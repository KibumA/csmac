'use client';

import React from 'react';
import { colors } from '../../styles/theme';

export default function ConcernPopup() {
    const concernItemBoxStyle: React.CSSProperties = {
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${colors.border}`,
        marginBottom: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '1rem',
        fontWeight: 'bold',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    const subBoxStyle: React.CSSProperties = {
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
        border: `1px solid transparent`,
    };

    const listStyle: React.CSSProperties = {
        margin: 0,
        paddingLeft: '22px',
        fontSize: '0.92rem',
        color: colors.textDark,
        lineHeight: '1.7',
    };

    const descriptionStyle: React.CSSProperties = {
        marginBottom: '20px',
        fontSize: '0.95rem',
        color: colors.textGray,
        lineHeight: '1.6'
    };

    return (
        <div style={{ padding: '5px' }}>
            <div style={concernItemBoxStyle}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.15rem', color: colors.primaryBlue, borderBottom: `2px solid ${colors.lightBlue}`, paddingBottom: '10px' }}>
                    1. SOP 방식의 업무 할당 모델에 대한 고민
                </h3>

                {/* Visual Context Section */}
                <div style={{ marginBottom: '25px', backgroundColor: '#F9FAFB', padding: '15px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: colors.textDark, marginBottom: '10px' }}>
                        📌 실제 구동 화면 (Do 단계: 업무지시 이해도 체크)
                    </div>
                    <img
                        src="/sop_context.png"
                        alt="SOP Model Context"
                        style={{ width: '100%', borderRadius: '4px', border: '1px solid #D1D5DB', marginBottom: '10px' }}
                    />
                    <p style={{ fontSize: '0.85rem', color: colors.textGray, lineHeight: '1.5' }}>
                        위 화면과 같이 <strong>'지배인'</strong> 직무의 모든 인원(박기철, 최민수, 이영희)에게 동일한 업무 지시와 확인 버튼이 노출되는 방식입니다.
                        이는 특정 1인에게 업무를 배정하는 것이 아니라, 해당 직무의 전체 인원이 표준 행동을 공유하는 <strong>SOP(전파) 모델</strong>입니다.
                    </p>
                </div>

                <p style={descriptionStyle}>
                    현재 업무 지시(Do) 단계에서 채택하고 있는 이 모델에 대한 검토 내용입니다.
                </p>

                <div style={{ ...subBoxStyle, backgroundColor: '#F0F7FF', border: '1px solid #D1E9FF' }}>
                    <div style={{ ...sectionTitleStyle, color: '#0056b3' }}>
                        <span>✅</span> 장점 (Pros)
                    </div>
                    <ul style={listStyle}>
                        <li><strong>서비스 표준화</strong>: 특정 직무의 모든 인원이 동일한 기준을 숙지하여 일관된 품질을 유지할 수 있습니다.</li>
                        <li><strong>교육 효율성</strong>: 신입 사원이나 순환 근무자에게 무엇을 해야 하는지 명확한 가이드를 제공합니다.</li>
                        <li><strong>누락 방지</strong>: 팀 전체에 공유되므로 중요한 업무가 간과될 확률이 줄어듭니다.</li>
                    </ul>
                </div>

                <div style={{ ...subBoxStyle, backgroundColor: '#FFF5F5', border: '1px solid #FFE3E3' }}>
                    <div style={{ ...sectionTitleStyle, color: '#c53030' }}>
                        <span>⚠️</span> 단점 (Cons)
                    </div>
                    <ul style={listStyle}>
                        <li><strong>운영 비효율</strong>: 특정 1인만 수행하면 되는 업무를 팀 전체가 확인해야 하는 피로감이 발생할 수 있습니다.</li>
                        <li><strong>책임 소재 불분명</strong>: "누군가 하겠지"라는 생각으로 인해 오히려 실행력이 떨어질 위험이 있습니다.</li>
                        <li><strong>데이터 중복</strong>: 동일 업무에 대해 여러 명이 각자 보고를 올릴 경우 관리가 복잡해집니다.</li>
                    </ul>
                </div>

                <div style={{ ...subBoxStyle, backgroundColor: '#F8F9FB', border: '1px solid #E9ECEF', marginBottom: 0 }}>
                    <div style={{ ...sectionTitleStyle, color: colors.textDark }}>
                        <span>💡</span> 현재 MVP 선정 이유
                    </div>
                    <p style={{ ...listStyle, paddingLeft: 0 }}>
                        현재 단계에서는 <strong>'표준의 내재화'</strong>가 최우선 과제입니다.
                        개별 배정 기능보다는 조직 전체가 어떤 상황(TPO)에서 어떤 행동(Checklist)을 해야 하는지
                        공통된 인식을 갖도록 하는 것이 더 가치 있다고 판단하여 SOP 배포 모델을 유지하고 있습니다.
                    </p>
                    <p style={{ marginTop: '12px', fontSize: '0.85rem', color: colors.textGray, fontStyle: 'italic', borderTop: '1px dashed #DDD', paddingTop: '10px' }}>
                        * 차후 고도화 단계에서 '공통 지시'와 '개별 지정'을 선택할 수 있는 기능을 검토할 예정입니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
