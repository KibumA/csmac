'use client';

import React, { useEffect, useState } from 'react';
import { MobileJobCard } from '../../components/mobile/MobileJobCard';
import { MobileJobDetail } from '../../components/mobile/MobileJobDetail';
import { MobileLayout } from '../../components/mobile/MobileLayout';
import { usePDCA } from '../../context/PDCAContext';
import { colors } from '../../styles/theme';
import { JobInstruction } from '@csmac/types';

export default function MobilePage() {
    const { jobInstructions, updateJobStatus, completeJobWithEvidence } = usePDCA();
    const [myTasks, setMyTasks] = useState<JobInstruction[]>([]);
    const [selectedTask, setSelectedTask] = useState<JobInstruction | null>(null);

    useEffect(() => {
        setMyTasks(jobInstructions);
        if (selectedTask) {
            const updated = jobInstructions.find(t => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
        }
    }, [jobInstructions, selectedTask?.id]);

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
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: colors.textGray }}>
                    {new Date().toLocaleDateString()} (오늘)
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
