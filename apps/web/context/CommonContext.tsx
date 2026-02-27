import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Phase, RegisteredTpo, ChecklistItem, TpoData } from '@csmac/types';
import { DEFAULT_WORKPLACE } from '../constants/pdca-data';

export interface CommonContextType {
    activePhase: Phase;
    setActivePhase: (phase: Phase) => void;
    workplace: string;
    setWorkplace: (v: string) => void;
    team: string;
    setTeam: (v: string) => void;
    job: string;
    setJob: (v: string) => void;
    registeredTpos: RegisteredTpo[];
    setRegisteredTpos: React.Dispatch<React.SetStateAction<RegisteredTpo[]>>;
    fetchTpos: () => Promise<void>;
}

const CommonContext = createContext<CommonContextType | undefined>(undefined);

export const CommonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activePhase, setActivePhase] = useState<Phase>('command');
    const [workplace, setWorkplace] = useState<string>(DEFAULT_WORKPLACE);
    const [team, setTeam] = useState('전체');
    const [job, setJob] = useState('전체');
    const [registeredTpos, setRegisteredTpos] = useState<RegisteredTpo[]>([]);

    const fetchTpos = React.useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('tpo')
                .select(`
                    id,
                    workplace, team, job,
                    tpo_time, tpo_place, tpo_occasion,
                    matching_evidence, matching_method, matching_elements,
                    checklist_items ( * ),
                    task_groups (
                        id,
                        group_name,
                        task_group_items (
                            checklist_item_id
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching TPOs:', error);
                return;
            }

            if (data) {
                const transformed: RegisteredTpo[] = data.map((row: any) => {
                    const itemsMap: Record<string, ChecklistItem> = {};
                    const checklistItems = row.checklist_items?.map((i: any) => {
                        const item = {
                            ...i,
                            content: i.content,
                            imageUrl: i.reference_image_url || i.image_url || undefined,
                            id: i.id
                        };
                        itemsMap[String(i.id)] = item;
                        return item;
                    }) || [];

                    const setupTasks = row.task_groups?.map((group: any) => {
                        return {
                            id: group.id,
                            items: group.task_group_items
                                ?.map((tgi: any) => itemsMap[String(tgi.checklist_item_id)])
                                .filter(Boolean) || []
                        };
                    }) || [];

                    return {
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
                            checklist: `[${row.tpo_time}] ${row.tpo_place} - ${row.tpo_occasion}`,
                            items: checklistItems
                        },
                        matching: {
                            evidence: row.matching_evidence || '',
                            method: row.matching_method || '',
                            elements: row.matching_elements || []
                        },
                        setupTasks
                    };
                });
                setRegisteredTpos(transformed);
            }
        } catch (err) {
            console.error('Unexpected error fetching TPOs:', err);
        }
    }, []);

    useEffect(() => {
        fetchTpos();
    }, []);

    const value = React.useMemo(() => ({
        activePhase, setActivePhase,
        workplace, setWorkplace,
        team, setTeam,
        job, setJob,
        registeredTpos, setRegisteredTpos,
        fetchTpos
    }), [activePhase, workplace, team, job, registeredTpos, fetchTpos]);

    return (
        <CommonContext.Provider value={value}>
            {children}
        </CommonContext.Provider>
    );
};

export const useCommon = () => {
    const context = useContext(CommonContext);
    if (!context) throw new Error('useCommon must be used within CommonProvider');
    return context;
};
