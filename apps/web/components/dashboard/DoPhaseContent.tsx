'use client';

import React, { useState } from 'react';
import { usePDCA } from '../../context/PDCAContext';
import { colors } from '../../styles/theme';
import { InstructionBoard } from './dophase/InstructionBoard';
import { ChecklistBoard } from './dophase/ChecklistBoard';
import { ActionPlanBoard } from './dophase/ActionPlanBoard';
import { JobCardBoard } from './dophase/JobCardBoard';
import { JobCardModal } from './dophase/JobCardModal';
import { TpoSetupModal } from './dophase/TpoSetupModal';
import { InspectionModal } from './dophase/InspectionModal';

const DoPhaseContent = () => {
    const {
        activeDoSubPhase, setActiveDoSubPhase,
        isInspectionModalOpen, setInspectionModalOpen,
        setSelectedInspectionSopId
    } = usePDCA();

    // Local State for Modals & UI interactions
    const [instructionSubject, setInstructionSubject] = useState('');
    const [instructionDescription, setInstructionDescription] = useState('');
    const [isInstructionModalOpen, setInstructionModalOpen] = useState(false);
    const [shouldRegisterAsStandard, setShouldRegisterAsStandard] = useState(false);
    const [isTpoModalOpen, setTpoModalOpen] = useState(false);
    const [newSopCategory, setNewSopCategory] = useState('');
    const [newTpo, setNewTpo] = useState({ time: '', place: '', occasion: '' });
    const [showReverseTooltip, setShowReverseTooltip] = useState(false);
    const [showChecklistTooltip, setShowChecklistTooltip] = useState(false);
    const [collapsedSops, setCollapsedSops] = useState<Record<number, boolean>>({});

    return (
        <div style={{ width: '100%', padding: '0 20px 40px 20px' }}>
            {/* 1. Header & Navigation */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.primaryBlue, marginBottom: '10px' }}>Do Phase: 업무 수행 및 점검</h1>
                <p style={{ fontSize: '1rem', color: colors.textGray }}>현장의 업무 수행과 실시간 점검을 관리합니다.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '0' }}>
                {([
                    { key: 'checklist', label: '업무수행 점검' },
                    { key: 'instruction', label: '업무지시 보드' },
                    { key: 'jobcard', label: '직무카드 현황' },
                    { key: 'actionplan', label: '조치계획 보드' }
                ] as Array<{ key: string; label: string; isNew?: boolean }>).map(tab => (
                    <div
                        key={tab.key}
                        onClick={() => setActiveDoSubPhase(tab.key)}
                        style={{
                            padding: '12px 25px',
                            cursor: 'pointer',
                            borderBottom: activeDoSubPhase === tab.key ? `4px solid ${colors.primaryBlue}` : '4px solid transparent',
                            fontWeight: activeDoSubPhase === tab.key ? 'bold' : 'normal',
                            color: activeDoSubPhase === tab.key ? colors.primaryBlue : colors.textGray,
                            fontSize: '1.05rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        {tab.label}
                        {tab.isNew && <span style={{ fontSize: '0.7rem', backgroundColor: '#FF5252', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>NEW</span>}
                    </div>
                ))}
            </div>

            {/* 2. Main Content Area */}
            {activeDoSubPhase === 'instruction' && (
                <InstructionBoard
                    setInstructionModalOpen={setInstructionModalOpen}
                    setInstructionSubject={setInstructionSubject}
                    setInstructionDescription={setInstructionDescription}
                    instructionSubject={instructionSubject}
                    instructionDescription={instructionDescription}
                    shouldRegisterAsStandard={shouldRegisterAsStandard}
                    setShouldRegisterAsStandard={setShouldRegisterAsStandard}
                    showReverseTooltip={showReverseTooltip}
                    setShowReverseTooltip={setShowReverseTooltip}
                    setTpoModalOpen={setTpoModalOpen}
                />
            )}

            {activeDoSubPhase === 'checklist' && (
                <ChecklistBoard
                    showChecklistTooltip={showChecklistTooltip}
                    setShowChecklistTooltip={setShowChecklistTooltip}
                    collapsedSops={collapsedSops}
                    setCollapsedSops={setCollapsedSops}
                    setInspectionModalOpen={setInspectionModalOpen}
                    setSelectedInspectionSopId={setSelectedInspectionSopId}
                />
            )}

            {activeDoSubPhase === 'actionplan' && (
                <ActionPlanBoard />
            )}

            {activeDoSubPhase === 'jobcard' && (
                <JobCardBoard />
            )}

            {/* 3. Modals */}
            {isInstructionModalOpen && (
                <JobCardModal
                    setInstructionModalOpen={setInstructionModalOpen}
                    instructionSubject={instructionSubject}
                    instructionDescription={instructionDescription}
                    shouldRegisterAsStandard={shouldRegisterAsStandard}
                    setInstructionSubject={setInstructionSubject}
                    setInstructionDescription={setInstructionDescription}
                    setShouldRegisterAsStandard={setShouldRegisterAsStandard}
                    setSelectedInspectionSopId={setSelectedInspectionSopId}
                    setNewSopCategory={setNewSopCategory}
                    newTpo={newTpo}
                    newSopCategory={newSopCategory}
                />
            )}

            {isTpoModalOpen && (
                <TpoSetupModal
                    setTpoModalOpen={setTpoModalOpen}
                    setInstructionModalOpen={setInstructionModalOpen}
                    setNewSopCategory={setNewSopCategory}
                    setNewTpo={setNewTpo}
                    newSopCategory={newSopCategory}
                    newTpo={newTpo}
                    instructionSubject={instructionSubject}
                />
            )}

            {isInspectionModalOpen && (
                <InspectionModal
                    setInspectionModalOpen={setInspectionModalOpen}
                />
            )}
        </div>
    );
};

export default DoPhaseContent;
