import { useCallback } from 'react';
import { JobInstruction } from '@csmac/types';

const STORAGE_KEY = 'csmac_mock_verification';

export interface MockVerificationData {
    aiScore?: number | null;
    aiAnalysis?: string | null;
    feedbackComment?: string | null;
    verificationResult?: 'pass' | 'fail' | null;
}

export type MockStore = Record<string, MockVerificationData>;

export function useVerificationPersistence() {
    const getMockStore = useCallback((): MockStore => {
        if (typeof window === 'undefined') return {};
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    }, []);

    const saveMockData = useCallback((id: number, data: MockVerificationData) => {
        const store = getMockStore();
        const key = id.toString();
        store[key] = { ...store[key], ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        console.log(`[Persistence] Saved for ID ${id}:`, data);
    }, [getMockStore]);

    const mergeWithMockData = useCallback(<T extends { id: number; aiScore?: number | null; aiAnalysis?: string | null; feedbackComment?: string | null; verificationResult?: 'pass' | 'fail' | null }>(dbItems: T[]): T[] => {
        const store = getMockStore();
        return dbItems.map(item => {
            const mock = store[item.id.toString()] || {};
            const result = {
                ...item,
                aiScore: (item.aiScore === null || item.aiScore === undefined) ? (mock.aiScore ?? item.aiScore) : item.aiScore,
                aiAnalysis: (item.aiAnalysis === null || item.aiAnalysis === undefined) ? (mock.aiAnalysis ?? item.aiAnalysis) : item.aiAnalysis,
                feedbackComment: (item.feedbackComment === null || item.feedbackComment === undefined) ? (mock.feedbackComment ?? item.feedbackComment) : item.feedbackComment,
                verificationResult: (item.verificationResult === null || item.verificationResult === undefined) ? (mock.verificationResult ?? item.verificationResult) : item.verificationResult,
            };
            return result;
        });
    }, [getMockStore]);

    return {
        getMockStore,
        saveMockData,
        mergeWithMockData
    };
}
