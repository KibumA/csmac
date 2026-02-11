'use client';

import React, { useEffect, useState } from 'react';
import { MobileJobCard } from '../../components/mobile/MobileJobCard';
import { MobileJobDetail } from '../../components/mobile/MobileJobDetail';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { usePDCA } from '../../context/PDCAContext';
import { colors } from '../../styles/theme';
import { JobInstruction } from '@csmac/types';

export default function MobilePage() {
    const { jobInstructions, updateJobStatus, completeJobWithEvidence, team } = usePDCA();
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [myTasks, setMyTasks] = useState<JobInstruction[]>([]);
    const [selectedTask, setSelectedTask] = useState<JobInstruction | null>(null);

    // Mock User List for the selected team
    const MOCK_TEAM_MEMBERS = [
        '김철수', '이영희', '노현우', '배수진', '오세진', '권도현',
        '박미숙', '최영미', '서금옥', '김순영', '한옥순',
        '김태섭', '박진우', '이상호', '최동혁'
    ];

    useEffect(() => {
        // Filter by current user name if selected
        const filtered = currentUser
            ? jobInstructions.filter(t => t.assignee === currentUser)
            : jobInstructions;

        setMyTasks(filtered);

        if (selectedTask) {
            const updated = filtered.find(t => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
            else setSelectedTask(null); // Deselect if no longer in filtered list
        }
    }, [jobInstructions, selectedTask?.id, currentUser]);

    const handleCardClick = (task: JobInstruction) => {
        setSelectedTask(task);
    };

    const handleStart = async () => {
        if (!selectedTask) return;
        await updateJobStatus(selectedTask.id, 'in_progress');
    };

    const handleComplete = async (file: File | null) => {
        if (!selectedTask) return;
        if (!confirm('업무를 완료하시겠습니까?' + (file ? ' (사진이 함께 전송됩니다)' : ''))) return;

        await completeJobWithEvidence(selectedTask.id, file);
        setSelectedTask(null);
    };

    return (
        <MobileLayout title="업무 목록">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* User Selector (Mock Login) */}
                <div style={{
                    backgroundColor: 'white', padding: '15px', borderRadius: '15px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: `1px solid ${colors.border}`
                }}>
                    <div style={{ fontSize: '0.8rem', color: colors.textGray, marginBottom: '8px', fontWeight: 'bold' }}>
                        로그인 사용자 (시뮬레이션)
                    </div>
                    <select
                        value={currentUser || ''}
                        onChange={(e) => setCurrentUser(e.target.value || null)}
                        style={{
                            width: '100%', padding: '10px', borderRadius: '8px',
                            border: `1px solid ${colors.border}`, fontSize: '0.95rem'
                        }}
                    >
                        <option value="">사용자 선택 안함 (전체 보기)</option>
                        {MOCK_TEAM_MEMBERS.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: colors.textGray }}>
                    {new Date().toLocaleDateString()} (오늘) {currentUser && ` - ${currentUser}님의 할 일`}
                </div>

                {myTasks.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '15px', color: colors.textGray }}>
                        할 일 목록이 없습니다.
                    </div>
                ) : (
                    myTasks.map(task => (
                        <MobileJobCard
                            key={task.id}
                            task={task}
                            onClick={() => handleCardClick(task)}
                        />
                    ))
                )}
            </div>

            {selectedTask && (
                <MobileJobDetail
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onStart={handleStart}
                    onComplete={handleComplete}
                />
            )}
        </MobileLayout>
    );
}
