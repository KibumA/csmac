import React from 'react';
import { TaskCardData, TeamMember, TaskStage } from '@csmac/types';
import { TaskCard } from './TaskCard';
import { STAGE_LABELS } from '../../../../utils/tpoUtils';
import { colors } from '../../../../styles/theme';

interface TaskTemplateBoardProps {
    tasks: TaskCardData[];
    assignments: Record<number, string[]>; // taskId -> memberId[]
    members: TeamMember[];
    onUnassign: (taskId: number, memberId: string) => void;
}

export const TaskTemplateBoard: React.FC<TaskTemplateBoardProps> = ({ tasks, assignments, members, onUnassign }) => {
    const stages: TaskStage[] = ['pre', 'during', 'post'];

    return (
        <div style={{ flex: 1, padding: '24px', backgroundColor: 'white', overflowX: 'auto' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                height: '100%',
                minWidth: '800px'
            }}>
                {stages.map(stage => {
                    const stageTasks = tasks.filter(t => t.stage === stage);

                    return (
                        <div key={stage} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                marginBottom: '16px', paddingBottom: '8px',
                                borderBottom: '2px solid #F1F5F9' // slate-100
                            }}>
                                <h3 style={{ fontWeight: 'bold', color: '#334155' }}>{STAGE_LABELS[stage]}</h3>
                                <span style={{
                                    backgroundColor: '#F1F5F9', // slate-100
                                    color: '#64748B', // slate-500
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: '9999px'
                                }}>
                                    {stageTasks.length}
                                </span>
                            </div>

                            <div style={{
                                flex: 1,
                                backgroundColor: '#F8F9FA', // slate-50/50 
                                borderRadius: '12px',
                                padding: '12px',
                                border: `1px solid ${colors.border}`,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                {stageTasks.map(task => {
                                    const assignedMemberIds = assignments[task.id] || [];
                                    const assignedMembers = assignedMemberIds.map(id => members.find(m => m.id === id)).filter(Boolean) as TeamMember[];

                                    return (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            assignedMembers={assignedMembers}
                                            onUnassign={onUnassign}
                                        />
                                    );
                                })}

                                {stageTasks.length === 0 && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '80px 0',
                                        color: '#9CA3AF',
                                        fontSize: '0.75rem',
                                        fontStyle: 'italic'
                                    }}>
                                        해당 단계의 업무가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
