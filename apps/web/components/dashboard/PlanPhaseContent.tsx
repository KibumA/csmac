'use client';

import React from 'react';
import { usePDCA } from '../../context/PDCAContext';
import {
    colors,
    selectStyle,
    inputPanelStyle,
    panelTitleRow,
    panelTitleText,
    pillButtonStyle,
    tpoBtnStyle,
    dropdownMenuStyle,
    dropdownItemStyle,
    actionButtonStyle,
    thStyle,
    tdStyle,
    tpoTag,
    itemTag
} from '../../styles/theme';

export default function PlanPhaseContent() {
    const {
        workplace, setWorkplace,
        team, setTeam,
        job, setJob,
        teams,
        tpoOptions,
        criteriaOptions,
        activeDropdown, setActiveDropdown,
        selectedTpo, handleTpoSelect,
        selectedCriteria, handleCriteriaSelect,
        selectedMatching, handleMatchingSelect,
        registeredTpos,
        handleRegister,
        handleRemoveRegistered, handleEdit,
        isEditing,
        showTpoTooltip, setShowTpoTooltip,
        currentCriteria
    } = usePDCA();

    return (
        <>
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.2rem', color: colors.textDark, marginBottom: '8px' }}>
                    <span style={{ color: colors.primaryBlue, fontWeight: 'bold' }}>Plan.</span> 상황별 업무 점검 기준을 TPO로 설정하면, 업무 생산성이 올라갑니다!
                </h1>
            </header>

            {/* --- GROUPED SETTINGS SECTION --- */}
            <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '25px', backgroundColor: '#FBFCFD', marginBottom: '40px' }}>
                {/* Dropdowns Section */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', alignItems: 'center', backgroundColor: '#F3F5F7', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', color: colors.textDark, fontSize: '0.9rem' }}>사업장 설정</label>
                        <select
                            style={selectStyle}
                            value={workplace}
                            onChange={(e) => setWorkplace(e.target.value)}
                        >
                            <option value="소노벨 천안">소노벨 천안</option>
                            <option value="소노벨 경주">소노벨 경주</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', color: colors.textDark, fontSize: '0.9rem' }}>팀 설정</label>
                        <select
                            style={selectStyle}
                            value={team}
                            onChange={(e) => {
                                const newTeam = e.target.value;
                                setTeam(newTeam);
                                setJob(teams[newTeam].jobs[0]);
                            }}
                        >
                            <option value="front">프론트</option>
                            <option value="housekeeping">객실관리</option>
                            <option value="facility">시설</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', color: colors.textDark, fontSize: '0.9rem' }}>직무 설정</label>
                        <select
                            style={selectStyle}
                            value={job}
                            onChange={(e) => setJob(e.target.value)}
                        >
                            {teams[team].jobs.map((j: string) => (
                                <option key={j} value={j}>{j}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* --- SEQUENTIAL INPUT PANELS --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {/* Panel 1: 업무수행 상황 설정 */}
                    <div style={inputPanelStyle}>
                        <div style={panelTitleRow}>
                            <span style={panelTitleText}>업무수행 상황 설정</span>
                            <button style={pillButtonStyle}>+ 상황 추가</button>
                        </div>
                        <div style={{ border: `1px solid ${colors.textDark}`, borderRadius: '15px', padding: '15px', position: 'relative', minHeight: '140px', backgroundColor: 'white', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: colors.textDark, lineHeight: '1.4' }}>
                                <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>직무별 반복되는</span> 일상업무<br />
                                <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>상황을 TPO로</span> 설정해 주세요
                            </p>

                            {/* TPO Selectors Floating Below */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', position: 'absolute', bottom: '-20px', left: '15px', zIndex: 10 }}>
                                {/* Time Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
                                        style={{ ...tpoBtnStyle, borderColor: selectedTpo.time ? colors.primaryBlue : colors.textDark, color: selectedTpo.time ? colors.primaryBlue : colors.textGray }}
                                    >
                                        {selectedTpo.time || '시간'} <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: colors.border }}>∨</span>
                                    </div>
                                    {activeDropdown === 'time' && (
                                        <div style={dropdownMenuStyle}>
                                            {tpoOptions.time.map((opt: string) => (
                                                <div key={opt} onClick={() => handleTpoSelect('time', opt)} style={dropdownItemStyle}>{opt}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Place Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => setActiveDropdown(activeDropdown === 'place' ? null : 'place')}
                                        style={{ ...tpoBtnStyle, borderColor: selectedTpo.place ? colors.primaryBlue : colors.textDark, color: selectedTpo.place ? colors.primaryBlue : colors.textGray }}
                                    >
                                        {selectedTpo.place || '장소'} <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: colors.border }}>∨</span>
                                    </div>
                                    {activeDropdown === 'place' && (
                                        <div style={dropdownMenuStyle}>
                                            {tpoOptions.place.map((opt: string) => {
                                                const hasCriteria = !selectedTpo.occasion || criteriaOptions[`${opt}|${selectedTpo.occasion}`];
                                                return (
                                                    <div
                                                        key={opt}
                                                        onClick={() => handleTpoSelect('place', opt)}
                                                        style={{ ...dropdownItemStyle, opacity: hasCriteria ? 1 : 0.5 }}
                                                    >
                                                        {opt} {!hasCriteria && '(선택 불가)'}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Occasion Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => setActiveDropdown(activeDropdown === 'occasion' ? null : 'occasion')}
                                        style={{ ...tpoBtnStyle, borderColor: selectedTpo.occasion ? colors.primaryBlue : colors.textDark, color: selectedTpo.occasion ? colors.primaryBlue : colors.textGray }}
                                    >
                                        {selectedTpo.occasion || '상황'} <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: colors.border }}>∨</span>
                                    </div>
                                    {activeDropdown === 'occasion' && (
                                        <div style={dropdownMenuStyle}>
                                            {tpoOptions.occasion
                                                .filter((opt: string) => !selectedTpo.place || criteriaOptions[`${selectedTpo.place}|${opt}`])
                                                .map((opt: string) => (
                                                    <div key={opt} onClick={() => handleTpoSelect('occasion', opt)} style={dropdownItemStyle}>{opt}</div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: 점검 기준 설정 */}
                    <div style={inputPanelStyle}>
                        <div style={panelTitleRow}>
                            <span style={panelTitleText}>점검 기준 설정</span>
                            <button style={pillButtonStyle}>+ 점검기준 추가</button>
                        </div>
                        <div style={{ border: `1px solid ${colors.textDark}`, borderRadius: '15px', padding: '15px', position: 'relative', minHeight: '140px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: colors.textDark, lineHeight: '1.4' }}>
                                <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>상황별 점검 질문(체크리스트)</span>과<br />
                                <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>세부 점검 항목</span>을 설정해 주세요
                            </p>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', position: 'absolute', bottom: '-20px', left: '15px', zIndex: 10 }}>
                                {/* Checklist Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => setActiveDropdown(activeDropdown === 'checklist' ? null : 'checklist')}
                                        style={{ ...tpoBtnStyle, borderColor: selectedCriteria.checklist ? colors.primaryBlue : colors.textDark, color: selectedCriteria.checklist ? colors.primaryBlue : colors.textGray, minWidth: '120px' }}
                                    >
                                        {selectedCriteria.checklist ? (selectedCriteria.checklist.length > 10 ? selectedCriteria.checklist.substring(0, 10) + '...' : selectedCriteria.checklist) : '체크리스트 질문'} <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: colors.border }}>∨</span>
                                    </div>
                                    {activeDropdown === 'checklist' && (
                                        <div style={{ ...dropdownMenuStyle, width: '250px' }}>
                                            {currentCriteria ? (
                                                <div onClick={() => handleCriteriaSelect('checklist', currentCriteria.checklist)} style={dropdownItemStyle}>{currentCriteria.checklist}</div>
                                            ) : (
                                                <div style={{ ...dropdownItemStyle, color: colors.textGray, cursor: 'default' }}>
                                                    {selectedTpo.place && selectedTpo.occasion
                                                        ? '등록된 점검 기준이 없습니다.'
                                                        : 'TPO(장소/상황)를 먼저 선택해 주세요'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Items Dropdown (Multi-select) */}
                                <div style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => setActiveDropdown(activeDropdown === 'criteriaItems' ? null : 'criteriaItems')}
                                        style={{ ...tpoBtnStyle, borderColor: selectedCriteria.items.length > 0 ? colors.primaryBlue : colors.textDark, color: selectedCriteria.items.length > 0 ? colors.primaryBlue : colors.textGray, minWidth: '120px' }}
                                    >
                                        {selectedCriteria.items.length > 0 ? `항목 ${selectedCriteria.items.length}개 선택` : '세부 점검 항목'} <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: colors.border }}>∨</span>
                                    </div>
                                    {activeDropdown === 'criteriaItems' && (
                                        <div style={{ ...dropdownMenuStyle, width: '250px' }}>
                                            {currentCriteria ? (
                                                currentCriteria.items.map((opt: string) => (
                                                    <div
                                                        key={opt}
                                                        onClick={() => handleCriteriaSelect('criteriaItems', opt)}
                                                        style={{
                                                            ...dropdownItemStyle,
                                                            backgroundColor: selectedCriteria.items.includes(opt) ? colors.lightBlue : 'transparent',
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        }}
                                                    >
                                                        {opt}
                                                        {selectedCriteria.items.includes(opt) && <span style={{ color: colors.primaryBlue }}>✓</span>}
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ ...dropdownItemStyle, color: colors.textGray, cursor: 'default' }}>
                                                    {selectedTpo.place && selectedTpo.occasion
                                                        ? '등록된 세부 항목이 없습니다.'
                                                        : 'TPO(장소/상황)를 먼저 선택해 주세요'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: 업무요소 매칭 */}
                    <div style={inputPanelStyle}>
                        <div style={panelTitleRow}>
                            <span style={panelTitleText}>업무요소 <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>매칭</span></span>
                        </div>
                        <div style={{ border: `1px solid ${colors.textDark}`, borderRadius: '15px', padding: '15px', position: 'relative', minHeight: '140px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: colors.textDark, lineHeight: '1.4' }}>
                                <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>이행근거 요구(AI/육안)</span>와<br />
                                <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textDecorationStyle: 'dotted' }}>검증방법</span>을 업무요소와 매칭해 주세요
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', position: 'absolute', bottom: '-20px', left: '15px', zIndex: 10 }}>
                                {/* Evidence Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => setActiveDropdown(activeDropdown === 'evidence' ? null : 'evidence')}
                                        style={{ ...tpoBtnStyle, borderColor: selectedMatching.evidence ? colors.primaryBlue : colors.textDark, color: selectedMatching.evidence ? colors.primaryBlue : colors.textGray, minWidth: '100px' }}
                                    >
                                        {selectedMatching.evidence || '이행근거'} <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: colors.border }}>∨</span>
                                    </div>
                                    {activeDropdown === 'evidence' && (
                                        <div style={dropdownMenuStyle}>
                                            {['AI', '육안'].map(opt => (
                                                <div key={opt} onClick={() => handleMatchingSelect('evidence', opt)} style={dropdownItemStyle}>{opt}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Method Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => setActiveDropdown(activeDropdown === 'method' ? null : 'method')}
                                        style={{ ...tpoBtnStyle, borderColor: selectedMatching.method ? colors.primaryBlue : colors.textDark, color: selectedMatching.method ? colors.primaryBlue : colors.textGray, minWidth: '100px' }}
                                    >
                                        {selectedMatching.method || '검증방법'} <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: colors.border }}>∨</span>
                                    </div>
                                    {activeDropdown === 'method' && (
                                        <div style={dropdownMenuStyle}>
                                            {['지정'].map(opt => (
                                                <div key={opt} onClick={() => handleMatchingSelect('method', opt)} style={dropdownItemStyle}>{opt}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <button
                            onMouseEnter={() => setShowTpoTooltip(true)}
                            onMouseLeave={() => setShowTpoTooltip(false)}
                            style={{ ...actionButtonStyle, backgroundColor: 'white', color: colors.primaryBlue }}
                        >
                            상황 추가
                        </button>
                        {showTpoTooltip && (
                            <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                right: 0,
                                backgroundColor: colors.textDark,
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                width: '280px',
                                marginBottom: '10px',
                                zIndex: 1000,
                                lineHeight: '1.4',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                            }}>
                                설정된 '업무수행 상황 + 점검 기준 + 업무요소 매칭' 세트를 리스트에 추가하는 기능입니다. (현재 미구현)
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '20px',
                                    borderWidth: '5px',
                                    borderStyle: 'solid',
                                    borderColor: `${colors.textDark} transparent transparent transparent`
                                }}></div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleRegister}
                        style={{ ...actionButtonStyle, backgroundColor: colors.primaryBlue, color: 'white' }}
                    >
                        {isEditing !== null ? '수정 완료' : '등록하기'}
                    </button>
                </div>
            </div>

            {/* --- REGISTERED LIST SECTION --- */}
            <div style={{ marginTop: '40px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: colors.textDark }}>TPO 등록 리스트</h2>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${colors.border}`, minWidth: '940px' }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.headerBlue }}>
                            <th style={{ ...thStyle, width: '100px' }}>관리</th>
                            <th style={thStyle}>사업장 / 팀</th>
                            <th style={thStyle}>직무 / 업무</th>
                            <th style={{ ...thStyle, width: '200px' }}>TPO 상황 설정</th>
                            <th style={thStyle}>점검 체크리스트 (질문)</th>
                            <th style={thStyle}>점검 항목</th>
                            <th style={thStyle}>표준 이미지 / 업무요소</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registeredTpos.length > 0 ? (
                            registeredTpos.map((item) => (
                                <tr key={item.id} style={{ backgroundColor: isEditing === item.id ? colors.lightBlue : 'transparent' }}>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleEdit(item.id)}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: colors.primaryBlue,
                                                    border: `1px solid ${colors.primaryBlue}`,
                                                    borderRadius: '4px',
                                                    backgroundColor: 'white',
                                                    cursor: 'pointer',
                                                    padding: '4px 8px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleRemoveRegistered(item.id)}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: '#D32F2F',
                                                    border: '1px solid #D32F2F',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'white',
                                                    cursor: 'pointer',
                                                    padding: '4px 8px',
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 'bold', color: colors.primaryBlue }}>
                                            {item.workplace}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: colors.textDark, marginTop: '2px' }}>
                                            {teams[item.team]?.label || item.team}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 'bold' }}>{item.job}</div>
                                        <div style={{ fontSize: '0.9rem', color: colors.textGray }}>{item.tpo.time}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={tpoTag}>시간: {item.tpo.time || '지정되지 않음'}</div>
                                        <div style={tpoTag}>장소: {item.tpo.place || '지정되지 않음'}</div>
                                        <div style={tpoTag}>상황: {item.tpo.occasion || '지정되지 않음'}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: '0.95rem' }}>{item.criteria.checklist}</div>
                                        <div style={{ marginTop: '5px', fontSize: '0.8rem', color: colors.primaryBlue }}>이행여부: 확인</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {item.criteria.items.map((it: string) => (
                                                <span key={it} style={itemTag}>{it}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ marginBottom: '5px', fontSize: '0.85rem', color: colors.textGray }}>이행근거: {item.matching.evidence || '지정되지 않음'}</div>
                                        <div style={{
                                            padding: '4px 8px',
                                            backgroundColor: '#EEEEEE',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            display: 'inline-block'
                                        }}>
                                            검증방법: {item.matching.method || '지정되지 않음'}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '40px', color: colors.textGray }}>
                                    등록된 상황이 없습니다. 상단에서 설정 후 '등록하기' 버튼을 눌러주세요.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
