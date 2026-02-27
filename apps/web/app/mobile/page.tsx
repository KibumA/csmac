'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MobileJobCard } from '../../components/mobile/MobileJobCard';
import { MobileJobDetail } from '../../components/mobile/MobileJobDetail';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { usePDCA } from '../../context/PDCAContext';
import { colors } from '../../styles/theme';
import { JobInstruction } from '@csmac/types';
import { TEAM_ROSTERS } from '../../constants/team-rosters';

export default function MobilePage() {
    const { jobInstructions, updateJobStatus, completeJobWithEvidence, team } = usePDCA();
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [myTasks, setMyTasks] = useState<JobInstruction[]>([]);
    const [selectedTask, setSelectedTask] = useState<JobInstruction | null>(null);

    // Dynamic User List from all teams
    const ALL_TEAM_MEMBERS = useMemo(() => {
        return Object.values(TEAM_ROSTERS).flat().map(m => m.name).sort((a, b) => a.localeCompare(b, 'ko'));
    }, []);

    useEffect(() => {
        // Filter by current user name if selected. Otherwise, only show tasks that HAVE an assignee.
        const filtered = currentUser
            ? jobInstructions.filter(t => t.assignee === currentUser)
            : jobInstructions.filter(t => t.assignee !== null);

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
                        {ALL_TEAM_MEMBERS.map(name => (
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
                    onRevert={async () => {
                        await updateJobStatus(selectedTask.id, 'in_progress');
                        // Set back to waiting by updating DB directly
                        const { supabase } = await import('../../utils/supabaseClient');
                        await supabase.from('job_instructions')
                            .update({ status: 'waiting', started_at: null, completed_at: null, evidence_url: null })
                            .eq('id', selectedTask.id);
                        setSelectedTask(null);
                    }}
                />
            )}
        </MobileLayout>
    );
}
