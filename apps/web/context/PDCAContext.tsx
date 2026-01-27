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
    showConcernPopup: boolean;
    setShowConcernPopup: (v: boolean) => void;
    actionPlanItems: ActionPlanItem[];
    updateActionPlanItem: (id: number, updates: Partial<ActionPlanItem>) => void;

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

    const teams: TeamsMapping = {
        front: { label: '프론트', jobs: ['지배인', '리셉션', '컨시어즈'] },
        housekeeping: { label: '객실관리', jobs: ['인스펙터', '룸메이드', '코디사원'] },
        facility: { label: '시설', jobs: ['엔지니어', '환경관리'] },
        customer_support: { label: '고객지원/CS', jobs: ['컨택센터 상담원', '고객서비스팀', 'CS파트'] },
        marketing_sales: { label: '마케팅/영업', jobs: ['마케팅전략팀', '영업기획'] },
        management: { label: '경영/HR', jobs: ['교육개발팀', '인사(HRD)', '상황실 관리자'] },
    };

    const tpoOptions = {
        time: ['업무중', '업무전', '업무후', '영업후'],
        place: ['객실', '로비', '린넨창고', '세탁실', '상황실', '단지 내', '업장(오션/스키)', '기계실'],
        occasion: [
            '인스펙 실행 시',
            '카트 점검 시',
            'VIP 객실 선배정 시',
            '객실 하자 접수 시',
            '분실물 습득 시',
            'VOC 등록 시',
            '설비 정기 정검 시',
            '고객 불만 전화 수신 시',
            '체크인 안내 시',
            '비품 수령 시',
            '정비 및 세팅 시',
            '환경 관리 시',
            '인수인계 시',
            '짐 운반 요청 시',
            '환대 서비스 시',
            '조회 시'
        ],
    };

    const criteriaOptions: Record<string, CriteriaData> = {
        '객실|인스펙 실행 시': {
            checklist: '인스펙션 상태를 기록 하였는가 ?',
            items: ['냉장고 습득물 유무', '미니바 세팅 상태', '화장실 변기 청결 상태', '침구류 오염 여부', '바닥 청소 상태']
        },
        '객실|객실 하자 접수 시': {
            checklist: '하자 신속 처리를 위한 초기 판단이 완료되었는가 ?',
            items: ['객실 방문 확인', '즉시 조치 가능 여부', '룸 체인지 필요성 판단', '자재 청구 필요 여부']
        },
        '상황실|분실물 습득 시': {
            checklist: '습득물 정보가 전산(DGNS)에 정확히 등록되었는가 ?',
            items: ['사진 촬영 및 업로드', '습득 장소/시간 기록', '귀중품 여부 판정', '고객 연락처 확인']
        },
        '로비|VOC 등록 시': {
            checklist: '고객 민원이 적절한 담당부서로 배분되었는가 ?',
            items: ['시급성 판단', '유관부서 지정', '과거 유사 사례 조회', '초동 대처 가이드 확인']
        },
        '기계실|설비 정기 정검 시': {
            checklist: '주요 설비 가동 상태 및 소음 수치가 정상인가?',
            items: ['냉동기 압력 체크', '보일러 연소 상태', '펌프 누수 여부', '전기 판넬 온도 측정']
        },
        '상황실|고객 불만 전화 수신 시': {
            checklist: '고객의 불만 요지를 정확히 확인하고 매뉴얼대로 응대하였는가?',
            items: ['불만 내용 기록', '사과 및 공감 표현', '해결 방안 제시', '부서 전달 완료 여부']
        },
        '로비|체크인 안내 시': {
            checklist: '체크인/아웃 대기 시간 및 정보가 정확히 안내되었는가?',
            items: ['번호표 위치 안내', '대기시간 고지', '부대시설 쿠폰 증정', '키 불출 확인']
        },
        '린넨창고|비품 수령 시': {
            checklist: '층별 필요한 비품 수량이 정확하게 확보되었는가?',
            items: ['페이스타월 수량 확인', '소모품 재고 체크', '린넨 청결 상태', '운반 카트 확보']
        },
        '객실|정비 및 세팅 시': {
            checklist: '침구류 및 화장실 정비가 표준 매뉴얼을 준수하였는가?',
            items: ['침구 텐션 확보', '바닥 물기 제거', '폭탄방 여부 확인', '해충 발생 여부']
        },
        '단지 내|환경 관리 시': {
            checklist: '로비 및 공용부 대리석 광택 상태가 양호한가?',
            items: ['얼룩 제거 여부', '낙상 방지 안내판 설치', '광택기 안전 준수', '화장실 청결도']
        },
        '상황실|인수인계 시': {
            checklist: '야간 특이사항 및 컴플레인 건이 정확히 전달되었는가?',
            items: ['관광정보 오안내 확인', '차량사고 이력 공유', '미결 업무 리스트', '시스템 오류 보고']
        },
        '로비|짐 운반 요청 시': {
            checklist: '고객 짐 수량과 객실 정보가 정확히 매칭되었는가?',
            items: ['수화물 택 부착', '카트 적재 안전', 'VIP 우선 서비스', '이동 경로 확보']
        },
        '로비|환대 서비스 시': {
            checklist: '도착 고객에 대한 눈맞춤과 맞이 인사가 이루어졌는가?',
            items: ['미소 유지', '용모 복장 점검', '주차 유도 안내', '무관심 응대 방지']
        }
    };

    const [activeDropdown, setActiveDropdown] = useState<any>(null);
    const [selectedTpo, setSelectedTpo] = useState<TpoData>({ time: '', place: '', occasion: '' });
    const [selectedCriteria, setSelectedCriteria] = useState<CriteriaData>({ checklist: '', items: [] });
    const [selectedMatching, setSelectedMatching] = useState<MatchingData>({ evidence: '', method: '' });
    const [registeredTpos, setRegisteredTpos] = useState<RegisteredTpo[]>([
        {
            id: 1, workplace: '소노벨 천안', team: 'housekeeping', job: '인스펙터',
            tpo: { time: '업무중', place: '객실', occasion: '인스펙 실행 시' },
            criteria: { checklist: '인스펙션 상태를 기록 하였는가 ?', items: ['냉장고 습득물 유무', '화장실 변기 청결 상태'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 2, workplace: '소노벨 천안', team: 'housekeeping', job: '룸메이드',
            tpo: { time: '업무중', place: '객실', occasion: '정비 및 세팅 시' },
            criteria: { checklist: '침구류 및 화장실 정비가 표준 매뉴얼을 준수하였는가?', items: ['침구 텐션 확보', '바닥 물기 제거'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 3, workplace: '소노벨 천안', team: 'housekeeping', job: '코디사원',
            tpo: { time: '업무전', place: '린넨창고', occasion: '비품 수령 시' },
            criteria: { checklist: '층별 필요한 비품 수량이 정확하게 확보되었는가?', items: ['페이스타월 수량 확인', '소모품 재고 체크'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 4, workplace: '소노벨 천안', team: 'front', job: '지배인',
            tpo: { time: '업무전', place: '상황실', occasion: '인수인계 시' },
            criteria: { checklist: '야간 특이사항 및 컴플레인 건이 정확히 전달되었는가?', items: ['컴플레인 이력 공유', '미결 업무 리스트'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 5, workplace: '소노벨 천안', team: 'front', job: '리셉션',
            tpo: { time: '업무중', place: '로비', occasion: '체크인 안내 시' },
            criteria: { checklist: '체크인/아웃 대기 시간 및 정보가 정확히 안내되었는가?', items: ['번호표 위치 안내', '키 불출 확인'] },
            matching: { evidence: 'AI', method: '지정' }
        },
        {
            id: 6, workplace: '소노벨 천안', team: 'front', job: '컨시어즈',
            tpo: { time: '업무중', place: '로비', occasion: '짐 운반 요청 시' },
            criteria: { checklist: '고객 짐 수량과 객실 정보가 정확히 매칭되었는가?', items: ['수화물 택 부착', '카트 적재 안전'] },
            matching: { evidence: 'AI', method: '지정' }
        },
        {
            id: 7, workplace: '소노벨 천안', team: 'facility', job: '엔지니어',
            tpo: { time: '업무중', place: '기계실', occasion: '설비 정기 정검 시' },
            criteria: { checklist: '주요 설비 가동 상태 및 소음 수치가 정상인가?', items: ['냉동기 압력 체크', '보일러 연소 상태'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 8, workplace: '소노벨 천안', team: 'facility', job: '환경관리',
            tpo: { time: '업무중', place: '단지 내', occasion: '환경 관리 시' },
            criteria: { checklist: '로비 및 공용부 대리석 광택 상태가 양호한가?', items: ['얼룩 제거 여부', '안내판 설치'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 9, workplace: '소노벨 천안', team: 'customer_support', job: '컨택센터 상담원',
            tpo: { time: '업무중', place: '상황실', occasion: '고객 불만 전화 수신 시' },
            criteria: { checklist: '고객의 불만 요지를 정확히 확인하고 매뉴얼대로 응대하였는가?', items: ['불만 내용 기록', '해결 방안 제시'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 10, workplace: '소노벨 천안', team: 'customer_support', job: '고객서비스팀',
            tpo: { time: '업무중', place: '로비', occasion: 'VOC 등록 시' },
            criteria: { checklist: '고객 민원이 적절한 담당부서로 배분되었는가 ?', items: ['시급성 판단', '유관부서 지정'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 11, workplace: '소노벨 천안', team: 'customer_support', job: 'CS파트',
            tpo: { time: '업무중', place: '로비', occasion: '환대 서비스 시' },
            criteria: { checklist: '도착 고객에 대한 눈맞춤과 맞이 인사가 이루어졌는가?', items: ['미소 유지', '용모 복장 점검'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 12, workplace: '소노벨 천안', team: 'marketing_sales', job: '마케팅전략팀',
            tpo: { time: '업무중', place: '단지 내', occasion: '현장 홍보물 점검 시' },
            criteria: { checklist: '시즌 프로모션 배너가 수평하게 잘 부착되어 있는가?', items: ['부착 높이 준수', '훼손 여부 확인'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 13, workplace: '소노벨 천안', team: 'marketing_sales', job: '영업기획',
            tpo: { time: '업무중', place: '로비', occasion: 'VOC 등록 시' },
            criteria: { checklist: '고객 민원이 적절한 담당부서로 배분되었는가 ?', items: ['시급성 판단', '유관부서 지정'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 14, workplace: '소노벨 천안', team: 'management', job: '교육개발팀',
            tpo: { time: '업무전', place: '상황실', occasion: '조회 시' },
            criteria: { checklist: '당일 주요 VIP 정보 및 특이사항 교육이 완료되었는가?', items: ['VIP 명단 확인', '전달사항 복기'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 15, workplace: '소노벨 천안', team: 'management', job: '인사(HRD)',
            tpo: { time: '업무전', place: '상황실', occasion: '조회 시' },
            criteria: { checklist: '당일 주요 VIP 정보 및 특이사항 교육이 완료되었는가?', items: ['복장 상태 점검', '특이사항 숙지'] },
            matching: { evidence: '육안', method: '지정' }
        },
        {
            id: 16, workplace: '소노벨 천안', team: 'management', job: '상황실 관리자',
            tpo: { time: '업무전', place: '상황실', occasion: '인수인계 시' },
            criteria: { checklist: '야간 특이사항 및 컴플레인 건이 정확히 전달되었는가?', items: ['시스템 오류 보고', '차량사고 이력 공유'] },
            matching: { evidence: '육안', method: '지정' }
        }
    ]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [showTpoTooltip, setShowTpoTooltip] = useState(false);
    const [activeDoSubPhase, setActiveDoSubPhase] = useState('instruction');
    const [inspectionResults, setInspectionResults] = useState<InspectionRecord[]>([
        { id: 1, time: '2026.01.26 10:20', name: '박기철', area: '902호(하자)', item: '객실 방문 확인', status: 'O', role: '인스펙터', tpoId: 1 },
        { id: 2, time: '2026.01.26 10:35', name: '박기철', area: '903호(하자)', item: '즉시 조치 가능 여부', status: 'X', role: '인스펙터', reason: '부품 부재로 즉시 조치 불가', tpoId: 1 },
        { id: 3, time: '2026.01.26 10:50', name: '최민수', area: '상황실(분실)', item: '사진 촬영 및 업로드', status: 'O', role: '컨시어즈', tpoId: 2 },
        { id: 4, time: '2026.01.26 14:15', name: '이대한', area: 'B1 기계실', item: '보일러 연소 상태', status: 'O', role: '엔지니어', tpoId: 4 },
    ]);

    const [showConcernPopup, setShowConcernPopup] = useState(false);
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
        stats,
        showConcernPopup, setShowConcernPopup,
        actionPlanItems, updateActionPlanItem
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
