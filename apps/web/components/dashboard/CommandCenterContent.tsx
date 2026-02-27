'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePDCA } from '../../context/PDCAContext';
import { colors } from '../../styles/theme';
import { supabase } from '../../utils/supabaseClient';
import { JobInstructionDB, JobInstructionStatus } from '@csmac/types';
import { CommandCenterCard } from './commandcenter/CommandCenterCard';
import { TEAMS } from '../../constants/pdca-data';
import { Download, Table, Package, CheckSquare, ShieldCheck, BarChart3, RotateCw, Clock, AlertCircle, ClipboardList } from 'lucide-react';
import { exportToCsv } from '../../utils/csvExport';

// Column definitions for the kanban board
const KANBAN_COLUMNS = [
    {
        key: 'before',
        label: '업무 전 (Plan)',
        icon: <ClipboardList size={18} color="#64748B" />,
        statuses: ['waiting'] as JobInstructionStatus[],
    },
    {
        key: 'doing',
        label: '진행 중 (Do)',
        icon: <Clock size={18} color="#2563EB" />,
        statuses: ['in_progress', 'delayed'] as JobInstructionStatus[],
    },
    {
        key: 'after',
        label: '완료/검증 (Check)',
        icon: <ShieldCheck size={18} color="#10B981" />,
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
    const [mounted, setMounted] = useState(false);

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
        setMounted(true);
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
        inProgress: instructions.filter(i => i.status === 'in_progress').length,
        completed: instructions.filter(i => i.status === 'completed').length,
        nonCompliant: instructions.filter(i => i.status === 'non_compliant' || i.verification_result === 'fail').length,
    };

    return (
        <div style={{ width: '100%', padding: '0 20px 40px 20px' }}>
            {/* Pulse animation for delayed cards */}
            <style>{`
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textDark, margin: 0, letterSpacing: '-0.5px' }}>
                        Action Command Center
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>
                        사업장 전체 업무지시 실시간 현황 및 이행 검증
                    </p>
                </div>

                <button
                    onClick={() => exportToCsv('command_center_tasks', instructions)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        backgroundColor: 'white', border: `1px solid ${colors.border}`,
                        padding: '8px 16px', borderRadius: '10px', fontSize: '13px',
                        fontWeight: 600, color: '#64748B', cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: '0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                >
                    <Download size={14} /> CSV 내보내기
                </button>
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
                    <div style={{ display: 'flex', gap: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: '#EEF2FF', padding: '10px', borderRadius: '12px' }}>
                                <Table size={18} color={colors.primaryBlue} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>전체 업무</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: colors.textDark }}>{stats.total}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: '#DBEAFE', padding: '10px', borderRadius: '12px' }}>
                                <Clock size={18} color="#2563EB" />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>진행 중</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB' }}>{stats.inProgress}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: '#ECFDF5', padding: '10px', borderRadius: '12px' }}>
                                <ShieldCheck size={18} color="#10B981" />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>검증 완료</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>{stats.completed}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: '#FFFBEB', padding: '10px', borderRadius: '12px' }}>
                                <AlertCircle size={18} color="#F59E0B" />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>조치 필요</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#F59E0B' }}>{stats.nonCompliant}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right', marginRight: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>LAST UPDATED</div>
                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                                {mounted ? lastRefresh.toLocaleTimeString() : ''}
                            </div>
                        </div>
                        <button
                            onClick={fetchInstructions}
                            disabled={loading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', borderRadius: '10px',
                                backgroundColor: loading ? '#F1F5F9' : '#F8FAFC',
                                border: `1px solid ${colors.border}`,
                                color: colors.textDark, fontSize: '13px', fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer', transition: '0.2s',
                            }}
                        >
                            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
                            새로고침
                        </button>
                    </div>
                </div>

                {/* Team Filters */}
                <div style={{ padding: '12px 20px', backgroundColor: '#F8FAFC', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                    {TEAM_FILTERS.map(team => (
                        <button
                            key={team.key}
                            onClick={() => setFilterTeam(team.key)}
                            style={{
                                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                cursor: 'pointer', transition: '0.2s',
                                border: `1px solid ${filterTeam === team.key ? colors.primaryBlue : 'transparent'}`,
                                backgroundColor: filterTeam === team.key ? 'white' : 'transparent',
                                color: filterTeam === team.key ? colors.primaryBlue : '#64748B',
                                boxShadow: filterTeam === team.key ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            }}
                        >
                            {team.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kanban Board */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {KANBAN_COLUMNS.map(column => (
                    <div key={column.key} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>{column.icon}</span>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: colors.textDark, margin: 0 }}>{column.label}</h3>
                                <span style={{
                                    fontSize: '11px', fontWeight: 700, color: '#94A3B8',
                                    backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '10px'
                                }}>
                                    {filteredInstructions.filter(inst => column.statuses.includes(inst.status)).length}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: '12px',
                            minHeight: '500px', padding: '4px',
                        }}>
                            {filteredInstructions
                                .filter(inst => column.statuses.includes(inst.status))
                                .map(instruction => (
                                    <CommandCenterCard
                                        key={instruction.id}
                                        instruction={instruction}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
