import React, { ReactNode } from 'react';
import { CommonProvider, useCommon } from './CommonContext';
import { PlanProvider, usePlan } from './PlanContext';
import { DoProvider, useDo } from './DoContext';
import { ActProvider, useAct } from './ActContext';
import { TEAMS, TPO_OPTIONS, PLACE_OCCASION_MAPPING, CRITERIA_OPTIONS } from '../constants/pdca-data';

export const PDCAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <CommonProvider>
            <PlanProvider>
                <DoProvider>
                    <ActProvider>
                        {children}
                    </ActProvider>
                </DoProvider>
            </PlanProvider>
        </CommonProvider>
    );
};

export const usePDCA = () => {
    const common = useCommon();
    const plan = usePlan();
    const doPhase = useDo();
    const act = useAct();

    const currentCriteria = CRITERIA_OPTIONS[`${plan.selectedTpo.place}|${plan.selectedTpo.occasion}`];

    const addInspectionResult = (result: any) => {
        const newId = doPhase.addInspectionResult(result);
        if (result.status === 'X') {
            act.addActionPlanItem({
                inspectionId: newId,
                team: TEAMS[common.team]?.label || common.team,
                area: result.area,
                category: '미준수 조치',
                issue: result.item,
                reason: result.reason || '관리자 현장 점검 미준수',
                timestamp: result.time,
                status: 'pending'
            });
        }
    };

    // Merge everything into a single object for backward compatibility
    return {
        ...common,
        ...plan,
        ...doPhase,
        ...act,
        addInspectionResult,
        // Constants
        teams: TEAMS,
        tpoOptions: TPO_OPTIONS,
        placeOccasionMapping: PLACE_OCCASION_MAPPING,
        criteriaOptions: CRITERIA_OPTIONS,
        currentCriteria
    };
};
