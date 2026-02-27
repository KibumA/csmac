import { useState, useMemo, useEffect } from 'react';
import { usePDCA } from '../context/PDCAContext';
import { useVerificationPersistence } from './useVerificationPersistence';
import { JobInstruction } from '@csmac/types';
import { mapDbToJobInstruction } from '../utils/instructionUtils';
import { JobService } from '../services/jobService';
import { useToast } from '../context/ToastContext';
import { TEAM_ROSTERS } from '../constants/team-rosters';

export interface StaffLog {
    id: number;
    t: string;
    tag: string;
    time: string;
    m: string;
    fb: string;
    isRisk: boolean;
    aiScore?: number | null;
    evidenceUrl?: string | null;
    referenceUrl?: string | null;
}

export interface StaffData {
    id: string;
    name: string;
    role: string;
    shift: string;
    accuracy?: string;
    speed?: string;
    loyalty?: string;
    share?: string;
    total?: string;
    status: 'GOOD' | 'RISK';
    counts: { total: number; ok: number; non: number; delay: number };
    logs: StaffLog[];
}

export function useActPhase() {
    const { allJobs, registeredTpos } = usePDCA();
    const { mergeWithMockData } = useVerificationPersistence();
    const { addToast } = useToast();

    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [activeTab, setActiveTab] = useState<'board' | 'analysis'>('board');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onResolve = async (jobId: number, feedback: string) => {
        try {
            if (feedback) await JobService.updateFeedback(jobId, feedback);
            await JobService.resolveRisk(jobId);
            addToast('조치가 완료되었습니다.', 'success');
        } catch (err) {
            console.error('Error resolving risk:', err);
            addToast('조치 처리 중 오류가 발생했습니다.', 'error');
        }
    };

    const onFeedback = async (jobId: number, feedback: string) => {
        try {
            await JobService.updateFeedback(jobId, feedback);
            addToast('피드백이 전송되었습니다.', 'success');
        } catch (err) {
            console.error('Error updating feedback:', err);
            addToast('피드백 전송 중 오류가 발생했습니다.', 'error');
        }
    };

    const usersData = useMemo(() => {
        const groups: Record<string, StaffData> = {};

        // Initialize all 56 members from TEAM_ROSTERS
        Object.values(TEAM_ROSTERS).flat().forEach(member => {
            groups[member.name] = {
                id: member.id, // Keep the original string ID for unique react keys
                name: member.name,
                role: member.role || 'Staff',
                shift: member.shift || 'Day',
                // Using some fake scores for demo purposes since we don't have historical metrics
                accuracy: '100%',
                speed: '100%',
                loyalty: '100%',
                share: '100%',
                total: '100',
                status: 'GOOD',
                counts: { total: 0, ok: 0, non: 0, delay: 0 },
                logs: []
            };
        });

        if (allJobs) {
            const mappedJobs: JobInstruction[] = allJobs.map(j => mapDbToJobInstruction(j));

            const mergedJobs = mergeWithMockData(mappedJobs);

            mergedJobs.forEach(job => {
                const assigneeName = job.assignee;
                // Only process if assignee exists and is part of our roster
                if (!assigneeName || !groups[assigneeName]) return;

                const g = groups[assigneeName];

                const isRisk = job.status === 'non_compliant' || job.verificationResult === 'fail';

                g.counts.total++;
                if (job.status === 'completed' && job.verificationResult !== 'fail') g.counts.ok++;
                if (isRisk) g.counts.non++;
                if (job.status === 'delayed') g.counts.delay++;

                let referenceUrl = null;
                if (job.tpo_id && registeredTpos) {
                    const tpo = registeredTpos.find(t => t.id === job.tpo_id);
                    if (tpo) {
                        if (job.taskGroupId && tpo.setupTasks) {
                            const group = tpo.setupTasks.find(g => g.id === job.taskGroupId);
                            if (group && group.items) {
                                referenceUrl = group.items.find(i => i.imageUrl)?.imageUrl || null;
                            }
                        }
                        if (!referenceUrl && tpo.criteria?.items) {
                            referenceUrl = tpo.criteria.items.find(i => i.imageUrl)?.imageUrl || null;
                        }
                    }
                }

                g.logs.push({
                    id: job.id,
                    t: job.subject,
                    tag: job.team,
                    time: new Date(job.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    m: job.description || '특이사항 없음',
                    fb: job.feedbackComment || (job.verificationResult === 'fail' ? '조치 필요' : '완료'),
                    isRisk: isRisk,
                    aiScore: job.aiScore,
                    evidenceUrl: job.evidenceUrl,
                    referenceUrl: referenceUrl
                });
            });
        }

        return Object.values(groups).map(g => ({
            ...g,
            status: (g.counts.non > 0 ? 'RISK' : 'GOOD') as 'RISK' | 'GOOD'
        }));
    }, [allJobs, mergeWithMockData, registeredTpos]);

    const stats = useMemo(() => {
        const total = usersData.reduce((acc, u) => acc + u.counts.total, 0);
        const ok = usersData.reduce((acc, u) => acc + u.counts.ok, 0);
        const non = usersData.reduce((acc, u) => acc + u.counts.non, 0);
        return { total, ok, non, rate: total > 0 ? Math.round((ok / total) * 100) : 0 };
    }, [usersData]);

    return {
        usersData,
        selectedUser,
        setSelectedUser,
        timeRange,
        setTimeRange,
        activeTab,
        setActiveTab,
        stats,
        mounted,
        onResolve,
        onFeedback
    };
}
