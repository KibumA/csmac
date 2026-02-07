import React from 'react';
import { colors } from '../../../styles/theme';
import { RegisteredTpo } from '@csmac/types';
import { LibraryCard } from './LibraryCard';

interface CategoryColumnProps {
    title: string;
    items: RegisteredTpo[];
    onViewDetail: (item: RegisteredTpo) => void;
}

export const CategoryColumn: React.FC<CategoryColumnProps> = ({ title, items, onViewDetail }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors.primaryBlue }} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: colors.textDark }}>{title}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: colors.primaryBlue, backgroundColor: '#E3F2FD', padding: '2px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                    {items.length}개 항목
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {items.map((item, idx) => (
                    <LibraryCard key={idx} data={item} onViewDetail={() => onViewDetail(item)} />
                ))}
            </div>
        </div>
    );
};
