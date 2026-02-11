'use client';

import React from 'react';
import { usePDCA } from '../../context/PDCAContext';
import { colors } from '../../styles/theme';
import Modal from '../shared/Modal';
import ConcernPopup from '../dashboard/ConcernPopup';

export default function Sidebar() {
    const { activePhase, setActivePhase, showConcernPopup, setShowConcernPopup } = usePDCA();

    return (
        <aside style={{ width: '240px', backgroundColor: colors.sidebarBg, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <div style={{ backgroundColor: colors.primaryBlue, color: 'white', padding: '10px', fontSize: '1.4rem', fontWeight: 'bold', borderRadius: '4px' }}>CS MAC</div>
            </div>
            <nav style={{ flex: 1, padding: '0 10px', marginTop: '20px' }}>
                <div
                    onClick={() => setShowConcernPopup(true)}
                    style={{
                        color: colors.primaryBlue,
                        padding: '15px 10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    PDCA
                </div>
                {/* Command Center 버튼 */}
                <div
                    onClick={() => setActivePhase('command')}
                    style={{
                        backgroundColor: activePhase === 'command' ? colors.primaryBlue : '#E7EEF8',
                        color: activePhase === 'command' ? 'white' : colors.primaryBlue,
                        padding: '12px 20px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                    }}
                >
                    🎯 Command Center
                </div>

                <div style={{ fontSize: '0.75rem', color: colors.textGray, padding: '0 10px', marginBottom: '8px', fontWeight: 600 }}>
                    PDCA 단계별
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {(['plan', 'do', 'check', 'act'] as const).map(phase => (
                        <li
                            key={phase}
                            onClick={() => setActivePhase(phase)}
                            style={{
                                backgroundColor: activePhase === phase ? colors.primaryBlue : 'transparent',
                                color: activePhase === phase ? 'white' : colors.textGray,
                                padding: '12px 20px',
                                borderRadius: '8px',
                                marginBottom: '5px',
                                fontWeight: activePhase === phase ? 'bold' : 'normal',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {phase} ({phase === 'plan' ? '업무 설정' : phase === 'do' ? '업무 수행' : phase === 'check' ? '업무 확인' : '업무 개선'})
                        </li>
                    ))}
                </ul>
                <div style={{ marginTop: '20px', borderTop: `1px solid ${colors.border}`, paddingTop: '10px' }}>
                    <a href="/mobile" style={{ display: 'block', padding: '10px 20px', color: colors.textGray, textDecoration: 'none', fontSize: '0.9rem' }}>
                        📱 Mobile View
                    </a>
                </div>
            </nav>

            <Modal
                isOpen={showConcernPopup}
                onClose={() => setShowConcernPopup(false)}
                title="고민"
            >
                <ConcernPopup />
            </Modal>
        </aside >
    );
}
