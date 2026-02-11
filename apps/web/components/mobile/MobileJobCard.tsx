import React from 'react';
import { colors } from '../../styles/theme';
import { JobInstruction } from '@csmac/types';

interface MobileJobCardProps {
    task: JobInstruction;
    onClick?: () => void;
}

export const MobileJobCard: React.FC<MobileJobCardProps> = ({ task, onClick }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return colors.success;
            case 'in_progress': return colors.primaryBlue;
            case 'delayed': return '#ea580c';
            default: return '#ddd';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return '완료됨';
            case 'in_progress': return '진행중';
            case 'delayed': return '지연됨';
            default: return '대기중';
        }
    };

    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: `5px solid ${getStatusColor(task.status)}`,
                cursor: 'pointer',
                transition: 'transform 0.1s active'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{
                        fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: '#f1f5f9', color: colors.textGray, fontWeight: 'bold'
                    }}>
                        {task.targetTeam}
                    </span>
                    {task.assignee && (
                        <span style={{
                            fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px',
                            backgroundColor: '#f8fafc', color: colors.textGray
                        }}>
                            {task.assignee}
                        </span>
                    )}
                </div>
                <span style={{
                    fontSize: '0.75rem', fontWeight: 'bold',
                    color: getStatusColor(task.status)
                }}>
                    {getStatusText(task.status)}
                </span>
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold', color: colors.textDark }}>
                {task.subject}
            </h3>

            <p style={{
                margin: 0,
                fontSize: '0.9rem',
                color: colors.textGray,
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}>
                {task.description}
            </p>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: colors.textGray }}>
                <span>{new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ fontWeight: 'bold' }}>&gt;</span>
            </div>
        </div>
    );
};
