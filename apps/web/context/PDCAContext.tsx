'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    RegisteredTpo,
    Phase,
    TpoData,
    CriteriaData,
    MatchingData,
    TeamsMapping,
    InspectionRecord
} from '@csmac/types';

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
    isEditing: number | null;
    showTpoTooltip: boolean;
    setShowTpoTooltip: (v: boolean) => void;
    activeDoSubPhase: string;
    setActiveDoSubPhase: (v: string) => void;
    inspectionResults: InspectionRecord[];
    addInspectionResult: (result: Omit<InspectionRecord, 'id'>) => void;

    // Handlers
    handleRegister: () => void;
    handleReset: () => void;
    handleRemoveRegistered: (id: number) => void;
    handleEdit: (id: number) => void;
    handleTpoSelect: (category: 'time' | 'place' | 'occasion', value: string) => void;
    handleCriteriaSelect: (type: 'checklist' | 'criteriaItems', value: string) => void;
    handleMatchingSelect: (type: 'evidence' | 'method', value: string) => void;

    // Config/Options
    teams: TeamsMapping;
    tpoOptions: any;
    criteriaOptions: Record<string, CriteriaData>;
    currentCriteria: CriteriaData | undefined;
}

const PDCAContext = createContext<PDCAContextType | undefined>(undefined);

export function PDCAProvider({ children }: { children: ReactNode }) {
    const [activePhase, setActivePhase] = useState<Phase>('plan');
    const [workplace, setWorkplace] = useState('소노벨 천안');
    const [team, setTeam] = useState('front');
    const [job, setJob] = useState('지배인');

    const teams: TeamsMapping = {
        front: { label: '프론트', jobs: ['지배인', '리셉션', '컨시어즈'] },
        housekeeping: { label: '객실관리', jobs: ['인스펙터', '룸메이드'] },
        facility: { label: '시설', jobs: ['엔지니어'] },
    };

    const tpoOptions = {
        time: ['업무중', '업무전', '업무후', '영업후'],
        place: ['객실', '로비', '린넨창고', '세탁실'],
        occasion: ['인스펙 실행 시', '카트 점검 시', 'VIP 객실 선배정 시', '린넨물 폐기 시', '수량 파악 시'],
    };

    const criteriaOptions: Record<string, CriteriaData> = {
        '객실|인스펙 실행 시': {
            checklist: '인스펙션 상태를 기록 하였는가 ?',
            items: ['냉장고 습득물 유무', '미니바 세팅 상태', '화장실 변기 청결 상태', '침구류 오염 여부', '바닥 청소 상태']
        },
        '객실|VIP 객실 선배정 시': {
            checklist: '인스펙 완료 객실을 확인하고 선배정 하였는가 ?',
            items: ['인스펙 완료 여부', 'VIP 어메니티 세팅', '객실 온도 확인', '조명 정렬 상태']
        },
        '로비|카트 점검 시': {
            checklist: '카트 청결 상태를 사전 점검 하였는가 ?',
            items: ['카트 외부 청결도', '바퀴 작동 상태', '생수/수건 비치 수량', '소모품 정리 상태']
        },
        '린넨창고|린넨물 폐기 시': {
            checklist: '수거업체에게 인계 하였는가 ?',
            items: ['수거업체 담당자 서명', '폐기 수량 대조 확인', '창고 내 잔여물 정리']
        },
        '세탁실|수량 파악 시': {
            checklist: '폐기분과 실재고 오차를 확인 하였는가 ?',
            items: ['실재고 전수 조사', '전산 재고 오차 확인', '불량 세탁물 별도 분류']
        }
    };

    const [activeDropdown, setActiveDropdown] = useState<any>(null);
    const [selectedTpo, setSelectedTpo] = useState<TpoData>({ time: '', place: '', occasion: '' });
    const [selectedCriteria, setSelectedCriteria] = useState<CriteriaData>({ checklist: '', items: [] });
    const [selectedMatching, setSelectedMatching] = useState<MatchingData>({ evidence: '', method: '' });
    const [registeredTpos, setRegisteredTpos] = useState<RegisteredTpo[]>([
        {
            id: 1,
            workplace: '소노벨 천안',
            team: 'front',
            job: '지배인',
            tpo: { time: '업무중', place: '객실', occasion: '인스펙 실행 시' },
            criteria: {
                checklist: '인스펙션 상태를 기록 하였는가 ?',
                items: ['냉장고 습득물 유무', '미니바 세팅 상태', '화장실 변기 청결 상태']
            },
            matching: { evidence: 'AI', method: '지정' }
        },
        {
            id: 2,
            workplace: '소노벨 천안',
            team: 'front',
            job: '리셉션',
            tpo: { time: '업무중', place: '로비', occasion: '카트 점검 시' },
            criteria: {
                checklist: '카트 청결 상태를 사전 점검 하였는가 ?',
                items: ['카트 외부 청결도', '바퀴 작동 상태']
            },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 3,
            workplace: '소노벨 천안',
            team: 'front',
            job: '컨시어즈',
            tpo: { time: '업무전', place: '객실', occasion: 'VIP 객실 선배정 시' },
            criteria: {
                checklist: '인스펙 완료 객실을 확인하고 선배정 하였는가 ?',
                items: ['인스펙 완료 여부', 'VIP 어메니티 세팅']
            },
            matching: { evidence: 'AI', method: '지정' }
        },
        {
            id: 4,
            workplace: '소노벨 천안',
            team: 'housekeeping',
            job: '인스펙터',
            tpo: { time: '업무중', place: '객실', occasion: '인스펙 실행 시' },
            criteria: {
                checklist: '객실 청소 상태를 최종 확인 하였는가 ?',
                items: ['머리카락 유무', '가구 파손 여부', '환기 상태']
            },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 5,
            workplace: '소노벨 천안',
            team: 'housekeeping',
            job: '룸메이드',
            tpo: { time: '업무중', place: '객실', occasion: '카트 점검 시' },
            criteria: {
                checklist: '청소 도구 및 소모품이 완비되었는가 ?',
                items: ['세정제 잔량', '걸레 청결도', '어메니티 수량']
            },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 6,
            workplace: '소노벨 천안',
            team: 'facility',
            job: '시설담당',
            tpo: { time: '업무중', place: '로비', occasion: '인스펙 실행 시' },
            criteria: {
                checklist: '시설물 작동 여부를 확인 하였는가 ?',
                items: ['조명 점등 상태', '자동문 작동 주기', '소방 벨 상태']
            },
            matching: { evidence: 'AI', method: '지정' }
        }
    ]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [showTpoTooltip, setShowTpoTooltip] = useState(false);
    const [activeDoSubPhase, setActiveDoSubPhase] = useState('instruction');
    const [inspectionResults, setInspectionResults] = useState<InspectionRecord[]>([
        { id: 1, time: '2025.12.01 14:20', name: '박기철', area: '902호', item: '침구류 오염 여부 확인', status: 'O', role: '인스펙터', tpoId: 4 },
        { id: 2, time: '2025.12.01 14:35', name: '박기철', area: '903호', item: '바닥 청소 및 습기 제거', status: 'X', role: '인스펙터', reason: '머리카락 발견', tpoId: 4 },
        { id: 3, time: '2025.12.01 14:50', name: '최민수', area: '905호', item: '냉장고 습득물 유무 확인', status: 'O', role: '룸메이드', tpoId: 5 },
    ]);

    const addInspectionResult = (result: Omit<InspectionRecord, 'id'>) => {
        setInspectionResults(prev => [{ ...result, id: Date.now() } as InspectionRecord, ...prev]);
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
        setSelectedMatching({ evidence: '', method: '' });
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
            const newState = { ...prev, [category]: value };
            if (category === 'place' && prev.occasion) {
                if (!criteriaOptions[`${value}|${prev.occasion}`]) newState.occasion = '';
            }
            if (category === 'occasion' && prev.place) {
                if (!criteriaOptions[`${prev.place}|${value}`]) newState.place = '';
            }
            return newState;
        });
        setSelectedCriteria({ checklist: '', items: [] });
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

    const handleMatchingSelect = (type: 'evidence' | 'method', value: string) => {
        setSelectedMatching(prev => ({ ...prev, [type]: value }));
        setActiveDropdown(null);
    };

    const currentCriteria = criteriaOptions[`${selectedTpo.place}|${selectedTpo.occasion}`];

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
        currentCriteria
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
