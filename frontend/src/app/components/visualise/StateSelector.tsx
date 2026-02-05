
"use client";

import React, { useEffect, useState } from 'react';

interface StateSelectorProps {
    selectedState: string | null;
    onStateChange: (state: string) => void;
}

export function StateSelector({ selectedState, onStateChange }: StateSelectorProps) {
    const [states, setStates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStates() {
            try {
                const res = await fetch('/api/v1/districts/states');
                if (res.ok) {
                    const data = await res.json();
                    setStates(data.states || []);
                }
            } catch (err) {
                console.error("Failed to fetch states", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStates();
    }, []);

    return (
        <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">State</label>
            <select
                value={selectedState || ''}
                onChange={(e) => onStateChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                disabled={loading}
            >
                <option value="">Select a State</option>
                {states.map((state) => (
                    <option key={state} value={state}>
                        {state}
                    </option>
                ))}
            </select>
        </div>
    );
}
