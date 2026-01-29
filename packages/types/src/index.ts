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
export type Phase = 'plan' | 'do' | 'check' | 'act';

export interface TpoData {
    time: string;
    place: string;
    occasion: string;
}

export interface CriteriaData {
    checklist: string;
    items: string[];
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
