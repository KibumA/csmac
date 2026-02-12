import React, { useState } from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors, thStyle, tdStyle, tpoTag } from '../../../styles/theme';

interface ChecklistBoardProps {
    showChecklistTooltip: boolean;
    setShowChecklistTooltip: (show: boolean) => void;
    collapsedSops: Record<number, boolean>;
    setCollapsedSops: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    setInspectionModalOpen: (open: boolean) => void;
    setSelectedInspectionSopId: (id: number | null) => void;
    // New props for TPO row click functionality
    setInstructionSubject: (subject: string) => void;
    setInstructionDescription: (desc: string) => void;
    setNewTpo: (tpo: { time: string; place: string; occasion: string }) => void;
    setActiveDoSubPhase: (phase: string) => void;
    setRegistrationModalOpen: (open: boolean) => void;
    handleEdit: (id: number) => void;
    handleRemoveRegistered: (id: number) => void;
}

export const ChecklistBoard: React.FC<ChecklistBoardProps> = ({
    showChecklistTooltip,
    setShowChecklistTooltip,
    collapsedSops,
    setCollapsedSops,
    setInspectionModalOpen,
    setSelectedInspectionSopId,
    setInstructionSubject,
    setInstructionDescription,
    setNewTpo,
    setActiveDoSubPhase,
    setRegistrationModalOpen,
    handleEdit,
    handleRemoveRegistered
}) => {
    const {
        registeredTpos,
        teams,
        selectedInspectionSopId,
        searchQuery,
        setSearchQuery,
        handleRemoveSetupTask,
        handleEditSetupTask
    } = usePDCA();

    // Filter logic: Team + Search Query
    // Local State for Multi-filter
    const [selectedTeams, setSelectedTeams] = useState<string[]>(['전체']);

    const toggleTeam = (tName: string) => {
        if (tName === '전체') {
            setSelectedTeams(['전체']);
        } else {
            setSelectedTeams(prev => {
                const isAllSelected = prev.includes('전체');
                const filtered = isAllSelected ? [] : prev;

                if (filtered.includes(tName)) {
                    const next = filtered.filter(t => t !== tName);
                    return next.length === 0 ? ['전체'] : next;
                } else {
                    return [...filtered, tName];
                }
            });
        }
    };

    // Filter logic: Team + Search Query
    const filteredTpos = registeredTpos.filter(t => {
        const matchesTeam = selectedTeams.includes('전체') || selectedTeams.includes(t.team);
        if (!matchesTeam) return false;

        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            t.criteria.checklist.toLowerCase().includes(query) ||
            t.tpo.place.toLowerCase().includes(query) ||
            t.tpo.occasion.toLowerCase().includes(query) ||
            (t.setupTasks && t.setupTasks.some(taskSet => taskSet.items.map(i => i.content).join(' ').toLowerCase().includes(query)))
        );
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>업무수행 점검리스트</h2>
                    {/* Tooltip Question Mark */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div
                            onClick={() => setShowChecklistTooltip(!showChecklistTooltip)}
                            style={{
                                width: '22px',
                                height: '22px',
                                backgroundColor: colors.primaryBlue,
                                color: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'
                            }}
                        >
                            ?
                        </div>
                        {showChecklistTooltip && (
                            <div style={{
                                position: 'absolute',
                                top: '30px',
                                left: '0',
                                backgroundColor: '#333',
                                color: 'white',
                                padding: '15px',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                width: '380px',
                                zIndex: 100,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                lineHeight: '1.6',
                                textAlign: 'left',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#64B5F6', fontSize: '0.95rem' }}>업무수행 점검리스트란?</div>
                                업무수행 점검리스트는 Plan 단계에서 정의된 TPO에 맞춰 체크리스트를 세분화하여 설정하는 공간입니다. 설정된 내용은 사업장/팀/직무에 맞춰 구분됩니다.
                                <div style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    left: '11px',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '6px solid transparent',
                                    borderRight: '6px solid transparent',
                                    borderBottom: '6px solid #333'
                                }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Bar & Filter Tags Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ position: 'relative', width: '380px' }}>
                    <input
                        type="text"
                        placeholder="업무수행 점검 상황을 검색해 보세요"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 20px 12px 45px',
                            border: `1px solid ${colors.textDark}`,
                            borderRadius: '25px',
                            fontSize: '0.95rem',
                            color: colors.textDark,
                            backgroundColor: 'white'
                        }}
                    />
                    <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: colors.textGray }}>🔍</div>
                </div>

                {/* Filter Tags (Right Aligned) - Team Filter */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div
                        onClick={() => toggleTeam('전체')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: selectedTeams.includes('전체') ? colors.primaryBlue : '#F3F4F6',
                            color: selectedTeams.includes('전체') ? 'white' : colors.textDark,
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        전체
                    </div>
                    {Object.keys(teams).map(tName => (
                        <div
                            key={tName}
                            onClick={() => toggleTeam(tName)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: selectedTeams.includes(tName) ? colors.primaryBlue : '#F3F4F6',
                                color: selectedTeams.includes(tName) ? 'white' : colors.textDark,
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {teams[tName].label}
                        </div>
                    ))}
                </div>
            </div>

            {/* SOP Management Table (Slide 7) */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                overflow: 'hidden',
                marginTop: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.headerBlue, borderBottom: `2px solid ${colors.border}`, color: colors.textDark }}>
                            <th style={{ ...thStyle, width: '140px' }}>관리</th>
                            <th style={thStyle}>사업장 / 팀</th>
                            <th style={thStyle}>직무 / 업무</th>
                            <th style={{ ...thStyle, width: '220px' }}>TPO 상황 설정</th>
                            <th style={thStyle}>체크리스트 (점검 항목)</th>
                            <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>세분화설정</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTpos
                            .map((t, index) => (
                                <React.Fragment key={t.id}>
                                    <tr
                                        style={{
                                            borderBottom: t.setupTasks && t.setupTasks.length > 0 ? 'none' : `1px solid ${colors.border}`,
                                            backgroundColor: selectedInspectionSopId === t.id ? '#E3F2FD' : 'white',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <td style={{ ...tdStyle, verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(t.id); }}
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        color: colors.primaryBlue,
                                                        cursor: 'pointer',
                                                        backgroundColor: 'white',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '4px',
                                                        padding: '4px 10px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveRegistered(t.id); }}
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        color: '#D32F2F',
                                                        cursor: 'pointer',
                                                        backgroundColor: 'white',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '4px',
                                                        padding: '4px 10px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 'bold', color: colors.textDark }}>{t.workplace}</div>
                                            <div style={{ fontSize: '0.85rem', color: colors.textGray }}>{teams[t.team]?.label}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ color: colors.textDark }}>{t.job}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={tpoTag}>
                                                {t.tpo.time} | {t.tpo.place} | {t.tpo.occasion}
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {t.setupTasks && t.setupTasks.length > 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCollapsedSops(prev => ({ ...prev, [t.id]: !prev[t.id] }));
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            padding: 0,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <span style={{
                                                            width: 0,
                                                            height: 0,
                                                            borderTop: collapsedSops[t.id] ? '6px solid transparent' : '9px solid #4A90E2',
                                                            borderBottom: collapsedSops[t.id] ? '6px solid transparent' : 'none',
                                                            borderLeft: collapsedSops[t.id] ? '9px solid #4A90E2' : '6px solid transparent',
                                                            borderRight: collapsedSops[t.id] ? 'none' : '6px solid transparent',
                                                            marginLeft: collapsedSops[t.id] ? '5px' : '2px',
                                                            marginRight: '5px'
                                                        }} />
                                                    </button>
                                                )}
                                                <div style={{ fontWeight: 'bold', color: colors.textDark }}>{t.criteria.checklist}</div>
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedInspectionSopId(t.id);
                                                    setInspectionModalOpen(true);
                                                }}
                                                style={{
                                                    backgroundColor: 'white',
                                                    color: colors.primaryBlue,
                                                    border: `1px solid ${colors.primaryBlue}`,
                                                    borderRadius: '6px',
                                                    padding: '6px 16px',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = colors.primaryBlue;
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'white';
                                                    e.currentTarget.style.color = colors.primaryBlue;
                                                }}
                                            >
                                                세분화 및 설정
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Sub-rows for each configured task set */}
                                    {!collapsedSops[t.id] && t.setupTasks && t.setupTasks.length > 0 && t.setupTasks.map((taskSet, tsIdx) => (
                                        <tr key={`${t.id}-setup-${tsIdx}`} style={{
                                            backgroundColor: '#F8F9FA',
                                            borderBottom: tsIdx === t.setupTasks!.length - 1 ? `1px solid ${colors.border}` : 'none'
                                        }}>
                                            <td colSpan={1}></td>
                                            <td colSpan={3}></td>
                                            <td style={{ padding: '8px 10px 8px 30px', borderLeft: `3px solid ${colors.primaryBlue}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ color: colors.primaryBlue, fontSize: '1rem' }}>↳</span>
                                                    <div style={{
                                                        padding: '4px 10px',
                                                        backgroundColor: 'white',
                                                        border: `1px solid ${colors.border}`,
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem',
                                                        color: colors.textDark,
                                                        display: 'inline-block'
                                                    }}>
                                                        <span style={{ fontWeight: 'bold', color: colors.primaryBlue, marginRight: '5px' }}>
                                                            [설정 {tsIdx + 1}]
                                                        </span>
                                                        {taskSet.items.map((item, iOffset) => (
                                                            <span key={iOffset} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
                                                                {item.content}
                                                                {item.imageUrl && (
                                                                    <span title="이미지 있음" style={{ fontSize: '0.9rem', cursor: 'help' }}>📷</span>
                                                                )}
                                                                {iOffset < taskSet.items.length - 1 && ','}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Sub-row Action Buttons */}
                                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditSetupTask(t.id, taskSet.id); }}
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                color: colors.primaryBlue,
                                                                cursor: 'pointer',
                                                                backgroundColor: 'white',
                                                                border: `1px solid ${colors.border}`,
                                                                borderRadius: '4px',
                                                                padding: '2px 8px',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveSetupTask(taskSet.id); }}
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                color: '#D32F2F',
                                                                cursor: 'pointer',
                                                                backgroundColor: 'white',
                                                                border: `1px solid ${colors.border}`,
                                                                borderRadius: '4px',
                                                                padding: '2px 8px',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        {filteredTpos.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: colors.textGray }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
                                    <div>등록된 점검 리스트가 없습니다.</div>
                                    <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>Plan 단계에서 새로운 TPO를 등록해주세요.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
