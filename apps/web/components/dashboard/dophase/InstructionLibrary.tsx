import React, { useState } from 'react';
import { colors } from '../../../styles/theme';
import { usePDCA } from '../../../context/PDCAContext';
import { RegisteredTpo } from '@csmac/types';
import { CategoryColumn, TEAM_COLORS } from './CategoryColumn';
import { LibraryDetailModal } from './LibraryDetailModal';
import { TEAMS } from '../../../constants/pdca-data';

export const InstructionLibrary: React.FC = () => {
    const { registeredTpos, deployedTaskGroupIds, deployToBoard, removeFromBoard } = usePDCA();
    const [searchQuery, setSearchQuery] = useState('');

    const handleToggleBoard = (groupId: number) => {
        if (deployedTaskGroupIds.includes(groupId)) {
            removeFromBoard(groupId);
        } else {
            deployToBoard(groupId);
        }
    };

    const isDeployed = (groupId: number) => deployedTaskGroupIds.includes(groupId);
    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState('전체');

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

    // Filtering Logic
    const filteredItems = registeredTpos.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.criteria.checklist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tpo.occasion.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesOccasion = !selectedOccasion || item.tpo.occasion === selectedOccasion;
        const matchesTeam = !selectedTeam || item.team === selectedTeam;
        const matchesJob = !selectedJob || item.job === selectedJob;
        // Mode is placeholder for now (all are '표준')
        const matchesMode = selectedMode === '전체' || selectedMode === '표준';

        return matchesSearch && matchesOccasion && matchesTeam && matchesJob && matchesMode;
    });

    // Categorize by team (key) instead of place
    const teamKeys = Array.from(new Set(filteredItems.map(t => t.team))).sort();

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedOccasion(null);
        setSelectedTeam(null);
        setSelectedJob(null);
        setSelectedMode('전체');
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                onClick={() => setSelectedMode(mode)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    backgroundColor: selectedMode === mode ? 'white' : 'transparent',
                                    fontWeight: selectedMode === mode ? 'bold' : 'normal',
                                    boxShadow: selectedMode === mode ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
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
                                onClick={() => setSelectedOccasion(selectedOccasion === occ ? null : occ)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: selectedOccasion === occ ? colors.primaryBlue : '#F3F4F6',
                                    color: selectedOccasion === occ ? 'white' : colors.textDark,
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
                        {Object.keys(teamJobMap).map(team => (
                            <div key={team}>
                                <div
                                    onClick={() => setSelectedTeam(selectedTeam === team ? null : team)}
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        marginBottom: '8px',
                                        cursor: 'pointer',
                                        color: selectedTeam === team ? colors.primaryBlue : colors.textDark
                                    }}
                                >
                                    {team}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {teamJobMap[team].map(job => (
                                        <span
                                            key={job}
                                            onClick={() => setSelectedJob(selectedJob === job ? null : job)}
                                            style={{
                                                padding: '4px 8px',
                                                border: `1px solid ${selectedJob === job || selectedTeam === team ? colors.primaryBlue : colors.border}`,
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                color: selectedJob === job || selectedTeam === team ? colors.primaryBlue : colors.textGray,
                                                cursor: 'pointer',
                                                backgroundColor: selectedJob === job || selectedTeam === team ? '#E3F2FD' : 'white'
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

            {/* Main Content: Card Grid */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: colors.textDark, flex: '1 1 200px', minWidth: 0 }}>
                        팀/직무 · 상황(TPO) · 표준/베테랑 지시를 선택해 “우리팀 보드”로 즉시 배포
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                            onClick={resetFilters}
                            style={{ padding: '7px 10px', borderRadius: '10px', border: `1px solid ${colors.border}`, backgroundColor: 'white', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            필터 초기화
                        </button>
                        <button style={{ padding: '7px 10px', borderRadius: '10px', border: 'none', backgroundColor: colors.primaryBlue, color: 'white', fontSize: '12px', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>우리팀 보드 보기</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', height: '100%' }}>
                    {teamKeys.length > 0 ? teamKeys.map(teamKey => {
                        const teamInfo = TEAMS[teamKey];
                        const teamLabel = teamInfo?.label || teamKey;
                        const jobs = teamInfo?.jobs || [];
                        const teamColor = TEAM_COLORS[teamKey] || colors.primaryBlue;
                        return (
                            <CategoryColumn
                                key={teamKey}
                                title={teamLabel}
                                subtitle={jobs.join('·')}
                                teamColor={teamColor}
                                items={filteredItems.filter(t => t.team === teamKey)}
                                onViewDetail={(item) => {
                                    setSelectedDetailItem(item);
                                    setDetailModalOpen(true);
                                }}
                                onToggleBoard={handleToggleBoard}
                                isDeployed={isDeployed}
                            />
                        );
                    }) : (
                        <div style={{ flex: 1, padding: '100px', textAlign: 'center', color: colors.textGray }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.textDark }}>검색된 결과가 없습니다.</div>
                            <div style={{ fontSize: '0.9rem', marginTop: '10px' }}>필터를 조정하여 원하는 업무를 찾아보세요.</div>
                        </div>
                    )}
                </div>
            </div>

            {isDetailModalOpen && selectedDetailItem && (
                <LibraryDetailModal
                    data={selectedDetailItem}
                    onClose={() => setDetailModalOpen(false)}
                    onAddToBoard={() => {
                        if (selectedDetailItem.setupTasks && selectedDetailItem.setupTasks.length > 0) {
                            handleToggleBoard(selectedDetailItem.setupTasks[0].id);
                        }
                        setDetailModalOpen(false);
                    }}
                    isDeployed={Boolean(selectedDetailItem.setupTasks?.[0] && isDeployed(selectedDetailItem.setupTasks[0].id))}
                />
            )}
        </div>
    );
};
