"use client";

import React, { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapLayerMouseEvent } from 'maplibre-gl';

const DISTRICT_LAYER_STYLE: any = {
    id: 'district-data',
    type: 'fill',
    paint: {
        'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'ST_CEN_CD'],
            0, '#dbeafe',    // Light Blue
            10, '#93c5fd',   // Blue 300
            20, '#3b82f6',   // Blue 500
            30, '#1d4ed8',   // Blue 700
            35, '#1e3a8a'    // Blue 900
        ],
        'fill-opacity': 0.6
    }
};

const DISTRICT_BORDER_STYLE: any = {
    id: 'district-borders',
    type: 'line',
    paint: {
        'line-color': '#000000',
        'line-width': 1
    }
};

interface MapInterfaceProps {
    year: number;
    selectedDistrict?: string | null;
    onDistrictSelect: (id: string) => void;
}

// Mock coordinates for demo
const DISTRICT_COORDINATES: Record<string, { lat: number, lng: number }> = {
    "Barddhaman": { lat: 23.2324, lng: 87.8615 },
    "Kolkata": { lat: 22.5726, lng: 88.3639 },
    "Darjeeling": { lat: 27.0410, lng: 88.2663 },
    "Mumbai": { lat: 19.0760, lng: 72.8777 },
    "Bangalore Urban": { lat: 12.9716, lng: 77.5946 }
};

export default function MapInterface({ year, selectedDistrict, onDistrictSelect }: MapInterfaceProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
        longitude: 78.9629,
        latitude: 20.5937,
        zoom: 4
    });

    // Fly to district when selected
    useEffect(() => {
        if (selectedDistrict && DISTRICT_COORDINATES[selectedDistrict]) {
            const { lat, lng } = DISTRICT_COORDINATES[selectedDistrict];
            mapRef.current?.flyTo({
                center: [lng, lat],
                zoom: 10,
                duration: 2000
            });
        }
    }, [selectedDistrict]);

    const [hoverInfo, setHoverInfo] = useState<{ feature: any, x: number, y: number, lngLat?: any } | null>(null);

    // Use static file directly to avoid API overhead for large (27MB) GeoJSON
    // In production, this should be replaced with Vector Tiles (.mvt/.pmtiles)
    const geojsonUrl = '/data/districts.json';

    const onHover = React.useCallback((event: MapLayerMouseEvent) => {
        const {
            features,
            point: { x, y },
            lngLat
        } = event;
        const hoveredFeature = features && features[0];

        // Simulating hover info
        setHoverInfo(
            hoveredFeature ? {
                feature: hoveredFeature,
                x,
                y,
                lngLat
            } : null
        );
    }, []);

    const onClick = React.useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features && event.features[0];
        if (feature) {
            onDistrictSelect(feature.properties?.DISTRICT || feature.properties?.district_name || feature.properties?.district_id || "unknown");
        }
    }, [onDistrictSelect]);

    return (
        <div className="w-full h-full">
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

                {/* Source for District Polygons */}
                <Source type="geojson" data={geojsonUrl}>
                    <Layer {...DISTRICT_LAYER_STYLE} />
                    <Layer {...DISTRICT_BORDER_STYLE} />
                </Source>

                {hoverInfo && hoverInfo.lngLat && (
                    <Popup
                        longitude={hoverInfo.lngLat.lng}
                        latitude={hoverInfo.lngLat.lat}
                        offset={[0, -10]}
                        closeButton={false}
                        className="text-black"
                    >
                        <div>
                            <h3 className="font-bold">{hoverInfo.feature.properties?.DISTRICT || hoverInfo.feature.properties?.district_name || "District"}</h3>
                            <p>State: {hoverInfo.feature.properties?.STATE || hoverInfo.feature.properties?.ST_NM || "N/A"}</p>
                            <p>Yield: {hoverInfo.feature.properties?.yield || "N/A"}</p>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}
