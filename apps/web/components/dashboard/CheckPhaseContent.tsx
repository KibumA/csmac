'use client';

import React from 'react';
import { colors, thStyle, tdStyle, tpoTag } from '../../styles/theme';

export default function CheckPhaseContent({ colors: _colors }: { colors: any }) {
    return (
        <>
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.2rem', color: colors.textDark, marginBottom: '8px' }}>
                    <span style={{ color: colors.primaryBlue, fontWeight: 'bold' }}>Check.</span> 실행 근거를 확보하고 업무 수행 상태를 검증합니다.
                </h1>
            </header>

            {/* Checklist Table (Slide 6-style) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${colors.border}` }}>
                <thead>
                    <tr style={{ backgroundColor: colors.headerBlue }}>
                        <th style={thStyle}>사업장/직무/업무</th>
                        <th style={thStyle}>TPO (상황)</th>
                        <th style={thStyle}>점검 체크리스트</th>
                        <th style={thStyle}>점검 항목</th>
                        <th style={thStyle}>이행근거 / 검증방법</th>
                        <th style={thStyle}>수행자</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2].map(i => (
                        <tr key={i}>
                            <td style={tdStyle}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>소노벨 천안 / 객실팀</div>
                                <div style={{ fontSize: '0.85rem', color: colors.textGray }}>인스펙터 / 객실 인스펙션</div>
                            </td>
                            <td style={tdStyle}>
                                <div style={tpoTag}>정비 직후 / 인스펙션 룸</div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ fontSize: '0.9rem' }}>베드 메이킹 상태가 주름 없이 팽팽하게 완료되었나요?</div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ fontSize: '0.85rem' }}>
                                    • 시트 오염 없음<br />
                                    • 베개 정렬 상태<br />
                                    • 러너 배치 확인
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🖼️</span>
                                    <span style={{ fontSize: '0.8rem', backgroundColor: '#EEEEEE', padding: '2px 5px', borderRadius: '3px' }}>AI 검증</span>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ fontWeight: 'bold' }}>박OO</div>
                                <div style={{ fontSize: '0.8rem', color: '#2E7D32' }}>이행완료 (14:20)</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
