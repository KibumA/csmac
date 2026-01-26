'use client';

import React, { useState, useEffect } from 'react';
import { usePDCA } from '../../context/PDCAContext';
import { colors, selectStyle } from '../../styles/theme';
import { InspectionRecord } from '@csmac/types';

export default function DoPhaseContent() {
    const {
        activeDoSubPhase,
        setActiveDoSubPhase,
        inspectionResults, addInspectionResult,
        registeredTpos
    } = usePDCA();

    const [activeJobFilter, setActiveJobFilter] = useState('지배인');
    const [localWorkplace, setLocalWorkplace] = useState('소노벨 천안');
    const [localTeam, setLocalTeam] = useState('프론트');

    const teamJobMap: { [key: string]: string[] } = {
        '프론트': ['지배인', '리셉션', '컨시어즈'],
        '객실관리': ['인스펙터', '룸메이드'],
        '시설': ['시설담당', '정비팀']
    };

    const currentJobs = teamJobMap[localTeam] || [];

    useEffect(() => {
        if (currentJobs[0]) setActiveJobFilter(currentJobs[0]);
    }, [localTeam]);

    const subPhases = [
        { id: 'instruction', label: '업무지시 보드' },
        { id: 'jobcard', label: '직무카드' },
        { id: 'actionplan', label: '조치계획 보드' },
        { id: 'checklist', label: '업무수행 점검 리스트' },
        { id: 'plan', label: '점검계획서' },
        { id: 'archive', label: '보관함' },
    ];

    return (
        <>
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.2rem', color: colors.textDark, marginBottom: '8px' }}>
                    <span style={{ color: colors.primaryBlue, fontWeight: 'bold' }}>Do 1-1.</span> 구성원 업무 현황을 <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>한눈에 파악</span> 할 수 있어 <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>업무지시를 빠르게</span> 할 수 있다
                </h1>
            </header>

            <div style={{ display: 'flex', gap: '2px', marginBottom: '30px', borderBottom: `2px solid ${colors.primaryBlue}` }}>
                {subPhases.map(phase => (
                    <div
                        key={phase.id}
                        onClick={() => setActiveDoSubPhase(phase.id)}
                        style={{
                            padding: '12px 25px',
                            cursor: 'pointer',
                            backgroundColor: activeDoSubPhase === phase.id ? colors.primaryBlue : '#F3F5F7',
                            color: activeDoSubPhase === phase.id ? colors.white : colors.textGray,
                            fontWeight: 'bold',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem'
                        }}
                    >
                        {phase.label}
                    </div>
                ))}
            </div>

            {activeDoSubPhase === 'instruction' ? (
                <>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>업무지시 보드</div>
                        <select
                            style={selectStyle}
                            value={localWorkplace}
                            onChange={(e) => setLocalWorkplace(e.target.value)}
                        >
                            <option value="소노벨 천안">소노벨 천안</option>
                            <option value="소노벨 경주">소노벨 경주</option>
                        </select>
                        <select
                            style={selectStyle}
                            value={localTeam}
                            onChange={(e) => setLocalTeam(e.target.value)}
                        >
                            <option value="프론트">프론트</option>
                            <option value="객실관리">객실관리</option>
                            <option value="시설">시설</option>
                        </select>
                    </div>

                    <div style={{
                        backgroundColor: colors.primaryBlue,
                        borderRadius: '15px',
                        padding: '25px 40px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'white',
                        marginBottom: '30px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{localTeam}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>팀원 수 12명</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>오늘 근무자 수 9명</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>오늘 <span style={{ color: '#FFCDD2', textDecoration: 'underline' }}>휴무자 수</span> 3명</div>
                    </div>

                    {/* Row 1: Role Selection Headers Container */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        marginBottom: '40px', // Robust physical separation
                        alignItems: 'stretch'
                    }}>
                        {currentJobs.map((jobName, colIdx) => {
                            const jobDescMap: { [key: string]: string } = {
                                '지배인': '팀 총괄 보조, VIP 응대',
                                '리셉션': '체크인/아웃, 정산 관리',
                                '컨시어즈': '고객 수하물, 시설 안내',
                                '인스펙터': '객실 정비 상태 최종 점검',
                                '룸메이드': '객실 청구, 베딩, 소모품 보충',
                                '시설담당': '전기, 설비, 기계 상시 점검',
                                '정비팀': '가구, 내외장재 보수'
                            };

                            return (
                                <div
                                    key={`header-${colIdx}`}
                                    onClick={() => setActiveJobFilter(jobName)}
                                    style={{
                                        border: activeJobFilter === jobName ? `2px solid ${colors.primaryBlue}` : `2px solid ${colors.textDark}`,
                                        borderRadius: '15px',
                                        padding: '20px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: activeJobFilter === jobName ? `0 0 10px ${colors.lightBlue}` : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: '180px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', borderBottom: `2px solid ${colors.primaryBlue}`, paddingBottom: '2px' }}>{jobName}</div>
                                        <div style={{ fontSize: '0.8rem', color: colors.primaryBlue, fontWeight: 'bold' }}>{jobDescMap[jobName] || '직무 상세 설명'}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', marginTop: 'auto' }}>
                                        <div style={{ padding: '4px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`, fontSize: '0.85rem' }}>{jobName} ∨</div>
                                    </div>
                                    <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>근무자</span>
                                            {['박', '최'].map((w, idx) => (
                                                <div key={idx} style={{ width: '30px', height: '30px', backgroundColor: '#CFD8DC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>{w}</div>
                                            ))}
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>+1</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#D32F2F' }}>휴무자</span>
                                            <div style={{ width: '30px', height: '30px', backgroundColor: 'white', border: `1px solid ${colors.border}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>김</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '0.75rem', color: colors.primaryBlue, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>평균 준수율: 92.5%</span>
                                        <span>이행근거 요구: 24건</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Row 2: Detailed Worker Task Cards Container */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        alignItems: 'start'
                    }}>
                        {[0, 1, 2].map((colIdx) => {
                            const workerNames = ['박기철', '최민수', '이영희'];
                            const workerName = workerNames[colIdx];
                            // Find TPO registered for this specific job filter
                            const tpo = registeredTpos.find(t => t.job === activeJobFilter);

                            const handleAction = (status: 'O' | 'X', understanding: string) => {
                                if (!tpo) return;
                                addInspectionResult({
                                    time: new Date().toLocaleString(),
                                    name: workerName,
                                    area: `${Math.floor(Math.random() * 200 + 800)}호`,
                                    item: tpo.criteria.checklist,
                                    status: status,
                                    role: activeJobFilter,
                                    reason: status === 'X' ? understanding : '',
                                    tpoId: tpo.id
                                });
                                alert(`${workerName}의 '${understanding}' 참여 기록이 전송되었습니다.`);
                            };

                            return (
                                <div key={`worker-${colIdx}`}>
                                    {tpo ? (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ flex: 1, border: `2px solid ${colors.textDark}`, borderRadius: '20px', padding: '20px', backgroundColor: 'white', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{activeJobFilter} : {workerName}</div>
                                                    <div style={{ color: colors.textGray }}>•••</div>
                                                </div>
                                                <div style={{ marginBottom: '10px', fontSize: '0.9rem', fontWeight: 'bold', lineHeight: '1.6' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ color: colors.textGray, fontSize: '0.8rem' }}>근속기간 : 5개월</span>
                                                        <button
                                                            onClick={() => handleAction('O', '수행 완료')}
                                                            style={{ backgroundColor: colors.primaryBlue, color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
                                                        >
                                                            보내기
                                                        </button>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '5px', marginTop: '5px' }}>
                                                        <span style={{ color: colors.textGray }}>Time :</span> <span>{tpo.tpo.time}</span>
                                                        <span style={{ color: colors.textGray }}>Place :</span> <span>{tpo.tpo.place}</span>
                                                        <span style={{ color: colors.textGray }}>Occasion :</span> <span>{tpo.tpo.occasion}</span>
                                                    </div>
                                                </div>
                                                <div style={{ backgroundColor: '#E3F2FD', borderRadius: '8px', padding: '12px', marginBottom: '15px', fontSize: '0.9rem', fontWeight: 'bold', borderLeft: `4px solid ${colors.primaryBlue}` }}>
                                                    {tpo.criteria.checklist}
                                                </div>
                                                <div style={{ marginBottom: '15px' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>업무지시 이해도 체크</span>
                                                        <span style={{ color: colors.primaryBlue }}>확인 대기 중</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '3px' }}>
                                                        <button onClick={() => handleAction('O', '이해완료')} style={{ flex: 1, padding: '6px 0', borderRadius: '6px', border: `1px solid ${colors.border}`, backgroundColor: 'white', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>이해완료</button>
                                                        <button onClick={() => handleAction('X', '모호')} style={{ flex: 1, padding: '6px 0', borderRadius: '6px', border: `1px solid ${colors.border}`, backgroundColor: 'white', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>모호</button>
                                                        <button onClick={() => handleAction('X', '이해불가')} style={{ flex: 1, padding: '6px 0', borderRadius: '6px', border: `1px solid ${colors.border}`, backgroundColor: 'white', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>이해불가</button>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>이행 근거</div>
                                                    <div style={{ fontSize: '1.2rem', color: colors.textGray, cursor: 'pointer' }} onClick={() => handleAction('O', '사진 업로드')}>📷</div>
                                                </div>
                                            </div>
                                            <div style={{ width: '80px', border: `2px solid ${colors.textDark}`, borderRadius: '15px', padding: '10px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', borderBottom: `2px solid ${colors.primaryBlue}`, paddingBottom: '4px' }}>{activeJobFilter}</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', lineHeight: '1.3' }}>00월 미준수<br />누적 수 : {inspectionResults.filter((r: InspectionRecord) => r.name === workerName && r.status === 'X').length}회</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', lineHeight: '1.3' }}>수행 준수율<br />{
                                                    inspectionResults.filter((r: InspectionRecord) => r.name === workerName).length > 0
                                                        ? Math.round((inspectionResults.filter((r: InspectionRecord) => r.name === workerName && r.status === 'O').length / inspectionResults.filter((r: InspectionRecord) => r.name === workerName).length) * 100)
                                                        : 100
                                                }%</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ border: `1px dashed ${colors.border}`, borderRadius: '20px', padding: '40px', textAlign: 'center', color: colors.textGray, fontSize: '0.9rem' }}>
                                            등록된 TPO 업무가 없습니다.<br />'Plan' 단계에서 등록해주세요.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : activeDoSubPhase === 'checklist' ? (
                <div>
                    <header style={{ marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '1.2rem', color: colors.textDark, fontWeight: 'bold' }}>Do 1-2. 업무수행 점검 리스트</h2>
                        <p style={{ color: colors.textGray, fontSize: '0.9rem', marginTop: '5px' }}>객실팀 업무수행 점검 결과를 확인하여 미준수 항목을 관리합니다.</p>
                    </header>

                    {/* Summary Statistics Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        {[
                            { label: '총 점검 건수', value: `${inspectionResults.length}건`, color: colors.textDark },
                            { label: '준수 건수', value: `${inspectionResults.filter((r: InspectionRecord) => r.status === 'O').length}건`, color: '#2E7D32' },
                            { label: '미준수 건수', value: `${inspectionResults.filter((r: InspectionRecord) => r.status === 'X').length}건`, color: '#D32F2F', highlight: inspectionResults.filter((r: InspectionRecord) => r.status === 'X').length > 0 },
                            { label: '평균 준수율', value: `${inspectionResults.length > 0 ? Math.round((inspectionResults.filter((r: InspectionRecord) => r.status === 'O').length / inspectionResults.length) * 100) : 100}%`, color: colors.primaryBlue, isRate: true }
                        ].map((stat, idx) => (
                            <div key={idx} style={{
                                backgroundColor: 'white',
                                padding: '20px',
                                borderRadius: '15px',
                                border: stat.highlight ? `2px solid #D32F2F` : `1px solid ${colors.border}`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '10px', fontWeight: 'bold' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                                {stat.isRate && <div style={{ fontSize: '0.8rem', color: '#2E7D32', marginTop: '5px' }}>▲ 2.3% vs 전주</div>}
                            </div>
                        ))}
                    </div>

                    {/* Inspection Group Tabs (Slide 6 concepts) */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {['전체', '인스펙터', '룸메이드'].map(tab => (
                            <button key={tab} style={{
                                padding: '8px 20px',
                                borderRadius: '20px',
                                border: tab === '인스펙터' ? `none` : `1px solid ${colors.border}`,
                                backgroundColor: tab === '인스펙터' ? colors.primaryBlue : 'white',
                                color: tab === '인스펙터' ? 'white' : colors.textGray,
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Detailed Inspection Table */}
                    <div style={{ backgroundColor: 'white', borderRadius: '15px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8F9FB', borderBottom: `2px solid ${colors.border}` }}>
                                    <th style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '0.9rem', color: colors.textGray }}>순번</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '0.9rem', color: colors.textGray }}>점검 시간</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '0.9rem', color: colors.textGray }}>점검자</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '0.9rem', color: colors.textGray }}>점검 구역</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '0.9rem', color: colors.textGray }}>점검 항목 (Checklist)</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '0.9rem', color: colors.textGray, textAlign: 'center' }}>결과</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '0.9rem', color: colors.textGray }}>이행 근거 (AI)</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 'bold', fontSize: '0.9rem', color: colors.textGray }}>조치</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inspectionResults.map((row: InspectionRecord, idx: number) => (
                                    <tr key={row.id} style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: row.status === 'X' ? '#FFF8F8' : 'white' }}>
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem' }}>{inspectionResults.length - idx}</td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: colors.textGray }}>{row.time}</td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem', fontWeight: 'bold' }}>{row.name} <span style={{ fontSize: '0.75rem', color: colors.textGray, fontWeight: 'normal' }}>({row.role})</span></td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem' }}>{row.area}</td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem', fontWeight: row.status === 'X' ? 'bold' : 'normal' }}>
                                            {row.item}
                                            {row.reason && <div style={{ fontSize: '0.8rem', color: '#D32F2F', marginTop: '4px' }}>└ {row.reason}</div>}
                                        </td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '24px',
                                                height: '24px',
                                                lineHeight: '24px',
                                                borderRadius: '50%',
                                                backgroundColor: row.status === 'O' ? '#E8F5E9' : '#FFEBEE',
                                                color: row.status === 'O' ? '#2E7D32' : '#D32F2F',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem'
                                            }}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '40px', height: '30px', backgroundColor: '#EEE', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: colors.textGray }}>IMG</div>
                                                <span style={{ fontSize: '0.8rem', color: colors.primaryBlue, textDecoration: 'underline', cursor: 'pointer' }}>AI 판독</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            {row.status === 'X' ? (
                                                <button style={{ padding: '4px 12px', backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>조치하기</button>
                                            ) : (
                                                <span style={{ color: colors.textGray, fontSize: '0.75rem' }}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeDoSubPhase === 'actionplan' ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.textDark }}>조치계획 보드</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ padding: '8px 15px', backgroundColor: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>고객접점 미준수 4건</div>
                            <div style={{ padding: '8px 15px', backgroundColor: '#FFF3E0', color: '#EF6C00', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>법적의무이행 미준수 3건</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {[1, 2].map(i => (
                            <div key={i} style={{ border: `2px solid ${colors.textDark}`, borderRadius: '15px', padding: '20px', backgroundColor: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{i === 1 ? '객실팀 / 객실안전성' : '로비 / 로비안전성'}</div>
                                    <div style={{ color: '#D32F2F', fontWeight: 'bold', fontSize: '0.9rem' }}>{i === 1 ? '10일째 방치' : '즉시 조치 필요'}</div>
                                </div>
                                <div style={{ backgroundColor: '#F5F5F5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '5px' }}>{i === 1 ? '노블리안 923호 방충망 탈락 방지' : '로비 회전문 파손 상태를 조치해주세요!'}</div>
                                    <p style={{ fontSize: '0.85rem', color: colors.textGray, margin: 0 }}>발생일시: 2025.12.01 14:00</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', alignSelf: 'center' }}>문제 원인</div>
                                    <input type="text" placeholder="문제 발생 원인을 입력하세요" style={{ ...selectStyle, width: '100%' }} />
                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', alignSelf: 'center' }}>조치 방법</div>
                                    <input type="text" placeholder="조치 방법을 입력하세요" style={{ ...selectStyle, width: '100%' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button style={{ padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`, backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.8rem', fontWeight: 'bold' }}>조치완료</button>
                                        <button style={{ padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`, backgroundColor: '#E3F2FD', color: '#1565C0', fontSize: '0.8rem', fontWeight: 'bold' }}>조치중</button>
                                        <button style={{ padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`, backgroundColor: '#FFEBEE', color: '#C62828', fontSize: '0.8rem', fontWeight: 'bold' }}>조치불가</button>
                                    </div>
                                    <button style={{ padding: '6px 15px', backgroundColor: colors.primaryBlue, color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem' }}>등록하기</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '50px',
                    textAlign: 'center',
                    backgroundColor: '#F8F9FB',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    color: colors.textGray
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚧</div>
                    <h3 style={{ fontSize: '1.2rem', color: colors.textDark, marginBottom: '10px' }}>
                        {subPhases.find(p => p.id === activeDoSubPhase)?.label} 화면 준비 중
                    </h3>
                    <p>현재 '업무지시 보드' 및 '조치계획 보드' 기능이 활성화되어 있습니다.</p>
                </div>
            )}
        </>
    );
}
