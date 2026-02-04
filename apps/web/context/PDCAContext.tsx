'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    RegisteredTpo,
    Phase,
    TpoData,
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
    setupTasksToSop: (sopId: number | null, tasks: string[], isManual?: boolean, newSopInfo?: { category: string, tpo: TpoData }) => void;

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

    const [registeredTpos, setRegisteredTpos] = useState<RegisteredTpo[]>([
        {
            id: 1, workplace: '소노벨 천안', team: 'housekeeping', job: '인스펙터',
            tpo: { time: '업무중', place: '객실', occasion: '인스펙션 실행' },
            criteria: { checklist: '객실 상태가 표준 정비 지침을 준수하는가?', items: ['침구류 오염 및 주름 상태 확인', '실내 온도 및 조명 작동 여부', '욕실 물기 제거 및 배수 상태'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 2, workplace: '소노벨 천안', team: 'housekeeping', job: '룸메이드',
            tpo: { time: '업무중', place: '객실', occasion: '객실 정비/세팅' },
            criteria: { checklist: '객실 정비 프로세스가 매뉴얼대로 수행되었는가?', items: ['침대 베딩 텐션 유지', '어메니티(에비앙 등) 재입고'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 3, workplace: '소노벨 천안', team: 'housekeeping', job: '코디사원',
            tpo: { time: '업무전', place: '창고/린넨실', occasion: '물품 전달/불출' },
            criteria: { checklist: '린넨 및 비품 재고 관리가 정확하게 이루어지는가?', items: ['린넨 청결도 및 오염 분류', '운반 카트 바퀴 소음/작동 점검'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 4, workplace: '소노벨 천안', team: 'front', job: '지배인',
            tpo: { time: '업무전', place: '기계실/상황실', occasion: '영업 준비/마감' },
            criteria: { checklist: '설비 시스템 교대 및 마감 점검이 완료되었는가?', items: ['인수인계 일지 기록 상태', '비상 발전기 대기 모드 확인'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 5, workplace: '소노벨 천안', team: 'front', job: '리셉션',
            tpo: { time: '업무중', place: '로비', occasion: '고객 환대/응대' },
            criteria: { checklist: '고객 맞이 및 대기 관리가 적절히 이루어지는가?', items: ['맞이 인사(Greeting) 수행 여부', '대기 번호표 발행 및 안내'] },
            matching: { evidence: 'AI', method: '지정' }
        },
        {
            id: 6, workplace: '소노벨 천안', team: 'front', job: '컨시어즈',
            tpo: { time: '업무중', place: '로비', occasion: '고객 환대/응대' },
            criteria: { checklist: '고객 맞이 및 대기 관리가 적절히 이루어지는가?', items: ['짐 운반 지원 필요성 확인', '용모 복장 및 명찰 착용 상태'] },
            matching: { evidence: 'AI', method: '지정' }
        },
        {
            id: 7, workplace: '소노벨 천안', team: 'facility', job: '엔지니어',
            tpo: { time: '업무중', place: '로비', occasion: '시설/안전 점검' },
            criteria: { checklist: '로비 내 시설이 안전하고 쾌적하게 유지되는가?', items: ['자동문 작동 및 센서 감지 상태', '비상 대피도 비치 및 시인성 확인'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 8, workplace: '소노벨 천안', team: 'management', job: '상황실 관리자',
            tpo: { time: '업무후', place: '기계실/상황실', occasion: '시설/안전 점검' },
            criteria: { checklist: '핵심 설비 및 시스템이 정상 작동 중인가?', items: ['화재 수신기 정상 작동 확인', 'CCTV 모니터링 사각지대 여부'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 9, workplace: '소노벨 천안', team: 'front', job: '리셉션',
            tpo: { time: '업무중', place: '로비', occasion: '컴플레인/VOC 처리' },
            criteria: { checklist: '로비에서의 고객 불편 사항이 신속하게 해결되었는가?', items: ['대기 시간 지연에 대한 안내 및 양해', '사후 피드백을 위한 연락처 확인'] },
            matching: { evidence: 'AI', method: '지정' }
        },
        {
            id: 10, workplace: '소노벨 천안', team: 'facility', job: '엔지니어',
            tpo: { time: '업무전', place: '주차장', occasion: '시설/안전 점검' },
            criteria: { checklist: '주차장 내 안전 위해 요소가 제거 되었는가?', items: ['포트홀 및 바닥 균열 유무', '조명 조도 및 작동 상태'] },
            matching: { evidence: 'AI', method: '지정' }
        }
    ]);
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

    const handleRegister = () => {
        if (!selectedTpo.place || !selectedTpo.occasion || !selectedCriteria.checklist) {
            alert('TPO(장소/상황)와 점검 기준을 모두 선택해 주세요.');
            return;
        }

        if (isEditing !== null) {
            setRegisteredTpos(prev => prev.map(item =>
                item.id === isEditing
                    ? { ...item, workplace, team, job, tpo: { ...selectedTpo }, criteria: { ...selectedCriteria }, matching: { ...selectedMatching } }
                    : item
            ));
            setIsEditing(null);
        } else {
            const newEntry: RegisteredTpo = {
                id: Date.now(),
                workplace,
                team,
                job,
                tpo: { ...selectedTpo },
                criteria: { ...selectedCriteria },
                matching: { ...selectedMatching }
            };
            setRegisteredTpos(prev => [...prev, newEntry]);
            alert(`${job} 직무의 TPO 상황이 등록되었습니다.`);
        }
        handleReset();
    };

    const handleReset = () => {
        setSelectedTpo({ time: '', place: '', occasion: '' });
        setSelectedCriteria({ checklist: '', items: [] });
        setSelectedMatching({ evidence: '', method: '', elements: [] });
        setIsEditing(null);
    };

    const handleRemoveRegistered = (id: number) => {
        setRegisteredTpos(prev => prev.filter(item => item.id !== id));
        if (isEditing === id) setIsEditing(null);
    };

    const handleEdit = (id: number) => {
        const itemToEdit = registeredTpos.find(item => item.id === id);
        if (itemToEdit) {
            setIsEditing(id);
            setWorkplace(itemToEdit.workplace);
            setTeam(itemToEdit.team);
            setJob(itemToEdit.job);
            setSelectedTpo({ ...itemToEdit.tpo });
            setSelectedCriteria({ ...itemToEdit.criteria });
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
                setSelectedCriteria(criteriaOptions[key]);
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
                const newItems = prev.items.includes(value)
                    ? prev.items.filter(i => i !== value)
                    : [...prev.items, value];
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
        tasks: string[],
        isManual?: boolean,
        newSopInfo?: { category: string, tpo: TpoData }
    ) => {
        const finalTasks = isManual ? tasks.map(t => `[수동등록] ${t}`) : tasks;

        if (sopId !== null) {
            // Update existing RegisteredTpo - Append new configuration if not duplicate
            setRegisteredTpos(prev => prev.map(t => {
                if (t.id === sopId) {
                    const currentConfigs = t.setupTasks || [];
                    // Check for duplicate set
                    const isDuplicate = currentConfigs.some(config =>
                        JSON.stringify(config.sort()) === JSON.stringify([...finalTasks].sort())
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
                workplace,
                team,
                job,
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
        jobInstructions, addJobInstruction, setupTasksToSop
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
