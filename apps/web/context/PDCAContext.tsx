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
    tpoOptions: any;
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
        place: ['객실', '로비', '레스토랑/라운지', '주차장', '복도/E/V', '창고/린넨실', '기계실/상황실'],
        occasion: [
            '인스펙션 실행',
            '객실 정비/세팅',
            '고객 환대/응대',
            '물품 전달/불출',
            '시설/안전 점검',
            '컴플레인/VOC 처리',
            '영업 준비/마감'
        ],
    };

    const placeOccasionMapping: Record<string, string[]> = {
        '객실': ['인스펙션 실행', '객실 정비/세팅', '컴플레인/VOC 처리'],
        '로비': ['고객 환대/응대', '컴플레인/VOC 처리', '시설/안전 점검'],
        '레스토랑/라운지': ['영업 준비/마감', '컴플레인/VOC 처리', '시설/안전 점검'],
        '주차장': ['시설/안전 점검', '컴플레인/VOC 처리'],
        '복도/E/V': ['시설/안전 점검', '컴플레인/VOC 처리'],
        '창고/린넨실': ['물품 전달/불출', '시설/안전 점검'],
        '기계실/상황실': ['시설/안전 점검', '컴플레인/VOC 처리', '영업 준비/마감']
    };

    const criteriaOptions: Record<string, CriteriaData> = {
        '객실|인스펙션 실행': {
            checklist: '객실 상태가 표준 정비 지침을 준수하는가?',
            items: ['침구류 오염 및 주름 상태 확인', '실내 온도 및 조명 작동 여부', '미니바/비품 세팅 수량 확인', '욕실 물기 제거 및 배수 상태', '창문 결로 및 환기 상태']
        },
        '객실|객실 정비/세팅': {
            checklist: '객실 정비 프로세스가 매뉴얼대로 수행되었는가?',
            items: ['침대 베딩 텐션 유지', '바닥 카펫/플로어 청소 상태', '쓰레기통 비움 및 내부 세척', '어메니티(에비앙 등) 재입고', '가구 먼지 및 얼룩 제거']
        },
        '객실|컴플레인/VOC 처리': {
            checklist: '객실 관련 고객 불만이 매뉴얼에 따라 해소되었는가?',
            items: ['고객 경청 및 사과(Apology) 표현', '객실 내 시설 결함 즉시 보수', '필요 시 룸 체인지 및 보상안 안내', '정비팀/프론트와 실시간 정보 공유']
        },
        '로비|고객 환대/응대': {
            checklist: '고객 맞이 및 대기 관리가 적절히 이루어지는가?',
            items: ['맞이 인사(Greeting) 수행 여부', '대기 번호표 발행 및 안내', '로비 향기 및 배경음악 점검', '짐 운반 지원 필요성 확인', '용모 복장 및 명찰 착용 상태']
        },
        '로비|컴플레인/VOC 처리': {
            checklist: '로비에서의 고객 불편 사항이 신속하게 해결되었는가?',
            items: ['대기 시간 지연에 대한 안내 및 양해', '컴플레인 고객 별도 장소 안내', '책임자의 정중한 응대 및 상황 설명', '사후 피드백을 위한 연락처 확인']
        },
        '로비|시설/안전 점검': {
            checklist: '로비 내 시설이 안전하고 쾌적하게 유지되는가?',
            items: ['소파 및 테이블 배치/청결 상태', '장애인 경사로 및 이동 경로 확보', '자동문 작동 및 센서 감지 상태', '비상 대피도 비치 및 시인성 확인']
        },
        '레스토랑/라운지|영업 준비/마감': {
            checklist: '업장 오픈/마감 준비가 위생 기준에 부합하는가?',
            items: ['테이블 수저/기물 세팅 상태', '뷔페 스테이션 온도 유지 확인', '바닥 및 가구 청결 점검', '음식 소진 시 즉시 보충 여부', '주방 입구 방충망 상태 점검']
        },
        '레스토랑/라운지|컴플레인/VOC 처리': {
            checklist: '식음 서비스 관련 불만이 즉각 조치되었는가?',
            items: ['음식 이물질/누락 즉시 교체', '맛/질에 대한 셰프 피드백 전달', '계산 착오 확인 및 정정 처리', '불만 고객 대상 서비스 메뉴 제공']
        },
        '레스토랑/라운지|시설/안전 점검': {
            checklist: '매장 내 안전 및 위생 설비가 정상인가?',
            items: ['홀 바닥 미끄럼 방지 처리 확인', '식기 세척기 적정 온도 유지', '가스 차단기 및 환기 시스템 점검', '유아용 의자 파손 및 청결 상태']
        },
        '주차장|시설/안전 점검': {
            checklist: '주차장 내 안전 위해 요소가 제거 되었는가?',
            items: ['포트홀 및 바닥 균열 유무', '조명 조도 및 작동 상태', '소화기 비치 및 점검 기록', '무단 주차 및 장기 방치 차량', '진입로 표지판 식별 가능 여부']
        },
        '주차장|컴플레인/VOC 처리': {
            checklist: '주차 관련 불편 사항이 적절히 처리되었는가?',
            items: ['주차 공간 부족 시 유도 안내', '차량 파손 사고 확인 및 CCTV 대조', '주차 요금 정산기 오류 즉시 대응', '발렛 전용 구역 무단 주차 관리']
        },
        '복도/E/V|시설/안전 점검': {
            checklist: '공용 구역 시설 및 청결 상태가 유지되는가?',
            items: ['엘리베이터 거울 및 바닥 청결', '비상계단 적치물 유무 확인', '벽면 파손 및 오염 흔적', '카페트 얼룩 제거 상태', '비상구 유도등 점등 여부']
        },
        '복도/E/V|컴플레인/VOC 처리': {
            checklist: '공용 공간 불편 신고가 처리되었는가?',
            items: ['복도 소음 유발 요인 즉시 차단', '엘리베이터 대기 시간 불만 해소', '복도 잔류 린넨 카드/쓰레기 수거', 'E/V 내부 불쾌한 냄새 탈취 조치']
        },
        '창고/린넨실|물품 전달/불출': {
            checklist: '린넨 및 비품 재고 관리가 정확하게 이루어지는가?',
            items: ['린넨 청결도 및 오염 분류', '비품 수량과 장부 일치 여부', '창고 내부 정리 상태', '유통기한(어메니티 등) 확인', '운반 카트 바퀴 소음/작동 점검']
        },
        '창고/린넨실|시설/안전 점검': {
            checklist: '창고 환경이 물품 보관에 적합한가?',
            items: ['린넨 적재 높이 준수(소방법)', '습도로 인한 곰팡이 발생 여부', '해충 방제(Pest Control) 주기 기록', '조명 밝기 및 통로 확보 상태']
        },
        '기계실/상황실|시설/안전 점검': {
            checklist: '핵심 설비 및 시스템이 정상 작동 중인가?',
            items: ['냉난방기 압력 및 온도 체크', '화재 수신기 정상 작동 확인', 'CCTV 모니터링 사각지대 여부', '전기 판넬 과열 흔적 확인', '시스템 오류 로그 확인 및 보고']
        },
        '기계실/상황실|영업 준비/마감': {
            checklist: '설비 시스템 교대 및 마감 점검이 완료되었는가?',
            items: ['인수인계 일지 기록 상태', '비상 발전기 대기 모드 확인', '네트워크 서버 백업 상태 체크', '제어실 출입 통제 장치 작동 여부']
        },
        '기계실/상황실|컴플레인/VOC 처리': {
            checklist: '기술적 불편 사항이 신속히 대응되었는가?',
            items: ['객실 온도 조절 원격 대응 속도', 'Wi-Fi 등 통신 장애 복구 조치', '승강기 갇힘 사고 등 긴급 구조', '수질/전력 공급 일시 중단 안내']
        }
    };

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
    const [activeDoSubPhase, setActiveDoSubPhase] = useState('instruction');
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
        jobInstructions, addJobInstruction
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
