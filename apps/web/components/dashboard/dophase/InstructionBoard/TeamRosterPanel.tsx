import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TeamMember } from '@csmac/types';
import { colors } from '../../../../styles/theme';
import { User, Coffee, Home, GripVertical } from 'lucide-react';

interface TeamRosterPanelProps {
    members: TeamMember[];
}

const DraggableMemberCard = ({ member }: { member: TeamMember }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: member.id,
        data: { type: 'member', member }
    });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 999 : 'auto',
        opacity: isDragging ? 0.5 : (member.status === 'off' ? 0.6 : 1),
        backgroundColor: member.status === 'off' ? '#F9FAFB' : 'white', // bg-gray-50 : white
        padding: '12px',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        boxShadow: isDragging ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'all 0.2s',
        position: 'relative',
        marginBottom: '10px'
    };

    const getStatusColor = (status: string) => {
        if (status === 'working') return '#10B981'; // emerald-500
        if (status === 'break') return '#F59E0B'; // amber-500
        return '#9CA3AF'; // gray-400
    };

    const getStatusIcon = (status: string) => {
        if (status === 'working') return <User size={12} color="white" />;
        if (status === 'break') return <Coffee size={12} color="white" />;
        return <Home size={12} color="white" />;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
        >
            {/* Status Indicator Badge */}
            <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                backgroundColor: getStatusColor(member.status),
                zIndex: 10
            }}>
                {getStatusIcon(member.status)}
            </div>

            {/* Avatar Circle */}
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9', // slate-100
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B', // slate-500
                fontWeight: 'bold',
                border: '1px solid #E2E8F0' // slate-200
            }}>
                {member.name.charAt(0)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', color: '#1F2937', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.role}</div>
            </div>

            <GripVertical size={16} color="#D1D5DB" />
        </div>
    );
};

export const TeamRosterPanel: React.FC<TeamRosterPanelProps> = ({ members }) => {
    const onlineCount = members.filter(m => m.status === 'working').length;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA' }}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, backgroundColor: 'white' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1E293B', marginBottom: '4px' }}>팀원 로스터</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280' }}>
                    <span>총원 {members.length}명</span>
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>근무중 {onlineCount}명</span>
                </div>
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {members.map(member => (
                        <DraggableMemberCard key={member.id} member={member} />
                    ))}
                </div>

                {members.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '0.875rem' }}>
                        해당 직무 팀원이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};
