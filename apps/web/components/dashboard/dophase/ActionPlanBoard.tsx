import React from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors, selectStyle } from '../../../styles/theme';

export const ActionPlanBoard: React.FC = () => {
    const {
        actionPlanItems,
        updateActionPlanItem
    } = usePDCA();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.textDark }}>조치계획 보드</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ padding: '8px 15px', backgroundColor: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>고객접점 미준수 4건</div>
                    <div style={{ padding: '8px 15px', backgroundColor: '#FFF3E0', color: '#EF6C00', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>법적의무이행 미준수 3건</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {actionPlanItems.map(item => (
                    <div key={item.id} style={{ border: `2px solid ${colors.textDark}`, borderRadius: '15px', padding: '20px', backgroundColor: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.team} / {item.category}</div>
                            <div style={{
                                color: item.status === 'pending' ? '#D32F2F' : item.status === 'in_progress' ? '#1565C0' : '#2E7D32',
                                fontWeight: 'bold', fontSize: '0.9rem'
                            }}>
                                {item.status === 'pending' ? '즉시 조치 필요' : item.status === 'in_progress' ? '조치 중' : '조치 완료'}
                            </div>
                        </div>
                        <div style={{ backgroundColor: '#F5F5F5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '5px' }}>{item.issue}</div>
                            <p style={{ fontSize: '0.85rem', color: colors.textGray, margin: 0 }}>발생일시: {item.timestamp}</p>
                            <p style={{ fontSize: '0.85rem', color: '#D32F2F', margin: '4px 0 0 0' }}>원인: {item.reason}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', alignSelf: 'center' }}>문제 원인</div>
                            <input
                                type="text"
                                placeholder="문제 발생 원인을 입력하세요"
                                value={item.cause || ''}
                                onChange={(e) => updateActionPlanItem(item.id, { cause: e.target.value })}
                                style={{ ...selectStyle, width: '100%' }}
                            />
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', alignSelf: 'center' }}>조치 방법</div>
                            <input
                                type="text"
                                placeholder="조치 방법을 입력하세요"
                                value={item.solution || ''}
                                onChange={(e) => updateActionPlanItem(item.id, { solution: e.target.value })}
                                style={{ ...selectStyle, width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button
                                    onClick={() => updateActionPlanItem(item.id, { status: 'completed' })}
                                    style={{
                                        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`,
                                        backgroundColor: item.status === 'completed' ? '#2E7D32' : '#E8F5E9',
                                        color: item.status === 'completed' ? 'white' : '#2E7D32',
                                        fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                                    }}
                                >
                                    조치완료
                                </button>
                                <button
                                    onClick={() => updateActionPlanItem(item.id, { status: 'in_progress' })}
                                    style={{
                                        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`,
                                        backgroundColor: item.status === 'in_progress' ? '#1565C0' : '#E3F2FD',
                                        color: item.status === 'in_progress' ? 'white' : '#1565C0',
                                        fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                                    }}
                                >
                                    조치중
                                </button>
                                <button
                                    onClick={() => updateActionPlanItem(item.id, { status: 'impossible' })}
                                    style={{
                                        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`,
                                        backgroundColor: item.status === 'impossible' ? '#C62828' : '#FFEBEE',
                                        color: item.status === 'impossible' ? 'white' : '#C62828',
                                        fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                                    }}
                                >
                                    조치불가
                                </button>
                            </div>
                            <button style={{ padding: '6px 15px', backgroundColor: colors.primaryBlue, color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>저장</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
