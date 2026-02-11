'use client';

import React from 'react';
import { JobInstructionDB, JobInstructionStatus } from '@csmac/types';
import { colors } from '../../../styles/theme';

interface CommandCenterCardProps {
    instruction: JobInstructionDB;
    onStatusChange: (id: number, newStatus: JobInstructionStatus) => void;
}

const STATUS_CONFIG: Record<JobInstructionStatus, { label: string; bg: string; color: string }> = {
    waiting: { label: '대기', bg: '#F1F5F9', color: '#64748B' },
    in_progress: { label: '실행', bg: '#DBEAFE', color: '#2563EB' },
    completed: { label: '완료', bg: '#DCFCE7', color: '#16A34A' },
    delayed: { label: '지연중', bg: '#FFEDD5', color: '#EA580C' },
    non_compliant: { label: '미준수', bg: '#FEE2E2', color: '#DC2626' },
};

function timeSince(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    const hours = seconds / 3600;
    if (hours > 24) return Math.floor(hours / 24) + '일 전';
    if (hours > 1) return Math.floor(hours) + '시간 전';
    const minutes = seconds / 60;
    if (minutes > 1) return Math.floor(minutes) + '분 전';
    return '방금 전';
}

export function CommandCenterCard({ instruction, onStatusChange }: CommandCenterCardProps) {
    const statusConfig = STATUS_CONFIG[instruction.status];
    const isDelayed = instruction.status === 'delayed';

    return (
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${colors.border}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Header: Team + Status Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                    <div style={{ fontSize: '11px', color: colors.primaryBlue, fontWeight: 800, marginBottom: '2px' }}>
                        {instruction.team}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1.4, color: '#1E293B' }}>
                        {instruction.subject}
                    </div>
                </div>
                <span
                    style={{
                        fontSize: '10px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.color,
                        whiteSpace: 'nowrap',
                        animation: isDelayed ? 'pulse 2s infinite' : undefined,
                    }}
                >
                    {statusConfig.label}
                </span>
            </div>

            {/* Meta Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{
                    fontSize: '11px', padding: '4px 8px', backgroundColor: '#F8FAFC',
                    border: `1px solid ${colors.border}`, borderRadius: '6px', fontWeight: 600, color: '#64748B'
                }}>
                    {instruction.evidence_url ? '📷 사진있음' : '📷 사진필요'}
                </span>
                <span style={{
                    fontSize: '11px', padding: '4px 8px', backgroundColor: '#F8FAFC',
                    border: `1px solid ${colors.border}`, borderRadius: '6px', fontWeight: 600, color: '#64748B'
                }}>
                    🤖 {instruction.verification_result === 'pass' ? '준수' : instruction.verification_result === 'fail' ? '미준수' : '대기'}
                </span>
            </div>

            {/* Footer: Assignee + Time */}
            <div style={{
                borderTop: '1px solid #F1F5F9', paddingTop: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {instruction.assignee && (
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            backgroundColor: colors.primaryBlue, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 700,
                        }}>
                            {instruction.assignee.charAt(0)}
                        </div>
                    )}
                    <span style={{ fontWeight: 600, color: '#64748B' }}>
                        {instruction.assignee || '미배정'}
                    </span>
                </div>
                <div style={{ color: '#94A3B8', fontWeight: 600 }}>
                    {timeSince(instruction.created_at)}
                </div>
            </div>

            {/* Status Change Controls */}
            <div style={{ display: 'flex', gap: '4px' }}>
                {instruction.status !== 'waiting' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(instruction.id, 'waiting'); }}
                        style={{
                            flex: 1, padding: '4px', fontSize: '10px', fontWeight: 800,
                            border: `1px solid ${colors.border}`, backgroundColor: '#F8FAFC',
                            borderRadius: '4px', cursor: 'pointer',
                        }}
                    >
                        ◀ 전
                    </button>
                )}
                {instruction.status !== 'in_progress' && instruction.status !== 'delayed' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(instruction.id, 'in_progress'); }}
                        style={{
                            flex: 1, padding: '4px', fontSize: '10px', fontWeight: 800,
                            border: `1px solid ${colors.border}`, backgroundColor: '#F8FAFC',
                            borderRadius: '4px', cursor: 'pointer',
                        }}
                    >
                        중간
                    </button>
                )}
                {instruction.status !== 'completed' && instruction.status !== 'non_compliant' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(instruction.id, 'completed'); }}
                        style={{
                            flex: 1, padding: '4px', fontSize: '10px', fontWeight: 800,
                            border: `1px solid ${colors.border}`, backgroundColor: '#F8FAFC',
                            borderRadius: '4px', cursor: 'pointer',
                        }}
                    >
                        완료 ▶
                    </button>
                )}
            </div>
        </div>
    );
}
