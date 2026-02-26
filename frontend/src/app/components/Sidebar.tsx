'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Map, Shield, GitBranch, Wheat, FileText, BookOpen, Menu, X,
    Layers, Droplet, Network, Target
} from 'lucide-react';

const NAV_GROUPS = [
    {
        name: "Core Explorer",
        items: [
            { href: '/', label: 'Interactive Map', icon: Map },
            { href: '/state', label: 'State Summaries', icon: Map },
            { href: '/reports', label: 'Reports', icon: FileText },
            { href: '/methodology', label: 'Methodology', icon: BookOpen },
        ]
    },
    {
        name: "Lineage & Boundary",
        items: [
            { href: '/lineage', label: 'Lineage Graph', icon: GitBranch },
            { href: '/split-report', label: 'Split Impact Report', icon: GitBranch },
        ]
    },
    {
        name: "Advanced Analytics",
        items: [
            { href: '/crop-shift', label: 'Crop Shift', icon: Layers },
            { href: '/water-stress', label: 'Water Stress', icon: Droplet },
            { href: '/spatial-contagion', label: 'Spatial Contagion', icon: Network },
            { href: '/yield-gap', label: 'Yield Gap Mapping', icon: Target },
            { href: '/crop-portfolio', label: 'Crop Portfolio', icon: Wheat },
            { href: '/risk-monitor', label: 'Risk Monitor', icon: Shield },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button (Top Bar on Mobile) */}
            <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-slate-900 z-50 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                        IA
                    </div>
                    <span className="font-bold text-white tracking-wide">I-ASCAP</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg transition focus:outline-none"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar Desktop + Mobile Drawer */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-40
                w-64 bg-slate-900 border-r border-slate-800 text-slate-300
                transform transition-transform duration-300 ease-in-out
                flex flex-col shadow-2xl md:shadow-none
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="hidden md:flex h-16 shrink-0 items-center justify-center gap-3 px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(79,70,229,0.6)] ring-1 ring-indigo-400">
                        IA
                    </div>
                    <span className="font-bold text-white tracking-wide text-sm">I-ASCAP Platform</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 pb-20 md:pb-6 mt-14 md:mt-0">
                    {NAV_GROUPS.map((group) => (
                        <div key={group.name} className="mb-8">
                            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                {group.name}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((route) => {
                                    const isActive = pathname === route.href;
                                    const Icon = route.icon;
                                    return (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group
                                                ${isActive
                                                    ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:border-slate-700/50 border border-transparent'
                                                }
                                            `}
                                        >
                                            <Icon size={16} className={`transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                                            {route.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer simple tag */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm shrink-0">
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex flex-col items-center text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">System Status</span>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-medium text-slate-300">All Modules Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}
