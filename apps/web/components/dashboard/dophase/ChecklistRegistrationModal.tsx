import React, { useState } from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors, selectStyle } from '../../../styles/theme';

interface ChecklistRegistrationModalProps {
    setModalOpen: (open: boolean) => void;
    onRegister: (data: {
        checklistItem: string;
        tpo: { time: string; place: string; occasion: string };
        subdivisions: string[];
    }) => void;
    initialChecklistItem?: string;
}

export const ChecklistRegistrationModal: React.FC<ChecklistRegistrationModalProps> = ({
    setModalOpen,
    onRegister,
    initialChecklistItem = ''
}) => {
    const { tpoOptions, job } = usePDCA();

    const [checklistItem, setChecklistItem] = useState(initialChecklistItem);
    const [tpo, setTpo] = useState({ time: '', place: '', occasion: '' });
    const [selectedSubdivisions, setSelectedSubdivisions] = useState<string[]>([]);

    // Temporary: hardcoded subdivisions by job type
    // TODO: Later, get this from Plan phase data structure  
    const subdivisionDataByJob: Record<string, string[]> = {
        '룸메이드': ['[생활 1] 홀 바닥 미끄럼 방지 처리 확인', '[생활 2] 식기 세척기 작업 준도 유지', '[생활 3] 식기 세척기 적정 온도 유지'],
        '지배인': ['[업무 1] VIP 고객 응대', '[업무 2] 팀별 업무 점검'],
        '리셉션': ['[업무 1] 체크인 절차', '[업무 2] 체크아웃 정산'],
        '컨시어즈': ['[업무 1] 수하물 관리', '[업무 2] 시설 안내'],
        '인스펙터': ['[업무 1] 객실 점검', '[업무 2] 최종 확인'],
        '시설담당': ['[업무 1] 전기 점검', '[업무 2] 설비 점검'],
        '정비팀': ['[업무 1] 가구 보수', '[업무 2] 내외장재 보수']
    };
    const availableSubdivisions: string[] = subdivisionDataByJob[job] || [];

    const toggleSubdivision = (subdivision: string) => {
        setSelectedSubdivisions(prev =>
            prev.includes(subdivision)
                ? prev.filter(s => s !== subdivision)
                : [...prev, subdivision]
        );
    };

    const handleRegister = () => {
        if (!checklistItem || !tpo.place || !tpo.time || !tpo.occasion) {
            alert('체크리스트 항목과 모든 TPO 항목을 입력해주세요.');
            return;
        }
        if (selectedSubdivisions.length === 0) {
            alert('세분화 항목을 1개 이상 선택해주세요.');
            return;
        }

        onRegister({
            checklistItem,
            tpo,
            subdivisions: selectedSubdivisions
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
                    {/* Checklist Item Input */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>
                            체크리스트 (점검 항목)
                        </label>
                        <input
                            type="text"
                            placeholder="예: 홀 바닥 미끄럼 방지 처리 확인"
                            value={checklistItem}
                            onChange={(e) => setChecklistItem(e.target.value)}
                            style={{ ...selectStyle, width: '100%' }}
                        />
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
                            세분화 항목 선택
                        </label>
                        <div style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            padding: '12px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            backgroundColor: 'white'
                        }}>
                            {availableSubdivisions.length === 0 ? (
                                <div style={{ color: colors.textGray, fontSize: '0.9rem' }}>
                                    세분화 항목이 없습니다. Plan 탭에서 먼저 설정해주세요.
                                </div>
                            ) : (
                                availableSubdivisions.map((subdivision: string, idx: number) => (
                                    <label
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '8px',
                                            cursor: 'pointer',
                                            borderRadius: '5px',
                                            backgroundColor: selectedSubdivisions.includes(subdivision) ? '#E3F2FD' : 'transparent',
                                            marginBottom: '5px'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSubdivisions.includes(subdivision)}
                                            onChange={() => toggleSubdivision(subdivision)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.9rem' }}>{subdivision}</span>
                                    </label>
                                ))
                            )}
                        </div>
                        {selectedSubdivisions.length > 0 && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: '0.85rem',
                                color: colors.primaryBlue
                            }}>
                                선택됨: {selectedSubdivisions.length}개
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
