'use client';

import React, { useState } from 'react';
import {
    Users, TrendingUp, AlertTriangle, CheckCircle2,
    ArrowRight, MessageSquare, Briefcase, Clock,
    ShieldAlert, Search, Filter, PieChart, ShieldCheck,
    LayoutDashboard, ClipboardList
} from 'lucide-react';
import { colors } from '../../styles/theme';
import { useActPhase, StaffData } from '../../hooks/useActPhase';
import ActionPlanBoard from './actphase/ActionPlanBoard';
import { TEAM_ROSTERS } from '../../constants/team-rosters';

export default function ActPhaseContent() {
    const {
        usersData, selectedUser, setSelectedUser,
        timeRange, setTimeRange, stats, mounted,
        activeTab, setActiveTab, onResolve, onFeedback
    } = useActPhase();

    const [showStaffPopup, setShowStaffPopup] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('전체');

    if (!mounted) return null;

    const selectedStaff = usersData.find(u => u.id === selectedUser);

    // Helper to find team for a user name
    const getTeamForUser = (userName: string) => {
        for (const [teamName, members] of Object.entries(TEAM_ROSTERS)) {
            if (members.some(m => m.name === userName)) return teamName;
        }
        return '기타';
    };

    const filteredUsersData = (selectedTeam === '전체'
        ? usersData
        : usersData.filter(u => TEAM_ROSTERS[selectedTeam]?.some(member => member.name === u.name))
    ).sort((a, b) => {
        // 1. Team Sort
        const teamA = getTeamForUser(a.name);
        const teamB = getTeamForUser(b.name);
        if (teamA !== teamB) return teamA.localeCompare(teamB, 'ko-KR');

        // 2. Role Sort
        const roleA = a.role || '';
        const roleB = b.role || '';
        if (roleA !== roleB) return roleA.localeCompare(roleB, 'ko-KR');

        // 3. Name Sort
        return a.name.localeCompare(b.name, 'ko-KR');
    });

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* Header section with Tab Switcher */}
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: colors.textDark, marginBottom: '8px' }}>
                        <span style={{ color: colors.primaryBlue }}>Act.</span> {activeTab === 'board' ? '조치계획보드' : 'TPO 이행 품질 지표 분석'}
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1rem' }}>
                        {activeTab === 'board'
                            ? '미준수 항목에 대한 즉시 조치 및 피드백 관리'
                            : '실무자별 성과 지표 분석 및 개선 조치 이력'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '14px', marginBottom: '4px' }}>
                    <button
                        onClick={() => setActiveTab('board')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', border: 'none',
                            background: activeTab === 'board' ? 'white' : 'transparent',
                            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
                            color: activeTab === 'board' ? colors.primaryBlue : '#64748B',
                            boxShadow: activeTab === 'board' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ClipboardList size={16} />
                        조치계획보드
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', border: 'none',
                            background: activeTab === 'analysis' ? 'white' : 'transparent',
                            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
                            color: activeTab === 'analysis' ? colors.primaryBlue : '#64748B',
                            boxShadow: activeTab === 'analysis' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LayoutDashboard size={16} />
                        KPI 데이터 분석
                    </button>
                </div>
            </header>

            {/* Stats Overlay - Always visible for context */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <StatCard
                    icon={<Users size={20} color={colors.primaryBlue} />}
                    label="분석 대상 인원"
                    value={`${usersData.length}명`}
                    sub="전 팀 Staff 기준"
                    color={colors.primaryBlue}
                    onClick={() => setShowStaffPopup(true)}
                />
                <StatCard
                    icon={<PieChart size={20} color={colors.success} />}
                    label="표준 준수율 (OK)"
                    value={`${stats.rate}%`}
                    sub={`${stats.ok}/${stats.total} 항목`}
                    color={colors.success}
                />
                <StatCard
                    icon={<AlertTriangle size={20} color="#EF4444" />}
                    label="미준수 항목"
                    value={`${stats.non}건`}
                    sub="즉시 조치 필요"
                    color="#EF4444"
                />
                <StatCard
                    icon={<TrendingUp size={20} color="#F59E0B" />}
                    label="개선 진행도"
                    value={`${stats.rate > 0 ? stats.rate : 0}%`}
                    sub={stats.total > 0 ? "전체 진행률" : "데이터 없음"}
                    color="#F59E0B"
                />
            </div>

            {activeTab === 'board' ? (
                <ActionPlanBoard
                    usersData={usersData}
                    onResolve={onResolve}
                    onFeedback={onFeedback}
                />
            ) : (
                <>
                    {/* Main Content Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px' }}>

                        {/* Left: KPI Matrix & Analysis */}
                        <section style={{ backgroundColor: 'white', border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '4px', height: '18px', backgroundColor: colors.primaryBlue, borderRadius: '2px' }} />
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B' }}>실무자 KPI 매트릭스</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {/* Team Filters */}
                                    <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                                        {['전체', ...Object.keys(TEAM_ROSTERS)].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setSelectedTeam(t)}
                                                style={{ border: 'none', background: t === selectedTeam ? 'white' : 'transparent', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: t === selectedTeam ? colors.primaryBlue : '#64748B', boxShadow: t === selectedTeam ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ width: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />
                                    {/* Sort Buttons */}
                                    <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                                        {['Risk 순', '점수 순'].map(t => (
                                            <button key={t} style={{ border: 'none', background: t === 'Risk 순' ? 'white' : 'transparent', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: t === 'Risk 순' ? colors.primaryBlue : '#64748B', boxShadow: t === 'Risk 순' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'left' }}>
                                        <th style={{ padding: '0 12px' }}>실무자</th>
                                        <th>정확성</th>
                                        <th>신속성</th>
                                        <th>충실도</th>
                                        <th>공유도</th>
                                        <th>Total</th>
                                        <th style={{ textAlign: 'right', paddingRight: '12px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsersData.map((user) => (
                                        <tr
                                            key={user.id}
                                            onClick={() => setSelectedUser(user.id)}
                                            style={{
                                                backgroundColor: selectedUser === user.id ? '#EFF6FF' : 'white',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: `1px solid ${selectedUser === user.id ? colors.primaryBlue : 'transparent'}`
                                            }}
                                        >
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: user.status === 'RISK' ? '#FEF2F2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: user.status === 'RISK' ? '#EF4444' : colors.primaryBlue }}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{user.name}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748B' }}>{user.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><Score score={user.accuracy || '100%'} /></td>
                                            <td><Score score={user.speed || '100%'} /></td>
                                            <td><Score score={user.loyalty || '100%'} /></td>
                                            <td><Score score={user.share || '100%'} /></td>
                                            <td style={{ fontSize: '14px', fontWeight: 900, color: colors.primaryBlue, fontStyle: 'italic' }}>{user.total}</td>
                                            <td style={{ textAlign: 'right', paddingRight: '12px' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, backgroundColor: user.status === 'RISK' ? '#FEF2F2' : '#ECFDF5', color: user.status === 'RISK' ? '#EF4444' : '#10B981', border: `1px solid ${user.status === 'RISK' ? '#FEE2E2' : '#D1FAE5'}` }}>
                                                    {user.status === 'RISK' ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                                                    {user.status}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        {/* Right: User Analysis Card */}
                        <aside>
                            {selectedStaff ? (
                                <div style={{ backgroundColor: '#1E293B', color: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'sticky', top: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                        <div>
                                            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{selectedStaff.name}</h2>
                                            <p style={{ fontSize: '13px', color: '#94A3B8' }}>{selectedStaff.role} 분석 리포트</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Total</div>
                                                <div style={{ fontSize: '14px', fontWeight: 700 }}>{selectedStaff.counts.total}</div>
                                            </div>
                                            <div style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#EF4444', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                <div style={{ fontSize: '10px', opacity: 0.8 }}>Issue</div>
                                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{selectedStaff.counts.non}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phase Navigation */}
                                    <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
                                        {['미준수 항목', '완료 항목', '전체'].map(t => (
                                            <button key={t} style={{ flex: 1, border: 'none', background: t === '전체' ? 'white' : 'transparent', padding: '8px 4px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: t === '전체' ? '#1E293B' : '#94A3B8', cursor: 'pointer' }}>{t}</button>
                                        ))}
                                    </div>

                                    {/* Logs */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {selectedStaff.logs.map((log) => (
                                            <div key={log.id} style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'white', color: '#1E293B', borderLeft: `4px solid ${log.isRisk ? '#EF4444' : '#10B981'}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: 800, color: colors.primaryBlue }}>{log.tag}</div>
                                                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{log.time}</div>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>{log.t}</div>

                                                {/* AI Match Rate Insight */}
                                                {log.aiScore !== undefined && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '6px 8px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                                        <ShieldCheck size={14} color={colors.primaryBlue} />
                                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>AI 판독 결과: {log.aiScore}%</span>
                                                    </div>
                                                )}

                                                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, marginBottom: '10px' }}>{log.m}</div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                    <button style={{ flex: 1, padding: '8px', border: '1px solid #E2E8F0', backgroundColor: 'white', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>피드백</button>
                                                    <button
                                                        onClick={() => onResolve(log.id, '')}
                                                        style={{ flex: 1, padding: '8px', border: 'none', backgroundColor: colors.primaryBlue, borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: 'white' }}
                                                    >
                                                        조치완료
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ border: `2px dashed ${colors.border}`, borderRadius: '20px', padding: '40px 20px', textAlign: 'center', color: '#94A3B8' }}>
                                    <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                    <p style={{ fontSize: '14px', fontWeight: 600 }}>실무자를 선택하여<br />상세 분석 리포트 확인</p>
                                </div>
                            )}
                        </aside>
                    </div>
                </>
            )}

            {/* Staff Popup Modal */}
            {showStaffPopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowStaffPopup(false)}>
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '450px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={20} color={colors.primaryBlue} />
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0 }}>분석 대상 인원 명단</h2>
                            </div>
                            <button onClick={() => setShowStaffPopup(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '24px', lineHeight: 1 }}>&times;</button>
                        </div>
                        <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {usersData.map(user => (
                                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', border: `1px solid ${colors.border}`, backgroundColor: '#F8FAFC' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: user.status === 'RISK' ? '#FEF2F2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', color: user.status === 'RISK' ? '#EF4444' : colors.primaryBlue }}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{user.name} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748B' }}>({user.shift})</span></div>
                                                <div style={{ fontSize: '12px', color: '#64748B' }}>{user.role}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, backgroundColor: user.status === 'RISK' ? '#FEF2F2' : '#ECFDF5', color: user.status === 'RISK' ? '#EF4444' : '#10B981', border: `1px solid ${user.status === 'RISK' ? '#FEE2E2' : '#D1FAE5'}` }}>
                                                {user.status === 'RISK' ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                                                {user.status}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Risk: {user.counts.non}건</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, sub, color, onClick }: { icon: React.ReactNode, label: string, value: string, sub: string, color: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '20px',
                border: `1px solid ${colors.border}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)')}
            onMouseOut={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')}
        >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>{label}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>{sub}</div>
        </div>
    );
}

function Score({ score }: { score: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{score}</span>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: score, height: '100%', backgroundColor: score === '100%' ? colors.success : colors.primaryBlue }} />
            </div>
        </div>
    );
}
