'use client';

import React from 'react';
import { TpoData } from '@csmac/types';
import { usePDCA } from '../../context/PDCAContext';
import {
    colors,
    selectStyle,
    pillButtonStyle,
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
        selectedCriteria,
        selectedMatching, handleMatchingSelect,
        registeredTpos,
        handleRegister,
        handleRemoveRegistered, handleEdit,
        isEditing,
        showTpoTooltip, setShowTpoTooltip,
        currentCriteria,
        searchQuery, setSearchQuery,
        placeOccasionMapping
    } = usePDCA();
    const [showStandardImageTooltip, setShowStandardImageTooltip] = React.useState(false);

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                    {[
                        { label: '브랜드', value: 'Grand Walkerhill' },
                        { label: '사업장', value: workplace, setter: setWorkplace, options: ['소노벨 천안', '소노벨 경주'] },
                        { label: '팀', value: team, setter: (v: string) => { setTeam(v); setJob(teams[v].jobs[0]); }, options: Object.keys(teams).map(k => ({ val: k, lab: teams[k].label })) },
                        { label: '직무', value: job, setter: setJob, options: teams[team].jobs }
                    ].map((cfg, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: colors.textGray }}>{cfg.label}</label>
                            <select
                                style={{ ...selectStyle, width: '100%', borderRadius: '8px', padding: '10px' }}
                                value={typeof cfg.value === 'string' ? cfg.value : ''}
                                onChange={(e) => cfg.setter && cfg.setter(e.target.value)}
                                disabled={!cfg.setter}
                            >
                                {cfg.options ? (
                                    Array.isArray(cfg.options) ? (
                                        cfg.options.map(opt => {
                                            const val = typeof opt === 'string' ? opt : opt.val;
                                            const lab = typeof opt === 'string' ? opt : opt.lab;
                                            return <option key={val} value={val}>{lab}</option>;
                                        })
                                    ) : null
                                ) : (
                                    <option>{cfg.value}</option>
                                )}
                            </select>
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '25px' }}>
                    <input
                        type="text"
                        placeholder="직무, 상황, 장소 등 키워드 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 15px 12px 40px',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            backgroundColor: 'white'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textGray }}>🔍</span>
                </div>

                {/* --- REFACTORED INPUT PANELS --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* TPO Row */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '1.2rem', color: colors.textDark }}>📋</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>TPO 설정</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(300px, 1.5fr) minmax(300px, 1.5fr)', gap: '30px' }}>
                            {[
                                { category: 'time', label: 'Time', icon: '🕒' },
                                { category: 'place', label: 'Place', icon: '📍' },
                                { category: 'occasion', label: 'Occasion', icon: '❕' }
                            ].map((cfg) => (
                                <div key={cfg.category}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '1rem', color: colors.textGray }}>{cfg.icon}</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: colors.textDark }}>{cfg.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {(() => {
                                            const allOptions = tpoOptions[cfg.category as keyof typeof tpoOptions];
                                            if (cfg.category !== 'occasion' || !selectedTpo.place) {
                                                return allOptions.map((opt: string) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => handleTpoSelect(cfg.category as 'time' | 'place' | 'occasion', opt)}
                                                        style={{
                                                            padding: '5px 15px',
                                                            borderRadius: '20px',
                                                            border: `1px solid ${selectedTpo[cfg.category as keyof TpoData] === opt ? colors.primaryBlue : '#E9ECEF'}`,
                                                            backgroundColor: selectedTpo[cfg.category as keyof TpoData] === opt ? colors.primaryBlue : 'white',
                                                            color: selectedTpo[cfg.category as keyof TpoData] === opt ? 'white' : colors.textGray,
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            boxShadow: selectedTpo[cfg.category as keyof TpoData] === opt ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                                        }}
                                                    >
                                                        {opt}
                                                    </button>
                                                ));
                                            }

                                            // Occasion recommendation logic
                                            const recommended = placeOccasionMapping[selectedTpo.place] || [];
                                            const recommendedOptions = allOptions.filter((opt: string) => recommended.includes(opt));
                                            const otherOptions = allOptions.filter((opt: string) => !recommended.includes(opt));

                                            return (
                                                <>
                                                    {recommendedOptions.map((opt: string) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => handleTpoSelect('occasion', opt)}
                                                            style={{
                                                                padding: '5px 15px',
                                                                borderRadius: '20px',
                                                                border: `1px solid ${selectedTpo.occasion === opt ? colors.primaryBlue : colors.primaryBlue}`,
                                                                backgroundColor: selectedTpo.occasion === opt ? colors.primaryBlue : '#F0F7FF',
                                                                color: selectedTpo.occasion === opt ? 'white' : colors.primaryBlue,
                                                                fontSize: '0.8rem',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                boxShadow: selectedTpo.occasion === opt ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                                            }}
                                                        >
                                                            ✨ {opt}
                                                        </button>
                                                    ))}
                                                    {otherOptions.map((opt: string) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => handleTpoSelect('occasion', opt)}
                                                            style={{
                                                                padding: '5px 15px',
                                                                borderRadius: '20px',
                                                                border: `1px solid ${selectedTpo.occasion === opt ? colors.primaryBlue : '#E9ECEF'}`,
                                                                backgroundColor: selectedTpo.occasion === opt ? colors.primaryBlue : 'white',
                                                                color: selectedTpo.occasion === opt ? 'white' : colors.textGray,
                                                                fontSize: '0.8rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                opacity: 0.6
                                                            }}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Criteria & Checklist Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* 체크리스트 Panel */}
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <span style={{ fontSize: '1.2rem' }}>✅</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>체크리스트</span>
                                <span style={{ fontSize: '0.7rem', color: colors.textGray, marginLeft: 'auto' }}>필수 항목</span>
                            </div>

                            <div style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Input field and Add button */}
                                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${colors.border}` }}>
                                    <input
                                        type="text"
                                        placeholder="항목 입력"
                                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem' }}
                                    />
                                    <button style={{
                                        backgroundColor: colors.primaryBlue,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        width: '24px',
                                        height: '24px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem'
                                    }}>+</button>
                                </div>

                                {/* Checklist Items */}
                                <div style={{ height: '130px', overflowY: 'auto', padding: '12px' }}>
                                    {currentCriteria ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {currentCriteria.items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <input type="checkbox" defaultChecked readOnly style={{ accentColor: colors.primaryBlue }} />
                                                    <span style={{ fontSize: '0.85rem', color: colors.textDark }}>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: colors.textGray }}>TPO를 선택하세요</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 기준 이미지 Panel */}
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🖼️</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>기준 이미지</span>

                                {/* Tooltip Question Mark */}
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <div
                                        onClick={() => setShowStandardImageTooltip(!showStandardImageTooltip)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            backgroundColor: colors.primaryBlue,
                                            color: 'white',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
                                            marginLeft: '4px'
                                        }}
                                    >
                                        ?
                                    </div>
                                    {showStandardImageTooltip && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '30px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: '#333',
                                            color: 'white',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            width: '320px',
                                            zIndex: 100,
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                            lineHeight: '1.4',
                                            textAlign: 'left'
                                        }}>
                                            체크리스트에 있는 항목에 대응하는 이미지/사진을 등록할 때, 하나의 이미지가 하나의 체크리스트 항목에 1:1로 대응해야 함. 그런데 그걸 어떻게 연결시킬것인가? 이미지 업로드 순번을 체크리스트의 항목 순번에 따라서 연결? 다른 방법 있나?
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-6px',
                                                left: '50%',
                                                marginLeft: '-6px',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '6px solid transparent',
                                                borderRight: '6px solid transparent',
                                                borderTop: '6px solid #333'
                                            }} />
                                        </div>
                                    )}
                                </div>

                                <span style={{ fontSize: '0.7rem', color: colors.textGray, marginLeft: 'auto' }}>최대 5장</span>
                            </div>
                            <div style={{
                                height: '180px',
                                border: `2px dashed ${colors.border}`,
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#F8F9FA',
                                cursor: 'pointer'
                            }}>
                                <span style={{ fontSize: '2rem', color: colors.border }}>☁️</span>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: colors.textDark, marginTop: '10px' }}>이미지 업로드</div>
                                <div style={{ fontSize: '0.7rem', color: colors.textGray }}>드래그 앤 드롭</div>
                            </div>
                        </div>
                    </div>

                    {/* 업무요소 매칭 (Bottom of groupings) */}
                    <div style={{ padding: '20px', backgroundColor: '#F8F9FA', borderRadius: '12px', border: `1px solid #E9ECEF` }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '15px', color: colors.textDark }}>업무요소 매칭</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                            {[
                                { name: '정확성', id: 'accuracy', icon: '🎯' },
                                { name: '신속성', id: 'speed', icon: '⚡' },
                                { name: '충성도', id: 'loyalty', icon: '💎' },
                                { name: '업무공유', id: 'sharing', icon: '💬' }
                            ].map((elem) => (
                                <button
                                    key={elem.id}
                                    type="button"
                                    onClick={() => handleMatchingSelect('elements', elem.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '12px',
                                        backgroundColor: selectedMatching.elements?.includes(elem.name) ? colors.primaryBlue : 'white',
                                        color: selectedMatching.elements?.includes(elem.name) ? 'white' : colors.textDark,
                                        border: `1px solid ${selectedMatching.elements?.includes(elem.name) ? colors.primaryBlue : colors.border}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{elem.icon}</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{elem.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
                <button
                    type="button"
                    onClick={handleRegister}
                    style={{ ...actionButtonStyle, backgroundColor: colors.primaryBlue, color: 'white' }}
                >
                    {isEditing !== null ? '수정 완료' : '등록하기'}
                </button>
            </div>

            {/* --- REGISTERED LIST SECTION --- */}
            <div style={{ marginTop: '40px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: colors.textDark }}>TPO 등록 리스트</h2>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${colors.border}`, minWidth: '940px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#CFD9EA' }}>
                                <th style={{ ...thStyle, width: '100px' }}>관리</th>
                                <th style={thStyle}>사업장 / 팀</th>
                                <th style={thStyle}>직무 / 업무</th>
                                <th style={{ ...thStyle, width: '200px' }}>TPO 상황 설정</th>
                                <th style={thStyle}>체크리스트</th>
                                <th style={thStyle}>업무요소</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registeredTpos.length > 0 ? (
                                registeredTpos.map((item) => (
                                    <tr key={item.id} style={{ backgroundColor: isEditing === item.id ? colors.lightBlue : 'transparent' }}>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button onClick={() => handleEdit(item.id)} style={{ fontSize: '0.75rem', color: colors.primaryBlue, cursor: 'pointer' }}>수정</button>
                                                <button onClick={() => handleRemoveRegistered(item.id)} style={{ fontSize: '0.75rem', color: '#D32F2F', cursor: 'pointer' }}>삭제</button>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 'bold' }}>{item.workplace}</div>
                                            <div style={{ fontSize: '0.85rem' }}>{teams[item.team]?.label || item.team}</div>
                                        </td>
                                        <td style={tdStyle}>{item.job}</td>
                                        <td style={tdStyle}>
                                            <div style={tpoTag}>{item.tpo.time} | {item.tpo.place} | {item.tpo.occasion}</div>
                                        </td>
                                        <td style={tdStyle}>{item.criteria.checklist}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {item.matching.elements?.map(e => <span key={e} style={itemTag}>{e}</span>)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '40px' }}>등록된 항목이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
