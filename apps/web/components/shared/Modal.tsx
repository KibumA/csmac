'use client';

import React, { ReactNode } from 'react';
import { colors } from '../../styles/theme';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '600px',
                maxWidth: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
            }} onClick={e => e.stopPropagation()}>
                <div style={{
                    padding: '20px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: colors.textDark }}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: colors.textGray,
                            padding: '0 5px'
                        }}
                    >
                        &times;
                    </button>
                </div>
                <div style={{ padding: '20px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
