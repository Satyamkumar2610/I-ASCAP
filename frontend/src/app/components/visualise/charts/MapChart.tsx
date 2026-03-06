"use client";

import React from 'react';

// For the Map view, we don't naturally have geoJSON in this context natively to map a specific district's yield evolution.
// Or if we're doing "State View", we could map all districts. But the data passed here `data={data}` is Time Series metrics for ONE selected entity.
// The user request shows "Map view not implemented yet." so we will build a placeholder for now that actually looks like a map UI, or redirect to the actual Interactive Map page.

export function MapChart() {
    return (
        <div className="w-full h-80 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Choropleth Maps</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-4">
                To view geospatial distribution of these agricultural metrics across districts, please use the dedicated Interactive Map tool.
            </p>
            <a href="/explore/map" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Go to Interactive Map
            </a>
        </div>
    );
}
