import React, { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import { usePDCA } from '../../../context/PDCAContext';
import { useToast } from '../../../context/ToastContext';
import { colors } from '../../../styles/theme';
import { TeamMember, TaskCardData, RegisteredTpo } from '@csmac/types';
import { getStageFromTpo } from '../../../utils/tpoUtils';
import { TEAM_ROSTERS } from '../../../constants/team-rosters';
import { TeamRosterPanel } from './InstructionBoard/TeamRosterPanel';
import { TaskTemplateBoard } from './InstructionBoard/TaskTemplateBoard';
import { LibraryDetailModal } from './LibraryDetailModal';
import { RefreshCw } from 'lucide-react';

export const InstructionBoard = () => {
    const {
        registeredTpos,
        teams,
        jobInstructions,
        deployedTaskGroupIds,
        assignMemberToTask,
        unassignMemberFromTask,
        workplaces,
        instructionBoardWorkplace, setInstructionBoardWorkplace,
        instructionBoardTeams, setInstructionBoardTeams,
        fetchJobInstructions
    } = usePDCA();
    const { addToast } = useToast();

    const [activeDraggable, setActiveDraggable] = useState<TeamMember | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskCardData | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Roster-side team filter (independent from card filter)
    const [rosterTeams, setRosterTeams] = useState<string[]>(['전체']);

    // ─── Helper Functions ───
    const toggleFilter = React.useCallback((
        prev: string[],
        item: string
    ) => {
        let next: string[];
        if (item === '전체') {
            next = ['전체'];
        } else if (prev.includes('전체')) {
            next = [item];
        } else if (prev.includes(item)) {
            const filtered = prev.filter(i => i !== item);
            next = filtered.length === 0 ? ['전체'] : filtered;
        } else {
            next = [...prev, item];
        }
        return next;
    }, []);

    const handleCardTeamClick = React.useCallback((teamKey: string) => {
        setInstructionBoardTeams(prev => toggleFilter(prev, teamKey));
    }, [toggleFilter, setInstructionBoardTeams]);

    const handleRosterTeamClick = React.useCallback((teamKey: string) => {
        setRosterTeams(prev => toggleFilter(prev, teamKey));
    }, [toggleFilter]);

    // All members for assignment display (always full roster, never filtered)
    const allMembers = useMemo(() => {
        return Object.values(TEAM_ROSTERS).flat();
    }, []);

    // Roster members (filtered by rosterTeams)
    const rosterMembers = useMemo(() => {
        const rawMembers = rosterTeams.includes('전체')
            ? Object.values(TEAM_ROSTERS).flat()
            : rosterTeams.flatMap(t => TEAM_ROSTERS[t] || []);

        return [...rawMembers].sort((a, b) => {
            const getPriority = (status: string) => status === 'working' ? 0 : 1;
            const priorityA = getPriority(a.status);
            const priorityB = getPriority(b.status);
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.name.localeCompare(b.name, 'ko');
        });
    }, [rosterTeams]);

    // Transform RegisteredTpos to TaskCardData (filtered by card team filter, no job filter)
    const activeTasks: TaskCardData[] = useMemo(() => {
        if (!registeredTpos) return [];

        const isTeamMatch = (t: string) => instructionBoardTeams.includes('전체') || instructionBoardTeams.includes(t);

        const filterTask = (t: RegisteredTpo) =>
            t.workplace === instructionBoardWorkplace &&
            isTeamMatch(t.team);

        const regularTasks = registeredTpos.filter(filterTask).flatMap(tpo => {
            if (!tpo.setupTasks || tpo.setupTasks.length === 0) return [];

            return tpo.setupTasks
                .filter(group => deployedTaskGroupIds.includes(group.id))
                .map(group => ({
                    ...tpo,
                    id: group.id,
                    stage: getStageFromTpo(tpo.tpo.time, tpo.tpo.occasion),
                    displayItems: group.items,
                    assignedMemberIds: jobInstructions
                        .filter(job => job.taskGroupId === group.id && job.assignee !== null)
                        .map(job => job.assignee!)
                }));
        });

        // Ad-hoc tasks (manually added, no taskGroupId)
        const adhocJobs = jobInstructions.filter(job =>
            (job.status === 'waiting' || job.status === 'in_progress') &&
            job.taskGroupId === null &&
            job.targetTeam &&
            isTeamMatch(job.targetTeam)
        );

        const adhocTasks: TaskCardData[] = adhocJobs.map(job => ({
            id: -job.id, // negative id for custom ad-hoc tasks to avoid collision with group id
            tpo: { time: '업무중' as const, place: '기타/단발성 업무', occasion: job.subject },
            workplace: instructionBoardWorkplace,
            team: job.targetTeam,
            job: '단발성 지시',
            stage: 'during' as any,
            criteria: { checklist: job.subject, standards: [], expectedOutcome: job.description, items: [] },
            displayItems: job.description ? [{ content: job.description }] : [],
            assignedMemberIds: job.assignee ? [job.assignee] : [],
            matching: { evidence: '단발성 지시', method: '-' }
        }));

        return [...regularTasks, ...adhocTasks];
    }, [instructionBoardWorkplace, instructionBoardTeams, jobInstructions, registeredTpos, deployedTaskGroupIds]);


    // 3. DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            }
        })
    );

    // 4. Handlers
    const handleDragStart = React.useCallback((event: DragStartEvent) => {
        if (event.active.data.current?.type === 'member') {
            setActiveDraggable(event.active.data.current.member as TeamMember);
        }
    }, []);

    const handleDragEnd = React.useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDraggable(null);

        if (over && active.data.current?.type === 'member') {
            const memberId = active.id as string;
            const taskIdStr = over.id as string;
            const member = active.data.current.member as TeamMember;

            if (taskIdStr.startsWith('task-')) {
                const taskId = parseInt(taskIdStr.replace('task-', ''));
                const task = activeTasks.find(t => t.id === taskId);

                // --- Guard 1: Off-duty check ---
                if (member.status === 'off') {
                    if (!confirm(`${member.name}님은 현재 '휴무' 상태입니다. 업무를 배정하시겠습니까?`)) {
                        return;
                    }
                }

                // --- Guard 2: Veteran task check ---
                if (task?.isVeteran && !['지배인', '인스펙터', '엔지니어', '업무지시 보드 관리자'].includes(member.role)) {
                    addToast(`이 업무는 '베테랑' 전용 업무입니다. ${member.role} 직무의 ${member.name}님에게 배정할 수 없습니다.`, 'warning', 4000);
                    return;
                }

                assignMemberToTask(taskId, member.name);
            }
        }
    }, [activeTasks, assignMemberToTask, addToast]);

    const handleUnassign = React.useCallback((taskId: number, memberName: string) => {
        unassignMemberFromTask(taskId, memberName);
    }, [unassignMemberFromTask]);

    const handleViewDetail = React.useCallback((task: TaskCardData) => {
        setSelectedTask(task);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (fetchJobInstructions) {
            await fetchJobInstructions();
        }
        setIsRefreshing(false);
    };

    const handleUpdateImage = async (itemId: number | undefined, file: File) => {
        if (!itemId) {
            addToast('항목 ID를 찾을 수 없습니다.', 'error');
            return;
        }

        try {
            const { supabase } = await import('../../../utils/supabaseClient');

            // 1. Upload image to 'evidence-photos' bucket (reusing existing bucket for simplicity)
            const fileExt = file.name.split('.').pop();
            const fileName = `guide_${Date.now()}_${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('evidence-photos').upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage.from('evidence-photos').getPublicUrl(fileName);

            // 3. Update DB
            const { error: dbError } = await supabase
                .from('checklist_items')
                .update({ reference_image_url: publicUrl })
                .eq('id', itemId);

            if (dbError) throw dbError;

            // 4. Update local state to reflect UI immediately
            setSelectedTask(prev => {
                if (!prev) return null;
                const updatedItems = (prev.displayItems || prev.criteria.items || []).map((item: any) =>
                    item.id === itemId ? { ...item, imageUrl: publicUrl } : item
                );
                return { ...prev, displayItems: updatedItems };
            });

            addToast('표준 가이드 이미지가 등록되었습니다.', 'success');
        } catch (error) {
            console.error('Error updating image:', error);
            addToast('이미지 등록 중 오류가 발생했습니다.', 'error');
        }
    };

    // ─── Drop Animation ───
    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
    };

    // Shared chip style builder
    const chipStyle = (isActive: boolean, isJob: boolean = false) => ({
        padding: '6px 14px',
        borderRadius: '9999px',
        backgroundColor: isActive ? colors.primaryBlue : 'white',
        border: isActive ? `1px solid ${colors.primaryBlue}` : `1px solid ${colors.border}`,
        color: isActive ? 'white' : colors.textGray,
        fontSize: '0.75rem',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        whiteSpace: 'nowrap' as const,
        transition: 'all 0.2s'
    });

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div style={{
                display: 'flex', flexDirection: 'column', height: '650px',
                backgroundColor: 'white', borderRadius: '16px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                border: `1px solid ${colors.border}`,
                overflow: 'hidden'
            }}>
                {/* Top Bar: Workplace and Refresh */}
                <div style={{
                    padding: '12px 20px', borderBottom: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <select
                            value={instructionBoardWorkplace}
                            onChange={(e) => setInstructionBoardWorkplace(e.target.value)}
                            style={{
                                border: 'none', borderRadius: '4px',
                                padding: '4px 8px', fontSize: '0.75rem', fontWeight: 'bold',
                                color: colors.textGray, backgroundColor: '#F1F5F9', cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            {workplaces.map(wp => (
                                <option key={wp} value={wp}>📍 {wp}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '6px',
                            backgroundColor: 'white', border: `1px solid ${colors.border}`,
                            color: colors.textDark, fontSize: '0.8rem', fontWeight: 'bold',
                            cursor: isRefreshing ? 'not-allowed' : 'pointer',
                            opacity: isRefreshing ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        새로고침
                    </button>
                </div>

                {/* Main Split Layout */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* LEFT: Roster Panel with its own team filter */}
                    <div style={{ width: '280px', minWidth: '280px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${colors.border}` }}>
                        {/* Roster Team Filter */}
                        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#FAFBFC' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                <button onClick={() => handleRosterTeamClick('전체')} style={chipStyle(rosterTeams.includes('전체'), false)}>
                                    전체
                                </button>
                                {Object.entries(teams).map(([key, info]) => (
                                    <button key={key} onClick={() => handleRosterTeamClick(key)} style={chipStyle(rosterTeams.includes(key), false)}>
                                        {info.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <TeamRosterPanel members={rosterMembers} />
                    </div>

                    {/* RIGHT: Card Area with its own team filter */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Card Team Filter */}
                        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#FAFBFC' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                <button onClick={() => handleCardTeamClick('전체')} style={chipStyle(instructionBoardTeams.includes('전체'))}>
                                    전체
                                </button>
                                {Object.entries(teams).map(([key, info]) => (
                                    <button key={key} onClick={() => handleCardTeamClick(key)} style={chipStyle(instructionBoardTeams.includes(key))}>
                                        {info.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Task Cards */}
                        <TaskTemplateBoard
                            tasks={activeTasks}
                            assignments={{}}
                            members={allMembers}
                            onUnassign={handleUnassign}
                            onViewDetail={handleViewDetail}
                        />
                    </div>
                </div>
            </div>

            {selectedTask && (
                <LibraryDetailModal
                    data={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    hideActionButton={true}
                    onSaveDescription={async (desc: string) => {
                        const { supabase } = await import('../../../utils/supabaseClient');
                        const { error } = await supabase
                            .from('job_instructions')
                            .update({ description: desc })
                            .eq('task_group_id', selectedTask.id);
                        if (!error) {
                            addToast('추가사항이 저장되었습니다.', 'success');
                        } else {
                            addToast('저장 중 오류가 발생했습니다.', 'error');
                        }
                    }}
                    onUpdateImage={handleUpdateImage}
                />
            )}

            {/* Drag Overlay for Visual Feedback */}
            <DragOverlay dropAnimation={dropAnimation}>
                {activeDraggable ? (
                    <div style={{
                        backgroundColor: 'white', padding: '12px', borderRadius: '12px',
                        border: `2px solid ${colors.primaryBlue}`, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        width: '250px', display: 'flex', alignItems: 'center', gap: '12px',
                        opacity: 0.9, cursor: 'grabbing'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: colors.primaryBlue, fontWeight: 'bold'
                        }}>
                            {activeDraggable.name.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#1F2937', fontSize: '0.875rem' }}>{activeDraggable.name}</div>
                            <div style={{ fontSize: '0.75rem', color: colors.primaryBlue, fontWeight: 'bold' }}>배정 중...</div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

