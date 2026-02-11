import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useCommon } from './CommonContext';
import { ActionPlanItem } from '@csmac/types';

export interface ActContextType {
    showConcernPopup: boolean;
    setShowConcernPopup: (v: boolean) => void;
    actionPlanItems: ActionPlanItem[];
    updateActionPlanItem: (id: number, updates: Partial<ActionPlanItem>) => void;
    addActionPlanItem: (item: Omit<ActionPlanItem, 'id'>) => void;
    resolveActionItem: (id: number) => Promise<void>;
    stats: {
        totalRecords: number;
        completedCount: number;
        nonCompliantCount: number;
        complianceRate: number;
        actionRequiredCount: number;
        delayedCount: number;
    };
    allJobs: any[];
}

const ActContext = createContext<ActContextType | undefined>(undefined);

export const ActProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { team } = useCommon();
    const [jobData, setJobData] = useState<any[]>([]);

    const fetchActData = async () => {
        const { data, error } = await supabase
            .from('job_instructions')
            .select('*')
            .eq('team', team);

        if (data) {
            setJobData(data);
        }
    };

    React.useEffect(() => {
        fetchActData();
        const interval = setInterval(fetchActData, 5000); // Poll every 5s for MVP real-time feel
        return () => clearInterval(interval);
    }, [team]);

    const [showConcernPopup, setShowConcernPopup] = useState(false);
    const [actionPlanItems, setActionPlanItems] = useState<ActionPlanItem[]>([]);

    const updateActionPlanItem = (id: number, updates: Partial<ActionPlanItem>) => {
        setActionPlanItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addActionPlanItem = (item: Omit<ActionPlanItem, 'id'>) => {
        const newId = actionPlanItems.length > 0 ? Math.max(...actionPlanItems.map(a => a.id)) + 1 : 1;
        setActionPlanItems(prev => [...prev, { ...item, id: newId }]);
    };

    const resolveActionItem = async (id: number) => {
        try {
            const { error } = await supabase
                .from('job_instructions')
                .update({ status: 'completed', verification_result: 'pass' })
                .eq('id', id);

            if (error) throw error;
            await fetchActData(); // Refresh list
            alert('조치가 완료되었습니다.');
        } catch (error) {
            console.error('Error resolving action item:', error);
            alert('조치 처리 중 오류가 발생했습니다.');
        }
    };

    // Calculate Stats from real DB data
    const totalRecords = jobData.length;

    // Status counts
    const completedCount = jobData.filter(j => j.status === 'completed' || j.status === 'non_compliant').length;
    const delayedCount = jobData.filter(j => j.status === 'delayed').length;
    const nonCompliantCount = jobData.filter(j => j.status === 'non_compliant' || j.verification_result === 'fail').length;

    // Compliance Rate: (Completed - NonCompliant) / Completed
    // Or simply (Pass / Total Verified)
    const verifiedCount = jobData.filter(j => j.verification_result !== null).length;
    const passCount = jobData.filter(j => j.verification_result === 'pass').length;

    const complianceRate = verifiedCount > 0
        ? Math.round((passCount / verifiedCount) * 100)
        : 100;

    const stats = {
        totalRecords,
        completedCount,
        nonCompliantCount,
        complianceRate,
        actionRequiredCount: nonCompliantCount,
        delayedCount
    };

    // Derived Action Plan Items from Non-Compliant Jobs
    // In a real app, this might be a separate table 'action_items' linked to jobs
    // For MVP, we map non-compliant jobs to action items if they aren't "resolved" (simulated)
    const activeIssues = jobData
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
            status: 'pending' as const
        }));

    return (
        <ActContext.Provider value={{
            showConcernPopup, setShowConcernPopup,
            actionPlanItems: activeIssues, // Use real issues
            updateActionPlanItem, addActionPlanItem, resolveActionItem, stats,
            allJobs: jobData
        }}>
            {children}
        </ActContext.Provider>
    );
};

export const useAct = () => {
    const context = useContext(ActContext);
    if (!context) throw new Error('useAct must be used within ActProvider');
    return context;
};
