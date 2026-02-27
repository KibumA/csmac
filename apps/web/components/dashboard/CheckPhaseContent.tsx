'use client';

import React, { useState } from 'react';
import {
    CheckCircle2, AlertCircle, Scan, Image as LucideImage,
    ArrowRight, MessageSquare, ShieldCheck, Download,
    RefreshCw, Zap
} from 'lucide-react';
import { colors } from '../../styles/theme';
import { exportToCsv } from '../../utils/csvExport';
import { useCheckPhase } from '../../hooks/useCheckPhase';

export default function CheckPhaseContent() {
    const {
        verificationList, selectedId, setSelectedId, isAnalyzing,
        feedback, setFeedback, mounted, handleBatchAnalysis,
        submitVerification, selectedItem, standardImage, fetchVerificationList
    } = useCheckPhase();

    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const handleExport = () => {
        exportToCsv('verification_report', verificationList.map(v => ({
            id: v.id,
            subject: v.subject,
            assignee: v.assignee,
            ai_score: v.aiScore,
            result: v.verificationResult,
            feedback: v.feedbackComment
        })));
    };

    if (!mounted) return null;

    return (
        <div style={{ width: '100%', minHeight: '80vh', paddingBottom: '100px', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: colors.textDark, marginBottom: '8px' }}>
                        <span style={{ color: colors.primaryBlue }}>Check.</span> TPO 이행근거 검증 보드
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1rem' }}>실행 근거 사진 판독 및 품질 준수 여부 확정</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleBatchAnalysis}
                        disabled={isAnalyzing}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: colors.primaryBlue, color: 'white',
                            border: 'none', padding: '10px 20px', borderRadius: '10px',
                            cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                            opacity: isAnalyzing ? 0.7 : 1, transition: '0.2s'
                        }}
                    >
                        {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                        AI 일괄 판독 실행
                    </button>
                    <button
                        onClick={fetchVerificationList}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: 'white', border: `1px solid ${colors.border}`,
                            padding: '10px 16px', borderRadius: '10px', fontSize: '14px',
                            fontWeight: 'bold', color: '#64748B', cursor: 'pointer',
                            transition: '0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        <RefreshCw size={16} /> 새로고침
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: 'white', border: `1px solid ${colors.border}`,
                            padding: '10px 16px', borderRadius: '10px', fontSize: '14px',
                            fontWeight: 'bold', color: '#64748B', cursor: 'pointer'
                        }}
                    >
                        <Download size={16} /> CSV 추출
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>

                {/* Left: Verification List */}
                <section style={{
                    backgroundColor: 'white', border: `1px solid ${colors.border}`, borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                        <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '15px' }}>이행근거 리스트 ({verificationList.length})</div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                            <span style={{ color: colors.success }}>PASS: {verificationList.filter(v => v.verificationResult === 'pass').length}</span>
                            <span style={{ color: '#EF4444' }}>FAIL: {verificationList.filter(v => v.verificationResult === 'fail').length}</span>
                        </div>
                    </div>

                    <div style={{ overflowY: 'auto', maxHeight: '700px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#F8FAFC', borderBottom: `1px solid ${colors.border}` }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#94A3B8' }}>업무 정보</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>이행 증빙</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>AI 일치율</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', color: '#94A3B8' }}>최종 상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {verificationList.map(item => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedId(item.id)}
                                        style={{
                                            cursor: 'pointer',
                                            borderBottom: `1px solid ${colors.border}`,
                                            backgroundColor: selectedId === item.id ? '#EFF6FF' : 'transparent',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 800, color: colors.primaryBlue, textTransform: 'uppercase', marginBottom: '2px' }}>{item.targetTeam}</div>
                                            <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>{item.subject}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{item.assignee} · {new Date(item.timestamp).toLocaleTimeString()}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                {item.evidenceUrl ? (
                                                    <img src={item.evidenceUrl} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }} alt="proof" />
                                                ) : (
                                                    <div style={{ width: '60px', height: '45px', backgroundColor: '#F1F5F9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <LucideImage size={16} color="#94A3B8" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                            {item.aiScore ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 900, color: item.aiScore > 80 ? colors.success : '#F59E0B' }}>
                                                        {item.aiScore}%
                                                    </div>
                                                    <div style={{ width: '40px', height: '3px', backgroundColor: '#E2E8F0', borderRadius: '99px', marginTop: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${item.aiScore}%`, height: '100%', backgroundColor: item.aiScore > 80 ? colors.success : '#F59E0B' }} />
                                                    </div>
                                                </div>
                                            ) : '--'}
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            {item.verificationResult ? (
                                                <div style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800,
                                                    backgroundColor: item.verificationResult === 'pass' ? '#ECFDF5' : '#FEF2F2',
                                                    color: item.verificationResult === 'pass' ? '#059669' : '#DC2626',
                                                    border: `1px solid ${item.verificationResult === 'pass' ? '#D1FAE5' : '#FEE2E2'}`
                                                }}>
                                                    {item.verificationResult === 'pass' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                    {item.verificationResult === 'pass' ? 'PASS' : 'FAIL'}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>대기중</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Right: Detailed Analysis Panel */}
                {selectedId && selectedItem ? (
                    <section style={{
                        backgroundColor: 'white', border: `1px solid ${colors.border}`, borderRadius: '16px',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>

                        <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontWeight: 800, color: '#1E293B' }}>검증 상세 리포트</h3>
                                <p style={{ fontSize: '12px', color: '#64748B' }}>#{selectedItem.id} · {selectedItem.subject}</p>
                            </div>
                            <button
                                onClick={() => setSelectedId(null)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                            {/* Comparison View */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>IMAGE COMPARISON</span>
                                    <Scan size={16} color={colors.primaryBlue} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '100%', height: '140px', backgroundColor: '#F8FAFC', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                                            {standardImage ? (
                                                <img
                                                    src={standardImage}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                                    alt="standard"
                                                    onClick={() => setZoomedImage(standardImage)}
                                                />
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                    <LucideImage size={24} color="#CBD5E1" />
                                                    <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>표준 이미지 없음</span>
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', marginTop: '4px', display: 'block' }}>[STANDARD]</span>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <ArrowRight size={24} color="#CBD5E1" />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '100%', height: '140px', backgroundColor: '#F8FAFC', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${colors.primaryBlue}` }}>
                                            {selectedItem.evidenceUrl ? (
                                                <img
                                                    src={selectedItem.evidenceUrl}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                                    alt="submitted"
                                                    onClick={() => setZoomedImage(selectedItem.evidenceUrl || null)}
                                                />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                    <LucideImage size={24} color="#CBD5E1" />
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: colors.primaryBlue, marginTop: '4px', display: 'block' }}>[SUBMITTED]</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis Result */}
                            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <ShieldCheck size={18} color={colors.primaryBlue} />
                                    <span style={{ fontWeight: 800, fontSize: '14px' }}>AI 종합 판독 결과</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '13px', color: '#475569' }}>표준 가이드라인 일치율</span>
                                    <span style={{ fontSize: '20px', fontWeight: 900, color: colors.primaryBlue }}>{selectedItem.aiScore || 0}%</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                    <strong>AI 심층 분석:</strong> {selectedItem.aiAnalysis || '일괄 판독을 실행해 주세요.'}
                                </div>
                            </div>

                            {/* Manager Feedback */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <MessageSquare size={16} color="#64748B" />
                                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#475569' }}>실무자 피드백 (미승인 시 전송)</span>
                                </div>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="무엇을 개선해야 하는지 구체적으로 입력하세요..."
                                    style={{
                                        width: '100%', height: '100px', padding: '12px', borderRadius: '10px',
                                        border: `1px solid ${colors.border}`, fontSize: '13px', resize: 'none',
                                        fontFamily: 'inherit', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '20px', borderTop: `1px solid ${colors.border}`, display: 'flex', gap: '12px' }}>
                            {selectedItem.verificationResult === 'pass' ? (
                                <button
                                    onClick={() => submitVerification('cancel_approval')}
                                    style={{
                                        flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #64748B',
                                        backgroundColor: 'white', color: '#64748B', fontWeight: 800, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    승인 취소
                                </button>
                            ) : selectedItem.verificationResult === 'fail' ? (
                                <button
                                    onClick={() => submitVerification('cancel_approval')}
                                    style={{
                                        flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #64748B',
                                        backgroundColor: 'white', color: '#64748B', fontWeight: 800, cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    미승인 취소
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => submitVerification('fail')}
                                        style={{
                                            flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #EF4444',
                                            backgroundColor: 'white', color: '#EF4444', fontWeight: 800, cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        미승인
                                    </button>
                                    <button
                                        onClick={() => submitVerification('pass')}
                                        style={{
                                            flex: 1, padding: '14px', borderRadius: '10px', border: 'none',
                                            backgroundColor: colors.success, color: 'white', fontWeight: 800, cursor: 'pointer',
                                            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', transition: 'all 0.2s'
                                        }}
                                    >
                                        승인
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                ) : (
                    <section style={{
                        backgroundColor: 'white', border: `1px solid ${colors.border}`, borderRadius: '16px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minHeight: '400px'
                    }}>
                        <Scan size={48} color="#CBD5E1" />
                        <h3 style={{ fontWeight: 800, color: '#94A3B8', marginTop: '16px', fontSize: '16px' }}>검증 상세 리포트</h3>
                        <p style={{ color: '#CBD5E1', fontSize: '13px', marginTop: '8px' }}>좌측 리스트에서 항목을 선택하세요</p>
                    </section>
                )}
            </div>

            {/* Zoomed Image Overlay */}
            {zoomedImage && (
                <div
                    onClick={() => setZoomedImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out'
                    }}
                >
                    <img
                        src={zoomedImage}
                        alt="Zoomed"
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    />
                </div>
            )}
        </div>
    );
}
