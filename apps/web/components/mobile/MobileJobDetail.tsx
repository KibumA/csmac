import React from 'react';
import { colors } from '../../styles/theme';
import { JobInstruction } from '@csmac/types';

interface MobileJobDetailProps {
    task: JobInstruction;
    onClose: () => void;
    onStart: () => void;
    onComplete: (file: File | null) => void;
}

export const MobileJobDetail: React.FC<MobileJobDetailProps> = ({ task, onClose, onStart, onComplete }) => {
    const [evidenceFile, setEvidenceFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEvidenceFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end' // Bottom sheet style
        }} onClick={onClose}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: 'white',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '25px',
                animation: 'slideUp 0.3s ease-out',
                maxHeight: '90vh',
                overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: colors.textGray, marginBottom: '4px' }}>
                            {task.targetTeam} · {task.assignee}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>
                            {task.subject}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ border: 'none', background: 'none', fontSize: '1.2rem', color: colors.textGray, cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Status Badge */}
                <div style={{ marginBottom: '25px' }}>
                    <span style={{
                        padding: '6px 12px', borderRadius: '20px',
                        backgroundColor: task.status === 'completed' ? '#dcfce7' : (task.status === 'in_progress' ? '#dbeafe' : '#f1f5f9'),
                        color: task.status === 'completed' ? colors.success : (task.status === 'in_progress' ? colors.primaryBlue : colors.textGray),
                        fontWeight: 'bold', fontSize: '0.9rem'
                    }}>
                        {task.status === 'completed' ? '✅ 완료됨' : (task.status === 'in_progress' ? '⚡ 진행중' : '⏳ 대기중')}
                    </span>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px', backgroundColor: '#F8F9FA', padding: '15px', borderRadius: '10px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: colors.textGray, marginTop: 0, marginBottom: '10px' }}>상세 지시사항</h3>
                    <p style={{ margin: 0, lineHeight: '1.6', color: colors.textDark, whiteSpace: 'pre-wrap' }}>
                        {task.description || '상세 내용이 없습니다.'}
                    </p>
                </div>

                {/* Evidence Upload Section (Only when In Progress) */}
                {task.status === 'in_progress' && (
                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: colors.textGray, marginBottom: '10px' }}>이행 증빙 (사진)</h3>

                        {!previewUrl ? (
                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                height: '120px', border: `2px dashed ${colors.border}`, borderRadius: '10px',
                                cursor: 'pointer', backgroundColor: '#fafafa'
                            }}>
                                <span style={{ fontSize: '2rem', marginBottom: '8px' }}>📸</span>
                                <span style={{ fontSize: '0.9rem', color: colors.textGray }}>사진 촬영 또는 업로드</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <img src={previewUrl} alt="Evidence Preview" style={{ width: '100%', borderRadius: '10px', maxHeight: '300px', objectFit: 'cover' }} />
                                <button
                                    onClick={() => { setEvidenceFile(null); setPreviewUrl(null); }}
                                    style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                                        border: 'none', borderRadius: '50%',
                                        width: '30px', height: '30px', cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    {task.status === 'completed' ? (
                        <div style={{ width: '100%', padding: '15px', textAlign: 'center', backgroundColor: '#f1f5f9', color: colors.textGray, borderRadius: '12px', fontWeight: 'bold' }}>
                            이미 완료된 업무입니다
                        </div>
                    ) : (
                        <>
                            {task.status !== 'in_progress' && (
                                <button
                                    onClick={onStart}
                                    style={{
                                        flex: 1, padding: '16px', borderRadius: '12px', border: 'none',
                                        backgroundColor: colors.primaryBlue, color: 'white',
                                        fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
                                    }}
                                >
                                    업무 시작
                                </button>
                            )}

                            {task.status === 'in_progress' && (
                                <button
                                    onClick={() => onComplete(evidenceFile)}
                                    style={{
                                        flex: 1, padding: '16px', borderRadius: '12px', border: 'none',
                                        backgroundColor: colors.success, color: 'white',
                                        fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                                        opacity: (!evidenceFile) ? 0.9 : 1
                                    }}
                                >
                                    {evidenceFile ? '업무 완료 (사진 제출)' : '업무 완료 (사진 없음)'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
