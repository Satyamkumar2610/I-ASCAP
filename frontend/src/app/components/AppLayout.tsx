'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Don't wrap the Map page in the main layout shell as it has its own full-screen layout
    if (pathname === '/explore/map') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar relative pt-14 md:pt-0 pb-10">
                {children}
            </main>
        </div>
    );
}
