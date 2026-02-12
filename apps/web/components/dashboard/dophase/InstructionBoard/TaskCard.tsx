import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskCardData, TeamMember } from '@csmac/types';
import { colors } from '../../../../styles/theme';
import { Clock, MapPin, AlertCircle, X } from 'lucide-react';

interface TaskCardProps {
    task: TaskCardData;
    assignedMembers: TeamMember[];
    onUnassign: (taskId: number, memberId: string) => void;
    onViewDetail: (task: TaskCardData) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, assignedMembers, onUnassign, onViewDetail }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `task-${task.id}`,
        data: { type: 'task', task }
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                position: 'relative',
                backgroundColor: isOver ? '#EFF6FF' : 'white', // blue-50 : white
                borderRadius: '12px',
                border: isOver ? `2px solid ${colors.primaryBlue}` : `1px solid ${colors.border}`,
                boxShadow: isOver ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transform: isOver ? 'scale(1.02)' : 'none',
                transition: 'all 0.2s',
                marginBottom: '10px'
            }}
        >
            {/* Header */}
            <div
                onClick={() => onViewDetail(task)}
                style={{ padding: '16px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                        backgroundColor: '#EFF6FF', // blue-50
                        color: colors.primaryBlue,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #DBEAFE' // blue-100
                    }}>
                        {task.tpo.time}
                    </span>
                    {assignedMembers.length === 0 && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '10px', color: '#EF4444', fontWeight: 'bold',
                            backgroundColor: '#FEF2F2', padding: '2px 6px', borderRadius: '4px'
                        }}>
                            <AlertCircle size={12} /> 미배정
                        </span>
                    )}
                </div>
                <h4 style={{ fontWeight: 'bold', color: '#1F2937', fontSize: '0.875rem', lineHeight: '1.25', marginBottom: '4px' }}>
                    {task.criteria?.checklist || '업무 내용 없음'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#6B7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={12} /> {task.tpo.place}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Clock size={12} /> {task.tpo.occasion}</span>
                </div>
            </div>

            {/* Droppable Area / Assigned Members */}
            <div style={{ padding: '12px', minHeight: '60px', backgroundColor: '#F9FAFB', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                {assignedMembers.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {assignedMembers.map(m => (
                            <div key={m.id} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                backgroundColor: 'white', border: `1px solid ${colors.border}`,
                                padding: '4px 8px 4px 4px', borderRadius: '9999px',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '10px', fontWeight: 'bold', color: '#475569'
                                }}>
                                    {m.name.charAt(0)}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>{m.name}</span>
                                <button
                                    onClick={() => onUnassign(task.id, m.id)}
                                    style={{ marginLeft: '2px', color: '#9CA3AF', cursor: 'pointer', border: 'none', background: 'none' }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '36px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', border: '1px dashed #D1D5DB', borderRadius: '4px', padding: '4px 8px' }}>
                            팀원을 여기에 드래그하세요
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
