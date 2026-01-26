'use client';

import React from 'react';
import { colors, statCardStyle } from '../../styles/theme';

export default function ActPhaseContent({ colors: _colors }: { colors: any }) {
    return (
        <>
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.2rem', color: colors.textDark, marginBottom: '8px' }}>
                    <span style={{ color: colors.primaryBlue, fontWeight: 'bold' }}>Act.</span> 데이터 분석을 통해 서비스 품질을 지속적으로 개선합니다.
                </h1>
            </header>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={statCardStyle}>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '10px' }}>전체 준수율</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.primaryBlue }}>94.2%</div>
                    <div style={{ fontSize: '0.8rem', color: '#2E7D32', marginTop: '5px' }}>▲ 2.1% (전주 대비)</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '10px' }}>미준수 발생</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#D32F2F' }}>12건</div>
                    <div style={{ fontSize: '0.8rem', color: '#D32F2F', marginTop: '5px' }}>▼ 3건 (전주 대비)</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '10px' }}>개선 조치율</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.textDark }}>100%</div>
                    <div style={{ fontSize: '0.8rem', color: colors.textGray, marginTop: '5px' }}>지연 항목 없음</div>
                </div>
            </div>

            <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '30px', backgroundColor: '#F8F9FB' }}>
                <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>주요 개선 리포트</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[1, 2].map(i => (
                        <div key={i} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', borderLeft: `5px solid ${colors.primaryBlue}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>[객실팀] 베드 메이킹 품질 표준화 가이드 배포</div>
                                <div style={{ fontSize: '0.85rem', color: colors.textGray }}>반복적인 주름 발생 이슈를 해결하기 위해 시연 영상 및 가이드북이 업데이트 되었습니다.</div>
                            </div>
                            <button style={{ padding: '8px 15px', borderRadius: '6px', border: `1px solid ${colors.primaryBlue}`, color: colors.primaryBlue, backgroundColor: 'white', fontWeight: 'bold', cursor: 'pointer' }}>보고서 보기</button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
