import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDo } from './DoContext';
import { ActionPlanItem } from '@csmac/types';

export interface ActContextType {
    showConcernPopup: boolean;
    setShowConcernPopup: (v: boolean) => void;
    actionPlanItems: ActionPlanItem[];
    updateActionPlanItem: (id: number, updates: Partial<ActionPlanItem>) => void;
    addActionPlanItem: (item: Omit<ActionPlanItem, 'id'>) => void;
    stats: {
        totalRecords: number;
        compliantCount: number;
        nonCompliantCount: number;
        complianceRate: number;
        actionRequiredCount: number;
    };
}

const ActContext = createContext<ActContextType | undefined>(undefined);

export const ActProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { inspectionResults } = useDo();
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

    const updateActionPlanItem = (id: number, updates: Partial<ActionPlanItem>) => {
        setActionPlanItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addActionPlanItem = (item: Omit<ActionPlanItem, 'id'>) => {
        const newId = actionPlanItems.length > 0 ? Math.max(...actionPlanItems.map(a => a.id)) + 1 : 1;
        setActionPlanItems(prev => [...prev, { ...item, id: newId }]);
    };

    const stats = {
        totalRecords: inspectionResults.length,
        compliantCount: inspectionResults.filter(r => r.status === 'O').length,
        nonCompliantCount: inspectionResults.filter(r => r.status === 'X').length,
        complianceRate: inspectionResults.length > 0
            ? Math.round((inspectionResults.filter(r => r.status === 'O').length / inspectionResults.length) * 100)
            : 100,
        actionRequiredCount: inspectionResults.filter(r => r.status === 'X').length
    };

    return (
        <ActContext.Provider value={{
            showConcernPopup, setShowConcernPopup, actionPlanItems, updateActionPlanItem, addActionPlanItem, stats
        }}>
            {children}
        </ActContext.Provider>
    );
};

export const useAct = () => {
    const context = useContext(ActContext);
    if (!context) throw new Error('useAct must be used within ActProvider');
    return context;
};
