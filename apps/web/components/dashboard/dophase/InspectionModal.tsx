import React, { useState } from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors } from '../../../styles/theme';
import { ChecklistItem } from '@csmac/types';

interface InspectionModalProps {
    setInspectionModalOpen: (open: boolean) => void;
    // New props for navigation to Instruction Board
    setInstructionSubject: (subject: string) => void;
    setInstructionDescription: (desc: string) => void;
    setNewTpo: (tpo: { time: string; place: string; occasion: string }) => void;
    setActiveDoSubPhase: (phase: string) => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
    setInspectionModalOpen,
    setInstructionSubject,
    setInstructionDescription,
    setNewTpo,
    setActiveDoSubPhase
}) => {
    const { registeredTpos, setupTasksToSop, selectedInspectionSopId } = usePDCA();
    const [selectedItems, setSelectedItems] = useState<ChecklistItem[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const targetSop = registeredTpos.find(t => t.id === selectedInspectionSopId);

    // Initialize selections removed to allow adding NEW configurations independent of existing ones.

    if (!targetSop) return null;

    const toggleItem = (item: ChecklistItem) => {
        setSelectedItems(prev =>
            prev.some(i => i.content === item.content)
                ? prev.filter(i => i.content !== item.content)
                : [...prev, item]
        );
    };

    const handleSave = async () => {
        if (selectedItems.length === 0) {
            setErrorMessage('최소 하나 이상의 항목을 선택해주세요.');
            return;
        }

        if (!selectedInspectionSopId) return;

        // 1. Save subdivision settings to SOP in context
        const success = await setupTasksToSop(selectedInspectionSopId, selectedItems);

        if (success) {
            // 2. Prompt for job card creation
            const shouldCreateJobCard = window.confirm('세분화 설정이 저장되었습니다. 바로 신규 업무지시(직무카드)를 생성하시겠습니까?');

            if (shouldCreateJobCard) {
                // Set instruction data for smooth transition
                setInstructionSubject(targetSop.criteria.checklist);
                setNewTpo(targetSop.tpo);
                // Instruction description could be a summary of selected items
                const itemsSummary = selectedItems.map(item => `- ${item.content}`).join('\n');
                setInstructionDescription(`다음 항목들에 대한 집중 점검이 필요합니다:\n${itemsSummary}`);

                // Navigate to Instruction Board
                setActiveDoSubPhase('instruction');
            }

            // Close modal
            setInspectionModalOpen(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                width: '600px', maxHeight: '90vh', backgroundColor: 'white', borderRadius: '15px',
                padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
                <div style={{ borderBottom: `2px solid ${colors.primaryBlue}`, paddingBottom: '15px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>업무 세분화 및 설정</div>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray }}>선택된 TPO 항목에 대한 구체적인 실행 가이드를 설정합니다.</div>
                </div>

                <div style={{ backgroundColor: '#F8F9FA', padding: '15px', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>대상 업무: {targetSop.criteria.checklist}</div>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray }}>
                        [{targetSop.tpo.time}] {targetSop.tpo.place} - {targetSop.tpo.occasion}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' }}>세부 설정</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {targetSop.criteria.items.map((item, idx) => {
                            const isSelected = selectedItems.some(i => i.content === item.content);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => toggleItem(item)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '15px',
                                        padding: '15px',
                                        border: `1px solid ${isSelected ? colors.primaryBlue : colors.border}`,
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#F0F7FF' : 'white',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {/* Image Thumbnail */}
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '8px',
                                        backgroundColor: '#f0f0f0',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: `1px solid ${colors.border}`
                                    }}>
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.content}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60?text=No+Img';
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', color: colors.textGray }}>N/A</span>
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1rem', color: colors.textDark, fontWeight: isSelected ? 'bold' : 'normal' }}>
                                            {item.content}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '15px',
                                        fontSize: '0.8rem',
                                        backgroundColor: isSelected ? colors.primaryBlue : '#f0f0f0',
                                        color: isSelected ? 'white' : colors.textGray
                                    }}>
                                        {isSelected ? '선택됨' : '미선택'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {
                    errorMessage && (
                        <div style={{ color: '#D32F2F', marginBottom: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {errorMessage}
                        </div>
                    )
                }
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: `1px solid ${colors.border}` }}>
                    <button
                        onClick={() => setInspectionModalOpen(false)}
                        style={{
                            padding: '12px 30px', backgroundColor: '#EEE', color: colors.textDark,
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '12px 30px', backgroundColor: colors.primaryBlue, color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        설정 저장
                    </button>
                </div>
            </div >
        </div >
    );
};
