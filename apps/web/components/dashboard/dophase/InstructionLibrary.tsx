import React, { useState } from 'react';
import { colors } from '../../../styles/theme';
import { usePDCA } from '../../../context/PDCAContext';
import { useToast } from '../../../context/ToastContext';
import { RegisteredTpo, ChecklistItem } from '@csmac/types';
import { LibraryCard } from './LibraryCard';
import { LibraryDetailModal } from './LibraryDetailModal';

interface FlattenedLibraryItem extends RegisteredTpo {
    currentGroupId: number;
    displayItems: ChecklistItem[];
}

export const InstructionLibrary: React.FC = () => {
    const {
        registeredTpos,
        deployedTaskGroupIds,
        deployToBoard,
        removeFromBoard,
        setupTasksToSop,
        librarySearchQuery,
        setLibrarySearchQuery,
        librarySelectedOccasions,
        setLibrarySelectedOccasions,
        librarySelectedTeams,
        setLibrarySelectedTeams,
        librarySelectedJobs,
        setLibrarySelectedJobs,
        librarySelectedMode,
        setLibrarySelectedMode
    } = usePDCA();
    const { addToast } = useToast();

    const handleToggleBoard = (groupId: number) => {
        if (deployedTaskGroupIds.includes(groupId)) {
            removeFromBoard(groupId);
        } else {
            deployToBoard(groupId);
        }
    };

    const isDeployed = (groupId: number) => deployedTaskGroupIds.includes(groupId);
    const [selectedDetailItem, setSelectedDetailItem] = useState<RegisteredTpo | null>(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    // Dynamically derive options from data
    const occasions = Array.from(new Set(registeredTpos.map(t => t.tpo.occasion))).sort();

    // Group jobs by team for the sidebar
    const teamJobMap: Record<string, string[]> = {};
    registeredTpos.forEach(t => {
        if (!teamJobMap[t.team]) teamJobMap[t.team] = [];
        if (!teamJobMap[t.team].includes(t.job)) teamJobMap[t.team].push(t.job);
    });

    // Custom sort: '전체' first, then alphabetical (가나다순)
    const sortFn = (a: string, b: string) => {
        if (a === '전체') return -1;
        if (b === '전체') return 1;
        return a.localeCompare(b, 'ko');
    };

    const sortedFilterTeams = Object.keys(teamJobMap).sort(sortFn);
    Object.keys(teamJobMap).forEach(team => {
        teamJobMap[team].sort(sortFn);
    });

    // Flatten items: Each setupTask (combination) becomes its own card
    const flattenedItems = registeredTpos.flatMap(tpo => {
        if (!tpo.setupTasks || tpo.setupTasks.length === 0) {
            return [];
        }
        return tpo.setupTasks.map(group => ({
            ...tpo,
            currentGroupId: group.id,
            displayItems: group.items
        }));
    }) as FlattenedLibraryItem[];

    // Filtering Logic (on flattened items)
    const filteredItems = flattenedItems.filter(item => {
        const matchesSearch = librarySearchQuery === '' ||
            item.criteria.checklist.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
            item.job.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
            item.tpo.occasion.toLowerCase().includes(librarySearchQuery.toLowerCase());

        const matchesOccasion = librarySelectedOccasions.length === 0 || librarySelectedOccasions.includes(item.tpo.occasion);
        const matchesTeam = librarySelectedTeams.length === 0 || librarySelectedTeams.includes(item.team);
        const matchesJob = librarySelectedJobs.length === 0 || librarySelectedJobs.includes(item.job);
        const matchesMode = librarySelectedMode === '전체' || librarySelectedMode === '표준';

        return matchesSearch && matchesOccasion && matchesTeam && matchesJob && matchesMode;
    });



    const resetFilters = () => {
        setLibrarySearchQuery('');
        setLibrarySelectedOccasions([]);
        setLibrarySelectedTeams([]);
        setLibrarySelectedJobs([]);
        setLibrarySelectedMode('전체');
    };

    return (
        <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 250px)' }}>
            {/* Left Sidebar: Filters */}
            <div style={{
                width: '300px',
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '20px',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                overflowY: 'auto'
            }}>
                <div>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '8px' }}>검색</div>
                    <input
                        type="text"
                        placeholder="업무명 / 직무 / TPO(상황)로 검색"
                        value={librarySearchQuery}
                        onChange={(e) => setLibrarySearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '12px',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                <div>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '8px' }}>지시서 모드</div>
                    <div style={{ display: 'flex', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
                        {['전체', '표준', '베테랑'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setLibrarySelectedMode(mode)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    backgroundColor: librarySelectedMode === mode ? 'white' : 'transparent',
                                    fontWeight: librarySelectedMode === mode ? 'bold' : 'normal',
                                    boxShadow: librarySelectedMode === mode ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '8px' }}>상황(TPO) 빠른 필터</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {occasions.map(occ => (
                            <span
                                key={occ}
                                onClick={() => setLibrarySelectedOccasions(prev => prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ])}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: librarySelectedOccasions.includes(occ) ? colors.primaryBlue : '#F3F4F6',
                                    color: librarySelectedOccasions.includes(occ) ? 'white' : colors.textDark,
                                    borderRadius: '15px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                {occ}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
                    <div style={{ fontSize: '0.9rem', color: colors.textGray, marginBottom: '15px' }}>팀 · 직무</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {sortedFilterTeams.map(team => (
                            <div key={team}>
                                <div
                                    onClick={() => setLibrarySelectedTeams(prev => prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team])}
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        marginBottom: '8px',
                                        cursor: 'pointer',
                                        color: librarySelectedTeams.includes(team) ? colors.primaryBlue : colors.textDark
                                    }}
                                >
                                    {team}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {teamJobMap[team].map(job => (
                                        <span
                                            key={job}
                                            onClick={() => setLibrarySelectedJobs(prev => prev.includes(job) ? prev.filter(j => j !== job) : [...prev, job])}
                                            style={{
                                                padding: '4px 8px',
                                                border: `1px solid ${librarySelectedJobs.includes(job) || librarySelectedTeams.includes(team) ? colors.primaryBlue : colors.border}`,
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                color: librarySelectedJobs.includes(job) || librarySelectedTeams.includes(team) ? colors.primaryBlue : colors.textGray,
                                                cursor: 'pointer',
                                                backgroundColor: librarySelectedJobs.includes(job) || librarySelectedTeams.includes(team) ? '#E3F2FD' : 'white'
                                            }}
                                        >
                                            {job}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content: Row per Job */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <button
                        onClick={resetFilters}
                        style={{ padding: '7px 10px', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: 'white', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                        필터 초기화
                    </button>
                </div>

                {filteredItems.length === 0 ? (
                    <div style={{ flex: 1, padding: '100px', textAlign: 'center', color: colors.textGray }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.textDark }}>검색된 결과가 없습니다.</div>
                        <div style={{ fontSize: '0.9rem', marginTop: '10px' }}>필터를 조정하여 원하는 업무를 찾아보세요.</div>
                    </div>
                ) : (() => {
                    // 팀→직무 가나다순 정렬
                    const teamJobPairs = Array.from(
                        new Map(filteredItems.map(i => [`${i.team}|${i.job}`, { team: i.team, job: i.job }])).values()
                    ).sort((a, b) => {
                        const teamCmp = a.team.localeCompare(b.team, 'ko');
                        if (teamCmp !== 0) return teamCmp;
                        return a.job.localeCompare(b.job, 'ko');
                    });

                    const jobRows: { key: string; label: string; items: typeof filteredItems }[] = [
                        { key: '전체', label: '전체', items: filteredItems },
                        ...teamJobPairs.map(({ team, job }) => ({
                            key: `${team}|${job}`,
                            label: `${team} · ${job}`,
                            items: filteredItems.filter(i => i.team === team && i.job === job)
                        }))
                    ];

                    return jobRows.map(({ key, label, items: rowItems }) => (
                        <div key={key} style={{ marginBottom: '20px' }}>
                            {/* 행 헤더 */}
                            <div style={{
                                fontSize: '0.8rem', fontWeight: 'bold', color: colors.textGray,
                                borderBottom: `2px solid ${colors.border}`, paddingBottom: '6px', marginBottom: '10px',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <span>{label}</span>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 'normal',
                                    backgroundColor: '#F1F5F9', color: '#64748B',
                                    padding: '1px 6px', borderRadius: '9999px'
                                }}>
                                    {rowItems.length}개
                                </span>
                            </div>
                            {/* 3열 카드 그리드 */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {rowItems.map((item, idx) => (
                                    <LibraryCard
                                        key={`${label}-${idx}`}
                                        data={item}
                                        onViewDetail={() => {
                                            setSelectedDetailItem(item);
                                            setDetailModalOpen(true);
                                        }}
                                        onToggleBoard={handleToggleBoard}
                                        isDeployed={isDeployed}
                                    />
                                ))}
                            </div>
                        </div>
                    ));
                })()}
            </div>

            {isDetailModalOpen && selectedDetailItem && (
                <LibraryDetailModal
                    data={selectedDetailItem}
                    onClose={() => setDetailModalOpen(false)}
                    onAddToBoard={() => {
                        const groupId = (selectedDetailItem as FlattenedLibraryItem).currentGroupId;
                        if (groupId) {
                            handleToggleBoard(groupId);
                        } else if (selectedDetailItem.setupTasks?.[0]) {
                            handleToggleBoard(selectedDetailItem.setupTasks[0].id);
                        }
                        setDetailModalOpen(false);
                    }}
                    isDeployed={Boolean(
                        (selectedDetailItem as FlattenedLibraryItem).currentGroupId
                            ? isDeployed((selectedDetailItem as FlattenedLibraryItem).currentGroupId)
                            : (selectedDetailItem.setupTasks?.[0] && isDeployed(selectedDetailItem.setupTasks[0].id))
                    )}
                />
            )}
        </div>
    );
};
