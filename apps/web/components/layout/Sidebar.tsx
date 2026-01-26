'use client';

import React from 'react';
import { usePDCA } from '../../context/PDCAContext';
import { colors } from '../../styles/theme';

export default function Sidebar() {
    const { activePhase, setActivePhase } = usePDCA();

    return (
        <aside style={{ width: '240px', backgroundColor: colors.sidebarBg, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                <div style={{ backgroundColor: colors.primaryBlue, color: 'white', padding: '10px', fontSize: '1.4rem', fontWeight: 'bold', borderRadius: '4px' }}>CS MAC</div>
            </div>
            <nav style={{ flex: 1, padding: '0 10px', marginTop: '20px' }}>
                <div style={{ color: colors.primaryBlue, padding: '15px 10px', fontWeight: 'bold' }}>PDCA</div>
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
            </nav>
        </aside>
    );
}
