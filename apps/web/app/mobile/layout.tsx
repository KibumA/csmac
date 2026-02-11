'use client';

import React from 'react';
import { PDCAProvider } from '../../context/PDCAContext';

export default function MobileLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PDCAProvider>
            {children}
        </PDCAProvider>
    );
}
