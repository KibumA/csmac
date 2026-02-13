import React, { useState, useMemo, useEffect } from 'react';
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
import { User, Send } from 'lucide-react';

// ─── Demo Scenarios for Pre/Post stages ───
const DEMO_SCENARIOS: RegisteredTpo[] = [
    // Pre-work (업무 전) - 3 scenarios
    {
        id: -1, workplace: '소노벨 천안', team: '프론트', job: '지배인',
        tpo: { time: '오픈 준비', place: '객실', occasion: '브리핑' },
        criteria: { checklist: '조회 브리핑 및 인수인계 확인', items: [] },
        matching: { evidence: '', method: '', elements: [] }
    },
    {
        id: -2, workplace: '소노벨 천안', team: '프론트', job: '리셉션',
        tpo: { time: '개시 전 점검', place: '로비', occasion: '입실 준비' },
        criteria: { checklist: '로비 청결 상태 및 비품 점검', items: [] },
        matching: { evidence: '', method: '', elements: [] }
    },
    {
        id: -3, workplace: '소노벨 천안', team: '프론트', job: '컨시어즈',
        tpo: { time: '오픈 전', place: '프론트 데스크', occasion: '준비' },
        criteria: { checklist: '체크인 시스템 가동 및 키카드 준비', items: [] },
        matching: { evidence: '', method: '', elements: [] }
    },
    // Post-work (업무 후) - 3 scenarios
    {
        id: -4, workplace: '소노벨 천안', team: '프론트', job: '지배인',
        tpo: { time: '마감', place: '객실', occasion: '정산' },
        criteria: { checklist: '일일 매출 정산 및 마감 보고 작성', items: [] },
        matching: { evidence: '', method: '', elements: [] }
    },
    {
        id: -5, workplace: '소노벨 천안', team: '프론트', job: '리셉션',
        tpo: { time: '종료', place: '로비', occasion: '퇴실 확인' },
        criteria: { checklist: '미퇴실 고객 확인 및 야간 인수인계', items: [] },
        matching: { evidence: '', method: '', elements: [] }
    },
    {
        id: -6, workplace: '소노벨 천안', team: '프론트', job: '컨시어즈',
        tpo: { time: 'close', place: '프론트 데스크', occasion: '보고' },
        criteria: { checklist: '고객 VOC 일지 정리 및 야간 당직 전달', items: [] },
        matching: { evidence: '', method: '', elements: [] }
    },
];

export const InstructionBoard = () => {
    const {
        registeredTpos,
        teams,
        jobInstructions,
        deployedTaskGroupIds,
        assignMemberToTask,
        unassignMemberFromTask,
        batchDeployTasks,
        instructionBoardWorkplace, setInstructionBoardWorkplace,
        instructionBoardTeams, setInstructionBoardTeams,
        instructionBoardJobs, setInstructionBoardJobs
    } = usePDCA();
    const { addToast } = useToast();

    const [activeDraggable, setActiveDraggable] = useState<TeamMember | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskCardData | null>(null);

    // ─── Helper Functions ───
    const toggleFilter = React.useCallback((
        prev: string[],
        item: string,
        onTeamChange?: () => void
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

        if (onTeamChange) onTeamChange();
        return next;
    }, []);

    const handleTeamClick = React.useCallback((teamKey: string) => {
        setInstructionBoardTeams(prev => toggleFilter(prev, teamKey, () => setInstructionBoardJobs(['전체'])));
    }, [toggleFilter, setInstructionBoardTeams, setInstructionBoardJobs]);

    const handleJobClick = React.useCallback((jobKey: string) => {
        setInstructionBoardJobs(prev => toggleFilter(prev, jobKey));
    }, [toggleFilter, setInstructionBoardJobs]);

    // Sync with global context only on initial mount or when explicitly needed?
    // User wants independence, so let's keep them as local state initialized from context.

    // 2. Computed Data
    const currentTeamJobs = useMemo(() => {
        if (instructionBoardTeams.includes('전체')) {
            const allJobs = new Set<string>();
            Object.values(teams).forEach(t => t.jobs.forEach(j => allJobs.add(j)));
            return Array.from(allJobs);
        }
        const jobs = new Set<string>();
        instructionBoardTeams.forEach(t => {
            teams[t]?.jobs.forEach(j => jobs.add(j));
        });
        return Array.from(jobs);
    }, [instructionBoardTeams, teams]);

    const teamMembers = useMemo(() => {
        const rawMembers = instructionBoardTeams.includes('전체')
            ? Object.values(TEAM_ROSTERS).flat()
            : instructionBoardTeams.flatMap(t => TEAM_ROSTERS[t] || []);

        return [...rawMembers].sort((a, b) => {
            // 1. Availability Sort (working first, break/off last)
            const getPriority = (status: string) => {
                if (status === 'working') return 0;
                return 1; // break, off
            };

            const priorityA = getPriority(a.status);
            const priorityB = getPriority(b.status);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // 2. Alphabetical Sort (가나다 순)
            return a.name.localeCompare(b.name, 'ko');
        });
    }, [instructionBoardTeams]);

    // Transform RegisteredTpos to TaskCardData structure with Stages
    // Merge DB data + demo scenarios for pre/post columns
    const activeTasks: TaskCardData[] = useMemo(() => {
        if (!registeredTpos) return [];

        const isTeamMatch = (t: string) => instructionBoardTeams.includes('전체') || instructionBoardTeams.includes(t);
        const isJobMatch = (j: string) => instructionBoardJobs.includes('전체') || instructionBoardJobs.includes(j);

        const filterTask = (t: RegisteredTpo) =>
            t.workplace === instructionBoardWorkplace &&
            isTeamMatch(t.team) &&
            isJobMatch(t.job);

        // 1. Demo Scenarios (Pre/Post stages)
        const demoTasks = DEMO_SCENARIOS.filter(filterTask).map(t => ({
            ...t,
            stage: getStageFromTpo(t.tpo.time, t.tpo.occasion),
            assignedMemberIds: []
        }));

        // 2. Real Deployed Tasks (Operation stage)
        const realTasks = registeredTpos.filter(filterTask).flatMap(tpo => {
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

        return [...demoTasks, ...realTasks];
    }, [instructionBoardWorkplace, instructionBoardTeams, instructionBoardJobs, jobInstructions, registeredTpos, deployedTaskGroupIds]);

    // 3. DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to start drag (prevents accidental clicks)
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

            // Check if dropped on a task
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

                // Persist assignment to DB in real-time
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

    const handleBatchDeploy = async () => {
        await batchDeployTasks();
    };

    const dropAnimation: DropAnimation = useMemo(() => ({
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    }), []);

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
                {/* Top Control Bar (3 Rows for Perfect Alignment) */}
                <div style={{
                    padding: '12px 20px', borderBottom: `1px solid ${colors.border}`,
                    display: 'flex', flexDirection: 'column', gap: '14px',
                    backgroundColor: 'white'
                }}>
                    {/* Row 1: Workplace (Independent) */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
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
                            <option value="소노벨 천안">📍 소노벨 천안</option>
                            <option value="소노벨 경주">📍 소노벨 경주</option>
                        </select>
                    </div>

                    {/* Row 2: Team Chips & Deploy Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Team Chips */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                                onClick={() => handleTeamClick('전체')}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    border: `1px solid ${instructionBoardTeams.includes('전체') ? colors.primaryBlue : colors.border}`,
                                    backgroundColor: instructionBoardTeams.includes('전체') ? colors.primaryBlue : 'white',
                                    color: instructionBoardTeams.includes('전체') ? 'white' : colors.textGray,
                                    fontSize: '0.8125rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: instructionBoardTeams.includes('전체') ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                                }}
                            >
                                전체
                            </button>
                            {Object.entries(teams).map(([key, info]) => {
                                const isActive = instructionBoardTeams.includes(key);
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleTeamClick(key)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            border: `1px solid ${isActive ? colors.primaryBlue : colors.border}`,
                                            backgroundColor: isActive ? colors.primaryBlue : 'white',
                                            color: isActive ? 'white' : colors.textGray,
                                            fontSize: '0.8125rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                                        }}
                                    >
                                        {info.label}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleBatchDeploy}
                            style={{
                                backgroundColor: colors.primaryBlue,
                                color: 'white', padding: '8px 20px', borderRadius: '8px',
                                fontWeight: 'bold', fontSize: '0.875rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Send size={16} />
                            업무지시 배정
                        </button>
                    </div>

                    {/* Row 3: Job Chips */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        backgroundColor: '#F8FAFC', padding: '0 12px', borderRadius: '8px',
                        border: '1px solid #F1F5F9', height: '48px', minHeight: '48px'
                    }}>
                        <div style={{
                            display: 'flex', gap: '6px', alignItems: 'center',
                            overflowX: 'auto', flex: 1, height: '100%'
                        }}>
                            <button
                                onClick={() => handleJobClick('전체')}
                                style={{
                                    padding: '5px 12px',
                                    borderRadius: '15px',
                                    border: `1px solid ${instructionBoardJobs.includes('전체') ? '#64748B' : colors.border}`,
                                    backgroundColor: instructionBoardJobs.includes('전체') ? '#64748B' : 'white',
                                    color: instructionBoardJobs.includes('전체') ? 'white' : '#64748B',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                전체
                            </button>
                            {currentTeamJobs.map(j => {
                                const isActive = instructionBoardJobs.includes(j);
                                return (
                                    <button
                                        key={j}
                                        onClick={() => handleJobClick(j)}
                                        style={{
                                            padding: '5px 12px',
                                            borderRadius: '15px',
                                            border: `1px solid ${isActive ? colors.primaryBlue : colors.border}`,
                                            backgroundColor: isActive ? '#EFF6FF' : 'white',
                                            color: isActive ? colors.primaryBlue : colors.textGray,
                                            fontSize: '0.75rem',
                                            fontWeight: isActive ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {j}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Split Layout */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* LEFT: Roster (Source) */}
                    <div style={{ width: '280px', minWidth: '280px' }}>
                        <TeamRosterPanel members={teamMembers} jobFilter={instructionBoardJobs} />
                    </div>

                    {/* RIGHT: Tasks (Target) */}
                    <TaskTemplateBoard
                        tasks={activeTasks}
                        assignments={{}} // Not used anymore as assignees are integrated into tasks
                        members={teamMembers}
                        onUnassign={handleUnassign}
                        onViewDetail={handleViewDetail}
                    />
                </div>
            </div>

            {selectedTask && (
                <LibraryDetailModal
                    data={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    hideActionButton={true}
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

