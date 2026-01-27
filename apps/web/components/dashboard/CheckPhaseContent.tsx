'use client';

import React from 'react';
import { colors, thStyle, tdStyle, tpoTag } from '../../styles/theme';
import { usePDCA } from '../../context/PDCAContext';

export default function CheckPhaseContent({ colors: _colors }: { colors: any }) {
    const { inspectionResults, registeredTpos, teams } = usePDCA();

    return (
        <>
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.2rem', color: colors.textDark, marginBottom: '8px' }}>
                    <span style={{ color: colors.primaryBlue, fontWeight: 'bold' }}>Check.</span> 실행 근거를 확보하고 업무 수행 상태를 검증합니다.
                </h1>
            </header>

            {/* Checklist Table (Slide 6-style) */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.headerBlue }}>
                            <th style={thStyle}>사업장/직무/업무</th>
                            <th style={thStyle}>TPO (상황)</th>
                            <th style={thStyle}>점검 체크리스트</th>
                            <th style={thStyle}>결과 / 이행근거</th>
                            <th style={thStyle}>수행자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inspectionResults.length > 0 ? (
                            inspectionResults.map((record) => {
                                const tpoInfo = registeredTpos.find(t => t.id === record.tpoId);
                                return (
                                    <tr key={record.id} style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: record.status === 'X' ? '#FFF8F8' : 'white' }}>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: colors.primaryBlue }}>{tpoInfo?.workplace || '소노벨 천안'}</div>
                                            <div style={{ fontSize: '0.85rem', color: colors.textGray }}>
                                                {teams[tpoInfo?.team || '']?.label || '객실팀'} / {record.role}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={tpoTag}>{tpoInfo?.tpo.place} / {tpoInfo?.tpo.occasion}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: record.status === 'X' ? 'bold' : 'normal' }}>{record.item}</div>
                                            {record.reason && <div style={{ fontSize: '0.8rem', color: '#D32F2F', marginTop: '4px' }}>└ {record.reason}</div>}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: '24px',
                                                    height: '24px',
                                                    lineHeight: '24px',
                                                    borderRadius: '50%',
                                                    backgroundColor: record.status === 'O' ? '#E8F5E9' : '#FFEBEE',
                                                    color: record.status === 'O' ? '#2E7D32' : '#D32F2F',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {record.status}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <span style={{ fontSize: '1.1rem' }}>🖼️</span>
                                                    <span style={{ fontSize: '0.75rem', color: colors.primaryBlue, textDecoration: 'underline' }}>AI 검증</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: colors.textGray }}>{record.time}</div>
                                        </td>
                                    </tr>
                                );
                            })
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
