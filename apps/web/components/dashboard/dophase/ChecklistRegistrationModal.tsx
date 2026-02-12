import React, { useState } from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { useToast } from '../../../context/ToastContext';
import { colors, selectStyle } from '../../../styles/theme';
import { ChecklistItem } from '@csmac/types';

interface ChecklistRegistrationModalProps {
    setModalOpen: (open: boolean) => void;
    onRegister: (data: {
        checklistItem: string;
        tpo: { time: string; place: string; occasion: string };
        subdivisions: ChecklistItem[];
    }) => void;
    initialChecklistItem?: string;
}

export const ChecklistRegistrationModal: React.FC<ChecklistRegistrationModalProps> = ({
    setModalOpen,
    onRegister,
    initialChecklistItem = ''
}) => {
    const { tpoOptions, registeredTpos, workplace, team, job } = usePDCA();
    const { addToast } = useToast();

    const [tpo, setTpo] = useState({ time: '', place: '', occasion: '' });
    const [selectedItems, setSelectedItems] = useState<ChecklistItem[]>([]);

    // Find the matching SOP from Plan phase to get real checklist items
    const matchingSop = registeredTpos.find(r =>
        r.tpo.time === tpo.time &&
        r.tpo.place === tpo.place &&
        r.tpo.occasion === tpo.occasion &&
        r.team === team
    );

    const availableItems = matchingSop?.criteria.items || [];

    const toggleItem = (item: ChecklistItem) => {
        setSelectedItems(prev =>
            prev.some(i => i.content === item.content)
                ? prev.filter(i => i.content !== item.content)
                : [...prev, item]
        );
    };

    const handleRegister = () => {
        if (!tpo.place || !tpo.time || !tpo.occasion) {
            addToast('모든 TPO 항목을 선택해주세요.', 'warning');
            return;
        }
        if (selectedItems.length === 0) {
            addToast('세분화 항목을 1개 이상 선택해주세요.', 'warning');
            return;
        }

        onRegister({
            checklistItem: matchingSop?.criteria.checklist || `${tpo.place} ${tpo.occasion}`,
            tpo,
            subdivisions: selectedItems
        });

        setModalOpen(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                width: '550px',
                maxHeight: '80vh',
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                overflowY: 'auto'
            }}>
                <div style={{ borderBottom: `2px solid ${colors.primaryBlue}`, paddingBottom: '15px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.textDark }}>
                        업무수행점검 항목 등록
                    </div>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray }}>
                        체크리스트 항목과 TPO, 세분화 설정을 입력해주세요.
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Selected SOP Title Display */}
                    <div style={{ backgroundColor: '#F0F7FF', padding: '15px', borderRadius: '8px', border: `1px solid ${colors.primaryBlue}` }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px', color: colors.primaryBlue }}>
                            대상 체크리스트 (Plan 단계 등록됨)
                        </label>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                            {matchingSop ? matchingSop.criteria.checklist : 'TPO를 선택하면 체크리스트가 나타납니다.'}
                        </div>
                    </div>

                    {/* TPO Section */}
                    <div style={{
                        backgroundColor: '#F8F9FA',
                        padding: '15px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: colors.textDark }}>
                            TPO 설정
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                    장소 (Place)
                                </label>
                                <select
                                    style={{ ...selectStyle, width: '100%' }}
                                    value={tpo.place}
                                    onChange={(e) => setTpo({ ...tpo, place: e.target.value })}
                                >
                                    <option value="">선택</option>
                                    {tpoOptions.place.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                    시간 (Time)
                                </label>
                                <select
                                    style={{ ...selectStyle, width: '100%' }}
                                    value={tpo.time}
                                    onChange={(e) => setTpo({ ...tpo, time: e.target.value })}
                                >
                                    <option value="">선택</option>
                                    {tpoOptions.time.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                상황 (Occasion)
                            </label>
                            <select
                                style={{ ...selectStyle, width: '100%' }}
                                value={tpo.occasion}
                                onChange={(e) => setTpo({ ...tpo, occasion: e.target.value })}
                            >
                                <option value="">선택</option>
                                {tpoOptions.occasion.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Subdivision Selection */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
                            세분화 항목 선택 (이미지 확인 가능)
                        </label>
                        <div style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            maxHeight: '250px',
                            overflowY: 'auto',
                            backgroundColor: 'white'
                        }}>
                            {availableItems.length === 0 ? (
                                <div style={{ padding: '20px', color: colors.textGray, fontSize: '0.9rem', textAlign: 'center' }}>
                                    {tpo.place && tpo.occasion ? '해당 TPO에 등록된 체크리스트 항목이 없습니다.' : 'TPO를 선택해 주세요.'}
                                </div>
                            ) : (
                                availableItems.map((item, idx) => {
                                    const isSelected = selectedItems.some(i => i.content === item.content);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => toggleItem(item)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '10px 15px',
                                                cursor: 'pointer',
                                                borderBottom: idx < availableItems.length - 1 ? `1px solid ${colors.border}` : 'none',
                                                backgroundColor: isSelected ? '#E3F2FD' : 'transparent',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt=""
                                                    style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                                                />
                                            )}
                                            <span style={{ fontSize: '0.95rem', flex: 1 }}>{item.content}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {selectedItems.length > 0 && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: '0.85rem',
                                color: colors.primaryBlue,
                                fontWeight: 'bold'
                            }}>
                                선택됨: {selectedItems.length}개 항목
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={handleRegister}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: colors.primaryBlue,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        업무수행점검 리스트에 등록
                    </button>
                    <button
                        onClick={() => setModalOpen(false)}
                        style={{
                            width: '100px',
                            padding: '12px',
                            backgroundColor: '#e0e0e0',
                            color: colors.textDark,
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};
