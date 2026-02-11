import React from 'react';
import { supabase } from '../../utils/supabaseClient';
import { JobInstruction } from '@csmac/types';
import { usePDCA } from '../../context/PDCAContext';

export default function CheckPhaseContent({ colors }: { colors: any }) {
    const { team, workplace } = usePDCA();
    const [verificationList, setVerificationList] = React.useState<JobInstruction[]>([]);

    const thStyle = { padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#333', borderBottom: `1px solid ${colors.border}` } as React.CSSProperties;
    const tdStyle = { padding: '12px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'middle' } as React.CSSProperties;

    const fetchVerificationList = async () => {
        const { data, error } = await supabase
            .from('job_instructions')
            .select('*')
            .eq('team', team)
            .in('status', ['completed', 'non_compliant'])
            .order('completed_at', { ascending: false });

        if (data) {
            const mapped: JobInstruction[] = data.map((item: any) => ({
                id: item.id,
                targetTeam: item.team,
                assignee: item.assignee || '담당자',
                subject: item.subject,
                description: item.description || '',
                deadline: item.deadline || '',
                status: item.status, // completed, non_compliant
                timestamp: item.completed_at || item.created_at,
                // Add extended fields if type supports, or cast
                evidenceUrl: item.evidence_url,
                verificationResult: item.verification_result // 'pass' | 'fail' | null
            } as any)); // Type casting for MVP extended fields
            setVerificationList(mapped);
        }
    };

    React.useEffect(() => {
        fetchVerificationList();
    }, [team]);

    const handleVerify = async (id: number, result: 'pass' | 'fail') => {
        const { error } = await supabase
            .from('job_instructions')
            .update({
                verification_result: result,
                status: result === 'fail' ? 'non_compliant' : 'completed' // Update status if fail
            })
            .eq('id', id);

        if (!error) {
            alert(`검증 결과가 저장되었습니다: ${result === 'pass' ? '승인' : '미준수'}`);
            fetchVerificationList(); // Refresh
        }
    };

    return (
        <>
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.2rem', color: colors.textDark, marginBottom: '8px' }}>
                    <span style={{ color: colors.primaryBlue, fontWeight: 'bold' }}>Check.</span> 실행 근거를 확보하고 업무 수행 상태를 검증합니다.
                </h1>
            </header>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.headerBlue }}>
                            <th style={thStyle}>사업장/직무/업무</th>
                            <th style={thStyle}>이행 증빙 (사진)</th>
                            <th style={thStyle}>수행자 / 시간</th>
                            <th style={thStyle}>AI 1차 판독</th>
                            <th style={thStyle}>관리자 최종 검증</th>
                        </tr>
                    </thead>
                    <tbody>
                        {verificationList.length > 0 ? (
                            verificationList.map((record: any) => (
                                <tr key={record.id} style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: record.status === 'non_compliant' ? '#FFF8F8' : 'white' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: colors.primaryBlue }}>{record.targetTeam}</div>
                                        <div style={{ fontSize: '0.95rem', color: colors.textDark, marginTop: '4px' }}>{record.subject}</div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        {record.evidenceUrl ? (
                                            <a href={record.evidenceUrl} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={record.evidenceUrl}
                                                    alt="Evidence"
                                                    style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            </a>
                                        ) : (
                                            <span style={{ color: colors.textGray, fontSize: '0.8rem' }}>사진 없음</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 'bold' }}>{record.assignee}</div>
                                        <div style={{ fontSize: '0.8rem', color: colors.textGray }}>
                                            {new Date(record.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        {/* AI Verdict based on verification result */}
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '12px',
                                            backgroundColor: record.verificationResult === 'fail' ? '#FEE2E2' : '#E8F5E9',
                                            color: record.verificationResult === 'fail' ? '#DC2626' : '#2E7D32',
                                            fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {record.verificationResult === 'fail' ? 'AI 부적합' : 'AI 적합'}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        {record.verificationResult ? (
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: record.verificationResult === 'pass' ? colors.success : '#D32F2F'
                                            }}>
                                                {record.verificationResult === 'pass' ? '✅ 승인됨' : '❌ 미준수'}
                                            </span>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleVerify(record.id, 'pass')}
                                                    style={{
                                                        padding: '6px 12px', border: `1px solid ${colors.success}`, backgroundColor: 'white',
                                                        color: colors.success, borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                                    }}
                                                >
                                                    승인(O)
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(record.id, 'fail')}
                                                    style={{
                                                        padding: '6px 12px', border: '1px solid #D32F2F', backgroundColor: 'white',
                                                        color: '#D32F2F', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                                    }}
                                                >
                                                    미준수(X)
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: '50px', textAlign: 'center', color: colors.textGray }}>
                                    검증할 데이터가 없습니다. Do 단계에서 업무를 완료해 주세요.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
