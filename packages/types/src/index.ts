export type RoomStatus = 'CLEAN' | 'DIRTY' | 'INSPECTING' | 'MAINTENANCE';

export interface InspectionItem {
    id: string;
    label: string;
    checked: boolean;
}

export interface Room {
    id: string;
    roomNumber: string;
    status: RoomStatus;
    floor: number;
    lastCleaned?: string; // ISO Date
    assignedWorkerId?: string;
    inspectionItems: InspectionItem[];
}

export interface Worker {
    id: string;
    name: string;
    role: 'FIELD_WORKER' | 'MANAGER';
}

export const MOCK_ROOMS: Room[] = [
    {
        id: '101',
        roomNumber: '101',
        status: 'DIRTY',
        floor: 1,
        inspectionItems: [
            { id: '1', label: 'Bed Sheet Replaced', checked: false },
            { id: '2', label: 'Bathroom Cleaned', checked: false },
            { id: '3', label: 'Amenities Restocked', checked: false },
        ],
    },
    {
        id: '102',
        roomNumber: '102',
        status: 'CLEAN',
        floor: 1,
        lastCleaned: '2023-11-20T10:00:00Z',
        inspectionItems: [],
    },
    {
        id: '201',
        roomNumber: '201',
        status: 'INSPECTING',
        floor: 2,
        assignedWorkerId: 'worker-1',
        inspectionItems: [
            { id: '1', label: 'Bed Sheet Replaced', checked: true },
            { id: '2', label: 'Bathroom Cleaned', checked: true },
        ],
    },
    {
        id: '202',
        roomNumber: '202',
        status: 'MAINTENANCE',
        floor: 2,
        inspectionItems: [],
    },
];

// PDCA Dashboard Types
export type Phase = 'command' | 'plan' | 'do' | 'check' | 'act';

// Command Center: job_instructions DB 테이블 매핑
export type JobInstructionStatus = 'waiting' | 'in_progress' | 'completed' | 'delayed' | 'non_compliant';

export interface JobInstructionDB {
    id: number;
    tpo_id: number | null;
    task_group_id: number | null;
    team: string;
    assignee: string | null;
    subject: string;
    description: string | null;
    status: JobInstructionStatus;
    evidence_url: string | null;
    verification_result: 'pass' | 'fail' | null;
    deadline: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

export interface TpoData {
    time: string;
    place: string;
    occasion: string;
}

export interface ChecklistItem {
    id?: number;
    content: string;
    imageFile?: File;
    imageUrl?: string;
}

export interface CriteriaData {
    checklist: string;
    items: ChecklistItem[];
}

export interface MatchingData {
    evidence: string;
    method: string;
    elements?: string[];
}

export interface RegisteredTpo {
    id: number;
    workplace: string;
    team: string;
    job: string;
    tpo: TpoData;
    criteria: CriteriaData;
    matching: MatchingData;
    setupTasks?: { id: number; items: ChecklistItem[] }[];
}

export interface TeamInfo {
    label: string;
    jobs: string[];
}

export type TeamsMapping = Record<string, TeamInfo>;

export interface InspectionRecord {
    id: number;
    time: string;
    name: string;
    area: string;
    item: string;
    status: 'O' | 'X';
    role: string;
    reason?: string;
    tpoId: number;
}
export interface ActionPlanItem {
    id: number;
    inspectionId: number;
    team: string;
    area: string;
    category: string;
    issue: string;
    reason: string;
    timestamp: string;
    status: 'pending' | 'in_progress' | 'completed' | 'impossible';
    cause?: string;
    solution?: string;
}

export interface JobInstruction {
    id: number;
    targetTeam: string;
    assignee: string;
    subject: string;
    description: string;
    deadline: string;
    status: 'sent' | 'received' | 'in_progress' | 'completed' | 'delayed' | 'non_compliant';
    timestamp: string;
}

// --- NEW TYPES FOR INSTRUCTION BOARD (DnD) ---

export interface TeamMember {
    id: string;
    name: string;
    role: string; // e.g., '리셉션', '지배인'
    status: 'working' | 'break' | 'off';
    shift?: string;
    avatarUrl?: string;
}

export type TaskStage = 'pre' | 'during' | 'post'; // 업무 전(Preparation), 중(Operation), 후(Closing)

export interface TaskCardData extends RegisteredTpo {
    stage: TaskStage;
    assignedMemberIds: string[]; // Temporarily assigned members before deployment
}
