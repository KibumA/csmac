import React from 'react';
import { colors } from '../../../styles/theme';
import { RegisteredTpo } from '@csmac/types';

interface LibraryCardProps {
    data: RegisteredTpo;
    onViewDetail: () => void;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ data, onViewDetail }) => {
    // Reverted to count the number of checklist combinations (setupTasks) created in the Do phase
    const subdivisionCount = data.setupTasks?.length || 0;

    // Heuristic: 1.5 mins per checklist item if not provided
    const estimatedTime = data.criteria.items.length * 1.5;

    // Check if any items mention "사진" or "촬영" for evidence
    const needsPhoto = data.criteria.items.some(item =>
        item.content.includes('사진') || item.content.includes('촬영')
    );
    const photoCount = data.criteria.items.filter(item =>
        item.content.includes('사진') || item.content.includes('촬영')
    ).length;

    const evidenceText = needsPhoto ? `사진 ${photoCount}장` : '없음';

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
        >
            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: colors.textDark, marginBottom: '8px', lineHeight: '1.4' }}>
                {data.criteria.checklist}
            </div>

            <div style={{ fontSize: '0.85rem', color: colors.textGray, marginBottom: '15px' }}>
                예상 {Math.ceil(estimatedTime)}분 · 실행근거: {evidenceText}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <span style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: '#E3F2FD',
                    color: '#1976D2'
                }}>
                    표준
                </span>
                <span style={{ padding: '3px 10px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '0.75rem', color: colors.textDark, fontWeight: '500' }}>
                    {data.job}
                </span>
                <span style={{ padding: '3px 10px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '0.75rem', color: colors.textDark, fontWeight: '500' }}>
                    {data.tpo.occasion}
                </span>
                {needsPhoto && (
                    <span style={{ padding: '3px 10px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '0.75rem', color: colors.textDark, fontWeight: '500' }}>
                        사진필수
                    </span>
                )}
                {data.setupTasks && data.setupTasks.length > 0 ? (
                    <span style={{ padding: '3px 10px', backgroundColor: '#E8F5E9', color: '#2E7D32', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        세분화 {subdivisionCount}
                    </span>
                ) : (
                    <span style={{ padding: '3px 10px', backgroundColor: '#F3E5F5', color: '#7B1FA2', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        항목 {subdivisionCount}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', borderTop: `1px solid ${colors.border}`, paddingTop: '15px', gap: '10px' }}>
                <button style={{
                    flex: 1.5,
                    padding: '10px',
                    border: 'none',
                    backgroundColor: colors.textDark,
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                }}>우리팀 보드로</button>
                <button
                    onClick={onViewDetail}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: 'white',
                        color: colors.textDark,
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}>상세보기</button>
            </div>
        </div>
    );
};
