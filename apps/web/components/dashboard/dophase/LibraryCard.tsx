import React from 'react';
import { colors } from '../../../styles/theme';
import { RegisteredTpo } from '@csmac/types';

interface LibraryCardProps {
    data: RegisteredTpo;
    onViewDetail: () => void;
    onToggleBoard: (groupId: number) => void;
    isDeployed: (groupId: number) => boolean;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ data, onViewDetail, onToggleBoard, isDeployed }) => {
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
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    border: '1px solid rgba(3,105,161,0.18)',
                }}>
                    표준
                </span>
                <span style={{ padding: '3px 10px', backgroundColor: '#F3F4F6', borderRadius: '999px', fontSize: '0.75rem', color: '#0F172A', fontWeight: 900 }}>
                    {data.job}
                </span>
                <span style={{ padding: '3px 10px', backgroundColor: '#F3F4F6', borderRadius: '999px', fontSize: '0.75rem', color: '#0F172A', fontWeight: 500 }}>
                    {data.tpo.occasion}
                </span>
                {needsPhoto && (
                    <span style={{ padding: '3px 10px', backgroundColor: 'rgba(15,23,42,0.06)', borderRadius: '999px', fontSize: '0.75rem', color: '#0F172A', fontWeight: 500, border: '1px solid rgba(15,23,42,0.16)' }}>
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
                <button
                    onClick={() => {
                        if (data.setupTasks && data.setupTasks.length > 0) {
                            // Batch deploy/remove ALL setupTasks
                            const allDeployed = data.setupTasks.every(g => isDeployed(g.id));
                            data.setupTasks.forEach(g => {
                                if (allDeployed) {
                                    // Remove all if all are deployed
                                    if (isDeployed(g.id)) onToggleBoard(g.id);
                                } else {
                                    // Deploy all that aren't deployed yet
                                    if (!isDeployed(g.id)) onToggleBoard(g.id);
                                }
                            });
                        }
                    }}
                    style={{
                        flex: 1.5,
                        padding: '8px 10px',
                        border: '1px solid rgba(15,23,42,0.10)',
                        backgroundColor: (data.setupTasks && data.setupTasks.length > 0 && data.setupTasks.every(g => isDeployed(g.id))) ? '#E8F5E9' : '#0F172A',
                        color: (data.setupTasks && data.setupTasks.length > 0 && data.setupTasks.every(g => isDeployed(g.id))) ? '#2E7D32' : 'white',
                        borderRadius: '10px',
                        fontWeight: 950,
                        fontSize: '12px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    }}>
                    {(data.setupTasks && data.setupTasks.length > 0 && data.setupTasks.every(g => isDeployed(g.id))) ? '보드에서 제거' : '우리팀 보드로'}
                </button>
                <button
                    onClick={onViewDetail}
                    style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: `1px solid rgba(15,23,42,0.10)`,
                        backgroundColor: 'white',
                        color: '#0F172A',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 950,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    }}>상세보기</button>
            </div>
        </div>
    );
};
