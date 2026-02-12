import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useCommon } from './CommonContext';
import { useToast } from './ToastContext';
import { TpoData, CriteriaData, MatchingData, RegisteredTpo, ChecklistItem } from '@csmac/types';
import { CRITERIA_OPTIONS } from '../constants/pdca-data';

export interface PlanContextType {
    selectedTpo: TpoData;
    selectedCriteria: CriteriaData;
    selectedMatching: MatchingData;
    isEditing: number | null;
    showTpoTooltip: boolean;
    setShowTpoTooltip: (v: boolean) => void;
    activeDropdown: string | null;
    setActiveDropdown: (v: any) => void;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    handleRegister: () => Promise<void>;
    handleReset: () => void;
    handleRemoveRegistered: (id: number) => Promise<void>;
    handleEdit: (id: number) => void;
    handleTpoSelect: (category: 'time' | 'place' | 'occasion', value: string) => void;
    handleCriteriaSelect: (type: 'checklist' | 'criteriaItems', value: string) => void;
    handleMatchingSelect: (type: 'evidence' | 'method' | 'elements', value: string) => void;
    addChecklistItem: (item: string) => void;
    removeChecklistItem: (index: number) => void;
    updateChecklistItemImage: (index: number, file: File | null, url?: string) => void;
    setSelectedCriteria: React.Dispatch<React.SetStateAction<CriteriaData>>;
    isSubmitting: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { workplace, team, job, registeredTpos, setRegisteredTpos, fetchTpos } = useCommon();
    const { addToast } = useToast();
    const [selectedTpo, setSelectedTpo] = useState<TpoData>({ time: '', place: '', occasion: '' });
    const [selectedCriteria, setSelectedCriteria] = useState<CriteriaData>({ checklist: '', items: [] });
    const [selectedMatching, setSelectedMatching] = useState<MatchingData>({ evidence: '', method: '', elements: [] });
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [showTpoTooltip, setShowTpoTooltip] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReset = React.useCallback(() => {
        setSelectedTpo({ time: '', place: '', occasion: '' });
        setSelectedCriteria({ checklist: '', items: [] });
        setSelectedMatching({ evidence: '', method: '', elements: [] });
        setIsEditing(null);
    }, []);

    const uploadChecklistImage = React.useCallback(async (file: File, tpoId: number, itemIndex: number): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${tpoId}_${itemIndex}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error } = await supabase.storage
                .from('checklist-reference-images')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('checklist-reference-images')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (err) {
            console.error('Error uploading image:', err);
            return null;
        }
    }, []);

    const handleRegister = React.useCallback(async () => {
        if (isSubmitting) return;

        if (!selectedTpo.place || !selectedTpo.occasion) {
            addToast('TPO(장소/상황)를 모두 선택해 주세요.', 'warning');
            return;
        }
        if (selectedCriteria.items.length === 0) {
            addToast('체크리스트 항목을 최소 1개 이상 추가해 주세요.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing !== null) {
                await supabase.from('tpo').update({
                    workplace, team, job,
                    tpo_time: selectedTpo.time,
                    tpo_place: selectedTpo.place,
                    tpo_occasion: selectedTpo.occasion,
                    matching_evidence: selectedMatching.evidence,
                    matching_method: selectedMatching.method,
                    matching_elements: selectedMatching.elements || []
                }).eq('id', isEditing);

                await supabase.from('checklist_items').delete().eq('tpo_id', isEditing);
                const itemsToInsert = await Promise.all(selectedCriteria.items.map(async (item, idx) => {
                    let imageUrl = item.imageUrl;
                    if (item.imageFile) {
                        const uploadedUrl = await uploadChecklistImage(item.imageFile, isEditing, idx);
                        if (uploadedUrl) imageUrl = uploadedUrl;
                    }
                    return { tpo_id: isEditing, content: item.content, sequence_order: idx, reference_image_url: imageUrl || null };
                }));
                await supabase.from('checklist_items').insert(itemsToInsert);
                setIsEditing(null);
                addToast('수정이 완료되었습니다.', 'success');
            } else {
                const { data: newTpo, error: tpoError } = await supabase.from('tpo').insert({
                    workplace, team, job,
                    tpo_time: selectedTpo.time,
                    tpo_place: selectedTpo.place,
                    tpo_occasion: selectedTpo.occasion,
                    matching_evidence: selectedMatching.evidence,
                    matching_method: selectedMatching.method,
                    matching_elements: selectedMatching.elements || []
                }).select().single();
                if (tpoError) throw tpoError;

                const itemsPayload = await Promise.all(selectedCriteria.items.map(async (item, idx) => {
                    let imageUrl = item.imageUrl;
                    if (item.imageFile) {
                        const uploadedUrl = await uploadChecklistImage(item.imageFile, newTpo.id, idx);
                        if (uploadedUrl) imageUrl = uploadedUrl;
                    }
                    return { tpo_id: newTpo.id, content: item.content, sequence_order: idx, reference_image_url: imageUrl || null };
                }));
                await supabase.from('checklist_items').insert(itemsPayload);
                addToast(`${job} 직무의 TPO가 등록되었습니다.`, 'success');
            }
            await fetchTpos();
            handleReset();
        } catch (err) {
            console.error('Error registering TPO:', err);
            addToast('저장 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedTpo, selectedCriteria, selectedMatching, isEditing, workplace, team, job, uploadChecklistImage, fetchTpos, handleReset, addToast, isSubmitting]);

    const handleRemoveRegistered = React.useCallback(async (id: number) => {
        try {
            const { error } = await supabase.from('tpo').delete().eq('id', id);
            if (error) throw error;
            setRegisteredTpos(prev => prev.filter(item => item.id !== id));
            if (isEditing === id) setIsEditing(null);
            addToast('삭제되었습니다.', 'info');
        } catch (err) {
            console.error('Error deleting TPO:', err);
            addToast('삭제 중 오류가 발생했습니다.', 'error');
        }
    }, [isEditing, setRegisteredTpos, addToast]);

    const handleEdit = React.useCallback((id: number) => {
        const itemToEdit = registeredTpos.find(item => item.id === id);
        if (itemToEdit) {
            setIsEditing(id);
            setSelectedTpo({ ...itemToEdit.tpo });
            setSelectedCriteria({
                checklist: itemToEdit.criteria.checklist,
                items: itemToEdit.criteria.items.map(item => ({ ...item }))
            });
            setSelectedMatching({ ...itemToEdit.matching });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [registeredTpos]);

    const handleTpoSelect = React.useCallback((category: 'time' | 'place' | 'occasion', value: string) => {
        setSelectedTpo(prev => {
            const newTpo = { ...prev, [category]: value };
            const key = `${newTpo.place}|${newTpo.occasion}`;
            if (CRITERIA_OPTIONS[key]) {
                setSelectedCriteria({
                    checklist: CRITERIA_OPTIONS[key].checklist,
                    items: CRITERIA_OPTIONS[key].items.map(item => ({ ...item }))
                });
            } else {
                setSelectedCriteria({ checklist: '', items: [] });
            }
            return newTpo;
        });
        setActiveDropdown(null);
    }, []);

    const handleCriteriaSelect = React.useCallback((type: 'checklist' | 'criteriaItems', value: string) => {
        if (type === 'checklist') {
            setSelectedCriteria(prev => ({ ...prev, checklist: value }));
            setActiveDropdown(null);
        } else {
            setSelectedCriteria(prev => {
                const itemExists = prev.items.some(item => item.content === value);
                const newItems = itemExists
                    ? prev.items.filter(item => item.content !== value)
                    : [...prev.items, { content: value }];
                return { ...prev, items: newItems };
            });
        }
    }, []);

    const handleMatchingSelect = React.useCallback((type: 'evidence' | 'method' | 'elements', value: string) => {
        if (type === 'elements') {
            setSelectedMatching(prev => {
                const elements = prev.elements || [];
                const newElements = elements.includes(value) ? elements.filter(e => e !== value) : [...elements, value];
                return { ...prev, elements: newElements };
            });
        } else {
            setSelectedMatching(prev => ({ ...prev, [type]: value }));
            setActiveDropdown(null);
        }
    }, []);

    const addChecklistItem = React.useCallback((item: string) => {
        if (item.trim()) {
            setSelectedCriteria(prev => ({ ...prev, items: [...prev.items, { content: item.trim() }] }));
        }
    }, []);

    const removeChecklistItem = React.useCallback((index: number) => {
        setSelectedCriteria(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    }, []);

    const updateChecklistItemImage = React.useCallback((index: number, file: File | null, url?: string) => {
        setSelectedCriteria(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === index ? { ...item, imageFile: file || undefined, imageUrl: url } : item)
        }));
    }, []);

    const value = React.useMemo(() => ({
        selectedTpo, selectedCriteria, selectedMatching, isEditing, showTpoTooltip, setShowTpoTooltip,
        activeDropdown, setActiveDropdown, searchQuery, setSearchQuery, handleRegister, handleReset,
        handleRemoveRegistered, handleEdit, handleTpoSelect, handleCriteriaSelect, handleMatchingSelect,
        addChecklistItem, removeChecklistItem, updateChecklistItemImage, setSelectedCriteria, isSubmitting
    }), [selectedTpo, selectedCriteria, selectedMatching, isEditing, showTpoTooltip, activeDropdown, searchQuery,
        handleRegister, handleReset, handleRemoveRegistered, handleEdit, handleTpoSelect, handleCriteriaSelect,
        handleMatchingSelect, addChecklistItem, removeChecklistItem, updateChecklistItemImage, isSubmitting]);

    return (
        <PlanContext.Provider value={value}>
            {children}
        </PlanContext.Provider>
    );
};

export const usePlan = () => {
    const context = useContext(PlanContext);
    if (!context) throw new Error('usePlan must be used within PlanProvider');
    return context;
};
