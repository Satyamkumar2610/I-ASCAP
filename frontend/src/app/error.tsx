'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[I-ASCAP Error]', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                    <AlertTriangle size={28} className="text-rose-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    An unexpected error occurred while loading this page.
                    This could be a temporary issue — try refreshing.
                </p>
                {error.message && (
                    <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-xs text-slate-500 font-mono break-all">{error.message}</p>
                    </div>
                )}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <RotateCcw size={14} />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Home size={14} />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
