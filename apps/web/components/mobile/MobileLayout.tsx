import React, { ReactNode } from 'react';
import { colors } from '../../styles/theme';
import { useRouter } from 'next/navigation';

interface MobileLayoutProps {
    children: ReactNode;
    title?: string;
    showBack?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, title = 'CS MAC', showBack = false }) => {
    const router = useRouter();

    return (
        <div style={{
            maxWidth: '480px',
            margin: '0 auto',
            minHeight: '100vh',
            backgroundColor: '#F5F7FB',
            position: 'relative',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)'
        }}>
            {/* Header */}
            <header style={{
                height: '60px',
                backgroundColor: 'white',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                {showBack && (
                    <button
                        onClick={() => router.back()}
                        style={{ marginRight: '15px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                    >
                        ←
                    </button>
                )}
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.primaryBlue }}>{title}</h1>
            </header>

            {/* Content */}
            <main style={{ padding: '20px', paddingBottom: '80px' }}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '480px',
                height: '70px',
                backgroundColor: 'white',
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 100
            }}>
                <NavItem icon="📋" label="업무목록" active />
                <NavItem icon="✅" label="완료내역" />
                <NavItem icon="👤" label="내정보" />
            </nav>
        </div>
    );
};

const NavItem = ({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        color: active ? colors.primaryBlue : colors.textGray
    }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
    </div>
);
