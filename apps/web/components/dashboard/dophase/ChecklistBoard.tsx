import React from 'react';
import { usePDCA } from '../../../context/PDCAContext';
import { colors } from '../../../styles/theme';

interface ChecklistBoardProps {
    showChecklistTooltip: boolean;
    setShowChecklistTooltip: (show: boolean) => void;
    collapsedSops: Record<number, boolean>;
    setCollapsedSops: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    setInspectionModalOpen: (open: boolean) => void;
    setSelectedInspectionSopId: (id: number | null) => void;
}

export const ChecklistBoard: React.FC<ChecklistBoardProps> = ({
    showChecklistTooltip,
    setShowChecklistTooltip,
    collapsedSops,
    setCollapsedSops,
    setInspectionModalOpen,
    setSelectedInspectionSopId
}) => {
    const {
        registeredTpos,
        team,
        teams,
        selectedInspectionSopId,
        searchQuery,
        setSearchQuery
    } = usePDCA();

    // Filter logic: Team + Search Query
    const filteredTpos = registeredTpos.filter(t => {
        if (t.team !== team) return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            t.criteria.checklist.toLowerCase().includes(query) ||
            t.tpo.place.toLowerCase().includes(query) ||
            t.tpo.occasion.toLowerCase().includes(query) ||
            (t.setupTasks && t.setupTasks.some(taskSet => taskSet.join(' ').toLowerCase().includes(query)))
        );
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: colors.textDark }}>객실팀 업무수행 점검리스트</h2>
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
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '8px 25px', backgroundColor: colors.primaryBlue, color: 'white', border: 'none', borderRadius: '25px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>수정하기</button>
                    <button style={{ padding: '8px 25px', backgroundColor: '#3F51B5', color: 'white', border: 'none', borderRadius: '25px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>등록하기</button>
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

                {/* Filter Tags (Right Aligned) */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[
                        { label: '마감업무', id: 1 },
                        { label: '인스펙션', id: 2 },
                        { label: '린넨물 관리', id: 3 }
                    ].map(tag => (
                        <div key={tag.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#F3F4F6',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: colors.textDark,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}>
                            {tag.label} <span style={{ fontSize: '0.8rem', color: colors.textGray }}>✕</span>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F8F9FA', borderBottom: `2px solid ${colors.border}`, color: colors.textDark }}>
                            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '100px' }}>사업장</th>
                            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '120px' }}>팀/직무</th>
                            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '80px' }}>Time</th>
                            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '100px' }}>Place</th>
                            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '150px' }}>Occasion</th>
                            <th style={{ padding: '15px 10px', fontWeight: 'bold', textAlign: 'left' }}>체크리스트 (점검 항목)</th>
                            <th style={{ padding: '15px 10px', fontWeight: 'bold', width: '100px' }}>세분화설정</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTpos
                            .map((t, index) => (
                                <React.Fragment key={t.id}>
                                    <tr style={{
                                        borderBottom: t.setupTasks && t.setupTasks.length > 0 ? 'none' : `1px solid ${colors.border}`,
                                        backgroundColor: selectedInspectionSopId === t.id ? '#E3F2FD' : 'white',
                                        transition: 'background-color 0.2s'
                                    }}>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{t.workplace}</td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <div style={{ fontWeight: 'bold', color: colors.textDark }}>{teams[t.team]?.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: colors.textGray }}>{t.job}</div>
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '4px', backgroundColor: '#E3F2FD', color: colors.primaryBlue, fontSize: '0.8rem', fontWeight: 'bold' }}>{t.tpo.time}</span>
                                        </td>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: colors.textDark }}>{t.tpo.place}</td>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: colors.primaryBlue }}>{t.tpo.occasion}</td>
                                        <td style={{ padding: '15px 10px', textAlign: 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                {t.setupTasks && t.setupTasks.length > 0 && (
                                                    <button
                                                        onClick={() => setCollapsedSops(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            padding: 0,
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            color: colors.primaryBlue,
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {collapsedSops[t.id] ? '▶' : '▼'}
                                                    </button>
                                                )}
                                                <div style={{ fontWeight: 'bold', color: colors.textDark }}>{t.criteria.checklist}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <button
                                                onClick={() => {
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
                                            <td colSpan={5}></td>
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
                                                        {taskSet.join(', ')}
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
                                <td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: colors.textGray }}>
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
