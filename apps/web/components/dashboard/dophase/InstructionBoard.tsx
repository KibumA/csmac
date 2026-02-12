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
import { TeamRosterPanel } from './InstructionBoard/TeamRosterPanel';
import { TaskTemplateBoard } from './InstructionBoard/TaskTemplateBoard';
import { LibraryDetailModal } from './LibraryDetailModal';
import { User, Send } from 'lucide-react';

// ─── Static Team Rosters (realistic headcounts per role) ───
const TEAM_ROSTERS: Record<string, TeamMember[]> = {
    '프론트': [
        // 지배인 1명
        { id: 'member-front-0', name: '김철수', role: '지배인', status: 'working', shift: 'Day' },
        // 리셉션 5명
        { id: 'member-front-1', name: '이영희', role: '리셉션', status: 'working', shift: 'Day' },
        { id: 'member-front-2', name: '노현우', role: '리셉션', status: 'working', shift: 'Day' },
        { id: 'member-front-3', name: '배수진', role: '리셉션', status: 'working', shift: 'Day' },
        { id: 'member-front-4', name: '오세진', role: '리셉션', status: 'break', shift: 'Day' },
        { id: 'member-front-5', name: '권도현', role: '리셉션', status: 'working', shift: 'Day' },
        // 컨시어즈 3명
        { id: 'member-front-6', name: '최윤서', role: '컨시어즈', status: 'working', shift: 'Day' },
        { id: 'member-front-7', name: '윤하준', role: '컨시어즈', status: 'working', shift: 'Day' },
        { id: 'member-front-8', name: '정다은', role: '컨시어즈', status: 'off', shift: 'Day' },
    ],
    '객실관리': [
        // 인스펙터 3명
        { id: 'member-hk-0', name: '박미숙', role: '인스펙터', status: 'working', shift: 'Day' },
        { id: 'member-hk-1', name: '최영미', role: '인스펙터', status: 'working', shift: 'Day' },
        { id: 'member-hk-2', name: '서금옥', role: '인스펙터', status: 'working', shift: 'Day' },
        // 룸메이드 7명
        { id: 'member-hk-3', name: '김순영', role: '룸메이드', status: 'working', shift: 'Day' },
        { id: 'member-hk-4', name: '한옥순', role: '룸메이드', status: 'break', shift: 'Day' },
        { id: 'member-hk-5', name: '오미영', role: '룸메이드', status: 'working', shift: 'Day' },
        { id: 'member-hk-6', name: '강수미', role: '룸메이드', status: 'working', shift: 'Day' },
        { id: 'member-hk-7', name: '임보라', role: '룸메이드', status: 'working', shift: 'Day' },
        { id: 'member-hk-8', name: '배옥희', role: '룸메이드', status: 'off', shift: 'Day' },
        { id: 'member-hk-9', name: '허순덕', role: '룸메이드', status: 'working', shift: 'Day' },
        // 코디사원 3명
        { id: 'member-hk-10', name: '이정자', role: '코디사원', status: 'working', shift: 'Day' },
        { id: 'member-hk-11', name: '정혜진', role: '코디사원', status: 'working', shift: 'Day' },
        { id: 'member-hk-12', name: '윤정희', role: '코디사원', status: 'break', shift: 'Day' },
    ],
    '시설': [
        // 엔지니어 5명
        { id: 'member-fc-0', name: '김태섭', role: '엔지니어', status: 'working', shift: 'Day' },
        { id: 'member-fc-1', name: '박진우', role: '엔지니어', status: 'working', shift: 'Day' },
        { id: 'member-fc-2', name: '한승기', role: '엔지니어', status: 'working', shift: 'Day' },
        { id: 'member-fc-3', name: '오창민', role: '엔지니어', status: 'break', shift: 'Day' },
        { id: 'member-fc-4', name: '강현철', role: '엔지니어', status: 'working', shift: 'Day' },
        // 환경관리 3명
        { id: 'member-fc-5', name: '이상호', role: '환경관리', status: 'working', shift: 'Day' },
        { id: 'member-fc-6', name: '최동혁', role: '환경관리', status: 'working', shift: 'Day' },
        { id: 'member-fc-7', name: '정용수', role: '환경관리', status: 'off', shift: 'Day' },
    ],
    '고객지원/CS': [
        // 컨택센터 상담원 5명
        { id: 'member-cs-0', name: '김나연', role: '컨택센터 상담원', status: 'working', shift: 'Day' },
        { id: 'member-cs-1', name: '오예진', role: '컨택센터 상담원', status: 'working', shift: 'Day' },
        { id: 'member-cs-2', name: '윤수아', role: '컨택센터 상담원', status: 'working', shift: 'Day' },
        { id: 'member-cs-3', name: '노은지', role: '컨택센터 상담원', status: 'break', shift: 'Day' },
        { id: 'member-cs-4', name: '허윤아', role: '컨택센터 상담원', status: 'working', shift: 'Day' },
        // 고객서비스팀 3명
        { id: 'member-cs-5', name: '이수빈', role: '고객서비스팀', status: 'working', shift: 'Day' },
        { id: 'member-cs-6', name: '한지유', role: '고객서비스팀', status: 'working', shift: 'Day' },
        { id: 'member-cs-7', name: '임하늘', role: '고객서비스팀', status: 'off', shift: 'Day' },
        // CS파트 3명
        { id: 'member-cs-8', name: '박소희', role: 'CS파트', status: 'working', shift: 'Day' },
        { id: 'member-cs-9', name: '정서영', role: 'CS파트', status: 'working', shift: 'Day' },
        { id: 'member-cs-10', name: '강채원', role: 'CS파트', status: 'working', shift: 'Day' },
    ],
    '마케팅/영업': [
        // 마케팅전략팀 3명
        { id: 'member-ms-0', name: '김지훈', role: '마케팅전략팀', status: 'working', shift: 'Day' },
        { id: 'member-ms-1', name: '한민서', role: '마케팅전략팀', status: 'working', shift: 'Day' },
        { id: 'member-ms-2', name: '오준혁', role: '마케팅전략팀', status: 'break', shift: 'Day' },
        // 영업기획 3명
        { id: 'member-ms-3', name: '이하은', role: '영업기획', status: 'working', shift: 'Day' },
        { id: 'member-ms-4', name: '정우빈', role: '영업기획', status: 'working', shift: 'Day' },
        { id: 'member-ms-5', name: '윤시우', role: '영업기획', status: 'off', shift: 'Day' },
    ],
    '경영/HR': [
        // 교육개발팀 3명
        { id: 'member-mg-0', name: '김관호', role: '교육개발팀', status: 'working', shift: 'Day' },
        { id: 'member-mg-1', name: '오민수', role: '교육개발팀', status: 'working', shift: 'Day' },
        { id: 'member-mg-2', name: '윤미선', role: '교육개발팀', status: 'working', shift: 'Day' },
        // 인사(HRD) 3명
        { id: 'member-mg-3', name: '이수정', role: '인사(HRD)', status: 'working', shift: 'Day' },
        { id: 'member-mg-4', name: '한경민', role: '인사(HRD)', status: 'break', shift: 'Day' },
        { id: 'member-mg-5', name: '임세환', role: '인사(HRD)', status: 'working', shift: 'Day' },
        // 업무지시 보드 관리자 3명
        { id: 'member-mg-6', name: '박성훈', role: '업무지시 보드 관리자', status: 'working', shift: 'Day' },
        { id: 'member-mg-7', name: '정보경', role: '업무지시 보드 관리자', status: 'working', shift: 'Day' },
        { id: 'member-mg-8', name: '강호진', role: '업무지시 보드 관리자', status: 'off', shift: 'Day' },
    ],
};

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
        assignments, setAssignments, batchDeployTasks,
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

        const mapTask = (t: RegisteredTpo) => ({
            ...t,
            stage: getStageFromTpo(t.tpo.time, t.tpo.occasion),
            assignedMemberIds: assignments[t.id] || []
        });

        return [
            ...DEMO_SCENARIOS.filter(filterTask).map(mapTask),
            ...registeredTpos.filter(filterTask).map(mapTask)
        ];
    }, [instructionBoardWorkplace, instructionBoardTeams, instructionBoardJobs, assignments, registeredTpos]);

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

                // Update assignment
                setAssignments(prev => {
                    const currentAssignees = prev[taskId] || [];
                    if (currentAssignees.includes(memberId)) return prev; // Already assigned
                    return {
                        ...prev,
                        [taskId]: [...currentAssignees, memberId]
                    };
                });
            }
        }
    }, [activeTasks, setAssignments]);

    const handleUnassign = React.useCallback((taskId: number, memberId: string) => {
        setAssignments(prev => ({
            ...prev,
            [taskId]: (prev[taskId] || []).filter(id => id !== memberId)
        }));
    }, [setAssignments]);

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
                        assignments={assignments}
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

