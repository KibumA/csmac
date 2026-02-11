'use client';

import React, { useState, useMemo } from 'react';
import { usePDCA } from '../../context/PDCAContext';
import {
    CheckCircle2, Clock, ClipboardCheck, Share2,
    AlertCircle, RefreshCw
} from 'lucide-react';
import { colors } from '../../styles/theme';

const MOCK_USERS: Record<string, { name: string, role: string, shift: string }> = {
    '프론트': { name: '김철수', role: '지배인', shift: 'Day' },
    '객실관리': { name: '박미숙', role: '인스펙터', shift: 'Day' },
    '시설': { name: '김태섭', role: '엔지니어', shift: 'Day' },
    '고객지원/CS': { name: '김나연', role: '컨택센터 상담원', shift: 'Day' },
    '마케팅/영업': { name: '김지훈', role: '마케팅전략팀', shift: 'Day' },
    '경영/HR': { name: '김관호', role: '교육개발팀', shift: 'Day' },
};

// ─── Inline-Style Helper Functions ───
const getProgressColor = (val: number): string => {
    if (val >= 90) return '#10B981';
    if (val >= 70) return colors.primaryBlue;
    if (val >= 50) return '#F59E0B';
    return '#EF4444';
};

const getGradeColor = (val: number): string => {
    if (val >= 90) return '#059669';
    if (val >= 70) return colors.primaryBlue;
    if (val >= 50) return '#D97706';
    return '#DC2626';
};

// ─── StatCard (Inline Styles) ───
function StatCardLight({ title, value, label, icon: Icon }: any) {
    return (
        <div style={{
            backgroundColor: 'white', border: `1px solid ${colors.border}`,
            borderRadius: '12px', padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={14} />
                    {label}
                </span>
            </div>
            <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: colors.textDark, marginBottom: '4px', fontVariantNumeric: 'tabular-nums' }}>{value}%</div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: colors.primaryBlue, width: `${value}%`, transition: 'width 1s' }} />
                </div>
            </div>
        </div>
    );
}

export default function ActPhaseContent() {
    const { stats, allJobs, actionPlanItems, resolveActionItem } = usePDCA();

    const [sortKey, setSortKey] = useState<string>('risk');
    const [selectedId, setSelectedId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('non');

    const aggregateStats = useMemo(() => {
        const baseRate = stats.complianceRate;
        return {
            kpis: { total: baseRate, accuracy: baseRate, speed: Math.max(0, baseRate - 5), fidelity: Math.min(100, baseRate + 2), share: 95 },
            ok: stats.completedCount - stats.nonCompliantCount,
            non: stats.nonCompliantCount,
        };
    }, [stats]);

    const usersData = useMemo(() => {
        const groups: Record<string, any> = {};
        Object.keys(MOCK_USERS).forEach(team => {
            groups[team] = { id: team, ...MOCK_USERS[team], counts: { total: 0, ok: 0, non: 0, delay: 0 }, logs: [] };
        });
        if (allJobs) {
            allJobs.forEach(job => {
                const teamKey = Object.keys(MOCK_USERS).find(k => job.team.includes(k)) || '프론트';
                if (!groups[teamKey]) {
                    groups[teamKey] = { id: teamKey, name: `${teamKey} 담당자`, role: 'Staff', shift: 'Day', counts: { total: 0, ok: 0, non: 0, delay: 0 }, logs: [] };
                }
                const g = groups[teamKey];
                g.counts.total++;
                if (job.status === 'completed' && job.verification_result === 'pass') g.counts.ok++;
                if (job.status === 'non_compliant' || job.verification_result === 'fail') g.counts.non++;
                if (job.status === 'delayed') g.counts.delay++;
                g.logs.push({
                    id: job.id, t: job.subject, tag: job.team,
                    time: new Date(job.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    m: job.description || '특이사항 없음',
                    fb: job.verification_result === 'fail' ? '조치 필요' : '완료',
                    isRisk: job.status === 'non_compliant' || job.verification_result === 'fail'
                });
            });
        }
        return Object.values(groups);
    }, [allJobs]);

    const sortedList = useMemo(() => {
        return [...usersData].sort((a, b) => {
            if (sortKey === 'risk') return b.counts.non - a.counts.non;
            if (sortKey === 'total') return b.counts.total - a.counts.total;
            return 0;
        });
    }, [usersData, sortKey]);

    React.useEffect(() => {
        if (!selectedId && sortedList.length > 0) { setSelectedId(sortedList[0].id); }
    }, [sortedList, selectedId]);

    const selectedPerson = usersData.find(u => u.id === selectedId) || usersData[0];

    const calculateKPIs = (counts: any) => {
        const total = counts.total || 1;
        const accuracy = Math.round(((total - counts.non) / total) * 100) || 0;
        return { total: Math.round((accuracy * 0.35) + (90 * 0.3) + (80 * 0.2) + (95 * 0.15)), accuracy, speed: 85, fidelity: 90, share: 95 };
    };

    const displayedItems = selectedPerson?.logs.filter((l: any) => {
        if (activeTab === 'non') return l.isRisk;
        if (activeTab === 'ok') return !l.isRisk;
        return true;
    }) || [];

    const showToast = (msg: string) => alert(msg);

    // ─── STYLES ───
    const sortBtnBase: React.CSSProperties = {
        padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s'
    };
    const tabBtnBase: React.CSSProperties = {
        flex: 1, padding: '6px 0', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s'
    };

    return (
        <div style={{ width: '100%', paddingBottom: '80px', fontFamily: '"맑은 고딕", "Malgun Gothic", sans-serif', color: colors.textDark }}>
            {/* ── Header ── */}
            <header style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '4px', color: colors.primaryBlue }}>
                            Act Phase: Action Command Center
                        </h1>
                        <p style={{ color: colors.textGray, fontSize: '1rem' }}>사업장 전체 업무지시 실시간 현황 및 이행 검증</p>
                    </div>
                    <button style={{
                        padding: '6px 12px', backgroundColor: 'white', borderRadius: '8px',
                        fontSize: '0.75rem', fontWeight: 'bold', color: colors.textGray,
                        border: `1px solid ${colors.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <RefreshCw size={12} /> Live Sync
                    </button>
                </div>

                {/* ── KPI Cards Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                    {/* Main Compliance Card */}
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', padding: '20px',
                        border: `1px solid ${colors.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Compliance</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <div style={{ fontSize: '1.875rem', fontWeight: 900, color: colors.textDark, marginBottom: '4px', fontVariantNumeric: 'tabular-nums' }}>{aggregateStats.kpis.total}%</div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>▲ 2.4%</span>
                            </div>
                            <div style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 600 }}>준수 {aggregateStats.ok} / 미준수 {aggregateStats.non}</div>
                        </div>
                        <div style={{ marginTop: '16px', position: 'relative', zIndex: 1 }}>
                            <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', backgroundColor: colors.primaryBlue, width: `${aggregateStats.kpis.total}%`, transition: 'width 1s' }} />
                            </div>
                        </div>
                        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }}>
                            <RefreshCw size={96} color={colors.primaryBlue} />
                        </div>
                    </div>

                    <StatCardLight title="정확성" value={aggregateStats.kpis.accuracy} label="Accuracy" icon={CheckCircle2} />
                    <StatCardLight title="신속성" value={aggregateStats.kpis.speed} label="Speed" icon={Clock} />
                    <StatCardLight title="충실도" value={aggregateStats.kpis.fidelity} label="Fidelity" icon={ClipboardCheck} />
                    <StatCardLight title="공유도" value={aggregateStats.kpis.share} label="Sharing" icon={Share2} />
                </div>
            </header>

            {/* ── Main Content Grid (8:4 Ratio) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>

                {/* ── Left: Employee KPI Matrix ── */}
                <section style={{
                    backgroundColor: 'white', border: `1px solid ${colors.border}`,
                    borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{
                        padding: '20px', borderBottom: `1px solid ${colors.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        backgroundColor: '#FAFAFA'
                    }}>
                        <h2 style={{ fontWeight: 'bold', color: colors.textDark, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '6px', height: '16px', backgroundColor: colors.primaryBlue, borderRadius: '9999px', display: 'inline-block' }}></span>
                            실무자 KPI 매트릭스
                        </h2>
                        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
                            {[
                                { id: 'risk', label: 'Risk 순' },
                                { id: 'total', label: '점수 순' },
                            ].map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSortKey(s.id)}
                                    style={{
                                        ...sortBtnBase,
                                        backgroundColor: sortKey === s.id ? 'white' : 'transparent',
                                        color: sortKey === s.id ? colors.primaryBlue : '#9CA3AF',
                                        boxShadow: sortKey === s.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#FAFAFA', borderBottom: `1px solid ${colors.border}` }}>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>실무자</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>정확성</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>신속성</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>충실도</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>공유도</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Total</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedList.map((p: any) => {
                                    const k = calculateKPIs(p.counts);
                                    const isSelected = selectedId === p.id;
                                    const minScore = Math.min(k.accuracy, k.speed, k.fidelity, k.share);
                                    const isRisk = minScore < 70;

                                    return (
                                        <tr
                                            key={p.id}
                                            onClick={() => setSelectedId(p.id)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                                                borderBottom: `1px solid ${colors.border}`,
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                                            onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.75rem', fontWeight: 'bold',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                        backgroundColor: isSelected ? colors.primaryBlue : 'white',
                                                        color: isSelected ? 'white' : '#6B7280',
                                                        border: isSelected ? 'none' : `1px solid ${colors.border}`
                                                    }}>
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', color: isSelected ? colors.primaryBlue : colors.textDark }}>{p.name}</div>
                                                        <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase' }}>{p.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {[k.accuracy, k.speed, k.fidelity, k.share].map((val, idx) => (
                                                <td key={idx} style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{val}%</span>
                                                        <div style={{ width: '40px', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '9999px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', backgroundColor: getProgressColor(val), width: `${val}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                            ))}
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 900, fontStyle: 'italic', color: getGradeColor(k.total) }}>{k.total}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '2px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                                                    backgroundColor: isRisk ? '#FEF2F2' : '#ECFDF5',
                                                    border: `1px solid ${isRisk ? '#FEE2E2' : '#D1FAE5'}`,
                                                    color: isRisk ? '#DC2626' : '#059669'
                                                }}>
                                                    {isRisk ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                                                    {isRisk ? 'Risk' : 'Good'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Right: Detail Panel ── */}
                <section>
                    <div style={{
                        backgroundColor: 'white', border: `1px solid ${colors.border}`,
                        borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#FAFAFA' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: colors.textDark }}>{selectedPerson?.name}</h3>
                                    <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>{selectedPerson?.role} 분석 리포트</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                                    <span style={{ backgroundColor: 'white', border: `1px solid ${colors.border}`, padding: '4px 8px', borderRadius: '4px', color: '#4B5563', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        Total: <strong>{selectedPerson?.counts.total}</strong>
                                    </span>
                                    <span style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', padding: '4px 8px', borderRadius: '4px', color: '#DC2626', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        Issue: <strong>{selectedPerson?.counts.non}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
                                {[
                                    { id: 'non', label: '미준수 항목' },
                                    { id: 'ok', label: '완료 항목' },
                                    { id: 'all', label: '전체' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        style={{
                                            ...tabBtnBase,
                                            backgroundColor: activeTab === t.id ? 'white' : 'transparent',
                                            color: activeTab === t.id ? colors.primaryBlue : '#9CA3AF',
                                            boxShadow: activeTab === t.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Logs List */}
                        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', maxHeight: '500px', backgroundColor: '#FAFAFA' }}>
                            {displayedItems.length === 0 ? (
                                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                                        <ClipboardCheck size={24} color="#D1D5DB" />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF' }}>데이터가 없습니다</p>
                                </div>
                            ) : (
                                displayedItems.map((item: any, idx: number) => (
                                    <div key={item.id} style={{
                                        backgroundColor: 'white', border: `1px solid ${colors.border}`,
                                        borderRadius: '8px', padding: '12px', marginBottom: '12px',
                                        transition: 'box-shadow 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    width: '20px', height: '20px', borderRadius: '4px',
                                                    fontSize: '10px', fontWeight: 'bold',
                                                    backgroundColor: item.isRisk ? '#FEE2E2' : '#D1FAE5',
                                                    color: item.isRisk ? '#DC2626' : '#059669'
                                                }}>
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: colors.textDark, lineHeight: 1.25 }}>{item.t}</div>
                                                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{item.time} · {item.tag}</div>
                                                </div>
                                            </div>
                                            {item.isRisk && (
                                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#EF4444', backgroundColor: '#FEF2F2', padding: '2px 6px', borderRadius: '4px' }}>조치필요</span>
                                            )}
                                        </div>

                                        <div style={{ fontSize: '0.75rem', color: '#4B5563', backgroundColor: '#F9FAFB', padding: '8px', borderRadius: '4px', marginBottom: '12px', lineHeight: 1.5 }}>
                                            {item.m}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => showToast(`피드백: ${item.t}`)}
                                                style={{
                                                    flex: 1, padding: '6px 0', borderRadius: '4px',
                                                    backgroundColor: 'white', border: `1px solid ${colors.border}`,
                                                    fontSize: '10px', fontWeight: 'bold', color: '#4B5563',
                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                피드백
                                            </button>
                                            <button
                                                onClick={() => resolveActionItem(item.id)}
                                                style={{
                                                    flex: 1, padding: '6px 0', borderRadius: '4px',
                                                    backgroundColor: colors.primaryBlue, border: 'none',
                                                    fontSize: '10px', fontWeight: 'bold', color: 'white',
                                                    cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                조치완료
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
