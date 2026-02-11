import React from 'react';

export const colors = {
    sidebarBg: '#F8F9FB',
    primaryBlue: '#4472C4',
    lightBlue: '#E7EEF8',
    textDark: '#333333',
    textGray: '#666666',
    border: '#D1D1D1',
    white: '#FFFFFF',
    headerBlue: '#CFD9EA', // PPT table header background
    success: '#22c55e',
};

export const statCardStyle: React.CSSProperties = {
    flex: 1,
    padding: '20px',
    backgroundColor: '#F8F9FB',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
};

export const thStyle: React.CSSProperties = {
    padding: '12px 10px',
    textAlign: 'left',
    fontSize: '0.9rem',
    color: colors.textDark,
    border: `1px solid ${colors.border}`,
    fontWeight: 'bold',
};

export const tdStyle: React.CSSProperties = {
    padding: '12px 10px',
    verticalAlign: 'top',
    border: `1px solid ${colors.border}`,
    color: colors.textDark,
};

export const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: `1px solid ${colors.border}`,
    backgroundColor: 'white',
    fontSize: '0.9rem',
    minWidth: '120px',
};

export const tpoTag: React.CSSProperties = {
    fontSize: '0.78rem',
    color: colors.primaryBlue,
    backgroundColor: colors.lightBlue,
    padding: '3px 8px',
    borderRadius: '4px',
    marginBottom: '5px',
    border: `1px solid ${colors.primaryBlue}33`,
};

export const itemTag: React.CSSProperties = {
    fontSize: '0.78rem',
    backgroundColor: '#F5F5F5',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #E5E5E5',
    color: colors.textGray,
};

export const inputPanelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
};

export const panelTitleRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 5px',
    minHeight: '40px', // Ensure consistent title row height
};

export const panelTitleText: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: colors.textDark,
};

export const pillButtonStyle: React.CSSProperties = {
    backgroundColor: '#E7EEF8',
    color: colors.primaryBlue,
    border: 'none',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
};

export const tpoBtnStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: `1px solid ${colors.textDark}`,
    borderRadius: '10px',
    padding: '8px 15px',
    fontSize: '0.85rem',
    color: colors.textGray,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
};

export const criteriaItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #F0F0F0',
    fontSize: '0.9rem',
    color: colors.textDark,
};

export const actionButtonStyle: React.CSSProperties = {
    padding: '10px 25px',
    borderRadius: '25px',
    border: `1px solid ${colors.primaryBlue}`,
    backgroundColor: 'white',
    color: colors.primaryBlue,
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
};

export const dropdownMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'white',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    zIndex: 100,
    marginTop: '5px',
    minWidth: '200px',
    padding: '5px 0',
};

export const dropdownItemStyle: React.CSSProperties = {
    padding: '10px 15px',
    fontSize: '0.85rem',
    color: colors.textDark,
    cursor: 'pointer',
    borderBottom: `1px solid #F0F0F0`,
    transition: 'background-color 0.2s',
};
