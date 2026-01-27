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
        registeredTpos,
        actionPlanItems, updateActionPlanItem,
        workplace, setWorkplace,
        team, setTeam,
        job, setJob,
        teams
    } = usePDCA();

    const [selectedSopId, setSelectedSopId] = useState<number | null>(null);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const selectedSop = registeredTpos.find(t => t.id === selectedSopId);

    // Use jobs from the global teams mapping
    const currentJobs = teams[team]?.jobs || [];

    useEffect(() => {
        if (currentJobs[0] && !currentJobs.includes(job)) {
            setJob(currentJobs[0]);
        }
    }, [team, currentJobs]);

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
                            value={workplace}
                            onChange={(e) => setWorkplace(e.target.value)}
                        >
                            <option value="소노벨 천안">소노벨 천안</option>
                            <option value="소노벨 경주">소노벨 경주</option>
                        </select>
                        <select
                            style={selectStyle}
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                        >
                            {Object.entries(teams).map(([key, info]) => (
                                <option key={key} value={key}>{info.label}</option>
                            ))}
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
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{teams[team]?.label}</div>
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
                                    onClick={() => setJob(jobName)}
                                    style={{
                                        border: job === jobName ? `2px solid ${colors.primaryBlue}` : `2px solid ${colors.textDark}`,
                                        borderRadius: '15px',
                                        padding: '20px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: job === jobName ? `0 0 10px ${colors.lightBlue}` : 'none',
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
                            const tpo = registeredTpos.find(t => t.job === job);

                            const handleAction = (status: 'O' | 'X', understanding: string) => {
                                if (!tpo) return;
                                addInspectionResult({
                                    time: new Date().toLocaleString(),
                                    name: workerName,
                                    area: `${Math.floor(Math.random() * 200 + 800)}호`,
                                    item: tpo.criteria.checklist,
                                    status: status,
                                    role: job,
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
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{job} : {workerName}</div>
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
                                                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', borderBottom: `2px solid ${colors.primaryBlue}`, paddingBottom: '4px' }}>{job}</div>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>객실팀 업무수행 점검리스트</h2>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{ padding: '8px 25px', backgroundColor: colors.primaryBlue, color: 'white', border: 'none', borderRadius: '25px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>수정하기</button>
                            <button style={{ padding: '8px 25px', backgroundColor: '#3F51B5', color: 'white', border: 'none', borderRadius: '25px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>등록하기</button>
                        </div>
                    </div>

                    {/* Search Bar Section */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="업무수행 점검 상황을 검색해 보세요"
                            style={{
                                width: '100%',
                                padding: '15px 20px 15px 50px',
                                border: `2px solid ${colors.textDark}`,
                                borderRadius: '10px',
                                fontSize: '1rem',
                                color: colors.textDark
                            }}
                        />
                        <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: colors.textGray }}>🔍</div>
                    </div>

                    {/* Filter Tags */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {[
                            { label: '마감업무', id: 1 },
                            { label: '인스펙션', id: 2 },
                            { label: '린넨물 관리', id: 3 }
                        ].map(tag => (
                            <div key={tag.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 15px',
                                backgroundColor: 'white',
                                border: `1px solid ${colors.textDark}`,
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}>
                                {tag.label} <span style={{ cursor: 'pointer', color: colors.textGray }}>✕</span>
                            </div>
                        ))}
                    </div>

                    {/* Rest of the content will be updated in the next step (Table) */}

                    {/* SOP Management Table (Matching Slide 6) */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0',
                        border: `1px solid ${colors.textDark}`,
                        overflow: 'hidden',
                        marginTop: '10px'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#E8EAF6', borderBottom: `1px solid ${colors.textDark}` }}>
                                    <th rowSpan={2} style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}`, width: '120px' }}>A 사업장</th>
                                    <th rowSpan={2} style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}`, width: '100px' }}>직무/팀</th>
                                    <th rowSpan={2} style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}`, width: '100px' }}>직무상세</th>
                                    <th colSpan={3} style={{ padding: '8px', borderRight: `1px solid ${colors.textDark}`, borderBottom: `1px solid ${colors.textDark}` }}>점검 해야 할 상황</th>
                                    <th rowSpan={2} style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}` }}>점검 체크리스트</th>
                                    <th rowSpan={2} style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}`, width: '80px' }}>점검 항목</th>
                                    <th rowSpan={2} style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}`, width: '70px' }}>이행근거 요구</th>
                                    <th rowSpan={2} style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}`, width: '70px' }}>검증 방법</th>
                                    <th rowSpan={2} style={{ padding: '12px', width: '70px' }}>업무 수행자</th>
                                </tr>
                                <tr style={{ backgroundColor: '#E8EAF6', borderBottom: `1px solid ${colors.textDark}` }}>
                                    <th style={{ padding: '8px', borderRight: `1px solid ${colors.textDark}`, width: '80px' }}>Time</th>
                                    <th style={{ padding: '8px', borderRight: `1px solid ${colors.textDark}`, width: '100px' }}>Place</th>
                                    <th style={{ padding: '8px', borderRight: `1px solid ${colors.textDark}`, width: '120px' }}>Occasion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredTpos.filter(t => t.team === team).map((t, idx, arr) => (
                                    <tr key={t.id} style={{ borderBottom: `1px solid ${colors.textDark}`, backgroundColor: selectedSopId === t.id ? '#F0F4F8' : 'transparent' }}>
                                        {idx === 0 && <td rowSpan={arr.length} style={{ borderRight: `1px solid ${colors.textDark}`, fontWeight: 'bold' }}>{workplace}</td>}
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}`, backgroundColor: '#F8F9FB' }}>{t.job}</td>
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}` }}>{t.criteria.checklist.split(' ')[0]}</td>
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}` }}>{t.tpo.time}</td>
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}` }}>{t.tpo.place}</td>
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}` }}>{t.tpo.occasion}</td>
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}`, textAlign: 'left' }}>{t.criteria.checklist}</td>
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}` }}>
                                            <button
                                                onClick={() => setSelectedSopId(t.id)}
                                                style={{
                                                    backgroundColor: selectedSopId === t.id ? colors.textDark : colors.primaryBlue,
                                                    color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer'
                                                }}
                                            >
                                                {selectedSopId === t.id ? '선택됨' : '선택'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}` }}>{t.matching.evidence}</td>
                                        <td style={{ padding: '12px', borderRight: `1px solid ${colors.textDark}` }}>{t.matching.method}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button style={{ backgroundColor: '#212121', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>지정</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Inspection Item Box (Slide 6 Bottom Right) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <div style={{
                            width: '350px',
                            border: `2px solid ${colors.textDark}`,
                            borderRadius: '15px',
                            padding: '15px',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: colors.textDark }}>업무수행 점검 항목</h3>
                                <button
                                    onClick={() => {
                                        if (!selectedSop) return;
                                        const allChecked = selectedSop.criteria.items.every(item => checkedItems[item]);
                                        addInspectionResult({
                                            time: new Date().toLocaleTimeString(),
                                            name: '최민수',
                                            area: selectedSop.tpo.place,
                                            item: selectedSop.criteria.checklist,
                                            status: allChecked ? 'O' : 'X',
                                            role: selectedSop.job,
                                            reason: allChecked ? '' : '세부 항목 일부 미이행',
                                            tpoId: selectedSop.id
                                        });
                                        alert(allChecked ? '점검 결과가 정상 등록되었습니다.' : '미준수 항목이 발생하여 조치계획 보드로 탐지되었습니다.');
                                        setCheckedItems({});
                                        setSelectedSopId(null);
                                    }}
                                    style={{ backgroundColor: colors.primaryBlue, color: 'white', border: 'none', borderRadius: '15px', padding: '4px 15px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    저장
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedSop ? (
                                    selectedSop.criteria.items.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: colors.textDark }}>{item}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    backgroundColor: i % 2 === 0 ? '#FF9800' : '#D32F2F',
                                                    color: 'white',
                                                    borderRadius: '15px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {i % 2 === 0 ? '표준 이미지 존재' : '표준 이미지 미준수'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={!!checkedItems[item]}
                                                    onChange={(e) => setCheckedItems(prev => ({ ...prev, [item]: e.target.checked }))}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', color: colors.textGray, fontSize: '0.85rem', padding: '20px' }}>
                                        상단 테이블에서 점검할 상황을 선택하세요.
                                    </div>
                                )}
                            </div>
                        </div>
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
                        {actionPlanItems.map(item => (
                            <div key={item.id} style={{ border: `2px solid ${colors.textDark}`, borderRadius: '15px', padding: '20px', backgroundColor: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.team} / {item.category}</div>
                                    <div style={{
                                        color: item.status === 'pending' ? '#D32F2F' : item.status === 'in_progress' ? '#1565C0' : '#2E7D32',
                                        fontWeight: 'bold', fontSize: '0.9rem'
                                    }}>
                                        {item.status === 'pending' ? '즉시 조치 필요' : item.status === 'in_progress' ? '조치 중' : '조치 완료'}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#F5F5F5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '5px' }}>{item.issue}</div>
                                    <p style={{ fontSize: '0.85rem', color: colors.textGray, margin: 0 }}>발생일시: {item.timestamp}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#D32F2F', margin: '4px 0 0 0' }}>원인: {item.reason}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', alignSelf: 'center' }}>문제 원인</div>
                                    <input
                                        type="text"
                                        placeholder="문제 발생 원인을 입력하세요"
                                        value={item.cause || ''}
                                        onChange={(e) => updateActionPlanItem(item.id, { cause: e.target.value })}
                                        style={{ ...selectStyle, width: '100%' }}
                                    />
                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', alignSelf: 'center' }}>조치 방법</div>
                                    <input
                                        type="text"
                                        placeholder="조치 방법을 입력하세요"
                                        value={item.solution || ''}
                                        onChange={(e) => updateActionPlanItem(item.id, { solution: e.target.value })}
                                        style={{ ...selectStyle, width: '100%' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={() => updateActionPlanItem(item.id, { status: 'completed' })}
                                            style={{
                                                padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`,
                                                backgroundColor: item.status === 'completed' ? '#2E7D32' : '#E8F5E9',
                                                color: item.status === 'completed' ? 'white' : '#2E7D32',
                                                fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                                            }}
                                        >
                                            조치완료
                                        </button>
                                        <button
                                            onClick={() => updateActionPlanItem(item.id, { status: 'in_progress' })}
                                            style={{
                                                padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`,
                                                backgroundColor: item.status === 'in_progress' ? '#1565C0' : '#E3F2FD',
                                                color: item.status === 'in_progress' ? 'white' : '#1565C0',
                                                fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                                            }}
                                        >
                                            조치중
                                        </button>
                                        <button
                                            onClick={() => updateActionPlanItem(item.id, { status: 'impossible' })}
                                            style={{
                                                padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`,
                                                backgroundColor: item.status === 'impossible' ? '#C62828' : '#FFEBEE',
                                                color: item.status === 'impossible' ? 'white' : '#C62828',
                                                fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                                            }}
                                        >
                                            조치불가
                                        </button>
                                    </div>
                                    <button style={{ padding: '6px 15px', backgroundColor: colors.primaryBlue, color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>저장</button>
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
