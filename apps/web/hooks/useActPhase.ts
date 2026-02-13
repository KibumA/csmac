import { useState, useMemo, useEffect } from 'react';
import { usePDCA } from '../context/PDCAContext';
import { useVerificationPersistence } from './useVerificationPersistence';
import { JobInstruction } from '@csmac/types';

export interface StaffLog {
    id: number;
    t: string;
    tag: string;
    time: string;
    m: string;
    fb: string;
    isRisk: boolean;
    aiScore?: number | null;
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

const MOCK_USERS: Record<string, Partial<StaffData>> = {
    '김철수': { name: '김철수', role: '지배인', shift: 'Day', accuracy: '89%', speed: '85%', loyalty: '90%', share: '95%', total: '88' },
    '박미숙': { name: '박미숙', role: '인스펙터', shift: 'Evening', accuracy: '100%', speed: '85%', loyalty: '90%', share: '95%', total: '92' },
    '김태섭': { name: '김태섭', role: '엔지니어', shift: 'Morning', accuracy: '100%', speed: '85%', loyalty: '90%', share: '95%', total: '92' },
    '김나연': { name: '김나연', role: '컨택센터 상담원', shift: 'Night', accuracy: '100%', speed: '85%', loyalty: '90%', share: '95%', total: '92' },
    '김지훈': { name: '김지훈', role: '마케팅전략팀', shift: 'Day', accuracy: '100%', speed: '85%', loyalty: '90%', share: '95%', total: '92' },
    '김관호': { name: '김관호', role: '교육개발팀', shift: 'Day', accuracy: '100%', speed: '85%', loyalty: '90%', share: '95%', total: '92' }
};

export function useActPhase() {
    const { allJobs } = usePDCA();
    const { mergeWithMockData } = useVerificationPersistence();

    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const usersData = useMemo(() => {
        const groups: Record<string, StaffData> = {};
        Object.keys(MOCK_USERS).forEach(team => {
            const mock = MOCK_USERS[team];
            groups[team] = {
                id: team,
                name: mock.name || '담당자',
                role: mock.role || 'Staff',
                shift: mock.shift || 'Day',
                accuracy: mock.accuracy,
                speed: mock.speed,
                loyalty: mock.loyalty,
                share: mock.share,
                total: mock.total,
                status: 'GOOD',
                counts: { total: 0, ok: 0, non: 0, delay: 0 },
                logs: []
            };
        });

        if (allJobs) {
            const mappedJobs: JobInstruction[] = allJobs.map((j: any) => ({
                id: j.id,
                targetTeam: j.team,
                team: j.team,
                assignee: j.assignee ? j.assignee.split(' (')[0] : null,
                subject: j.subject,
                description: j.description || '',
                deadline: j.deadline || '',
                status: j.status,
                timestamp: j.completed_at || j.created_at,
                created_at: j.created_at,
                evidenceUrl: j.evidence_url || undefined,
                verificationResult: j.verification_result,
                aiScore: j.ai_score,
                aiAnalysis: j.ai_analysis,
                feedbackComment: j.feedback_comment,
                tpo_id: j.tpo_id
            }));

            const mergedJobs = mergeWithMockData(mappedJobs);

            mergedJobs.forEach(job => {
                // Find user by name (assignee)
                // If assignee is null, we might skip or put in a 'Unknown' bucket.
                // For now, we only track users defined in MOCK_USERS to match the dashboard design.
                const assigneeName = job.assignee;
                if (!assigneeName || !MOCK_USERS[assigneeName]) return;

                if (!groups[assigneeName]) {
                    // Initialize with MOCK_USERS data if not already present
                    const mock = MOCK_USERS[assigneeName];
                    groups[assigneeName] = {
                        id: assigneeName,
                        name: mock.name!,
                        role: mock.role!,
                        shift: mock.shift!,
                        accuracy: mock.accuracy,
                        speed: mock.speed,
                        loyalty: mock.loyalty,
                        share: mock.share,
                        total: mock.total,
                        status: 'GOOD',
                        counts: { total: 0, ok: 0, non: 0, delay: 0 },
                        logs: []
                    };
                }
                const g = groups[assigneeName];

                const isRisk = job.status === 'non_compliant' || job.verificationResult === 'fail';

                g.counts.total++;
                if (job.status === 'completed' && job.verificationResult !== 'fail') g.counts.ok++;
                if (isRisk) g.counts.non++;
                if (job.status === 'delayed') g.counts.delay++;

                g.logs.push({
                    id: job.id,
                    t: job.subject,
                    tag: job.team,
                    time: new Date(job.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    m: job.description || '특이사항 없음',
                    fb: job.feedbackComment || (job.verificationResult === 'fail' ? '조치 필요' : '완료'),
                    isRisk: isRisk,
                    aiScore: job.aiScore
                });
            });
        }

        return Object.values(groups).map(g => ({
            ...g,
            status: g.counts.non > 0 ? 'RISK' : 'GOOD'
        }));
    }, [allJobs, mergeWithMockData]);

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
        stats,
        mounted
    };
}
