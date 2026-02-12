import React, { useState } from 'react';
import { colors } from '../../../styles/theme';
import { RegisteredTpo } from '@csmac/types';
import { getCheckPoints } from '../../../utils/libraryUtils';

interface LibraryDetailModalProps {
    data: RegisteredTpo;
    onClose: () => void;
    onAddToBoard?: () => void;
    isDeployed?: boolean;
    hideActionButton?: boolean;
}

export const LibraryDetailModal: React.FC<LibraryDetailModalProps> = ({ data, onClose, onAddToBoard, isDeployed, hideActionButton }) => {
    const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                width: '95%',
                maxWidth: '1400px',
                height: '90vh',
                maxHeight: '1000px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#F8F9FA'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: colors.primaryBlue, fontWeight: 'bold', backgroundColor: '#E3F2FD', padding: '2px 8px', borderRadius: '4px' }}>표준 가이드</span>
                            <span style={{ color: colors.textGray, fontSize: '0.9rem' }}>{data.team} · {data.job}</span>
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>{data.criteria.checklist}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: colors.textGray }}
                    >✕</button>
                </div>

                {/* Content: Two-Pane Layout */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Left Pane: Checklist Items */}
                    <div style={{
                        flex: 1,
                        borderRight: `1px solid ${colors.border}`,
                        padding: '32px',
                        overflowY: 'auto',
                        backgroundColor: 'white'
                    }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: colors.textDark }}>세부 점검 리스트</h3>
                            <span style={{ fontSize: '0.85rem', color: colors.primaryBlue, fontWeight: 'bold' }}>{((data as any).displayItems || data.criteria.items).length}개 항목</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {((data as any).displayItems || data.criteria.items).map((item: any, idx: number) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedItemIndex(idx)}
                                    style={{
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: `1px solid ${selectedItemIndex === idx ? colors.primaryBlue : colors.border}`,
                                        backgroundColor: selectedItemIndex === idx ? '#F0F7FF' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        gap: '15px',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {item.imageUrl ? (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textGray, fontSize: '1.2rem', flexShrink: 0 }}>
                                            📷
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1rem', fontWeight: '500', color: colors.textDark, marginBottom: '4px' }}>{item.content}</div>
                                        <div style={{ fontSize: '0.8rem', color: colors.textGray }}>인스펙션 기준 준수여부 확인</div>
                                    </div>
                                    <div style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        backgroundColor: selectedItemIndex === idx ? colors.primaryBlue : '#F5F5F5',
                                        color: selectedItemIndex === idx ? 'white' : colors.textGray,
                                        fontWeight: 'bold'
                                    }}>
                                        {selectedItemIndex === idx ? '선택됨' : '미선택'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Pane: Item Details */}
                    <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: colors.textDark, marginBottom: '20px' }}>준수 사항 상세</h3>

                        {((data as any).displayItems || data.criteria.items)[selectedItemIndex] ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>


                                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '15px' }}>핵심 점검 포인트 (집중 관리)</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {getCheckPoints(((data as any).displayItems || data.criteria.items)[selectedItemIndex].content).map((point, pIdx) => (
                                            <div key={pIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                <div style={{
                                                    marginTop: '4px',
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '4px',
                                                    border: `1.5px solid ${colors.primaryBlue}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: colors.primaryBlue,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    flexShrink: 0
                                                }}>
                                                    {pIdx + 1}
                                                </div>
                                                <div style={{ fontSize: '0.95rem', color: colors.textDark, lineHeight: '1.5' }}>{point}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '12px' }}>수행 근거 및 방법</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.85rem', fontWeight: 'bold' }}>{data.matching.evidence} 증빙</span>
                                        <span style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: '#FFF3E0', color: '#E65100', fontSize: '0.85rem', fontWeight: 'bold' }}>{data.matching.method} 수행</span>
                                        {data.matching.elements?.map(e => (
                                            <span key={e} style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: '#F3E5F5', color: '#7B1FA2', fontSize: '0.85rem', fontWeight: 'bold' }}>{e}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textGray }}>
                                왼쪽 항목을 클릭하면 상세 내용을 볼 수 있습니다.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '24px 32px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'white' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '12px 24px', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >취소</button>
                    {!hideActionButton && onAddToBoard && (
                        <button
                            onClick={onAddToBoard}
                            style={{
                                padding: '12px 32px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: isDeployed ? '#E8F5E9' : colors.textDark,
                                color: isDeployed ? '#2E7D32' : 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            {isDeployed ? '보드에서 제거' : '우리팀 보드로'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
