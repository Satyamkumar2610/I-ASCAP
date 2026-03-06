
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                disabled={!selectedState || loading}
                size={1}
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
