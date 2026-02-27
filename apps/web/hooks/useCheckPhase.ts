import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { JobInstruction, JobInstructionDB, RegisteredTpo } from '@csmac/types';
import { usePDCA } from '../context/PDCAContext';
import { simulateAIAnalysis } from '../utils/aiSimulation';
import { useVerificationPersistence } from './useVerificationPersistence';
import { mapDbToJobInstruction } from '../utils/instructionUtils';

export function useCheckPhase() {
    const { team, registeredTpos, resolveActionItem } = usePDCA();
    const { saveMockData, mergeWithMockData } = useVerificationPersistence();

    const [verificationList, setVerificationList] = useState<JobInstruction[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [mounted, setMounted] = useState(false);

    const fetchVerificationList = useCallback(async () => {
        let query = supabase
            .from('job_instructions')
            .select('*')
            .in('status', ['completed', 'non_compliant'])
            .order('completed_at', { ascending: false });

        if (team !== '전체') {
            query = query.eq('team', team);
        }

        const { data, error } = await query;

        if (data) {
            const mapped: JobInstruction[] = data.map((item: JobInstructionDB) => mapDbToJobInstruction(item));

            setVerificationList(mergeWithMockData(mapped));
        }
    }, [team, mergeWithMockData]);

    useEffect(() => {
        setMounted(true);
        fetchVerificationList();
    }, [fetchVerificationList]);

    // Sync feedback state when selected item changes
    useEffect(() => {
        if (selectedId) {
            const item = verificationList.find(i => i.id === selectedId);
            setFeedback(item?.feedbackComment || '');
        } else {
            setFeedback('');
        }
    }, [selectedId, verificationList]);

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

    const submitVerification = async (result: 'pass' | 'fail' | 'cancel_approval') => {
        if (!selectedId) return;

        const newVerificationResult = result === 'cancel_approval' ? null : result;
        const newStatus = result === 'cancel_approval' ? 'completed' : (result === 'fail' ? 'non_compliant' : 'completed');

        // 1. Persistent Fallback
        saveMockData(selectedId, {
            feedbackComment: result === 'cancel_approval' ? '' : feedback,
            verificationResult: newVerificationResult as any
        });

        // 2. Resolve
        console.log('[useCheckPhase] submitting resolveActionItem:', {
            verificationResult: newVerificationResult,
            status: newStatus,
            feedbackComment: result === 'cancel_approval' ? '' : feedback
        });

        await resolveActionItem(selectedId, {
            verificationResult: newVerificationResult,
            status: newStatus as any,
            feedbackComment: result === 'cancel_approval' ? '' : feedback
        } as any);

        setFeedback('');
        setSelectedId(null);
        await fetchVerificationList();
    };

    const selectedItem = verificationList.find(i => i.id === selectedId);
    const standardTpo = registeredTpos.find((t: RegisteredTpo) => t.id === selectedItem?.tpo_id);
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
