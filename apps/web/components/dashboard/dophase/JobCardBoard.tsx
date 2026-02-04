import React from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors } from '../../../styles/theme';

export const JobCardBoard: React.FC = () => {
    const { jobInstructions } = usePDCA();

    return (
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
    );
};
