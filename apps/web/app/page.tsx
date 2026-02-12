'use client';

import React from 'react';
import { PDCAProvider, usePDCA } from '../context/PDCAContext';
import { colors } from '../styles/theme';
import Sidebar from '../components/layout/Sidebar';
import CommandCenterContent from '../components/dashboard/CommandCenterContent';
import PlanPhaseContent from '../components/dashboard/PlanPhaseContent';
import DoPhaseContent from '../components/dashboard/DoPhaseContent';
import CheckPhaseContent from '../components/dashboard/CheckPhaseContent';
import ActPhaseContent from '../components/dashboard/ActPhaseContent';

function DashboardContent() {
    const { activePhase } = usePDCA();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.white, fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif' }}>
            <Sidebar />

            {/* MAIN CONTENT */}
            <main style={{ flex: 1, padding: '30px 40px', overflowX: 'auto' }}>
                {activePhase === 'command' && <CommandCenterContent />}
                {activePhase === 'plan' && <PlanPhaseContent />}
                {activePhase === 'do' && <DoPhaseContent />}
                {activePhase === 'check' && <CheckPhaseContent />}
                {activePhase === 'act' && <ActPhaseContent />}
            </main>
        </div>
    );
}

export default function PDCADashboardPage() {
    return (
        <PDCAProvider>
            <DashboardContent />
        </PDCAProvider>
    );
}
