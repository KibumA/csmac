import React from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors, selectStyle } from '../../../styles/theme';

interface TpoSetupModalProps {
    setTpoModalOpen: (open: boolean) => void;
    setInstructionModalOpen: (open: boolean) => void;
    setNewSopCategory: (category: string) => void;
    setNewTpo: (tpo: any) => void;
    newSopCategory: string;
    newTpo: { time: string, place: string, occasion: string };
    instructionSubject: string;
}

export const TpoSetupModal: React.FC<TpoSetupModalProps> = ({
    setTpoModalOpen,
    setInstructionModalOpen,
    setNewSopCategory,
    setNewTpo,
    newSopCategory,
    newTpo,
    instructionSubject
}) => {
    const {
        tpoOptions,
        registeredTpos
    } = usePDCA();

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                width: '500px', backgroundColor: 'white', borderRadius: '15px',
                padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
                <div style={{ borderBottom: `2px solid ${colors.primaryBlue}`, paddingBottom: '15px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.textDark }}>TPO 수동 설정 및 세분화</div>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray }}>현장 등록 업무의 표준화를 위해 TPO 정보를 입력해주세요.</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>장소 (Place)</label>
                            <select
                                style={{ ...selectStyle, width: '100%' }}
                                value={newTpo.place}
                                onChange={(e) => setNewTpo({ ...newTpo, place: e.target.value })}
                            >
                                <option value="">선택</option>
                                {tpoOptions.place.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>시간 (Time)</label>
                            <select
                                style={{ ...selectStyle, width: '100%' }}
                                value={newTpo.time}
                                onChange={(e) => setNewTpo({ ...newTpo, time: e.target.value })}
                            >
                                <option value="">선택</option>
                                {tpoOptions.time.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>상황 (Occasion)</label>
                        <select
                            style={{ ...selectStyle, width: '100%' }}
                            value={newTpo.occasion}
                            onChange={(e) => setNewTpo({ ...newTpo, occasion: e.target.value })}
                        >
                            <option value="">선택</option>
                            {tpoOptions.occasion.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>체크리스트 (점검 항목)</label>
                        <input
                            type="text"
                            placeholder="예: 객실 정비, 고객 응대"
                            value={newSopCategory}
                            onChange={(e) => setNewSopCategory(e.target.value)}
                            style={{ ...selectStyle, width: '100%' }}
                        />
                    </div>

                    <div style={{ backgroundColor: '#F3F4F6', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>등록될 점검 항목:</div>
                        <div style={{ color: colors.primaryBlue }}>• {instructionSubject || '(제목 없음)'}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={() => {
                            if (!newSopCategory || !newTpo.place || !newTpo.time || !newTpo.occasion) {
                                alert('모든 항목을 입력해주세요.');
                                return;
                            }
                            setTpoModalOpen(false);
                            setInstructionModalOpen(true);
                        }}
                        style={{
                            flex: 1, padding: '12px',
                            backgroundColor: colors.primaryBlue, color: 'white',
                            border: 'none', borderRadius: '8px',
                            fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        설정 완료 및 확인
                    </button>
                    <button
                        onClick={() => setTpoModalOpen(false)}
                        style={{
                            width: '100px', padding: '12px',
                            backgroundColor: '#e0e0e0', color: colors.textDark,
                            border: 'none', borderRadius: '8px',
                            fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};
