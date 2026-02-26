import React from 'react';
import { TaskCardData, TeamMember, TaskStage } from '@csmac/types';
import { TaskCard } from './TaskCard';
import { colors } from '../../../../styles/theme';

interface TaskTemplateBoardProps {
    tasks: TaskCardData[];
    assignments: Record<number, string[]>;
    members: TeamMember[];
    onUnassign: (taskId: number, memberId: string) => void;
    onViewDetail: (task: TaskCardData) => void;
}

const STAGE_ORDER: TaskStage[] = ['pre', 'during', 'post', 'after_service'];

export const TaskTemplateBoard: React.FC<TaskTemplateBoardProps> = ({ tasks, assignments, members, onUnassign, onViewDetail }) => {
    const teamOrder = Array.from(new Set(tasks.map(t => t.team))).sort((a, b) => a.localeCompare(b, 'ko'));

    const sortedTasks = [...tasks].sort((a, b) => {
        const teamCmp = teamOrder.indexOf(a.team) - teamOrder.indexOf(b.team);
        if (teamCmp !== 0) return teamCmp;
        const jobCmp = a.job.localeCompare(b.job, 'ko');
        if (jobCmp !== 0) return jobCmp;
        return STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
    });

    // 팀별로 그룹핑
    const grouped: { team: string; tasks: TaskCardData[] }[] = [];
    for (const task of sortedTasks) {
        const last = grouped[grouped.length - 1];
        if (last && last.team === task.team) {
            last.tasks.push(task);
        } else {
            grouped.push({ team: task.team, tasks: [task] });
        }
    }

    if (sortedTasks.length === 0) {
        return (
            <div style={{ flex: 1, padding: '16px 24px', backgroundColor: 'white', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
                    배정할 업무가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, padding: '16px 24px', backgroundColor: 'white', overflowY: 'auto' }}>
            {grouped.map(({ team, tasks: teamTasks }) => (
                <div key={team} style={{ marginBottom: '24px' }}>
                    {/* 팀 헤더 */}
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: colors.textGray,
                        letterSpacing: '0.05em',
                        borderBottom: `2px solid ${colors.border}`,
                        paddingBottom: '6px',
                        marginBottom: '12px'
                    }}>
                        {team}
                    </div>

                    {/* 3열 그리드 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px'
                    }}>
                        {teamTasks.map(task => {
                            const assignedMembers = (assignments[task.id] || [])
                                .map(id => members.find(m => m.id === id))
                                .filter(Boolean) as TeamMember[];
                            return (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    assignedMembers={assignedMembers}
                                    onUnassign={onUnassign}
                                    onViewDetail={onViewDetail}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
