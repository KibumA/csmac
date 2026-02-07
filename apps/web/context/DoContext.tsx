import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useCommon } from './CommonContext';
import { usePlan } from './PlanContext';
import { InspectionRecord, JobInstruction, ChecklistItem, TpoData } from '@csmac/types';

export interface DoContextType {
    activeDoSubPhase: string;
    setActiveDoSubPhase: (v: string) => void;
    inspectionResults: InspectionRecord[];
    addInspectionResult: (result: Omit<InspectionRecord, 'id'>) => number;
    isInspectionModalOpen: boolean;
    setInspectionModalOpen: (v: boolean) => void;
    selectedInspectionSopId: number | null;
    setSelectedInspectionSopId: (v: number | null) => void;
    jobInstructions: JobInstruction[];
    addJobInstruction: (instruction: Omit<JobInstruction, 'id'>) => void;
    setupTasksToSop: (sopId: number | null, tasks: ChecklistItem[], isManual?: boolean, newSopInfo?: { category: string, tpo: TpoData }) => Promise<boolean>;
    handleRemoveSetupTask: (groupId: number) => Promise<void>;
    handleEditSetupTask: (tpoId: number, groupId: number) => void;
}

const DoContext = createContext<DoContextType | undefined>(undefined);

export const DoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { workplace, team, job, registeredTpos, setRegisteredTpos, fetchTpos } = useCommon();
    const { setSelectedCriteria } = usePlan();

    const [activeDoSubPhase, setActiveDoSubPhase] = useState('checklist');
    const [inspectionResults, setInspectionResults] = useState<InspectionRecord[]>([
        { id: 1, time: '2026.01.26 10:20', name: '박기철', area: '902호', item: '침구류 오염 및 주름 상태 확인', status: 'O', role: '인스펙터', tpoId: 1 },
        { id: 2, time: '2026.01.26 10:35', name: '박기철', area: '903호', item: '실내 온도 및 조명 작동 여부', status: 'X', role: '인스펙터', reason: '조명 깜빡임', tpoId: 1 },
        { id: 3, time: '2026.01.26 10:50', name: '최민수', area: '로비', item: '맞이 인사(Greeting) 수행 여부', status: 'O', role: '리셉션', tpoId: 5 },
        { id: 4, time: '2026.01.26 14:15', name: '이대한', area: '주차장', item: '포트홀 및 바닥 균열 유무', status: 'O', role: '엔지니어', tpoId: 10 },
    ]);
    const [isInspectionModalOpen, setInspectionModalOpen] = useState(false);
    const [selectedInspectionSopId, setSelectedInspectionSopId] = useState<number | null>(null);
    const [jobInstructions, setJobInstructions] = useState<JobInstruction[]>([]);

    const addInspectionResult = (result: Omit<InspectionRecord, 'id'>) => {
        const newId = inspectionResults.length > 0 ? Math.max(...inspectionResults.map(r => r.id)) + 1 : 1;
        const newRecord = { ...result, id: newId };
        setInspectionResults(prev => [...prev, newRecord]);
        return newRecord.id;
    };

    const addJobInstruction = (instruction: Omit<JobInstruction, 'id'>) => {
        setJobInstructions(prev => [{ id: Date.now(), ...instruction }, ...prev]);
    };

    const handleRemoveSetupTask = async (groupId: number) => {
        if (!confirm('선택한 세분화 설정을 삭제하시겠습니까?')) return;
        try {
            await supabase.from('task_groups').delete().eq('id', groupId);
            setRegisteredTpos(prev => prev.map(tpo => tpo.setupTasks ? { ...tpo, setupTasks: tpo.setupTasks.filter(g => g.id !== groupId) } : tpo));
            setTimeout(() => alert('삭제되었습니다.'), 0);
        } catch (err) {
            console.error('Error removing setup task group:', err);
        }
    };

    const handleEditSetupTask = (tpoId: number, groupId: number) => {
        const tpo = registeredTpos.find(t => t.id === tpoId);
        if (!tpo || !tpo.setupTasks) return;
        const group = tpo.setupTasks.find(g => g.id === groupId);
        if (!group) return;
        setSelectedCriteria({ checklist: tpo.criteria.checklist, items: group.items.map(item => ({ ...item })) });
        setSelectedInspectionSopId(tpoId);
        setInspectionModalOpen(true);
    };

    const setupTasksToSop = async (sopId: number | null, tasks: ChecklistItem[], isManual?: boolean, newSopInfo?: { category: string, tpo: TpoData }): Promise<boolean> => {
        try {
            if (sopId !== null) {
                // Duplicate check: Verify if this combination already exists for this TPO
                const existingTpo = registeredTpos.find(t => t.id === sopId);
                if (existingTpo && existingTpo.setupTasks) {
                    const isDuplicate = existingTpo.setupTasks.some(group => {
                        if (group.items.length !== tasks.length) return false;
                        const existingIds = group.items.map(i => i.id).sort().join(',');
                        const newIds = tasks.map(i => i.id).sort().join(',');
                        return existingIds === newIds;
                    });

                    if (isDuplicate) {
                        alert('이미 동일한 항목 구성으로 세분화 설정이 등록되어 있습니다.');
                        return false;
                    }
                }

                const { data: groupData, error: groupError } = await supabase.from('task_groups').insert({ tpo_id: sopId, group_name: `설정 ${Date.now()}` }).select().single();
                if (groupError) throw groupError;
                const junctionItems = tasks.filter((t: any) => t.id).map((item: any) => ({ group_id: groupData.id, checklist_item_id: item.id }));
                if (junctionItems.length > 0) await supabase.from('task_group_items').insert(junctionItems);
                setRegisteredTpos(prev => prev.map(t => t.id === sopId ? { ...t, setupTasks: [...(t.setupTasks || []), { id: groupData.id, items: tasks }] } : t));
                return true;
            } else if (newSopInfo) {
                const { data: tpoData, error: tpoError } = await supabase.from('tpo').insert({ workplace, team, job, tpo_time: newSopInfo.tpo.time, tpo_place: newSopInfo.tpo.place, tpo_occasion: newSopInfo.tpo.occasion, matching_evidence: '사진', matching_method: '정기점검', matching_elements: ['청결도'] }).select().single();
                if (tpoError) throw tpoError;
                const itemsToInsert = tasks.map((item, idx) => ({ tpo_id: tpoData.id, content: item.content, sequence_order: idx, reference_image_url: item.imageUrl || null }));
                const { data: insertedItems } = await supabase.from('checklist_items').insert(itemsToInsert).select();
                const { data: groupData } = await supabase.from('task_groups').insert({ tpo_id: tpoData.id, group_name: `현장등록 ${Date.now()}` }).select().single();
                if (insertedItems && groupData) {
                    const junctionItems = insertedItems.map(item => ({ group_id: groupData.id, checklist_item_id: item.id }));
                    await supabase.from('task_group_items').insert(junctionItems);
                }
                await fetchTpos();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error in setupTasksToSop:', err);
            return false;
        }
    };

    return (
        <DoContext.Provider value={{
            activeDoSubPhase, setActiveDoSubPhase, inspectionResults, addInspectionResult,
            isInspectionModalOpen, setInspectionModalOpen, selectedInspectionSopId, setSelectedInspectionSopId,
            jobInstructions, addJobInstruction, setupTasksToSop, handleRemoveSetupTask, handleEditSetupTask
        }}>
            {children}
        </DoContext.Provider>
    );
};

export const useDo = () => {
    const context = useContext(DoContext);
    if (!context) throw new Error('useDo must be used within DoProvider');
    return context;
};
