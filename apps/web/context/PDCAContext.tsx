
import { supabase } from '../utils/supabaseClient';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    RegisteredTpo,
    Phase,
    TpoData,
    ChecklistItem,
    CriteriaData,
    MatchingData,
    TeamsMapping,
    InspectionRecord,
    ActionPlanItem
} from '@csmac/types';
import {
    TEAMS,
    TPO_OPTIONS,
    PLACE_OCCASION_MAPPING,
    CRITERIA_OPTIONS
} from '../constants/pdca-data';

export interface JobInstruction {
    id: number;
    targetTeam: string;
    assignee: string;
    subject: string;
    description: string;
    deadline: string;
    status: 'sent' | 'received' | 'in_progress' | 'completed';
    timestamp: string;
}

interface PDCAContextType {
    activePhase: Phase;
    setActivePhase: (phase: Phase) => void;
    workplace: string;
    setWorkplace: (v: string) => void;
    team: string;
    setTeam: (v: string) => void;
    job: string;
    setJob: (v: string) => void;
    registeredTpos: RegisteredTpo[];
    activeDropdown: string | null;
    setActiveDropdown: (v: any) => void;
    selectedTpo: TpoData;
    selectedCriteria: CriteriaData;
    selectedMatching: MatchingData;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    isEditing: number | null;
    showTpoTooltip: boolean;
    setShowTpoTooltip: (v: boolean) => void;
    activeDoSubPhase: string;
    setActiveDoSubPhase: (v: string) => void;
    inspectionResults: InspectionRecord[];
    addInspectionResult: (result: Omit<InspectionRecord, 'id'>) => void;
    showConcernPopup: boolean;
    setShowConcernPopup: (v: boolean) => void;
    actionPlanItems: ActionPlanItem[];
    updateActionPlanItem: (id: number, updates: Partial<ActionPlanItem>) => void;
    isInspectionModalOpen: boolean;
    setInspectionModalOpen: (v: boolean) => void;
    selectedInspectionSopId: number | null;
    setSelectedInspectionSopId: (v: number | null) => void;

    // Job Instructions (Slide 8)
    jobInstructions: JobInstruction[];
    addJobInstruction: (instruction: Omit<JobInstruction, 'id'>) => void;
    setupTasksToSop: (sopId: number | null, tasks: ChecklistItem[], isManual?: boolean, newSopInfo?: { category: string, tpo: TpoData }) => void;

    // Options
    tpoOptions: { time: string[], place: string[], occasion: string[] };

    // Handlers
    handleRegister: () => void;
    handleReset: () => void;
    handleRemoveRegistered: (id: number) => void;
    handleEdit: (id: number) => void;
    handleTpoSelect: (category: 'time' | 'place' | 'occasion', value: string) => void;
    handleCriteriaSelect: (type: 'checklist' | 'criteriaItems', value: string) => void;
    handleMatchingSelect: (type: 'evidence' | 'method' | 'elements', value: string) => void;
    addChecklistItem: (item: string) => void;
    removeChecklistItem: (index: number) => void;
    updateChecklistItemImage: (index: number, file: File | null, url?: string) => void;

    // Config/Options
    teams: TeamsMapping;
    criteriaOptions: Record<string, CriteriaData>;
    currentCriteria: CriteriaData | undefined;
    placeOccasionMapping: Record<string, string[]>;

    // Derived Stats for Act Phase
    stats: {
        totalRecords: number;
        compliantCount: number;
        nonCompliantCount: number;
        complianceRate: number;
        actionRequiredCount: number;
    };
}

const PDCAContext = createContext<PDCAContextType | undefined>(undefined);


export function PDCAProvider({ children }: { children: ReactNode }) {
    const [activePhase, setActivePhase] = useState<Phase>('plan');
    const [workplace, setWorkplace] = useState('소노벨 천안');
    const [team, setTeam] = useState('front');
    const [job, setJob] = useState('지배인');

    // Use imported constants
    const teams: TeamsMapping = TEAMS;
    const tpoOptions = TPO_OPTIONS;
    const placeOccasionMapping: Record<string, string[]> = PLACE_OCCASION_MAPPING;
    const criteriaOptions: Record<string, CriteriaData> = CRITERIA_OPTIONS;

    const [activeDropdown, setActiveDropdown] = useState<any>(null);
    const [selectedTpo, setSelectedTpo] = useState<TpoData>({ time: '', place: '', occasion: '' });
    const [selectedCriteria, setSelectedCriteria] = useState<CriteriaData>({ checklist: '', items: [] });
    const [selectedMatching, setSelectedMatching] = useState<MatchingData>({ evidence: '', method: '', elements: [] });
    const [searchQuery, setSearchQuery] = useState('');

    const [registeredTpos, setRegisteredTpos] = useState<RegisteredTpo[]>([]);

    // Fetch initial data from Supabase
    useEffect(() => {
        const fetchTpos = async () => {
            try {
                // Simple query with new schema
                const { data, error } = await supabase
                    .from('tpo')
                    .select(`
                        id,
                        workplace, team, job,
                        tpo_time, tpo_place, tpo_occasion,
                        matching_evidence, matching_method, matching_elements,
                        checklist_items ( * )
                    `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching TPOs:', error);
                    return;
                }

                if (data) {
                    // Transform DB shape to frontend RegisteredTpo shape
                    const transformed: RegisteredTpo[] = data.map((row: any) => ({
                        id: row.id,
                        workplace: row.workplace,
                        team: row.team,
                        job: row.job,
                        tpo: {
                            time: row.tpo_time,
                            place: row.tpo_place,
                            occasion: row.tpo_occasion
                        },
                        criteria: {
                            checklist: '', // Not used anymore
                            items: row.checklist_items?.map((i: any) => ({
                                content: i.content,
                                imageUrl: i.reference_image_url || i.image_url || undefined,
                                ...i
                            })) || []
                        },
                        matching: {
                            evidence: row.matching_evidence || '',
                            method: row.matching_method || '',
                            elements: row.matching_elements || [] // Already an array in PostgreSQL
                        },
                        setupTasks: [] // Will be populated in Do phase
                    }));
                    setRegisteredTpos(transformed);
                }
            } catch (err) {
                console.error('Unexpected error fetching TPOs:', err);
            }
        };

        fetchTpos();
    }, []);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [showTpoTooltip, setShowTpoTooltip] = useState(false);
    const [activeDoSubPhase, setActiveDoSubPhase] = useState('checklist');
    const [inspectionResults, setInspectionResults] = useState<InspectionRecord[]>([
        { id: 1, time: '2026.01.26 10:20', name: '박기철', area: '902호', item: '침구류 오염 및 주름 상태 확인', status: 'O', role: '인스펙터', tpoId: 1 },
        { id: 2, time: '2026.01.26 10:35', name: '박기철', area: '903호', item: '실내 온도 및 조명 작동 여부', status: 'X', role: '인스펙터', reason: '조명 깜빡임', tpoId: 1 },
        { id: 3, time: '2026.01.26 10:50', name: '최민수', area: '로비', item: '맞이 인사(Greeting) 수행 여부', status: 'O', role: '리셉션', tpoId: 5 },
        { id: 4, time: '2026.01.26 14:15', name: '이대한', area: '주차장', item: '포트홀 및 바닥 균열 유무', status: 'O', role: '엔지니어', tpoId: 10 },
    ]);

    const [showConcernPopup, setShowConcernPopup] = useState(false);
    const [isInspectionModalOpen, setInspectionModalOpen] = useState(false);
    const [selectedInspectionSopId, setSelectedInspectionSopId] = useState<number | null>(null);
    const [actionPlanItems, setActionPlanItems] = useState<ActionPlanItem[]>([
        {
            id: 1,
            inspectionId: 0,
            team: '객실팀',
            area: '로비',
            category: '로비안전성',
            issue: '로비 회전문 파손 상태를 조치해주세요!',
            reason: '회전문 구동축 소음 및 간헐적 멈춤',
            timestamp: '2025.12.01 14:00',
            status: 'pending'
        }
    ]);

    const addInspectionResult = (result: Omit<InspectionRecord, 'id'>) => {
        const newId = inspectionResults.length > 0 ? Math.max(...inspectionResults.map(r => r.id)) + 1 : 1;
        const newRecord = { ...result, id: newId };
        setInspectionResults(prev => [...prev, newRecord]);

        // Auto-link to Action Plan if non-compliant
        if (result.status === 'X') {
            const newActionId = actionPlanItems.length > 0 ? Math.max(...actionPlanItems.map(a => a.id)) + 1 : 1;
            const newActionItem: ActionPlanItem = {
                id: newActionId,
                inspectionId: newId,
                team: workplace, // Or however you want to categorize
                area: result.area,
                category: '미준수 조치',
                issue: result.item,
                reason: result.reason || '관리자 현장 점검 미준수',
                timestamp: result.time,
                status: 'pending'
            };
            setActionPlanItems(prev => [...prev, newActionItem]);
        }
    };

    const updateActionPlanItem = (id: number, updates: Partial<ActionPlanItem>) => {
        setActionPlanItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    // Upload image to Supabase Storage and return public URL
    const uploadChecklistImage = async (file: File, tpoId: number, itemIndex: number): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${tpoId}_${itemIndex}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('checklist-reference-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('checklist-reference-images')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (err) {
            console.error('Error uploading image:', err);
            return null;
        }
    };

    const handleRegister = async () => {
        if (!selectedTpo.place || !selectedTpo.occasion) {
            setTimeout(() => alert('TPO(장소/상황)를 모두 선택해 주세요.'), 0);
            return;
        }

        if (selectedCriteria.items.length === 0) {
            setTimeout(() => alert('체크리스트 항목을 최소 1개 이상 추가해 주세요.'), 0);
            return;
        }

        try {
            if (isEditing !== null) {
                // UPDATE Logic
                await supabase.from('tpo').update({
                    workplace,
                    team,
                    job,
                    tpo_time: selectedTpo.time,
                    tpo_place: selectedTpo.place,
                    tpo_occasion: selectedTpo.occasion,
                    matching_evidence: selectedMatching.evidence,
                    matching_method: selectedMatching.method,
                    matching_elements: selectedMatching.elements || []
                }).eq('id', isEditing);

                // Replace checklist items
                await supabase.from('checklist_items').delete().eq('tpo_id', isEditing);

                // Upload images and prepare items
                const itemsToInsert = await Promise.all(
                    selectedCriteria.items.map(async (item, idx) => {
                        let imageUrl = item.imageUrl;

                        // Upload new image if imageFile exists
                        if (item.imageFile) {
                            const uploadedUrl = await uploadChecklistImage(item.imageFile, isEditing, idx);
                            if (uploadedUrl) imageUrl = uploadedUrl;
                        }

                        return {
                            tpo_id: isEditing,
                            content: item.content,
                            sequence_order: idx,
                            reference_image_url: imageUrl || null
                        };
                    })
                );

                await supabase.from('checklist_items').insert(itemsToInsert);

                setIsEditing(null);
                setTimeout(() => alert('수정이 완료되었습니다.'), 0);
            } else {
                // INSERT Logic
                const { data: newTpo, error: tpoError } = await supabase.from('tpo').insert({
                    workplace,
                    team,
                    job,
                    tpo_time: selectedTpo.time,
                    tpo_place: selectedTpo.place,
                    tpo_occasion: selectedTpo.occasion,
                    matching_evidence: selectedMatching.evidence,
                    matching_method: selectedMatching.method,
                    matching_elements: selectedMatching.elements || []
                }).select().single();

                if (tpoError) throw tpoError;

                // Upload images and insert checklist items
                const itemsPayload = await Promise.all(
                    selectedCriteria.items.map(async (item, idx) => {
                        let imageUrl = item.imageUrl;

                        // Upload image if exists
                        if (item.imageFile) {
                            const uploadedUrl = await uploadChecklistImage(item.imageFile, newTpo.id, idx);
                            if (uploadedUrl) imageUrl = uploadedUrl;
                        }

                        return {
                            tpo_id: newTpo.id,
                            content: item.content,
                            sequence_order: idx,
                            reference_image_url: imageUrl || null
                        };
                    })
                );

                const { error: itemError } = await supabase.from('checklist_items').insert(itemsPayload);
                if (itemError) throw itemError;

                setTimeout(() => alert(`${job} 직무의 TPO가 등록되었습니다.`), 0);
            }

            // Refresh data by refetching
            const { data, error } = await supabase
                .from('tpo')
                .select(`
                    id,
                    workplace, team, job,
                    tpo_time, tpo_place, tpo_occasion,
                matching_evidence, matching_method, matching_elements,
                checklist_items ( * )
                `)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const transformed: RegisteredTpo[] = data.map((row: any) => ({
                    id: row.id,
                    workplace: row.workplace,
                    team: row.team,
                    job: row.job,
                    tpo: {
                        time: row.tpo_time,
                        place: row.tpo_place,
                        occasion: row.tpo_occasion
                    },
                    criteria: {
                        checklist: '',
                        items: row.checklist_items?.map((i: any) => ({
                            ...i,
                            content: i.content,
                            imageUrl: i.reference_image_url || i.image_url || undefined
                        })) || []
                    },
                    matching: {
                        evidence: row.matching_evidence || '',
                        method: row.matching_method || '',
                        elements: row.matching_elements || []
                    },
                    setupTasks: []
                }));
                setRegisteredTpos(transformed);
            }

        } catch (err) {
            console.error('Error registering TPO:', err);
            setTimeout(() => alert('저장 중 오류가 발생했습니다.'), 0);
        }
        handleReset();
    };

    const handleReset = () => {
        setSelectedTpo({ time: '', place: '', occasion: '' });
        setSelectedCriteria({ checklist: '', items: [] });
        setSelectedMatching({ evidence: '', method: '', elements: [] });
        setIsEditing(null);
    };

    const handleRemoveRegistered = async (id: number) => {
        try {
            // Delete from database (cascades to checklist_items)
            const { error } = await supabase.from('tpo').delete().eq('id', id);
            if (error) throw error;

            // Remove from local state
            setRegisteredTpos(prev => prev.filter(item => item.id !== id));
            if (isEditing === id) setIsEditing(null);

            setTimeout(() => alert('삭제되었습니다.'), 0);
        } catch (err) {
            console.error('Error deleting TPO:', err);
            setTimeout(() => alert('삭제 중 오류가 발생했습니다.'), 0);
        }
    };

    const handleEdit = (id: number) => {
        const itemToEdit = registeredTpos.find(item => item.id === id);
        if (itemToEdit) {
            setIsEditing(id);
            setWorkplace(itemToEdit.workplace);
            setTeam(itemToEdit.team);
            setJob(itemToEdit.job);
            setSelectedTpo({ ...itemToEdit.tpo });
            // Deep copy to prevent mutating the original registered data
            setSelectedCriteria({
                checklist: itemToEdit.criteria.checklist,
                items: itemToEdit.criteria.items.map(item => ({ ...item }))
            });
            setSelectedMatching({ ...itemToEdit.matching });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleTpoSelect = (category: 'time' | 'place' | 'occasion', value: string) => {
        setSelectedTpo(prev => {
            const newTpo = { ...prev, [category]: value };

            // Automatically select criteria if a valid combination exists
            const key = `${newTpo.place}|${newTpo.occasion}`;
            if (criteriaOptions[key]) {
                // Deep copy to prevent mutating the original constant
                setSelectedCriteria({
                    checklist: criteriaOptions[key].checklist,
                    items: criteriaOptions[key].items.map(item => ({ ...item }))
                });
            } else {
                setSelectedCriteria({ checklist: '', items: [] });
            }

            return newTpo;
        });
        setActiveDropdown(null);
    };

    const handleCriteriaSelect = (type: 'checklist' | 'criteriaItems', value: string) => {
        if (type === 'checklist') {
            setSelectedCriteria(prev => ({ ...prev, checklist: value }));
            setActiveDropdown(null);
        } else {
            setSelectedCriteria(prev => {
                const itemExists = prev.items.some(item => item.content === value);
                const newItems = itemExists
                    ? prev.items.filter(item => item.content !== value)
                    : [...prev.items, { content: value }];
                return { ...prev, items: newItems };
            });
        }
    };

    const handleMatchingSelect = (type: 'evidence' | 'method' | 'elements', value: string) => {
        if (type === 'elements') {
            setSelectedMatching(prev => {
                const elements = prev.elements || [];
                const newElements = elements.includes(value)
                    ? elements.filter(e => e !== value)
                    : [...elements, value];
                return { ...prev, elements: newElements };
            });
        } else {
            setSelectedMatching(prev => ({ ...prev, [type]: value }));
            setActiveDropdown(null);
        }
    };

    const addChecklistItem = (item: string) => {
        if (item.trim()) {
            setSelectedCriteria(prev => ({
                ...prev,
                items: [...prev.items, { content: item.trim() }]
            }));
        }
    };

    const removeChecklistItem = (index: number) => {
        setSelectedCriteria(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateChecklistItemImage = (index: number, file: File | null, url?: string) => {
        setSelectedCriteria(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, imageFile: file || undefined, imageUrl: url } : item
            )
        }));
    };

    const currentCriteria = criteriaOptions[`${selectedTpo.place}|${selectedTpo.occasion}`];

    // Calculate real-time stats
    const stats = {
        totalRecords: inspectionResults.length,
        compliantCount: inspectionResults.filter(r => r.status === 'O').length,
        nonCompliantCount: inspectionResults.filter(r => r.status === 'X').length,
        complianceRate: inspectionResults.length > 0
            ? Math.round((inspectionResults.filter(r => r.status === 'O').length / inspectionResults.length) * 100)
            : 100,
        actionRequiredCount: inspectionResults.filter(r => r.status === 'X').length // Simplified for now
    };

    const [jobInstructions, setJobInstructions] = useState<JobInstruction[]>([]);

    const addJobInstruction = (instruction: Omit<JobInstruction, 'id'>) => {
        setJobInstructions(prev => [
            { id: Date.now(), ...instruction },
            ...prev
        ]);
    };

    const setupTasksToSop = (
        sopId: number | null,
        tasks: ChecklistItem[],
        isManual?: boolean,
        newSopInfo?: { category: string, tpo: TpoData }
    ) => {
        const finalTasks = isManual ? tasks.map(item => ({ ...item, content: `[수동등록] ${item.content}` })) : tasks;

        if (sopId !== null) {
            // Update existing RegisteredTpo - Append new configuration if not duplicate
            setRegisteredTpos(prev => prev.map(t => {
                if (t.id === sopId) {
                    const currentConfigs = t.setupTasks || [];
                    // Check for duplicate set - comparing content strings
                    const isDuplicate = currentConfigs.some(config =>
                        JSON.stringify(config.map(i => i.content).sort()) === JSON.stringify(finalTasks.map(i => i.content).sort())
                    );

                    if (isDuplicate) return t;

                    return { ...t, setupTasks: [...currentConfigs, finalTasks] };
                }
                return t;
            }));

        } else if (newSopInfo) {
            // Create a brand new SOP (SOP ID is null)
            const newId = Date.now();
            const newRegisteredTpo: RegisteredTpo = {
                id: newId,
                workplace: workplace, // Use state values
                team: team,
                job: job,
                tpo: newSopInfo.tpo,
                criteria: { checklist: `[현장등록] ${newSopInfo.category}`, items: [] },
                matching: { evidence: '사진', method: '정기점검', elements: ['청결도'] },
                setupTasks: [finalTasks] // Initialize as array of arrays
            };

            setRegisteredTpos(prev => [...prev, newRegisteredTpo]);

        }
    };

    const value = {
        activePhase, setActivePhase,
        workplace, setWorkplace,
        team, setTeam,
        job, setJob,
        registeredTpos,
        activeDropdown, setActiveDropdown,
        selectedTpo,
        selectedCriteria,
        selectedMatching,
        isEditing,
        showTpoTooltip, setShowTpoTooltip,
        activeDoSubPhase, setActiveDoSubPhase,
        inspectionResults, addInspectionResult,
        handleRegister,
        handleReset,
        handleRemoveRegistered,
        handleEdit,
        handleTpoSelect,
        handleCriteriaSelect,
        handleMatchingSelect,
        teams,
        tpoOptions,
        criteriaOptions,
        currentCriteria,
        placeOccasionMapping,
        stats,
        showConcernPopup, setShowConcernPopup,
        actionPlanItems, updateActionPlanItem,
        searchQuery, setSearchQuery,
        isInspectionModalOpen, setInspectionModalOpen,
        selectedInspectionSopId, setSelectedInspectionSopId,
        jobInstructions, addJobInstruction, setupTasksToSop,
        addChecklistItem, removeChecklistItem, updateChecklistItemImage
    };

    return <PDCAContext.Provider value={value}>{children}</PDCAContext.Provider>;
}

export function usePDCA() {
    const context = useContext(PDCAContext);
    if (context === undefined) {
        throw new Error('usePDCA must be used within a PDCAProvider');
    }
    return context;
}
