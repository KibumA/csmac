'use client';

import React, { useState } from 'react';
import {
    AlertTriangle, CheckCircle2, MessageSquare,
    Clock, ShieldAlert, ShieldCheck, ArrowRight,
    Send, CheckCircle, RefreshCcw
} from 'lucide-react';
import { colors } from '../../../styles/theme';
import { StaffData, StaffLog } from '../../../hooks/useActPhase';

interface ActionPlanBoardProps {
    usersData: StaffData[];
    onResolve: (jobId: number, feedback: string) => Promise<void>;
    onFeedback: (jobId: number, feedback: string) => Promise<void>;
}

export default function ActionPlanBoard({ usersData, onResolve, onFeedback }: ActionPlanBoardProps) {
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

    // Filter jobs that are in RISK status (non_compliant or verification fail)
    const riskJobs = usersData.flatMap(user =>
        user.logs.filter(log => log.isRisk).map(log => ({
            ...log,
            assigneeName: user.name,
            assigneeRole: user.role
        }))
    ).sort((a, b) => b.id - a.id); // Latest first

    const selectedJob = riskJobs.find(j => j.id === selectedJobId);

    const handleSendFeedback = async () => {
        if (!selectedJobId || !feedbackText.trim()) return;
        setIsSubmitting(true);
        try {
            await onFeedback(selectedJobId, feedbackText);
            setFeedbackText('');
            // Optional: Show success toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedJobId) return;
        setIsSubmitting(true);
        try {
            await onResolve(selectedJobId, feedbackText);
            setSelectedJobId(null);
            setFeedbackText('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) minmax(0, 1fr)', gap: '24px', height: 'calc(100vh - 250px)' }}>

            {/* Left: Risk Feed */}
            <section style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#FEF2F2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
                        <ShieldAlert size={20} />
                        <h2 style={{ fontSize: '16px', fontWeight: 800 }}>미준수 리스크 피드</h2>
                    </div>
                    <p style={{ fontSize: '12px', color: '#991B1B', marginTop: '4px' }}>즉시 조치가 필요한 {riskJobs.length}건의 항목</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {riskJobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                            <CheckCircle2 size={32} style={{ marginBottom: '12px', opacity: 0.5, color: colors.success }} />
                            <p style={{ fontSize: '14px' }}>현재 감지된 리스크가 없습니다.</p>
                        </div>
                    ) : (
                        riskJobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => setSelectedJobId(job.id)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: selectedJobId === job.id ? '#F8FAFC' : 'white',
                                    border: `1px solid ${selectedJobId === job.id ? colors.primaryBlue : colors.border}`,
                                    marginBottom: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: colors.primaryBlue }}>{job.tag}</span>
                                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{job.time}</span>
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>{job.t}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#EF4444' }}>
                                        {job.assigneeName.charAt(0)}
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748B' }}>{job.assigneeName} ({job.assigneeRole})</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Right: Action Context & Feedback */}
            <section style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {selectedJob ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Header */}
                        <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B' }}>조치 계획 수립</h2>
                                    <span style={{ padding: '4px 8px', backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}>PENDING</span>
                                </div>
                                <p style={{ fontSize: '14px', color: '#64748B' }}>#{selectedJob.id} · {selectedJob.t}</p>
                            </div>
                            <button
                                onClick={handleResolve}
                                disabled={isSubmitting}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    backgroundColor: colors.success,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                }}
                            >
                                <CheckCircle size={18} />
                                최종 조치 완료
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 340px)', gap: '24px' }}>

                            {/* Left Col: Evidence & Analysis */}
                            <div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#64748B', marginBottom: '12px' }}>발생 원인 및 현장 상태</label>
                                    <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                        <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6 }}>{selectedJob.m}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                                        <div style={{ padding: '8px 12px', backgroundColor: '#F1F5F9', fontSize: '11px', fontWeight: 800, color: '#64748B' }}>[STANDARD]</div>
                                        <div style={{ height: '200px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {selectedJob.referenceUrl ? (
                                                <img
                                                    src={selectedJob.referenceUrl}
                                                    alt="Standard"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                                                    onClick={() => setEnlargedImageUrl(selectedJob.referenceUrl!)}
                                                />
                                            ) : (
                                                <ShieldCheck size={48} color="#E2E8F0" />
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ border: '1px solid #EF4444', borderRadius: '16px', overflow: 'hidden' }}>
                                        <div style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', fontSize: '11px', fontWeight: 800, color: '#EF4444' }}>[SUBMITTED]</div>
                                        <div style={{ height: '200px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {selectedJob.evidenceUrl ? (
                                                <img
                                                    src={selectedJob.evidenceUrl}
                                                    alt="Submitted"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                                                    onClick={() => setEnlargedImageUrl(selectedJob.evidenceUrl!)}
                                                />
                                            ) : (
                                                <AlertTriangle size={48} color="#FCA5A5" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', backgroundColor: '#EFF6FF', borderRadius: '16px', border: '1px solid #DBEAFE' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <ShieldCheck size={18} color={colors.primaryBlue} />
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E40AF' }}>AI 종합 판독 분석</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#1E40AF' }}>표준 가이드라인 일치율</span>
                                        <span style={{ fontSize: '24px', fontWeight: 900, color: colors.primaryBlue }}>{selectedJob.aiScore ?? 0}%</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                                        <div style={{ width: `${selectedJob.aiScore ?? 0}%`, height: '100%', backgroundColor: colors.primaryBlue }} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Feedback Loop */}
                            <div style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: '24px', display: 'flex', flexDirection: 'column' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#64748B', marginBottom: '16px' }}>
                                    <MessageSquare size={16} />
                                    실무자 피드백 히스토리
                                </label>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ alignSelf: 'flex-start', maxWidth: '90%' }}>
                                        <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>관리자 (나)</div>
                                        <div style={{ padding: '12px 16px', backgroundColor: '#F1F5F9', borderRadius: '12px 12px 12px 0', fontSize: '13px', color: '#1E293B' }}>
                                            {selectedJob.fb || '조치가 필요합니다. 확인해주세요.'}
                                        </div>
                                    </div>

                                    {/* Mock response from staff for demo */}
                                    <div style={{ alignSelf: 'flex-end', maxWidth: '90%' }}>
                                        <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px', textAlign: 'right' }}>{selectedJob.assigneeName}</div>
                                        <div style={{ padding: '12px 16px', backgroundColor: colors.primaryBlue, color: 'white', borderRadius: '12px 12px 0 12px', fontSize: '13px' }}>
                                            확인했습니다. 즉시 보완 작업 들어가겠습니다.
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <textarea
                                        placeholder="실무자에게 전달할 추가 조치 가이드를 입력하세요..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '100px',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            border: `1px solid ${colors.border}`,
                                            fontSize: '13px',
                                            resize: 'none',
                                            marginBottom: '12px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = colors.primaryBlue}
                                        onBlur={(e) => e.target.style.borderColor = colors.border}
                                    />
                                    <button
                                        onClick={handleSendFeedback}
                                        disabled={isSubmitting || !feedbackText.trim()}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '12px',
                                            backgroundColor: '#F1F5F9',
                                            color: isSubmitting || !feedbackText.trim() ? '#94A3B8' : colors.primaryBlue,
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Send size={16} />
                                        피드백 전송
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                        <ShieldAlert size={64} style={{ marginBottom: '24px', opacity: 0.2 }} />
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>리스크를 선택해주세요</h2>
                        <p style={{ fontSize: '14px' }}>좌측 피드에서 조치가 필요한 항목을 선택하면 상세 분석 및 조치 계획 수립이 가능합니다.</p>
                    </div>
                )}
            </section>

            {/* Enlarged Image Modal */}
            {enlargedImageUrl && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out'
                    }}
                    onClick={() => setEnlargedImageUrl(null)}
                >
                    <img
                        src={enlargedImageUrl}
                        alt="Enlarged view"
                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
