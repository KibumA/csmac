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
        placeOccasionMapping,
        addChecklistItem, removeChecklistItem, updateChecklistItemImage,
        isSubmitting
    } = usePDCA();
    const [newItemInput, setNewItemInput] = React.useState('');

    // --- Local Filter States for Registration List ---
    const [localSearchQuery, setLocalSearchQuery] = React.useState('');
    const [listFilterTeam, setListFilterTeam] = React.useState('전체');
    const [listFilterJob, setListFilterJob] = React.useState('전체');

    // Aggregate all unique jobs across all teams
    const allUniqueJobs = React.useMemo(() => {
        const set = new Set<string>();
        Object.values(teams).forEach(t => {
            t.jobs.forEach(j => set.add(j));
        });
        return Array.from(set).sort();
    }, [teams]);

    // Filter logic for the Registration List
    const filteredList = React.useMemo(() => {
        return registeredTpos.filter(item => {
            // 1. Workplace Filter (Global)
            if (item.workplace !== workplace) return false;

            // 2. Team Filter (Local)
            if (listFilterTeam !== '전체' && item.team !== listFilterTeam) return false;

            // 3. Job Filter (Local)
            if (listFilterJob !== '전체' && item.job !== listFilterJob) return false;

            // 4. Search Filter (Local)
            if (!localSearchQuery) return true;
            const query = localSearchQuery.toLowerCase();
            return (
                item.job.toLowerCase().includes(query) ||
                item.tpo.place.toLowerCase().includes(query) ||
                item.tpo.occasion.toLowerCase().includes(query) ||
                item.criteria.checklist.toLowerCase().includes(query)
            );
        });
    }, [registeredTpos, workplace, listFilterTeam, listFilterJob, localSearchQuery]);

    return (
        <>
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: colors.textDark, marginBottom: '8px' }}>
                    <span style={{ color: colors.primaryBlue }}>Plan.</span> 상황별 업무 점검 기준 설정
                </h1>
                <p style={{ color: '#64748B', fontSize: '1rem' }}>TPO로 설정하면, 업무 생산성이 올라갑니다!</p>
            </header>

            {/* --- GROUPED SETTINGS SECTION --- */}
            <div style={{ border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '25px', backgroundColor: '#FBFCFD', marginBottom: '40px' }}>
                {/* Dropdowns Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                    {[
                        { label: '브랜드', value: 'Grand Walkerhill' },
                        { label: '사업장', value: workplace, setter: setWorkplace, options: ['소노벨 천안', '소노벨 경주'] },
                        {
                            label: '팀',
                            value: team,
                            setter: (v: string) => {
                                setTeam(v);
                                if (v !== '전체' && teams[v]) {
                                    setJob(teams[v].jobs[0]);
                                } else {
                                    setJob('전체');
                                }
                            },
                            options: [
                                { val: '전체', lab: '전체' },
                                ...Object.keys(teams).map(k => ({ val: k, lab: teams[k].label }))
                            ]
                        },
                        {
                            label: '직무',
                            value: job,
                            setter: setJob,
                            options: team !== '전체' && teams[team] ? teams[team].jobs : ['전체']
                        }
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

                {/* Search Bar (Decoupled) */}
                <div style={{ position: 'relative', marginBottom: '25px' }}>
                    <input
                        type="text"
                        placeholder="등록 양식용 직무, 상황 등 검색..."
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
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
                                <span style={{ fontSize: '0.7rem', color: colors.textGray, marginLeft: 'auto' }}>항목 추가 가능</span>
                            </div>

                            <div style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Input field and Add button */}
                                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${colors.border}` }}>
                                    <input
                                        type="text"
                                        placeholder="항목 입력 후 + 클릭"
                                        value={newItemInput}
                                        onChange={(e) => setNewItemInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && newItemInput.trim()) {
                                                addChecklistItem(newItemInput);
                                                setNewItemInput('');
                                            }
                                        }}
                                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem' }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (newItemInput.trim()) {
                                                addChecklistItem(newItemInput);
                                                setNewItemInput('');
                                            }
                                        }}
                                        style={{
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
                                        }}
                                    >+</button>
                                </div>

                                {/* Checklist Items */}
                                <div style={{ height: '200px', overflowY: 'auto', padding: '12px' }}>
                                    {selectedCriteria.items.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {selectedCriteria.items.map((item, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'flex-start',
                                                    padding: '8px',
                                                    backgroundColor: '#F8F9FA',
                                                    borderRadius: '6px'
                                                }}>
                                                    <span style={{ fontSize: '0.85rem', color: colors.textDark, flex: 1, paddingTop: '4px' }}>
                                                        {item.content}
                                                    </span>

                                                    {/* Image Upload & Preview */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                        {item.imageUrl || item.imageFile ? (
                                                            <div style={{ position: 'relative' }}>
                                                                <img
                                                                    src={item.imageFile ? URL.createObjectURL(item.imageFile) : item.imageUrl}
                                                                    alt="Preview"
                                                                    style={{
                                                                        width: '50px',
                                                                        height: '50px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px',
                                                                        border: `1px solid ${colors.border}`
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : null}
                                                        <label style={{
                                                            backgroundColor: colors.primaryBlue,
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.7rem'
                                                        }}>
                                                            📷
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                style={{ display: 'none' }}
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        updateChecklistItemImage(idx, file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>

                                                    <button
                                                        onClick={() => removeChecklistItem(idx)}
                                                        style={{
                                                            backgroundColor: '#FEE',
                                                            color: '#D32F2F',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            width: '24px',
                                                            height: '24px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >×</button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: colors.textGray }}>체크리스트 항목을 추가하세요</span>
                                    )}
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
                        disabled={isSubmitting}
                        style={{
                            ...actionButtonStyle,
                            backgroundColor: isSubmitting ? '#A0C4FF' : colors.primaryBlue,
                            color: 'white',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSubmitting ? '처리 중...' : (isEditing !== null ? '수정 완료' : '등록하기')}
                    </button>
                </div>

                {/* --- REGISTERED LIST SECTION --- */}
                <div style={{ marginTop: '40px' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: colors.textDark }}>TPO 등록 리스트</h2>
                            <p style={{ fontSize: '0.8rem', color: colors.textGray, marginTop: '4px' }}>{workplace} 사업장의 등록 현황입니다.</p>
                        </div>

                        {/* List Filters */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => {
                                            setListFilterTeam('전체');
                                            setListFilterJob('전체');
                                        }}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '15px',
                                            border: `1px solid ${listFilterTeam === '전체' ? colors.primaryBlue : colors.border}`,
                                            backgroundColor: listFilterTeam === '전체' ? colors.primaryBlue : 'white',
                                            color: listFilterTeam === '전체' ? 'white' : colors.textGray,
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        전체
                                    </button>
                                    {Object.keys(teams).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                setListFilterTeam(t);
                                                setListFilterJob('전체');
                                            }}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '15px',
                                                border: `1px solid ${listFilterTeam === t ? colors.primaryBlue : colors.border}`,
                                                backgroundColor: listFilterTeam === t ? colors.primaryBlue : 'white',
                                                color: listFilterTeam === t ? 'white' : colors.textGray,
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {teams[t].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setListFilterJob('전체')}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '15px',
                                            border: `1px solid ${listFilterJob === '전체' ? '#64748B' : colors.border}`,
                                            backgroundColor: listFilterJob === '전체' ? '#64748B' : '#F8FAFC',
                                            color: listFilterJob === '전체' ? 'white' : '#64748B',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        전체
                                    </button>
                                    {(listFilterTeam === '전체' ? allUniqueJobs : teams[listFilterTeam]?.jobs || []).map(j => (
                                        <button
                                            key={j}
                                            onClick={() => setListFilterJob(j)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '15px',
                                                border: `1px solid ${listFilterJob === j ? colors.primaryBlue : colors.border}`,
                                                backgroundColor: listFilterJob === j ? '#EFF6FF' : 'white',
                                                color: listFilterJob === j ? colors.primaryBlue : colors.textGray,
                                                fontSize: '0.75rem',
                                                fontWeight: listFilterJob === j ? 'bold' : 'normal',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {j}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
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
                                {filteredList.length > 0 ? (
                                    filteredList.map((item) => (
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
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {item.criteria.items.map((i, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {i.imageUrl && (
                                                                <img
                                                                    src={i.imageUrl}
                                                                    alt=""
                                                                    style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
                                                                />
                                                            )}
                                                            <span style={{ fontSize: '0.85rem' }}>{i.content}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
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
            </div>
        </>
    );
}
