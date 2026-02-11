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
    // New deployment logic
    deployedTaskGroupIds: number[];
    deployToBoard: (groupId: number) => void;

    removeFromBoard: (groupId: number) => void;
    updateJobStatus: (id: number, status: 'in_progress' | 'completed' | 'delayed') => Promise<void>;
    completeJobWithEvidence: (id: number, evidenceFile: File | null) => Promise<void>;
}

const DoContext = createContext<DoContextType | undefined>(undefined);

export const DoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { workplace, team, job, registeredTpos, setRegisteredTpos, fetchTpos } = useCommon();
    const { setSelectedCriteria } = usePlan();

    const [activeDoSubPhase, setActiveDoSubPhase] = useState('checklist');
    const [inspectionResults, setInspectionResults] = useState<InspectionRecord[]>([]);
    const [isInspectionModalOpen, setInspectionModalOpen] = useState(false);
    const [selectedInspectionSopId, setSelectedInspectionSopId] = useState<number | null>(null);
    const [jobInstructions, setJobInstructions] = useState<JobInstruction[]>([]);
    const [deployedTaskGroupIds, setDeployedTaskGroupIds] = useState<number[]>([]);

    // Fetch inspection results from job_instructions table (completed or non_compliant)
    const fetchInspectionResults = async () => {
        try {
            const { data, error } = await supabase
                .from('job_instructions')
                .select('*')
                .eq('team', team)
                .in('status', ['completed', 'non_compliant'])
                .order('completed_at', { ascending: false });

            if (error) {
                console.error('Error fetching inspection results:', error);
                return;
            }

            if (data) {
                const mappedResults: InspectionRecord[] = data.map((item: any) => {
                    const status = item.status === 'completed' ? 'O' : 'X';
                    // Parse deadline or completed_at for time
                    const timeStr = item.completed_at ? new Date(item.completed_at).toLocaleString('ko-KR', {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    }) : new Date().toLocaleString('ko-KR');

                    // Extract area from subject/description or default
                    const areaMatch = item.subject.match(/\[(.*?)\]/);
                    const area = areaMatch ? areaMatch[1] : (item.description?.substring(0, 10) || '현장');

                    // Extract item/issue from subject
                    const workItem = item.subject.replace(/\[.*?\]\s*/, '');

                    return {
                        id: item.id,
                        time: timeStr,
                        name: item.assignee || '담당자', // Fallback if null
                        area: area,
                        item: workItem,
                        status: status,
                        role: item.team, // Use team as role for now
                        reason: item.description, // Use description as reason/detail
                        tpoId: item.tpo_id || 0
                    };
                });
                setInspectionResults(mappedResults);
            }
        } catch (err) {
            console.error('Unexpected error fetching inspection results:', err);
        }
    };

    // Fetch on mount and when team changes
    React.useEffect(() => {
        fetchInspectionResults();
    }, [team]);

    const addInspectionResult = (result: Omit<InspectionRecord, 'id'>) => {
        // Use negative IDs for locally-created records to avoid conflicts with DB auto-increment IDs
        const newId = inspectionResults.length > 0 ? Math.min(...inspectionResults.map(r => r.id), 0) - 1 : -1;
        const newRecord = { ...result, id: newId };
        setInspectionResults(prev => [newRecord, ...prev]);
        return newRecord.id;
    };

    // Fetch job instructions for Job Card Board
    const fetchJobInstructions = async () => {
        try {
            const { data, error } = await supabase
                .from('job_instructions')
                .select('*')
                .eq('team', team)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching job instructions:', error);
                return;
            }

            if (data) {
                const mappedInstructions: JobInstruction[] = data.map((item: any) => ({
                    id: item.id,
                    targetTeam: item.team,
                    assignee: item.assignee || '담당자',
                    subject: item.subject,
                    description: item.description || '',
                    deadline: item.deadline || '',
                    status: item.status === 'waiting' ? 'sent' :
                        item.status === 'in_progress' ? 'in_progress' :
                            item.status === 'completed' ? 'completed' : 'sent', // Map DB status to UI status
                    timestamp: item.created_at
                }));
                setJobInstructions(mappedInstructions);
            }
        } catch (err) {
            console.error('Unexpected error fetching job instructions:', err);
        }
    };

    React.useEffect(() => {
        fetchJobInstructions();
    }, []);

    const addJobInstruction = async (instruction: Omit<JobInstruction, 'id'>) => {
        try {
            // Ensure deadline is in ISO format for DB
            let safeDeadline = null;
            if (instruction.deadline) {
                try {
                    // Try to parse and format as ISO
                    safeDeadline = new Date(instruction.deadline).toISOString();
                } catch (e) {
                    console.warn('Invalid date format for deadline, using null', instruction.deadline);
                }
            }

            const { data, error } = await supabase
                .from('job_instructions')
                .insert([
                    {
                        team: instruction.targetTeam,
                        assignee: instruction.assignee,
                        subject: instruction.subject,
                        description: instruction.description,
                        status: 'waiting', // Default DB status
                        deadline: safeDeadline
                        // created_at is auto-generated
                    }
                ])
                .select();

            if (error) {
                console.error('Error adding job instruction:', error);
                alert('직무카드 생성 중 오류가 발생했습니다.');
                return;
            }

            if (data && data.length > 0) {
                const newItem = data[0];
                const newInstruction: JobInstruction = {
                    id: newItem.id,
                    targetTeam: newItem.team,
                    assignee: newItem.assignee || '담당자',
                    subject: newItem.subject,
                    description: newItem.description || '',
                    deadline: newItem.deadline || '',
                    status: 'sent',
                    timestamp: newItem.created_at
                };
                setJobInstructions(prev => [newInstruction, ...prev]);
            }
        } catch (err) {
            console.error('Unexpected error adding job instruction:', err);
        }
    };

    const deployToBoard = async (groupId: number) => {
        if (deployedTaskGroupIds.includes(groupId)) return;

        // Find the TPO and task group info for this groupId
        let tpoId: number | null = null;
        let teamLabel = team;
        let subject = '업무지시';

        for (const tpo of registeredTpos) {
            const group = tpo.setupTasks?.find(g => g.id === groupId);
            if (group) {
                tpoId = tpo.id;
                teamLabel = tpo.team;
                // Build subject from checklist items
                const itemNames = group.items.map(i => i.content).join(', ');
                subject = itemNames.length > 50 ? itemNames.substring(0, 50) + '...' : itemNames;
                if (!subject) subject = `[${tpo.tpo.place}] ${tpo.tpo.occasion}`;
                break;
            }
        }

        // team is already stored as Korean label (프론트, 객실관리, etc.)
        // INSERT into Supabase
        try {
            await supabase.from('job_instructions').insert({
                tpo_id: tpoId,
                task_group_id: groupId,
                team: teamLabel,
                subject,
                status: 'waiting',
            });
        } catch (err) {
            console.error('Error inserting job_instruction:', err);
        }

        setDeployedTaskGroupIds(prev => [...prev, groupId]);
    };

    const removeFromBoard = async (groupId: number) => {
        // DELETE from Supabase
        try {
            await supabase.from('job_instructions').delete().eq('task_group_id', groupId);
        } catch (err) {
            console.error('Error deleting job_instruction:', err);
        }

        setDeployedTaskGroupIds(prev => prev.filter(id => id !== groupId));
    };

    const handleRemoveSetupTask = async (groupId: number) => {
        if (!confirm('선택한 세분화 설정을 삭제하시겠습니까?')) return;
        try {
            await supabase.from('task_groups').delete().eq('id', groupId);
            setRegisteredTpos(prev => prev.map(tpo => tpo.setupTasks ? { ...tpo, setupTasks: tpo.setupTasks.filter(g => g.id !== groupId) } : tpo));
            // Also remove from board if it was deployed
            setDeployedTaskGroupIds(prev => prev.filter(id => id !== groupId));
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

    const updateJobStatus = async (id: number, status: 'in_progress' | 'completed' | 'delayed') => {
        try {
            const updates: any = { status };
            const now = new Date().toISOString();

            if (status === 'in_progress') {
                updates.started_at = now;
            } else if (status === 'completed') {
                updates.completed_at = now;
            }

            const { error } = await supabase
                .from('job_instructions')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error('Error updating job status:', error);
                alert('상태 업데이트 중 오류가 발생했습니다.');
                return;
            }

            // Update local state
            setJobInstructions(prev => prev.map(job =>
                job.id === id ? { ...job, status: status } : job
            ));

        } catch (err) {
            console.error('Unexpected error updating job status:', err);
        }
    };

    const uploadEvidence = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('evidence-photos')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading evidence:', uploadError);
                return null;
            }

            const { data } = supabase.storage
                .from('evidence-photos')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error in uploadEvidence:', error);
            return null;
        }
    };

    const completeJobWithEvidence = async (id: number, evidenceFile: File | null) => {
        let evidenceUrl = null;
        if (evidenceFile) {
            evidenceUrl = await uploadEvidence(evidenceFile);
            if (!evidenceUrl) {
                alert('사진 업로드에 실패했습니다. 다시 시도해주세요.');
                return;
            }
        }

        try {
            const updates: any = {
                status: 'completed',
                completed_at: new Date().toISOString()
            };

            if (evidenceUrl) {
                updates.evidence_url = evidenceUrl;
                updates.description = `[이행증빙포함] ${updates.description || ''}`; // Optional: mark description
            }

            const { error } = await supabase
                .from('job_instructions')
                .update(updates)
                .eq('id', id);

            if (error) {
                console.error('Error completing job:', error);
                alert('완료 처리 중 오류가 발생했습니다.');
                return;
            }

            // Update local state
            setJobInstructions(prev => prev.map(job =>
                job.id === id ? { ...job, status: 'completed' } : job
            ));

        } catch (err) {
            console.error('Unexpected error completing job:', err);
        }
    };

    return (
        <DoContext.Provider value={{
            activeDoSubPhase, setActiveDoSubPhase, inspectionResults, addInspectionResult,
            isInspectionModalOpen, setInspectionModalOpen, selectedInspectionSopId, setSelectedInspectionSopId,
            jobInstructions, addJobInstruction, setupTasksToSop, handleRemoveSetupTask, handleEditSetupTask,
            deployedTaskGroupIds, deployToBoard, removeFromBoard, updateJobStatus, completeJobWithEvidence
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
