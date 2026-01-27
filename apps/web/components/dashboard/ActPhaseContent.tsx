'use client';

import React from 'react';
import { colors, statCardStyle } from '../../styles/theme';
import { usePDCA } from '../../context/PDCAContext';

export default function ActPhaseContent({ colors: _colors }: { colors: any }) {
    const { stats, inspectionResults } = usePDCA();
    const nonCompliantRecords = inspectionResults.filter(r => r.status === 'X');

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
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.primaryBlue }}>{stats.complianceRate}%</div>
                    <div style={{ fontSize: '0.8rem', color: '#2E7D32', marginTop: '5px' }}>실시간 집계 중</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '10px' }}>미준수 발생</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#D32F2F' }}>{stats.nonCompliantCount}건</div>
                    <div style={{ fontSize: '0.8rem', color: '#D32F2F', marginTop: '5px' }}>즉시 조치 필요</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '10px' }}>개선 조치율</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: colors.textDark }}>0%</div>
                    <div style={{ fontSize: '0.8rem', color: colors.textGray, marginTop: '5px' }}>{stats.nonCompliantCount}개 항목 미조치</div>
                </div>
            </div>

            <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '30px', backgroundColor: '#F8F9FB' }}>
                <div style={{ marginBottom: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>실시간 미준수 조치 알림</span>
                    <span style={{ fontSize: '0.8rem', color: '#D32F2F' }}>{nonCompliantRecords.length}건 대기 중</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {nonCompliantRecords.length > 0 ? (
                        nonCompliantRecords.map((record) => (
                            <div key={record.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', borderLeft: `5px solid #D32F2F`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>[{record.role}] {record.item} - 미준수</div>
                                    <div style={{ fontSize: '0.85rem', color: colors.textGray }}>
                                        발생 장소: {record.area} | 발생 시각: {record.time}
                                        {record.reason && <div style={{ color: '#D32F2F', marginTop: '4px' }}>이유: {record.reason}</div>}
                                    </div>
                                </div>
                                <button style={{ padding: '8px 15px', borderRadius: '6px', border: `1px solid #D32F2F`, color: '#D32F2F', backgroundColor: 'white', fontWeight: 'bold', cursor: 'pointer' }}>조치하기</button>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: colors.textGray }}>
                            현재 미준수 발생 항목이 없습니다. 우수한 서비스 상태를 유지 중입니다.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
