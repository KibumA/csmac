import React from 'react';
import { colors } from '../../../styles/theme';
import { RegisteredTpo } from '@csmac/types';
import { LibraryCard } from './LibraryCard';

// Team color mapping matching 코드소스 reference
const TEAM_COLORS: Record<string, string> = {
    '프론트': '#2563EB',          // 파랑
    '객실관리': '#2563EB',        // 파랑 (객실 계열)
    '시설': '#EA580C',            // 주황
    '고객지원/CS': '#7C3AED',     // 보라
    '마케팅/영업': '#059669',     // 초록
    '경영/HR': '#64748B',         // 회색
};

interface CategoryColumnProps {
    title: string;
    subtitle?: string;
    teamColor?: string;
    items: RegisteredTpo[];
    onViewDetail: (item: RegisteredTpo) => void;
    onToggleBoard: (groupId: number) => void;
    isDeployed: (groupId: number) => boolean;
}

export const CategoryColumn: React.FC<CategoryColumnProps> = ({
    title, subtitle, teamColor, items, onViewDetail, onToggleBoard, isDeployed
}) => {
    const dotColor = teamColor || colors.primaryBlue;

    return (
        <div style={{
            minWidth: '320px', flex: 1,
            border: `1px solid rgba(15,23,42,0.10)`,
            borderRadius: '14px',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.55)',
        }}>
            {/* Column Header */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: `1px solid rgba(15,23,42,0.10)`,
                padding: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 1,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '10px', height: '10px', borderRadius: '999px',
                        backgroundColor: dotColor, flexShrink: 0,
                    }} />
                    <span style={{ fontWeight: 900, fontSize: '13px', color: '#0F172A' }}>{title}</span>
                </div>
                <span style={{
                    fontSize: '12px', padding: '3px 8px', borderRadius: '999px',
                    border: `1px solid rgba(15,23,42,0.10)`,
                    backgroundColor: '#F9FAFB', color: 'rgba(15,23,42,0.58)',
                    whiteSpace: 'nowrap',
                }}>
                    {subtitle || `${items.length}개`}
                </span>
            </div>

            {/* Cards Container */}
            <div style={{ padding: '10px', overflowY: 'auto', flex: 1 }}>
                {items.length > 0 ? items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                        <LibraryCard
                            data={item}
                            onViewDetail={() => onViewDetail(item)}
                            onToggleBoard={onToggleBoard}
                            isDeployed={isDeployed}
                        />
                    </div>
                )) : (
                    <div style={{
                        textAlign: 'center', padding: '40px 10px',
                        color: 'rgba(15,23,42,0.42)', fontSize: '13px', fontWeight: 600,
                    }}>
                        해당 팀의 업무가 없습니다
                    </div>
                )}
            </div>
        </div>
    );
};

export { TEAM_COLORS };
