import Link from "next/link";

export const metadata = {
    title: 'CSMAC 대시보드',
    description: 'AI 기반 PDCA 관리 시스템',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body style={{ margin: 0, padding: 0, backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: 'sans-serif' }}>
                {children}
            </body>
        </html>
    );
}
