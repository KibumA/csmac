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
        isInspectionModalOpen, setInspectionModalOpen,
        selectedInspectionSopId, setSelectedInspectionSopId,
        workplace, setWorkplace,
        team, setTeam,
        job, setJob,
        teams,
        addJobInstruction,
        jobInstructions
    } = usePDCA();

    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [isInstructionModalOpen, setInstructionModalOpen] = useState(false);

    const selectedSop = registeredTpos.find(t => t.id === selectedInspectionSopId);

    // Use jobs from the global teams mapping
    const currentJobs = teams[team]?.jobs || [];

    useEffect(() => {
        if (currentJobs[0] && !currentJobs.includes(job)) {
            setJob(currentJobs[0]);
        }
    }, [team, currentJobs]);

    const subPhases = [
        { id: 'checklist', label: '업무수행 점검 리스트' },
        { id: 'instruction', label: '업무지시 보드' },
        { id: 'jobcard', label: '직무카드' },
        { id: 'actionplan', label: '조치계획 보드' },
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

                    {/* Row 2: Selected Job Detail & Instruction Input */}
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        {/* Left: Job Detail/SOP List */}
                        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: `1px solid ${colors.border}` }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '15px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '10px' }}>{job} 업무 리스트</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {registeredTpos
                                    .filter(t => t.job === job)
                                    .slice(0, 5) // Show top 5
                                    .map(t => (
                                        <div key={t.id} style={{ padding: '10px', backgroundColor: '#F8F9FA', borderRadius: '8px', fontSize: '0.9rem' }}>
                                            [{t.tpo.time}] {t.criteria.checklist}
                                        </div>
                                    ))}
                                {registeredTpos.filter(t => t.job === job).length === 0 && (
                                    <div style={{ color: colors.textGray, padding: '20px', textAlign: 'center' }}>등록된 업무가 없습니다.</div>
                                )}
                            </div>
                        </div>

                        {/* Right: Job Instruction Form */}
                        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: `1px solid ${colors.border}` }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '20px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '10px' }}>업무지시 (Job Order)</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px', color: colors.textDark }}>담당자 (Assignee)</label>
                                    <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.textDark}`, fontSize: '0.95rem' }}>
                                        <option>김철수 ({job})</option>
                                        <option>이영희 ({job})</option>
                                        <option>박지성 ({job})</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px', color: colors.textDark }}>제목 (Subject)</label>
                                    <input type="text" placeholder="업무 지시 제목을 입력하세요" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.textDark}`, fontSize: '0.95rem' }} id="instruction-subject" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px', color: colors.textDark }}>지시 상세 (Description)</label>
                                    <textarea placeholder="구체적인 업무 지시 내용을 입력하세요..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.textDark}`, fontSize: '0.95rem', minHeight: '100px' }} id="instruction-desc" />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button
                                        onClick={() => {
                                            const subject = (document.getElementById('instruction-subject') as HTMLInputElement).value;
                                            const desc = (document.getElementById('instruction-desc') as HTMLTextAreaElement).value;
                                            if (!subject || !desc) {
                                                alert('제목과 상세 내용을 모두 입력해주세요.');
                                                return;
                                            }
                                            setInstructionModalOpen(true);
                                        }}
                                        style={{
                                            padding: '12px 30px',
                                            backgroundColor: colors.primaryBlue,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        직무카드 생성 (Create Job Card)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Card Preview Modal (Slide 8 Logic) */}
                    {isInstructionModalOpen && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <div style={{
                                width: '400px', backgroundColor: 'white', borderRadius: '15px',
                                padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                                display: 'flex', flexDirection: 'column', gap: '20px'
                            }}>
                                <div style={{ textAlign: 'center', borderBottom: `2px solid ${colors.primaryBlue}`, paddingBottom: '15px' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.primaryBlue }}>JOB CARD</div>
                                    <div style={{ fontSize: '0.9rem', color: colors.textGray }}>업무 지시 확인</div>
                                </div>

                                <div style={{ backgroundColor: '#F8F9FA', padding: '20px', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ color: colors.textGray, fontSize: '0.9rem' }}>To:</span>
                                        <span style={{ fontWeight: 'bold' }}>박지성 ({job})</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ color: colors.textGray, fontSize: '0.9rem' }}>From:</span>
                                        <span style={{ fontWeight: 'bold' }}>관리자</span>
                                    </div>
                                    <div style={{ borderTop: `1px solid ${colors.border}`, margin: '10px 0' }} />
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>
                                        {(document.getElementById('instruction-subject') as HTMLInputElement)?.value}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: colors.textDark, lineHeight: '1.5' }}>
                                        {(document.getElementById('instruction-desc') as HTMLTextAreaElement)?.value}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        addJobInstruction({
                                            targetTeam: team,
                                            assignee: `박지성 (${job})`,
                                            subject: (document.getElementById('instruction-subject') as HTMLInputElement).value,
                                            description: (document.getElementById('instruction-desc') as HTMLTextAreaElement).value,
                                            deadline: new Date().toLocaleDateString(),
                                            status: 'sent',
                                            timestamp: new Date().toISOString()
                                        });
                                        alert('직무카드가 실무자에게 전송되었습니다.');
                                        setInstructionModalOpen(false);
                                        // Optional: Clear inputs
                                    }}
                                    style={{
                                        width: '100%', padding: '15px',
                                        backgroundColor: colors.primaryBlue, color: 'white',
                                        border: 'none', borderRadius: '10px',
                                        fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
                                    }}
                                >
                                    실무자에게 전송 (Send)
                                </button>
                                <button
                                    onClick={() => setInstructionModalOpen(false)}
                                    style={{
                                        width: '100%', padding: '10px',
                                        backgroundColor: 'white', color: colors.textGray,
                                        border: 'none', cursor: 'pointer', fontSize: '0.9rem'
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
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

                    {/* Search Bar & Filter Tags Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ position: 'relative', width: '380px' }}>
                            <input
                                type="text"
                                placeholder="업무수행 점검 상황을 검색해 보세요"
                                style={{
                                    width: '100%',
                                    padding: '12px 20px 12px 45px',
                                    border: `1px solid ${colors.textDark}`,
                                    borderRadius: '25px',
                                    fontSize: '0.95rem',
                                    color: colors.textDark,
                                    backgroundColor: 'white'
                                }}
                            />
                            <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: colors.textGray }}>🔍</div>
                        </div>

                        {/* Filter Tags (Right Aligned) */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {[
                                { label: '마감업무', id: 1 },
                                { label: '인스펙션', id: 2 },
                                { label: '린넨물 관리', id: 3 }
                            ].map(tag => (
                                <div key={tag.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    backgroundColor: '#F3F4F6',
                                    border: 'none',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    color: colors.textDark,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}>
                                    {tag.label} <span style={{ fontSize: '0.8rem', color: colors.textGray }}>✕</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rest of the content will be updated in the next step (Table) */}

                    {/* SOP Management Table (Slide 7) */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: `1px solid ${colors.border}`,
                        overflow: 'hidden',
                        marginTop: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8F9FA', borderBottom: `2px solid ${colors.border}`, color: colors.textDark }}>
                                    <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '100px' }}>사업장</th>
                                    <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '120px' }}>직무/팀</th>
                                    <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '80px' }}>Time</th>
                                    <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '100px' }}>Place</th>
                                    <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '150px' }}>Occasion</th>
                                    <th style={{ padding: '15px 10px', fontWeight: 'bold', textAlign: 'left' }}>체크리스트 (점검 항목)</th>
                                    <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '100px' }}>평가</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredTpos
                                    .filter(t => t.team === team)
                                    .map((t, index) => (
                                        <tr key={t.id} style={{
                                            borderBottom: `1px solid ${colors.border}`,
                                            backgroundColor: selectedInspectionSopId === t.id ? '#E3F2FD' : 'white',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{t.workplace}</td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <div style={{ fontWeight: 'bold', color: colors.textDark }}>{t.job}</div>
                                                <div style={{ fontSize: '0.8rem', color: colors.textGray }}>{teams[t.team]?.label}</div>
                                            </td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '4px', backgroundColor: '#E3F2FD', color: colors.primaryBlue, fontSize: '0.8rem', fontWeight: 'bold' }}>{t.tpo.time}</span>
                                            </td>
                                            <td style={{ padding: '15px 10px', fontWeight: 'bold', color: colors.textDark }}>{t.tpo.place}</td>
                                            <td style={{ padding: '15px 10px', fontWeight: 'bold', color: colors.primaryBlue }}>{t.tpo.occasion}</td>
                                            <td style={{ padding: '15px 10px', textAlign: 'left' }}>
                                                <div style={{ fontWeight: 'bold', color: colors.textDark, marginBottom: '4px' }}>{t.criteria.checklist}</div>
                                                <div style={{ fontSize: '0.8rem', color: colors.textGray }}>
                                                    {t.criteria.items.slice(0, 2).map(i => i).join(', ')}
                                                    {t.criteria.items.length > 2 && ` 외 ${t.criteria.items.length - 2}건`}
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedInspectionSopId(t.id);
                                                        setInspectionModalOpen(true);
                                                    }}
                                                    style={{
                                                        backgroundColor: 'white',
                                                        color: colors.primaryBlue,
                                                        border: `1px solid ${colors.primaryBlue}`,
                                                        borderRadius: '6px',
                                                        padding: '6px 16px',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = colors.primaryBlue;
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                        e.currentTarget.style.color = colors.primaryBlue;
                                                    }}
                                                >
                                                    점검하기
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                {registeredTpos.filter(t => t.team === team).length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '50px', textAlign: 'center', color: colors.textGray }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
                                            <div>등록된 점검 리스트가 없습니다.</div>
                                            <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>Plan 단계에서 새로운 TPO를 등록해주세요.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Inspection Modal (Slide 7 Overlay) */}
                    {isInspectionModalOpen && selectedSop && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                width: '550px',
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '30px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: '85vh'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '15px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>업무점검 실행</h3>
                                        <span style={{ fontSize: '0.9rem', color: colors.textGray }}>{selectedSop?.job} / {selectedSop?.tpo.place}</span>
                                    </div>
                                    <button
                                        onClick={() => setInspectionModalOpen(false)}
                                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: colors.textGray }}
                                    >✕</button>
                                </div>

                                <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#F0F4F8', borderRadius: '12px', borderLeft: `6px solid ${colors.primaryBlue}` }}>
                                    <div style={{ fontSize: '0.85rem', color: colors.primaryBlue, fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Check Point</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: colors.textDark, lineHeight: '1.5' }}>{selectedSop?.criteria.checklist}</div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '25px', paddingRight: '5px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {selectedSop?.criteria.items.map((item, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '15px',
                                                borderRadius: '12px',
                                                border: checkedItems[item] ? `2px solid ${colors.primaryBlue}` : `1px solid ${colors.border}`,
                                                backgroundColor: checkedItems[item] ? '#E3F2FD' : 'white',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }} onClick={() => setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        border: checkedItems[item] ? `6px solid ${colors.primaryBlue}` : `2px solid ${colors.textGray}`,
                                                        backgroundColor: 'white',
                                                        transition: 'all 0.2s'
                                                    }} />
                                                    <span style={{ fontSize: '1rem', color: colors.textDark, fontWeight: checkedItems[item] ? 'bold' : 'normal' }}>{item}</span>
                                                </div>

                                                {/* Simulated 'Standard Image' Badge Logic */}
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    padding: '4px 10px',
                                                    backgroundColor: i === 0 ? '#4CAF50' : '#ECEFF1',
                                                    color: i === 0 ? 'white' : colors.textGray,
                                                    borderRadius: '20px',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    {i === 0 ? '📷 표준 이미지' : 'No Image'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => setInspectionModalOpen(false)}
                                        style={{ flex: 1, padding: '15px', border: `1px solid ${colors.border}`, borderRadius: '12px', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', color: colors.textGray }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={() => {
                                            const allChecked = selectedSop?.criteria.items.every(item => checkedItems[item]);
                                            addInspectionResult({
                                                time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                                                name: '최민수',
                                                area: selectedSop?.tpo.place,
                                                item: selectedSop?.criteria.checklist,
                                                status: allChecked ? 'O' : 'X',
                                                role: selectedSop?.job,
                                                reason: allChecked ? '' : '세부 항목 일부 미이행',
                                                tpoId: selectedSop?.id
                                            });
                                            alert(allChecked ? '점검 결과가 정상 등록되었습니다.' : '미준수 항목이 발생하여 조치계획 보드로 자동 이관되었습니다.');
                                            setCheckedItems({});
                                            setInspectionModalOpen(false);
                                        }}
                                        style={{
                                            flex: 2,
                                            padding: '15px',
                                            backgroundColor: colors.primaryBlue,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                                        }}
                                    >
                                        점검 완료 및 저장
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
            ) : activeDoSubPhase === 'jobcard' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>직무카드 현황 (Job Cards)</h2>
                        <div style={{ padding: '8px 20px', backgroundColor: colors.primaryBlue, color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
                            전송된 직무카드: {jobInstructions.length}건
                        </div>
                    </div>

                    {jobInstructions.length === 0 ? (
                        <div style={{ padding: '50px', textAlign: 'center', backgroundColor: 'white', borderRadius: '15px', border: `1px solid ${colors.border}`, color: colors.textGray }}>
                            전송된 직무카드가 없습니다. 업무지시 보드에서 직무카드를 생성하여 전송해주세요.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {jobInstructions.map(jobInstruction => (
                                <div key={jobInstruction.id} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${colors.border}` }}>
                                        <span style={{ fontWeight: 'bold', color: colors.primaryBlue }}>To: {jobInstruction.assignee}</span>
                                        <span style={{ fontSize: '0.8rem', color: colors.textGray }}>{new Date(jobInstruction.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>{jobInstruction.subject}</div>
                                    <div style={{ fontSize: '0.9rem', color: colors.textDark, lineHeight: '1.5', minHeight: '60px' }}>{jobInstruction.description}</div>
                                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: '#E3F2FD', color: colors.primaryBlue, fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {jobInstruction.status === 'sent' ? '전송됨' : jobInstruction.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
            )
            }
        </>
    );
}
