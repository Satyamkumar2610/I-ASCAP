'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Map, Shield, GitBranch, Wheat, FileText, BookOpen, Menu, X, Search
} from 'lucide-react';

const NAV_ROUTES = [
    { href: '/', label: 'Map', icon: Map },
    { href: '/state', label: 'States', icon: Map },
    { href: '/risk-monitor', label: 'Risk Monitor', icon: Shield },
    { href: '/lineage', label: 'Lineage', icon: GitBranch },
    { href: '/split-report', label: 'Split Report', icon: GitBranch },
    { href: '/crop-portfolio', label: 'Crop Portfolio', icon: Wheat },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/methodology', label: 'Methodology', icon: BookOpen },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Don't show navbar on the main map page — it has its own full-screen layout
    if (pathname === '/') return null;

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform">
                                IA
                            </div>
                            <span className="font-bold text-indigo-900 text-sm hidden sm:block tracking-wide">I-ASCAP</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {NAV_ROUTES.filter(r => r.href !== '/').map((route) => {
                                const isActive = pathname === route.href;
                                const Icon = route.icon;
                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {route.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Search + Mobile Toggle */}
                        <div className="flex items-center gap-2">
                            <Link
                                href="/state"
                                className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                            >
                                <Search size={16} />
                            </Link>
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 text-slate-500 hover:text-indigo-700 rounded-lg transition"
                            >
                                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden bg-white border-t border-slate-200 py-2 px-4 animate-in">
                        {NAV_ROUTES.filter(r => r.href !== '/').map((route) => {
                            const isActive = pathname === route.href;
                            const Icon = route.icon;
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {route.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </nav>
        </>
    );
}
