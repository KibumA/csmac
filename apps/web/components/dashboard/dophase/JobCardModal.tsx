import React from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors } from '../../../styles/theme';

interface JobCardModalProps {
    setInstructionModalOpen: (open: boolean) => void;
    instructionSubject: string;
    instructionDescription: string;
    shouldRegisterAsStandard: boolean;
    setInstructionSubject: (subject: string) => void;
    setInstructionDescription: (desc: string) => void;
    setShouldRegisterAsStandard: (checked: boolean) => void;
    setSelectedInspectionSopId: (id: number | null) => void;
    setNewSopCategory: (category: string) => void;
    newTpo: { time: string, place: string, occasion: string };
    newSopCategory: string;
}

export const JobCardModal: React.FC<JobCardModalProps> = ({
    setInstructionModalOpen,
    instructionSubject,
    instructionDescription,
    shouldRegisterAsStandard,
    setInstructionSubject,
    setInstructionDescription,
    setShouldRegisterAsStandard,
    setSelectedInspectionSopId,
    setNewSopCategory,
    newTpo,
    newSopCategory
}) => {
    const {
        workplace,
        team,
        teams,
        job,
        addJobInstruction,
        setupTasksToSop,
        selectedInspectionSopId
    } = usePDCA();

    const resetForm = () => {
        setInstructionModalOpen(false);
        setInstructionSubject('');
        setInstructionDescription('');
        setShouldRegisterAsStandard(false);
        setSelectedInspectionSopId(null);
        setNewSopCategory('');
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                width: '400px', backgroundColor: 'white', borderRadius: '15px',
                padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
                <div style={{ textAlign: 'center', borderBottom: `2px solid ${colors.primaryBlue}`, paddingBottom: '15px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.primaryBlue }}>업무지시 (Job Order)</div>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray }}>담당자</div>
                </div>

                <div style={{ backgroundColor: '#F8F9FA', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Context Summary: Site · Team · Job · Assignee */}
                    <div style={{ borderBottom: '1px solid #EEE', paddingBottom: '10px' }}>
                        <div style={{ fontSize: '0.85rem', color: colors.textGray, marginBottom: '4px' }}>정보 확인</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                            {workplace} · {teams[team]?.label || team} · {job} / 박지성
                        </div>
                    </div>

                    {(shouldRegisterAsStandard || selectedInspectionSopId) && (
                        <div style={{ borderBottom: '1px solid #EEE', paddingBottom: '10px' }}>
                            <div style={{ fontSize: '0.85rem', color: colors.textGray, marginBottom: '4px' }}>TPO 설정</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: colors.textDark }}>
                                [{newTpo.time}] {newTpo.place} · {newTpo.occasion}
                            </div>
                        </div>
                    )}

                    <div>
                        <div style={{ fontSize: '0.85rem', color: colors.textGray, marginBottom: '4px' }}>체크리스트 항목 (제목)</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px', color: colors.textDark }}>
                            {instructionSubject}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: colors.textGray, marginBottom: '4px' }}>지시 상세</div>
                        <div style={{ fontSize: '0.95rem', color: colors.textDark, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {instructionDescription}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        addJobInstruction({
                            targetTeam: team,
                            assignee: `박지성 (${job})`,
                            subject: instructionSubject,
                            description: instructionDescription,
                            deadline: new Date().toLocaleDateString(),
                            status: 'sent',
                            timestamp: new Date().toISOString()
                        });

                        addJobInstruction({
                            targetTeam: team,
                            assignee: `박지성 (${job})`,
                            subject: instructionSubject,
                            description: instructionDescription,
                            deadline: new Date().toLocaleDateString(),
                            status: 'sent',
                            timestamp: new Date().toISOString()
                        });

                        // Reverse Registration Logic - already configured in TPO modal
                        if (shouldRegisterAsStandard) {
                            if (selectedInspectionSopId) {
                                setupTasksToSop(selectedInspectionSopId, [instructionSubject], true);
                            } else {
                                setupTasksToSop(null, [instructionSubject], true, { category: newSopCategory, tpo: newTpo });
                            }
                            alert('직무카드가 실무자에게 전송되었으며, 업무수행점검 리스트에 등록되었습니다.');
                        } else {
                            alert('직무카드가 실무자에게 전송되었습니다.');
                        }
                        resetForm();
                    }}
                    style={{
                        width: '100%', padding: '15px',
                        backgroundColor: colors.primaryBlue, color: 'white',
                        border: 'none', borderRadius: '10px',
                        fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    실무자에게 전송 (Send)
                </button>
                <button
                    onClick={() => setInstructionModalOpen(false)}
                    style={{
                        width: '100%', padding: '10px',
                        backgroundColor: 'white', color: colors.textGray,
                        border: 'none', cursor: 'pointer', fontSize: '0.9rem'
                    }}
                >
                    취소
                </button>
            </div>
        </div>
    );
};
