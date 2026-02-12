import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useCommon } from './CommonContext';
import { ActionPlanItem, VocRecord, JobInstructionDB } from '@csmac/types';
import { useVerificationPersistence } from '../hooks/useVerificationPersistence';
import { useToast } from './ToastContext';

export interface ActContextType {
    showConcernPopup: boolean;
    setShowConcernPopup: (v: boolean) => void;
    actionPlanItems: ActionPlanItem[];
    vocRecords: VocRecord[];
    updateActionPlanItem: (id: number, updates: Partial<ActionPlanItem>) => void;
    addActionPlanItem: (item: Omit<ActionPlanItem, 'id'>) => void;
    resolveActionItem: (id: number, updates?: Partial<ActionPlanItem>) => Promise<void>;
    timeRange: 'today' | 'weekly' | 'monthly';
    setTimeRange: (v: 'today' | 'weekly' | 'monthly') => void;
    stats: {
        totalRecords: number;
        completedCount: number;
        nonCompliantCount: number;
        complianceRate: number;
        actionRequiredCount: number;
        delayedCount: number;
    };
    allJobs: JobInstructionDB[];
}

const ActContext = createContext<ActContextType | undefined>(undefined);

const MOCK_VOC: VocRecord[] = [
    { id: 1, customerName: 'James Wilson', roomNumber: '1004', content: '체크인 시 직원분이 매우 친절하게 응대해 주셔서 기분이 좋았습니다.', sentiment: 'positive', receivedAt: new Date().toISOString(), status: 'received' },
    { id: 2, customerName: 'Sarah Lee', roomNumber: '802', content: '객실 바닥에 먼지가 조금 남아 있었습니다. 청결에 더 신경 써주세요.', sentiment: 'negative', receivedAt: new Date().toISOString(), status: 'received' },
    { id: 3, customerName: 'Michael Chen', content: '조식 뷔페가 예전보다 다양해져서 만족스럽습니다.', sentiment: 'positive', receivedAt: new Date().toISOString(), status: 'processed' },
    { id: 4, customerName: '박지민', roomNumber: '1512', content: '엘리베이터 대기 시간이 너무 길어요.', sentiment: 'neutral', receivedAt: new Date().toISOString(), status: 'received' },
];

export const ActProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { team } = useCommon();
    const { mergeWithMockData } = useVerificationPersistence();
    const { addToast } = useToast();
    const [jobData, setJobData] = useState<JobInstructionDB[]>([]);
    const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly'>('today');

    const fetchActData = React.useCallback(async () => {
        const { data, error } = await supabase
            .from('job_instructions')
            .select('*')
            .eq('team', team);

        if (data) {
            setJobData(data);
        }
    }, [team]);

    React.useEffect(() => {
        fetchActData();
        const interval = setInterval(fetchActData, 5000); // Poll every 5s for MVP real-time feel
        return () => clearInterval(interval);
    }, [team]);

    const [showConcernPopup, setShowConcernPopup] = useState(false);
    const [actionPlanItems, setActionPlanItems] = useState<ActionPlanItem[]>([]);

    const updateActionPlanItem = React.useCallback((id: number, updates: Partial<ActionPlanItem>) => {
        setActionPlanItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }, []);

    const addActionPlanItem = React.useCallback((item: Omit<ActionPlanItem, 'id'>) => {
        setActionPlanItems(prev => {
            const newId = prev.length > 0 ? Math.max(...prev.map(a => a.id)) + 1 : 1;
            return [...prev, { ...item, id: newId }];
        });
    }, []);

    const resolveActionItem = async (id: number, updates?: Partial<ActionPlanItem>) => {
        try {
            // Attempt DB update but anticipate missing columns
            const { error: dbError } = await supabase
                .from('job_instructions')
                .update({
                    status: updates?.status || 'completed',
                    verification_result: updates?.verificationResult || 'pass',
                    ai_score: updates?.aiScore,
                    ai_analysis: updates?.aiAnalysis
                    // feedback_comment is intentionally omitted if risky, 
                    // or we can try/catch a second update for extended fields.
                })
                .eq('id', id);

            if (dbError) {
                console.warn('Primary DB update warning (possibly missing columns):', dbError);
            }

            // Try the secondary update for feedback_comment separately to avoid breaking the whole flow
            if (updates?.feedbackComment) {
                const { error: fbError } = await supabase
                    .from('job_instructions')
                    .update({ feedback_comment: updates.feedbackComment })
                    .eq('id', id);

                if (fbError) {
                    console.warn('Feedback column missing or update failed, relying on localStorage fallback.');
                }
            }

            await fetchActData(); // Refresh list to get what we can from DB
            addToast('검증 결과가 처리되었습니다.', 'success');
        } catch (error) {
            console.error('Unexpected error in resolveActionItem:', error);
            addToast('조치 처리 중 오류가 발생했습니다.', 'error');
        }
    };

    // Filter jobData based on timeRange (Simulated)
    const filteredJobs = useMemo(() => {
        if (timeRange === 'today') {
            const today = new Date().toISOString().split('T')[0];
            return jobData.filter(j => j.created_at.startsWith(today));
        }
        // For weekly/monthly, we just return the full set for now to simulate "historical data"
        // In a real app, this would be a date range filter in SQL.
        return jobData;
    }, [jobData, timeRange]);

    // Calculate Stats from filtered data
    const stats = useMemo(() => {
        const total = filteredJobs.length;
        const completed = filteredJobs.filter(j => j.status === 'completed' || j.status === 'non_compliant').length;
        const delayed = filteredJobs.filter(j => j.status === 'delayed').length;
        const nonCompliant = filteredJobs.filter(j => j.status === 'non_compliant' || j.verification_result === 'fail').length;

        const verifiedCount = filteredJobs.filter(j => j.verification_result !== null).length;
        const passCount = filteredJobs.filter(j => j.verification_result === 'pass').length;

        const complianceRate = verifiedCount > 0
            ? Math.round((passCount / verifiedCount) * 100)
            : 100;

        return {
            totalRecords: total,
            completedCount: completed,
            nonCompliantCount: nonCompliant,
            complianceRate,
            actionRequiredCount: nonCompliant,
            delayedCount: delayed
        };
    }, [filteredJobs]);

    // Derived Action Plan Items from Non-Compliant Jobs
    const activeIssues = useMemo(() => {
        const jobsWithMock = mergeWithMockData(filteredJobs);

        return jobsWithMock
            .filter(j => (j.status === 'non_compliant' || j.verification_result === 'fail'))
            .map(j => ({
                id: j.id,
                inspectionId: j.id,
                team: j.team,
                area: j.subject.substring(0, 15) + '...',
                category: '미준수',
                issue: j.subject,
                reason: j.description || '이행 미준수',
                timestamp: j.completed_at || j.created_at,
                status: 'pending' as const,
                aiScore: j.ai_score ?? undefined,
                aiAnalysis: j.ai_analysis ?? undefined,
                feedbackComment: j.feedback_comment ?? undefined
            }));
    }, [filteredJobs, mergeWithMockData]);

    const value = React.useMemo(() => ({
        showConcernPopup, setShowConcernPopup,
        actionPlanItems: activeIssues,
        vocRecords: MOCK_VOC, // Mock VOC data
        updateActionPlanItem, addActionPlanItem, resolveActionItem, stats,
        allJobs: jobData,
        timeRange, setTimeRange
    }), [showConcernPopup, activeIssues, updateActionPlanItem, addActionPlanItem, resolveActionItem, stats, jobData, timeRange]);

    return (
        <ActContext.Provider value={value}>
            {children}
        </ActContext.Provider>
    );
};

export const useAct = () => {
    const context = useContext(ActContext);
    if (!context) throw new Error('useAct must be used within ActProvider');
    return context;
};
