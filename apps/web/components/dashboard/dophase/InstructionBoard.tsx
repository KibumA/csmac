import React, { useState } from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors, selectStyle } from '../../../styles/theme';
import { ChecklistRegistrationModal } from './ChecklistRegistrationModal';

interface InstructionBoardProps {
    setInstructionModalOpen: (open: boolean) => void;
    setInstructionSubject: (subject: string) => void;
    setInstructionDescription: (desc: string) => void;
    instructionSubject: string;
    instructionDescription: string;
    shouldRegisterAsStandard: boolean;
    setShouldRegisterAsStandard: (checked: boolean) => void;
    showReverseTooltip: boolean;
    setShowReverseTooltip: (show: boolean) => void;
    setTpoModalOpen: (open: boolean) => void;
}

export const InstructionBoard: React.FC<InstructionBoardProps> = ({
    setInstructionModalOpen,
    setInstructionSubject,
    setInstructionDescription,
    instructionSubject,
    instructionDescription,
    shouldRegisterAsStandard,
    setShouldRegisterAsStandard,
    showReverseTooltip,
    setShowReverseTooltip,
    setTpoModalOpen
}) => {
    const {
        workplace, setWorkplace,
        team, setTeam,
        job, setJob,
        teams,
        registeredTpos,
        setSelectedInspectionSopId,
        selectedInspectionSopId,
        setupTasksToSop
    } = usePDCA();

    const [checklistRegModalOpen, setChecklistRegModalOpen] = useState(false);

    // Use jobs from the global teams mapping
    const currentJobs = teams[team]?.jobs || [];

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
                                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <div
                                        onClick={() => {
                                            setSelectedInspectionSopId(t.id);
                                            setInstructionSubject(t.criteria.checklist);
                                            setInstructionDescription(''); // Clear desc for fresh input
                                        }}
                                        style={{
                                            padding: '10px',
                                            backgroundColor: '#F8F9FA',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            border: selectedInspectionSopId === t.id ? `2px solid ${colors.primaryBlue}` : '1px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        [{t.tpo.time}] {t.criteria.checklist}
                                    </div>
                                    {/* Sub-menu for the configured tasks */}
                                    {t.setupTasks && t.setupTasks.length > 0 && t.setupTasks.map((taskSet, tsIdx) => {
                                        const combinedTask = taskSet.join(', ');
                                        return (
                                            <div
                                                key={`setup-config-${tsIdx}`}
                                                onClick={() => {
                                                    setInstructionSubject(`[${t.tpo.place}] ${combinedTask}`);
                                                    setInstructionDescription(`${t.tpo.occasion}: ${combinedTask}\n업무 가이드라인에 따라 업무를 수행해 주세요.`);
                                                    setSelectedInspectionSopId(t.id);
                                                }}
                                                style={{
                                                    padding: '6px 10px 6px 20px',
                                                    fontSize: '0.85rem',
                                                    color: colors.primaryBlue,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s',
                                                    borderRadius: '4px'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F0F7FF'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span>↳</span>
                                                <span style={{ backgroundColor: '#E3F2FD', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${colors.border}`, fontWeight: 'bold' }}>
                                                    [세분화설정 {tsIdx + 1}] {combinedTask}
                                                </span>
                                            </div>
                                        );
                                    })}
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
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px', color: colors.textDark }}>지시 상세 (Description)</label>
                            <textarea
                                placeholder="구체적인 업무 지시 내용을 입력하세요..."
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${colors.textDark}`, fontSize: '0.95rem', minHeight: '100px' }}
                                value={instructionDescription}
                                onChange={(e) => setInstructionDescription(e.target.value)}
                                id="instruction-desc"
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', position: 'relative' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: colors.textDark }}>
                                <input
                                    type="checkbox"
                                    checked={shouldRegisterAsStandard}
                                    onChange={(e) => setShouldRegisterAsStandard(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                업무수행점검 리스트에 추가
                            </label>
                            <div
                                onClick={() => setShowReverseTooltip(!showReverseTooltip)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: colors.primaryBlue,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ?
                            </div>

                            {showReverseTooltip && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '30px',
                                    left: '0',
                                    width: '320px',
                                    backgroundColor: '#333',
                                    color: 'white',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    fontSize: '0.8rem',
                                    zIndex: 10,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                    lineHeight: '1.5'
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ff4444', paddingBottom: '5px', color: '#ff4444' }}>
                                        ⚠️ [DEBUG] 중복 등록 이슈 분석
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div>
                                            <strong>1. 현상</strong><br />
                                            리스트에서 항목을 선택한 상태로 '업무수행점검 리스트에 추가'를 하면, 해당 체크리스트가 업무수행점검 탭에 등록됩니다.
                                        </div>
                                        <div>
                                            <strong>2. 원인</strong><br />
                                            <code>setupTasksToSop</code> 함수의 중복 체크(`includes`)가 단순 전체 문자열 일치만 확인하기 때문. 'A+B' 문자열 안에 'A'가 있는지, 혹은 'A'가 이미 등록된 세트의 일부인지 확인하는 로직 부재.
                                        </div>
                                        <div>
                                            <strong>3. 해결책</strong><br />
                                            기존 <code>setupTasks</code> 배열을 순회하며, 입력된 작업(Task)들이 이미 등록된 항목 집합의 부분집합(Subset)인지 검사하여 차단하는 로직 추가 필요.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button
                                onClick={() => {
                                    if (!instructionDescription) {
                                        alert('지시 상세 내용을 입력해주세요.');
                                        return;
                                    }
                                    if (shouldRegisterAsStandard) {
                                        // If registering to checklist, open structured modal
                                        setChecklistRegModalOpen(true);
                                    } else {
                                        // If not registering, need checklist item selected first
                                        if (!instructionSubject) {
                                            alert('체크리스트 항목을 먼저 선택해주세요.');
                                            return;
                                        }
                                        // Go straight to Job Card Preview
                                        setInstructionModalOpen(true);
                                    }
                                }}
                                style={{
                                    padding: '12px 30px',
                                    backgroundColor: colors.primaryBlue,
                                    color: '#ffffff',
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

            {/* Checklist Registration Modal */}
            {checklistRegModalOpen && (
                <ChecklistRegistrationModal
                    setModalOpen={setChecklistRegModalOpen}
                    onRegister={(data) => {
                        // Register the checklist item with TPO and subdivisions
                        setupTasksToSop(null, data.subdivisions, true, {
                            category: data.checklistItem,
                            tpo: data.tpo
                        });
                        alert('업무수행점검 리스트에 등록되었습니다.');
                        
                        // Also create job card
                        setInstructionSubject(data.checklistItem);
                        setInstructionDescription(data.subdivisions.join('\n') + '\n업무 가이드라인에 따라 업무를 수행해 주세요.');
                        setInstructionModalOpen(true);
                    }}
                />
            )}
        </>
    );
};
