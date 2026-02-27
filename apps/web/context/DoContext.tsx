import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useCommon } from './CommonContext';
import { usePlan } from './PlanContext';
import { useToast } from './ToastContext';
import { InspectionRecord, JobInstruction, ChecklistItem, TpoData, JobInstructionDB } from '@csmac/types';
import { mapDbToJobInstruction, mapDbToInspectionRecord } from '../utils/instructionUtils';
import { JobService } from '../services/jobService';

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
    fetchJobInstructions: () => Promise<void>;
    // New deployment logic
    deployedTaskGroupIds: number[];
    deployToBoard: (groupId: number) => void;
    removeFromBoard: (groupId: number) => void;
    deleteJobInstruction: (id: number) => Promise<void>;
    assignMemberToTask: (taskGroupId: number, memberId: string) => Promise<void>;
    unassignMemberFromTask: (taskGroupId: number, memberId: string) => Promise<void>;
    assignments: Record<number, string[]>;
    setAssignments: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
    batchDeployTasks: () => Promise<void>;
    updateJobStatus: (id: number, status: 'in_progress' | 'completed' | 'delayed') => Promise<void>;
    completeJobWithEvidence: (id: number, evidenceFile: File | null) => Promise<void>;
    // Instruction Board Filter Persistence
    instructionBoardWorkplace: string;
    setInstructionBoardWorkplace: (v: string) => void;
    instructionBoardTeams: string[];
    setInstructionBoardTeams: React.Dispatch<React.SetStateAction<string[]>>;
    instructionBoardJobs: string[];
    setInstructionBoardJobs: React.Dispatch<React.SetStateAction<string[]>>;
    // Checklist Board Filter Persistence
    checklistSearchQuery: string;
    setChecklistSearchQuery: (v: string) => void;
    checklistSelectedTeams: string[];
    setChecklistSelectedTeams: React.Dispatch<React.SetStateAction<string[]>>;
    // Instruction Library Filter Persistence
    librarySearchQuery: string;
    setLibrarySearchQuery: (v: string) => void;
    librarySelectedOccasions: string[];
    setLibrarySelectedOccasions: React.Dispatch<React.SetStateAction<string[]>>;
    librarySelectedTeams: string[];
    setLibrarySelectedTeams: React.Dispatch<React.SetStateAction<string[]>>;
    librarySelectedJobs: string[];
    setLibrarySelectedJobs: React.Dispatch<React.SetStateAction<string[]>>;
    librarySelectedMode: string;
    setLibrarySelectedMode: (v: string) => void;
}

const DoContext = createContext<DoContextType | undefined>(undefined);

export const DoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { workplace, team, job, registeredTpos, setRegisteredTpos, fetchTpos } = useCommon();
    const { setSelectedCriteria } = usePlan();
    const { addToast } = useToast();

    const [activeDoSubPhase, setActiveDoSubPhase] = useState('checklist');
    const [inspectionResults, setInspectionResults] = useState<InspectionRecord[]>([]);
    const [isInspectionModalOpen, setInspectionModalOpen] = useState(false);
    const [selectedInspectionSopId, setSelectedInspectionSopId] = useState<number | null>(null);
    const [jobInstructions, setJobInstructions] = useState<JobInstruction[]>([]);
    const [assignments, setAssignments] = useState<Record<number, string[]>>({}); // taskId -> memberNames/Ids

    // Instruction Board Filters
    const [instructionBoardWorkplace, setInstructionBoardWorkplace] = useState('소노벨 천안');
    const [instructionBoardTeams, setInstructionBoardTeams] = useState<string[]>(['전체']);
    const [instructionBoardJobs, setInstructionBoardJobs] = useState<string[]>(['전체']);

    // Checklist Board Filters
    const [checklistSearchQuery, setChecklistSearchQuery] = useState('');
    const [checklistSelectedTeams, setChecklistSelectedTeams] = useState<string[]>(['전체']);

    // Instruction Library Filters
    const [librarySearchQuery, setLibrarySearchQuery] = useState('');
    const [librarySelectedOccasions, setLibrarySelectedOccasions] = useState<string[]>([]);
    const [librarySelectedTeams, setLibrarySelectedTeams] = useState<string[]>([]);
    const [librarySelectedJobs, setLibrarySelectedJobs] = useState<string[]>([]);
    const [librarySelectedMode, setLibrarySelectedMode] = useState('전체');

    // Persistence for Checklist Filters
    React.useEffect(() => {
        const savedQuery = localStorage.getItem('checklist_search_query');
        const savedTeams = localStorage.getItem('checklist_selected_teams');
        if (savedQuery) setChecklistSearchQuery(savedQuery);
        if (savedTeams) {
            try { setChecklistSelectedTeams(JSON.parse(savedTeams)); } catch (e) { console.error('Error parsing saved teams:', e); }
        }

        // Persistence for Library Filters
        const savedLibQuery = localStorage.getItem('library_search_query');
        const savedLibOccasions = localStorage.getItem('library_selected_occasions');
        const savedLibTeams = localStorage.getItem('library_selected_teams');
        const savedLibJobs = localStorage.getItem('library_selected_jobs');
        const savedLibMode = localStorage.getItem('library_selected_mode');

        if (savedLibQuery) setLibrarySearchQuery(savedLibQuery);
        if (savedLibOccasions) { try { setLibrarySelectedOccasions(JSON.parse(savedLibOccasions)); } catch (e) { } }
        if (savedLibTeams) { try { setLibrarySelectedTeams(JSON.parse(savedLibTeams)); } catch (e) { } }
        if (savedLibJobs) { try { setLibrarySelectedJobs(JSON.parse(savedLibJobs)); } catch (e) { } }
        if (savedLibMode) setLibrarySelectedMode(savedLibMode);
    }, []);

    React.useEffect(() => { localStorage.setItem('checklist_search_query', checklistSearchQuery); }, [checklistSearchQuery]);
    React.useEffect(() => { localStorage.setItem('checklist_selected_teams', JSON.stringify(checklistSelectedTeams)); }, [checklistSelectedTeams]);

    // Sync Library Filters
    React.useEffect(() => { localStorage.setItem('library_search_query', librarySearchQuery); }, [librarySearchQuery]);
    React.useEffect(() => { localStorage.setItem('library_selected_occasions', JSON.stringify(librarySelectedOccasions)); }, [librarySelectedOccasions]);
    React.useEffect(() => { localStorage.setItem('library_selected_teams', JSON.stringify(librarySelectedTeams)); }, [librarySelectedTeams]);
    React.useEffect(() => { localStorage.setItem('library_selected_jobs', JSON.stringify(librarySelectedJobs)); }, [librarySelectedJobs]);
    React.useEffect(() => { localStorage.setItem('library_selected_mode', librarySelectedMode); }, [librarySelectedMode]);

    const deployedTaskGroupIds = React.useMemo(() => {
        return Array.from(new Set(
            jobInstructions
                .filter(job => (job.status === 'waiting' || job.status === 'in_progress') && job.taskGroupId !== null)
                .map(job => Number(job.taskGroupId))
        ));
    }, [jobInstructions]);

    // Fetch inspection results from job_instructions table (completed or non_compliant)
    const fetchInspectionResults = React.useCallback(async () => {
        try {
            const data = await JobService.fetchInspectionResults(team);
            const mappedResults: InspectionRecord[] = data.map(item => mapDbToInspectionRecord(item));
            setInspectionResults(mappedResults);
        } catch (err) {
            console.error('Unexpected error fetching inspection results:', err);
        }
    }, [team]);

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
    const fetchJobInstructions = React.useCallback(async () => {
        try {
            const data = await JobService.fetchAll();
            const mappedInstructions: JobInstruction[] = data.map(item => mapDbToJobInstruction(item));
            setJobInstructions(mappedInstructions);
        } catch (err) {
            console.error('Unexpected error fetching job instructions:', err);
        }
    }, [team]);

    React.useEffect(() => {
        fetchJobInstructions();
    }, []);

    const addJobInstruction = React.useCallback(async (instruction: Omit<JobInstruction, 'id'>) => {
        try {
            let safeDeadline = null;
            if (instruction.deadline) {
                try {
                    safeDeadline = new Date(instruction.deadline).toISOString();
                } catch (e) {
                    console.warn('Invalid date format for deadline, using null', instruction.deadline);
                }
            }

            const payload = {
                team: instruction.targetTeam,
                assignee: instruction.assignee,
                subject: instruction.subject,
                description: instruction.description,
                status: 'waiting',
                deadline: safeDeadline
            };

            const data = await JobService.add(payload);
            const newInstruction = mapDbToJobInstruction(data);
            setJobInstructions(prev => [newInstruction, ...prev]);
        } catch (err) {
            console.error('Unexpected error adding job instruction:', err);
        }
    }, []);

    const deployToBoard = React.useCallback(async (groupId: number) => {
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
            await JobService.insert({
                tpo_id: tpoId,
                task_group_id: groupId,
                team: teamLabel,
                subject,
                status: 'waiting',
            });
            await fetchJobInstructions();
        } catch (err) {
            console.error('Error inserting job_instruction:', err);
            addToast('업무 보드 추가 중 오류가 발생했습니다.', 'error');
        }
    }, [registeredTpos, team, fetchJobInstructions, deployedTaskGroupIds]);

    const removeFromBoard = React.useCallback(async (groupId: number) => {
        try {
            await JobService.deleteByGroupId(groupId);
            await fetchJobInstructions();
            addToast('업무가 보드에서 삭제되었습니다.', 'info');
        } catch (err) {
            console.error('Error deleting job_instruction:', err);
            addToast('업무 삭제 중 오류가 발생했습니다.', 'error');
        }
    }, [fetchJobInstructions, addToast]);

    const deleteJobInstruction = React.useCallback(async (id: number) => {
        try {
            const { error } = await supabase.from('job_instructions').delete().eq('id', id);
            if (error) throw error;
            await fetchJobInstructions();
            addToast('직무카드가 삭제되었습니다.', 'info');
        } catch (err) {
            console.error('Error deleting job instruction:', err);
            addToast('직무카드 삭제 중 오류가 발생했습니다.', 'error');
        }
    }, [fetchJobInstructions, addToast]);

    const assignMemberToTask = React.useCallback(async (groupId: number, memberId: string) => {
        try {
            await JobService.assignMember(groupId, memberId);
            await fetchJobInstructions();
        } catch (err) {
            console.error('Error in assignMemberToTask:', err);
            addToast('멤버 배정 중 오류가 발생했습니다.', 'error');
        }
    }, [fetchJobInstructions, addToast]);

    const unassignMemberFromTask = React.useCallback(async (groupId: number, memberId: string) => {
        try {
            await JobService.unassignMember(groupId, memberId);
            await fetchJobInstructions();
        } catch (err) {
            console.error('Error in unassignMemberFromTask:', err);
            addToast('멤버 배정 취소 중 오류가 발생했습니다.', 'error');
        }
    }, [fetchJobInstructions, addToast]);

    const batchDeployTasks = React.useCallback(async () => {
        const taskIds = Object.keys(assignments).map(Number);
        if (taskIds.length === 0) return;

        const allTasks = registeredTpos.flatMap(t => {
            const tasks = t.setupTasks || [];
            return tasks.map(g => ({ ...g, parentTpo: t }));
        });

        const deploymentPayloads: any[] = taskIds.flatMap(taskId => {
            const memberIds = assignments[taskId] || [];
            const taskInfo = allTasks.find(at => at.id === taskId);
            if (!taskInfo) return [];

            const itemNames = taskInfo.items.map(i => i.content).join(', ');
            const subject = itemNames.length > 50 ? itemNames.substring(0, 50) + '...' : itemNames;

            return memberIds.map(memberId => ({
                tpo_id: taskInfo.parentTpo.id,
                task_group_id: taskId,
                team: taskInfo.parentTpo.team,
                subject: subject || `[${taskInfo.parentTpo.tpo.place}] ${taskInfo.parentTpo.tpo.occasion}`,
                status: 'waiting',
                assignee: memberId
            }));
        });

        try {
            await JobService.batchDeploy(deploymentPayloads);
            setAssignments({});
            await fetchJobInstructions();
            addToast('업무 지시가 성공적으로 배포되었습니다.', 'success');
        } catch (err) {
            console.error('Error batch deploying tasks:', err);
            addToast('배포 중 오류가 발생했습니다.', 'error');
        }
    }, [assignments, registeredTpos, fetchJobInstructions, addToast]);

    const handleRemoveSetupTask = React.useCallback(async (groupId: number) => {
        if (!confirm('선택한 세분화 설정을 삭제하시겠습니까?')) return;
        try {
            await supabase.from('task_groups').delete().eq('id', groupId);
            setRegisteredTpos(prev => prev.map(tpo => tpo.setupTasks ? { ...tpo, setupTasks: tpo.setupTasks.filter(g => g.id !== groupId) } : tpo));
            // Also remove from board if it was deployed
            await fetchJobInstructions(); // Refresh will naturally update derived deployedTaskGroupIds
            addToast('삭제되었습니다.', 'info');
        } catch (err) {
            console.error('Error removing setup task group:', err);
        }
    }, [setRegisteredTpos, addToast, fetchJobInstructions]);

    const handleEditSetupTask = React.useCallback((tpoId: number, groupId: number) => {
        const tpo = registeredTpos.find(t => t.id === tpoId);
        if (!tpo || !tpo.setupTasks) return;
        const group = tpo.setupTasks.find(g => g.id === groupId);
        if (!group) return;
        setSelectedCriteria({ checklist: tpo.criteria.checklist, items: group.items.map(item => ({ ...item })) });
        setSelectedInspectionSopId(tpoId);
        setInspectionModalOpen(true);
    }, [registeredTpos, setSelectedCriteria, setSelectedInspectionSopId, setInspectionModalOpen]);

    const setupTasksToSop = React.useCallback(async (sopId: number | null, tasks: ChecklistItem[], isManual?: boolean, newSopInfo?: { category: string, tpo: TpoData }): Promise<boolean> => {
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
                        addToast('이미 동일한 항목 구성으로 세분화 설정이 등록되어 있습니다.', 'warning');
                        return false;
                    }
                }

                const { data: groupData, error: groupError } = await supabase.from('task_groups').insert({ tpo_id: sopId, group_name: `설정 ${Date.now()}` }).select().single();
                if (groupError) throw groupError;
                const junctionItems = tasks.filter((t: ChecklistItem) => t.id).map((item: ChecklistItem) => ({ group_id: groupData.id, checklist_item_id: item.id }));
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
    }, [registeredTpos, workplace, team, job, setRegisteredTpos, fetchTpos, addToast]);

    const updateJobStatus = React.useCallback(async (id: number, status: 'in_progress' | 'completed' | 'delayed') => {
        try {
            await JobService.updateStatus(id, status);
            // Update local state for immediate feedback
            setJobInstructions(prev => prev.map(job => job.id === id ? { ...job, status: status } : job));
        } catch (err) {
            console.error('Error updating job status:', err);
            addToast('상태 업데이트 중 오류가 발생했습니다.', 'error');
        }
    }, [addToast]);

    const completeJobWithEvidence = React.useCallback(async (id: number, evidenceFile: File | null) => {
        try {
            let evidenceUrl = null;
            if (evidenceFile) {
                evidenceUrl = await JobService.uploadEvidence(evidenceFile);
                if (!evidenceUrl) {
                    addToast('사진 업로드에 실패했습니다. 다시 시도해주세요.', 'error');
                    return;
                }
            }

            await JobService.completeJob(id, evidenceUrl);

            setJobInstructions(prev => prev.map(job =>
                job.id === id ? { ...job, status: 'completed', evidenceUrl: evidenceUrl || undefined } : job
            ));
            addToast('업무가 완료되었습니다.', 'success');
        } catch (err) {
            console.error('Unexpected error completing job:', err);
            addToast('완료 처리 중 오류가 발생했습니다.', 'error');
        }
    }, [addToast]);

    const value = React.useMemo(() => ({
        activeDoSubPhase, setActiveDoSubPhase, inspectionResults, addInspectionResult,
        isInspectionModalOpen, setInspectionModalOpen, selectedInspectionSopId, setSelectedInspectionSopId,
        jobInstructions, addJobInstruction, fetchJobInstructions, deleteJobInstruction, setupTasksToSop, handleRemoveSetupTask, handleEditSetupTask,
        deployedTaskGroupIds, deployToBoard, removeFromBoard, updateJobStatus, completeJobWithEvidence,
        assignMemberToTask, unassignMemberFromTask,
        assignments, setAssignments, batchDeployTasks,
        instructionBoardWorkplace, setInstructionBoardWorkplace,
        instructionBoardTeams, setInstructionBoardTeams,
        instructionBoardJobs, setInstructionBoardJobs,
        checklistSearchQuery, setChecklistSearchQuery,
        checklistSelectedTeams, setChecklistSelectedTeams,
        librarySearchQuery, setLibrarySearchQuery,
        librarySelectedOccasions, setLibrarySelectedOccasions,
        librarySelectedTeams, setLibrarySelectedTeams,
        librarySelectedJobs, setLibrarySelectedJobs,
        librarySelectedMode, setLibrarySelectedMode
    }), [activeDoSubPhase, inspectionResults, addInspectionResult, isInspectionModalOpen, selectedInspectionSopId,
        jobInstructions, addJobInstruction, fetchJobInstructions, deleteJobInstruction, setupTasksToSop, handleRemoveSetupTask, handleEditSetupTask,
        deployedTaskGroupIds, deployToBoard, removeFromBoard, updateJobStatus, completeJobWithEvidence,
        assignMemberToTask, unassignMemberFromTask,
        assignments, batchDeployTasks,
        instructionBoardWorkplace, instructionBoardTeams, instructionBoardJobs,
        checklistSearchQuery, checklistSelectedTeams,
        librarySearchQuery, librarySelectedOccasions, librarySelectedTeams, librarySelectedJobs, librarySelectedMode]);

    return (
        <DoContext.Provider value={value}>
            {children}
        </DoContext.Provider>
    );
};

export const useDo = () => {
    const context = useContext(DoContext);
    if (!context) throw new Error('useDo must be used within DoProvider');
    return context;
};
