"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { useDistrictMetrics, DistrictMetric } from '../hooks/useDistrictMetrics';

interface MapInterfaceProps {
    year: number;
    crop?: string;
    metric?: string;
    selectedDistrict?: string | null;
    onDistrictSelect: (id: string) => void;
    showRainfallLayer?: boolean;
}

// Color Scale Helper (Agricultural Metric - Green Gradient)
const getAgriColor = (value: number, min: number, max: number) => {
    if (value <= 0) return '#1f2937'; // Gray for 0
    const ratio = (value - min) / (max - min || 1);
    if (ratio < 0.2) return '#d1fae5'; // emerald-100
    if (ratio < 0.4) return '#6ee7b7'; // emerald-300
    if (ratio < 0.6) return '#10b981'; // emerald-500
    if (ratio < 0.8) return '#059669'; // emerald-600
    return '#047857'; // emerald-700
};

// Color Scale Helper (Rainfall - Blue Gradient)
const getRainfallColor = (value: number, min: number, max: number) => {
    if (value <= 0) return '#1f2937'; // Gray for 0
    const ratio = (value - min) / (max - min || 1);
    if (ratio < 0.2) return '#dbeafe'; // blue-100
    if (ratio < 0.4) return '#93c5fd'; // blue-300
    if (ratio < 0.6) return '#60a5fa'; // blue-400
    if (ratio < 0.8) return '#2563eb'; // blue-600
    return '#1e40af'; // blue-800
};



export default function MapInterface({ year, crop = 'wheat', metric = 'yield', selectedDistrict, onDistrictSelect, showRainfallLayer = false }: MapInterfaceProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
        longitude: 78.9629,
        latitude: 20.5937,
        zoom: 4
    });

    // Data Hook (The V1.5 Pipeline)
    const { joinedData, loading } = useDistrictMetrics(year, crop, metric);

    // Compute Style Layer
    const layerStyle = useMemo(() => {
        if (loading || Object.keys(joinedData).length === 0) {
            return {
                id: 'district-data',
                type: 'fill',
                paint: { 'fill-color': '#374151', 'fill-opacity': 0.6 }
            };
        }

        // Calculate Min/Max for scaling
        const values = Object.values(joinedData).map(d => d.value).filter(v => v > 0);
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Construct Match Expression
        // Use coalesce to handle variant property names in GeoJSON
        const districtExpr = ['coalesce', ['get', 'DISTRICT'], ['get', 'district_name']];
        const stateExpr = ['coalesce', ['get', 'STATE'], ['get', 'ST_NM']];
        const keyExpr = ['concat', districtExpr, '|', stateExpr];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchExpr: any[] = ['match', keyExpr];

        // Use different color schemes based on layer mode
        const colorFn = showRainfallLayer ? getRainfallColor : getAgriColor;

        Object.entries(joinedData).forEach(([geoKey, d]) => {
            matchExpr.push(geoKey);
            matchExpr.push(colorFn(d.value, min, max));
        });

        matchExpr.push('#374151'); // Default color (gray-700)

        return {
            id: 'district-data',
            type: 'fill',
            paint: {
                'fill-color': matchExpr,
                'fill-opacity': 0.7,
                'fill-outline-color': '#000000'
            }
        };

    }, [joinedData, loading, showRainfallLayer]);

    // Fly to selection
    useEffect(() => {
        // ... (Coordinate logic omitted for brevity in V1 POC)
    }, [selectedDistrict]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [hoverInfo, setHoverInfo] = useState<{ feature: any, x: number, y: number, lngLat?: any, data?: DistrictMetric } | null>(null);

    const onHover = React.useCallback((event: MapLayerMouseEvent) => {
        const { features, point: { x, y } } = event;

        const feature = features && features[0];

        if (feature) {
            const dist = feature.properties?.DISTRICT;
            const state = feature.properties?.STATE;
            const geoKey = `${dist}|${state}`;
            const metricData = joinedData[geoKey];

            setHoverInfo({
                feature: feature,
                x: x,
                y: y,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                lngLat: event.lngLat as any,
                data: metricData
            });
        } else {
            setHoverInfo(null);
        }
    }, [joinedData]);

    const onClick = React.useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features && event.features[0];
        if (feature) {
            // Pass back the display name
            onDistrictSelect(feature.properties?.DISTRICT || "unknown");
        }
    }, [onDistrictSelect]);

    return (
        <div className="w-full h-full relative">
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                interactiveLayerIds={['district-data']}
                onMouseMove={onHover}
                onClick={onClick}
            >
                <NavigationControl position="top-right" />

                <Source type="geojson" data="/data/districts.json">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Layer {...(layerStyle as any)} />
                    <Layer id="borders" type="line" paint={{ 'line-color': '#ffffff', 'line-width': 0.5, 'line-opacity': 0.2 }} />
                </Source>

                {hoverInfo && hoverInfo.lngLat && (
                    <Popup
                        longitude={hoverInfo.lngLat.lng}
                        latitude={hoverInfo.lngLat.lat}
                        offset={[0, -10]}
                        closeButton={false}
                        className="text-black"
                    >
                        <div className="p-2">
                            <h3 className="font-bold text-lg">{hoverInfo.feature.properties?.DISTRICT}</h3>
                            <p className="text-sm text-gray-500">{hoverInfo.feature.properties?.STATE}</p>

                            <hr className="my-2 border-gray-200" />

                            {hoverInfo.data ? (
                                <div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="capitalize text-gray-700 font-medium">{crop} {metric}</span>
                                        <span className="font-bold text-blue-600 text-lg">
                                            {hoverInfo.data.value.toLocaleString()}
                                            <span className="text-xs text-gray-500 ml-1">
                                                {metric === 'yield' ? 'kg/ha' : metric === 'production' ? 'tons' : 'ha'}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">
                                        Source: {hoverInfo.data.method === 'Raw' ? 'Observed' : 'Harmonized (Backcast)'}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-red-400 italic">No Data Available</p>
                            )}
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Loading Indicator */}
            {loading && (
                <div className="absolute top-4 right-16 bg-black/80 text-white px-3 py-1 rounded-full text-xs backdrop-blur">
                    Loading Data...
                </div>
            )}
        </div>
    );
}
