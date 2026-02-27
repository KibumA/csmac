import React, { useMemo, useState, useEffect } from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors } from '../../../styles/theme';
import { TEAM_ROSTERS } from '../../../constants/team-rosters';
import { JobInstruction } from '@csmac/types';
import { RefreshCw } from 'lucide-react';

export const JobCardBoard: React.FC = () => {
    const { jobInstructions, deleteJobInstruction, fetchJobInstructions } = usePDCA();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchJobInstructions();
    }, [fetchJobInstructions]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchJobInstructions();
        setIsRefreshing(false);
    };

    const assignedJobs = useMemo(() => {
        const allRosterNames = Object.values(TEAM_ROSTERS).flat().map(m => m.name);
        return jobInstructions.filter((job: JobInstruction) =>
            job.assignee !== null && allRosterNames.includes(job.assignee)
        );
    }, [jobInstructions]);

    // Helper to find role from roster
    const getRoleByName = (name: string | null) => {
        if (!name) return '';
        const allMembers = Object.values(TEAM_ROSTERS).flat();
        const member = allMembers.find(m => m.name === name);
        return member ? member.role : '';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>직무카드 현황 (Job Cards)</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={handleRefresh}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '15px', border: `1px solid ${colors.border}`,
                            backgroundColor: 'white', color: colors.textGray, fontSize: '0.85rem', fontWeight: 'bold',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                        새로고침
                    </button>
                    <div style={{ padding: '8px 20px', backgroundColor: colors.primaryBlue, color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
                        전송된 직무카드: {assignedJobs.length}건
                    </div>
                </div>
            </div>

            {assignedJobs.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', backgroundColor: 'white', borderRadius: '15px', border: `1px solid ${colors.border}`, color: colors.textGray }}>
                    전송된 직무카드가 없습니다. 업무지시 보드에서 팀원을 드래그하여 업무를 배정해주세요.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {assignedJobs.map((jobInstruction: JobInstruction) => (
                        <div key={jobInstruction.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            border: jobInstruction.status === 'non_compliant' ? `2px solid ${colors.error}` : `1px solid ${colors.border}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${colors.border}` }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: 'bold', color: colors.primaryBlue }}>To: {jobInstruction.assignee}</span>
                                    <span style={{ fontSize: '0.75rem', color: colors.textGray }}>{getRoleByName(jobInstruction.assignee)}</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: colors.textGray }}>{new Date(jobInstruction.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>{jobInstruction.subject}</div>
                            <div style={{ fontSize: '0.9rem', color: colors.textDark, lineHeight: '1.5', minHeight: '60px' }}>{jobInstruction.description}</div>
                            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {jobInstruction.evidenceUrl && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: '#059669',
                                            fontWeight: 'bold',
                                            backgroundColor: '#ecfdf5',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #10b981'
                                        }}>
                                            📸 이행증빙포함
                                        </span>
                                    )}
                                    {jobInstruction.status === 'non_compliant' && (
                                        <span style={{ fontSize: '0.75rem', color: colors.error, fontWeight: 'bold' }}>🚨 보완 요청됨</span>
                                    )}
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: jobInstruction.status === 'non_compliant' ? '#fee2e2' : '#E3F2FD',
                                        color: jobInstruction.status === 'non_compliant' ? colors.error : colors.primaryBlue,
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {jobInstruction.status === 'waiting' ? '대기중' :
                                            jobInstruction.status === 'in_progress' ? '진행중' :
                                                jobInstruction.status === 'non_compliant' ? '미준수' :
                                                    jobInstruction.status === 'completed' ? '완료' : jobInstruction.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => deleteJobInstruction(jobInstruction.id)}

                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '4px',
                                            backgroundColor: 'white',
                                            color: '#D32F2F',
                                            border: '1px solid #D32F2F',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        삭제및통보
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
