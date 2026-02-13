import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { JobInstruction } from '@csmac/types';
import { usePDCA } from '../context/PDCAContext';
import { simulateAIAnalysis } from '../utils/aiSimulation';
import { useVerificationPersistence } from './useVerificationPersistence';

export function useCheckPhase() {
    const { team, registeredTpos, resolveActionItem } = usePDCA();
    const { saveMockData, mergeWithMockData } = useVerificationPersistence();

    const [verificationList, setVerificationList] = useState<JobInstruction[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [mounted, setMounted] = useState(false);

    const fetchVerificationList = useCallback(async () => {
        const { data, error } = await supabase
            .from('job_instructions')
            .select('*')
            .eq('team', team)
            .in('status', ['completed', 'non_compliant'])
            .order('completed_at', { ascending: false });

        if (data) {
            const mapped: JobInstruction[] = data.map((item: any) => ({
                id: item.id,
                targetTeam: item.team,
                assignee: item.assignee ? item.assignee.split(' (')[0] : null,
                subject: item.subject,
                description: item.description || '',
                deadline: item.deadline || '',
                status: item.status,
                timestamp: item.completed_at || item.created_at,
                team: item.team,
                created_at: item.created_at,
                evidenceUrl: item.evidence_url,
                verificationResult: item.verification_result,
                aiScore: item.ai_score,
                aiAnalysis: item.ai_analysis,
                feedbackComment: item.feedback_comment,
                tpo_id: item.tpo_id
            }));

            setVerificationList(mergeWithMockData(mapped));
        }
    }, [team, mergeWithMockData]);

    useEffect(() => {
        setMounted(true);
        fetchVerificationList();
    }, [fetchVerificationList]);

    const handleBatchAnalysis = async () => {
        setIsAnalyzing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        for (const item of verificationList) {
            if (!item.aiScore) {
                const result = simulateAIAnalysis(item);

                // 1. Try DB Update
                await supabase
                    .from('job_instructions')
                    .update({
                        ai_score: result.score,
                        ai_analysis: result.analysis,
                        verification_result: result.isPass ? 'pass' : 'fail'
                    })
                    .eq('id', item.id);

                // 2. Persistent Fallback
                saveMockData(item.id, {
                    aiScore: result.score,
                    aiAnalysis: result.analysis,
                    verificationResult: result.isPass ? 'pass' : 'fail'
                });
            }
        }

        await fetchVerificationList();
        setIsAnalyzing(false);
    };

    const submitVerification = async (result: 'pass' | 'fail') => {
        if (!selectedId) return;

        // 1. Persistent Fallback
        saveMockData(selectedId, {
            feedbackComment: feedback,
            verificationResult: result
        });

        // 2. Resolve
        await resolveActionItem(selectedId, {
            verificationResult: result,
            status: result === 'fail' ? 'non_compliant' : 'completed',
            feedbackComment: feedback
        });

        setFeedback('');
        setSelectedId(null);
        await fetchVerificationList();
    };

    const selectedItem = verificationList.find(i => i.id === selectedId);
    const standardTpo = registeredTpos.find((t: any) => t.id === selectedItem?.tpo_id);
    const standardImage = standardTpo?.criteria.items.find((i: any) => i.imageUrl)?.imageUrl;

    return {
        verificationList,
        selectedId,
        setSelectedId,
        isAnalyzing,
        feedback,
        setFeedback,
        mounted,
        handleBatchAnalysis,
        submitVerification,
        selectedItem,
        standardImage,
        fetchVerificationList
    };
}
