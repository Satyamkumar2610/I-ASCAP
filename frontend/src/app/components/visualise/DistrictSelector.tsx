
"use client";

import React, { useEffect, useState } from 'react';

interface DistrictSelectorProps {
    selectedState: string | null;
    selectedDistrict: string | null;
    onDistrictChange: (district: string) => void;
}

export function DistrictSelector({ selectedState, selectedDistrict, onDistrictChange }: DistrictSelectorProps) {
    const [districts, setDistricts] = useState<{ cdk: string; district_name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedState) {
            setDistricts([]);
            return;
        }

        async function fetchDistricts() {
            setLoading(true);
            try {
                const res = await fetch(`/api/v1/districts?state=${encodeURIComponent(selectedState || '')}`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter out the "Whole State" entry which has cdk starting with S_
                    const items = data.items.filter((d: { cdk: string; district_name: string }) => !d.cdk.startsWith('S_'));
                    setDistricts(items);
                }
            } catch (err) {
                console.error("Failed to fetch districts", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDistricts();
    }, [selectedState]);

    return (
        <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">District</label>
            <select
                value={selectedDistrict || ''}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                disabled={!selectedState || loading}
            >
                <option value="">All Districts (State View)</option>
                {districts.map((d) => (
                    <option key={d.cdk} value={d.district_name}>
                        {d.district_name}
                    </option>
                ))}
            </select>
        </div>
    );
}
