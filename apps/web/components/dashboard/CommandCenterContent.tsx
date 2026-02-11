'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePDCA } from '../../context/PDCAContext';
import { colors } from '../../styles/theme';
import { supabase } from '../../utils/supabaseClient';
import { JobInstructionDB, JobInstructionStatus } from '@csmac/types';
import { CommandCenterCard } from './commandcenter/CommandCenterCard';
import { TEAMS } from '../../constants/pdca-data';

// Column definitions for the kanban board
const KANBAN_COLUMNS = [
    {
        key: 'before',
        label: '업무 전 (Plan)',
        icon: '📝',
        statuses: ['waiting'] as JobInstructionStatus[],
    },
    {
        key: 'doing',
        label: '실행 중 (Do)',
        icon: '⚡',
        statuses: ['in_progress', 'delayed'] as JobInstructionStatus[],
    },
    {
        key: 'after',
        label: '완료/검증 (Check)',
        icon: '🏁',
        statuses: ['completed', 'non_compliant'] as JobInstructionStatus[],
    },
];

// Team filter options derived from TEAMS constant
const TEAM_FILTERS = [
    { key: 'all', label: '전체' },
    ...Object.keys(TEAMS).map(key => ({ key, label: key })),
];

export default function CommandCenterContent() {
    const { setActivePhase, setActiveDoSubPhase } = usePDCA();
    const [instructions, setInstructions] = useState<JobInstructionDB[]>([]);
    const [filterTeam, setFilterTeam] = useState('all');
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // Fetch all job instructions from Supabase
    const fetchInstructions = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('job_instructions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching job_instructions:', error);
            } else {
                setInstructions(data || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchInstructions();
    }, [fetchInstructions]);

    // Handle status change for a card
    const handleStatusChange = async (id: number, newStatus: JobInstructionStatus) => {
        // Optimistic update
        setInstructions(prev =>
            prev.map(inst => inst.id === id ? { ...inst, status: newStatus } : inst)
        );

        const updateData: Record<string, unknown> = { status: newStatus };
        if (newStatus === 'in_progress') updateData.started_at = new Date().toISOString();
        if (newStatus === 'completed') updateData.completed_at = new Date().toISOString();

        const { error } = await supabase
            .from('job_instructions')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating status:', error);
            fetchInstructions(); // Revert on error
        }
    };

    // Filter instructions by team
    const filteredInstructions = filterTeam === 'all'
        ? instructions
        : instructions.filter(inst => inst.team === filterTeam);

    // Summary stats
    const stats = {
        total: instructions.length,
        completed: instructions.filter(i => i.status === 'completed').length,
        delayed: instructions.filter(i => i.status === 'delayed').length,
        nonCompliant: instructions.filter(i => i.status === 'non_compliant' || i.verification_result === 'fail').length,
    };

    return (
        <div style={{ width: '100%', padding: '0 20px 40px 20px' }}>
            {/* Pulse animation for delayed cards */}
            <style>{`
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textDark, margin: 0, letterSpacing: '-0.5px' }}>
                    Action Command Center
                </h1>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>
                    사업장 전체 업무지시 실시간 현황 및 이행 검증
                </p>
            </div>

            {/* Quick Navigation to PDCA Sub-modules */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                    { label: 'TPO 업무기준 설정', phase: 'plan' as const },
                    { label: '업무지시 라이브러리', phase: 'do' as const, subPhase: 'library' },
                    { label: '업무지시', phase: 'do' as const, subPhase: 'instruction' },
                    { label: 'TPO 이행근거 검증', phase: 'check' as const },
                    { label: 'KPI 분석', phase: 'act' as const },
                ].map(nav => (
                    <button
                        key={nav.label}
                        onClick={() => { setActivePhase(nav.phase); if (nav.subPhase) setActiveDoSubPhase(nav.subPhase); }}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                            whiteSpace: 'nowrap', cursor: 'pointer', transition: '0.2s',
                            color: '#64748B', border: '1px solid transparent',
                            backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        {nav.label}
                    </button>
                ))}
            </div>

            {/* Summary Stats + Refresh */}
            <div style={{
                backgroundColor: 'white', borderRadius: '18px',
                border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                marginBottom: '24px', overflow: 'hidden',
            }}>
                <div style={{
                    padding: '20px', borderBottom: `1px solid ${colors.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>실시간 현황</h2>
                        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '13px' }}>
                            기준 시각: {lastRefresh.toLocaleTimeString('ko-KR')}
                        </p>
                    </div>
                    <button
                        onClick={fetchInstructions}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                            cursor: 'pointer', border: `1px solid ${colors.primaryBlue}`,
                            backgroundColor: colors.primaryBlue, color: 'white', transition: '0.2s',
                        }}
                    >
                        🔄 새로고침
                    </button>
                </div>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
                    padding: '20px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.01))',
                }}>
                    {[
                        { label: '📌 전체 지시', value: stats.total, colorClass: '' },
                        { label: '✅ 완료', value: stats.completed, colorClass: 'blue' },
                        { label: '⏳ 지연', value: stats.delayed, colorClass: 'orange' },
                        { label: '⚠️ 미준수', value: stats.nonCompliant, colorClass: 'red' },
                    ].map(stat => (
                        <div
                            key={stat.label}
                            style={{
                                backgroundColor: stat.colorClass === 'blue' ? 'rgba(29,78,216,0.03)'
                                    : stat.colorClass === 'orange' ? 'rgba(245,158,11,0.03)'
                                        : stat.colorClass === 'red' ? 'rgba(239,68,68,0.03)'
                                            : 'white',
                                border: `1px solid ${stat.colorClass === 'blue' ? 'rgba(29,78,216,0.1)'
                                    : stat.colorClass === 'orange' ? 'rgba(245,158,11,0.1)'
                                        : stat.colorClass === 'red' ? 'rgba(239,68,68,0.1)'
                                            : colors.border
                                    }`,
                                padding: '16px', borderRadius: '12px', transition: 'transform 0.2s', textAlign: 'center',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>
                                {stat.label}
                            </div>
                            <div style={{
                                fontSize: '24px', fontWeight: 800,
                                color: stat.colorClass === 'blue' ? '#1D4ED8'
                                    : stat.colorClass === 'orange' ? '#F59E0B'
                                        : stat.colorClass === 'red' ? '#EF4444'
                                            : colors.textDark,
                            }}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Filter */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {TEAM_FILTERS.map(team => (
                        <button
                            key={team.key}
                            onClick={() => setFilterTeam(team.key)}
                            style={{
                                padding: '8px 16px', backgroundColor: filterTeam === team.key ? colors.primaryBlue : 'white',
                                color: filterTeam === team.key ? 'white' : '#64748B',
                                border: `1px solid ${filterTeam === team.key ? colors.primaryBlue : colors.border}`,
                                borderRadius: '999px', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap',
                            }}
                        >
                            {team.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748B', fontSize: '14px' }}>
                    데이터를 불러오는 중...
                </div>
            ) : instructions.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '80px 20px', color: '#64748B',
                    backgroundColor: '#F8FAFC', borderRadius: '18px', border: `1px solid ${colors.border}`,
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                        등록된 업무지시가 없습니다
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '24px' }}>
                        Plan 단계에서 TPO 기준을 설정하고, 업무지시 라이브러리에서 보드에 배포해 주세요.
                    </div>
                    <button
                        onClick={() => setActivePhase('plan')}
                        style={{
                            padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                            cursor: 'pointer', border: `1px solid ${colors.primaryBlue}`,
                            backgroundColor: colors.primaryBlue, color: 'white',
                        }}
                    >
                        TPO 기준 설정으로 이동
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
                    {KANBAN_COLUMNS.map(column => {
                        const columnCards = filteredInstructions.filter(inst =>
                            column.statuses.includes(inst.status)
                        );
                        return (
                            <div
                                key={column.key}
                                style={{
                                    flex: 1, minWidth: '300px', backgroundColor: '#F1F5F9',
                                    borderRadius: '18px', padding: '12px',
                                    display: 'flex', flexDirection: 'column', gap: '12px',
                                    minHeight: '500px',
                                }}
                            >
                                {/* Column Header */}
                                <div style={{
                                    padding: '8px 4px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
                                        <span>{column.icon}</span>
                                        {column.label}
                                    </div>
                                    <span style={{
                                        backgroundColor: 'white', padding: '2px 10px', borderRadius: '12px',
                                        fontSize: '12px', fontWeight: 700, border: `1px solid ${colors.border}`,
                                    }}>
                                        {columnCards.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                {columnCards.map(instruction => (
                                    <CommandCenterCard
                                        key={instruction.id}
                                        instruction={instruction}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}

                                {columnCards.length === 0 && (
                                    <div style={{
                                        textAlign: 'center', padding: '40px 10px', color: '#94A3B8',
                                        fontSize: '13px', fontWeight: 600,
                                    }}>
                                        해당 상태의 업무가 없습니다
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
