/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MONITORED_CITIES } from '../lib/config';
import { Thermometer, Wind, Clock, Plus, Minus, ArrowCounterClockwise } from '@phosphor-icons/react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

interface MapPanelProps {
  onSelectCity: (city: string) => void;
  selectedCity: string;
  weatherData: any[];
  aqiData: any[];
  tempUnit?: string;
}

export default function MapPanel({ onSelectCity, selectedCity, weatherData, aqiData, tempUnit }: MapPanelProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [worldData, setWorldData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom and Pan states
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const wasDragged = useRef(false);
  const dragStartCoords = useRef({ x: 0, y: 0 });

  // ResizeObserver for dynamic, highly responsive scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Fetch World TopoJSON at runtime (110m resolution for lightweight, high-performance loading)
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load map topology');
        return res.json();
      })
      .then((topology) => {
        const geojson = feature(topology, topology.objects.countries as any);
        setWorldData(geojson);
      })
      .catch((err) => {
        console.error('Error loading world map atlas:', err);
      });
  }, []);

  const formatTempTooltip = (tempC: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((tempC * 9 / 5) + 32)}°F`;
    }
    return `${tempC}°C`;
  };

  // Create d3-geo projection and path generator based on responsive dimensions
  const projection = useMemo(() => {
    // Dynamic scaling: fit neatly inside the responsive aspect ratio
    const scale = Math.min(dimensions.width / 5.4, dimensions.height * 0.44);
    return geoNaturalEarth1()
      .scale(scale)
      .translate([dimensions.width / 2, dimensions.height / 2 + 15]);
  }, [dimensions.width, dimensions.height]);

  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  // Calibration helper using the real projection coordinates
  const getXY = (lat: number, lon: number) => {
    const projected = projection([lon, lat]);
    if (!projected) return { x: 0, y: 0 };
    return { x: projected[0], y: projected[1] };
  };

  const getCityDetails = (cityName: string) => {
    const weather = weatherData?.find((w) => w.city.toLowerCase() === cityName.toLowerCase());
    const aqi = aqiData?.find((a) => a.city.toLowerCase() === cityName.toLowerCase());
    return { weather, aqi };
  };

  const activeCityDetails = hoveredCity ? getCityDetails(hoveredCity) : null;
  const activeCityCoords = hoveredCity ? MONITORED_CITIES.find(c => c.city === hoveredCity) : null;
  const activeXYRaw = activeCityCoords ? getXY(activeCityCoords.lat, activeCityCoords.lon) : null;

  const activeXY = useMemo(() => {
    if (!activeXYRaw) return null;
    const x1 = activeXYRaw.x - dimensions.width / 2;
    const y1 = activeXYRaw.y - dimensions.height / 2;
    const x_final = x1 * zoomScale + dimensions.width / 2 + panOffset.x;
    const y_final = y1 * zoomScale + dimensions.height / 2 + panOffset.y;
    return { x: x_final, y: y_final };
  }, [activeXYRaw, zoomScale, panOffset, dimensions.width, dimensions.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartCoords.current = { x: e.clientX, y: e.clientY };
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    wasDragged.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = Math.abs(e.clientX - dragStartCoords.current.x);
    const dy = Math.abs(e.clientY - dragStartCoords.current.y);
    if (dx > 4 || dy > 4) {
      wasDragged.current = true;
    }
    const maxPanX = (dimensions.width * (zoomScale - 1)) / 2;
    const maxPanY = (dimensions.height * (zoomScale - 1)) / 2;
    const newX = Math.min(maxPanX, Math.max(-maxPanX, e.clientX - dragStart.x));
    const newY = Math.min(maxPanY, Math.max(-maxPanY, e.clientY - dragStart.y));
    setPanOffset({ x: newX, y: newY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] border border-border-hairline border-t-2 border-t-status-accent rounded-3xl p-4 overflow-hidden shadow-xs"
      style={{ backgroundColor: '#0d1117' }}
      id="global-map-panel"
    >
      {/* Background Subtle Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #2a3340 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Map Header */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-2 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-status-accent animate-pulse" />
        <h3 className="font-sans font-medium text-sm tracking-tight text-slate-100">Air quality map</h3>
        <span className="font-sans text-[10px] text-slate-400 bg-[#1a2029]/80 px-2 py-0.1 rounded-full font-medium border border-[#2a3340]/50 backdrop-blur-xs">
          {MONITORED_CITIES.length} Monitoring stations
        </span>
      </div>

      {/* Floating Zoom & Pan Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#1a2029]/90 p-1.5 rounded-2xl border border-[#2a3340]/60 backdrop-blur-md shadow-lg">
        <button
          onClick={() => setZoomScale((prev) => Math.min(5, prev + 0.5))}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-center"
          title="Zoom In"
        >
          <Plus size={14} weight="bold" />
        </button>
        <button
          onClick={() => {
            setZoomScale((prev) => {
              const next = Math.max(1, prev - 0.5);
              if (next === 1) {
                setPanOffset({ x: 0, y: 0 });
              }
              return next;
            });
          }}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-center"
          title="Zoom Out"
        >
          <Minus size={14} weight="bold" />
        </button>
        <button
          onClick={() => {
            setZoomScale(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-center"
          title="Reset View"
        >
          <ArrowCounterClockwise size={14} weight="bold" />
        </button>
        {zoomScale > 1 && (
          <span className="font-mono text-[9px] text-slate-400 px-1.5 font-semibold">
            {zoomScale.toFixed(1)}x
          </span>
        )}
      </div>

      {/* SVG Map Canvas */}
      <svg
        width="100%"
        height="100%"
        className={`text-text-primary/10 select-none ${zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <g
          transform={`translate(${dimensions.width / 2 + panOffset.x}, ${dimensions.height / 2 + panOffset.y}) scale(${zoomScale}) translate(${-dimensions.width / 2}, ${-dimensions.height / 2})`}
          style={{ transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
        >
          {/* Render filled geographic countries */}
          {worldData && worldData.features && (
            <g className="countries-layer">
              {worldData.features.map((feature: any, idx: number) => {
                const d = pathGenerator(feature);
                if (!d) return null;
                return (
                  <path
                    key={idx}
                    d={d}
                    fill="#1a2029"
                    stroke="#2a3340"
                    strokeWidth="0.5"
                    className="transition-colors duration-200"
                  />
                );
              })}
            </g>
          )}

          {/* Equatorial and Meridian Reference Lines */}
          <line
            x1="0"
            y1={dimensions.height / 2}
            x2={dimensions.width}
            y2={dimensions.height / 2}
            stroke="#2a3340"
            strokeWidth="0.5"
            strokeDasharray="3 3"
            opacity="0.25"
          />
          <line
            x1={dimensions.width / 2}
            y1="0"
            x2={dimensions.width / 2}
            y2={dimensions.height}
            stroke="#2a3340"
            strokeWidth="0.5"
            strokeDasharray="3 3"
            opacity="0.25"
          />

          {/* Hotspot City Nodes */}
          {MONITORED_CITIES.map((c) => {
            const { x, y } = getXY(c.lat, c.lon);
            // Handle off-screen projection safely
            if (x === 0 && y === 0) return null;

            const isSelected = selectedCity.toLowerCase() === c.city.toLowerCase();
            const isHovered = hoveredCity?.toLowerCase() === c.city.toLowerCase();
            const details = getCityDetails(c.city);
            const aqiLevel = details?.aqi?.aqi ?? 50;

            // AQI indicator color (Strict status matching WCAG/contrast rules)
            let colorHex = '#10b981'; // Good (Emerald)
            if (aqiLevel > 100) colorHex = '#ef4444'; // Bad (Red)
            else if (aqiLevel > 50) colorHex = '#f59e0b'; // Moderate (Amber)

            return (
              <g
                key={c.city}
                className="cursor-pointer"
                onClick={() => {
                  if (wasDragged.current) return;
                  onSelectCity(c.city);
                }}
              >
                {/* Soft low-opacity halo behind the dot for a beautiful pulsing glow effect */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? 12 : 8}
                  fill={colorHex}
                  className="opacity-20 animate-pulse"
                  style={{ transition: 'r 0.2s ease-out' }}
                />

                {/* Small solid dot in status color */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? 5 : 3.5}
                  fill={colorHex}
                  stroke="#0d1117"
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoveredCity(c.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                />

                {/* Quiet outer selection outline ring */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="9"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    className="animate-ping opacity-70"
                    style={{ animationDuration: '3s' }}
                  />
                )}

                {/* Site Name Text Label (shows on hover or when selected) */}
                {(isHovered || isSelected) && (
                  <text
                    x={x + 9}
                    y={y + 3}
                    className="font-sans font-semibold text-[10px] pointer-events-none select-none"
                    fill="#f1f5f9"
                    style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {c.city}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Detail Card on Hover */}
      {hoveredCity && activeCityDetails && activeXY && (
        <div
          className="absolute z-20 pointer-events-none p-3.5 bg-[#141922]/95 border border-[#2a3340] rounded-2xl shadow-xl backdrop-blur-md animate-slide-up"
          style={{
            left: `${Math.min(dimensions.width - 240, Math.max(20, activeXY.x - 110))}px`,
            top: `${Math.min(dimensions.height - 180, Math.max(40, activeXY.y - 150))}px`,
            width: '220px',
          }}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <div>
              <h4 className="font-sans font-semibold text-xs text-slate-100 tracking-tight">{hoveredCity}</h4>
              <p className="font-mono text-[9px] text-slate-400 uppercase">
                {MONITORED_CITIES.find((c) => c.city === hoveredCity)?.country}
              </p>
            </div>
            {activeCityDetails.aqi && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${activeCityDetails.aqi.status === 'Good' ? 'bg-status-success-bg/20 text-status-success border-status-success/35' :
                activeCityDetails.aqi.status === 'Moderate' ? 'bg-status-warning-bg/20 text-status-warning border-status-warning/35' :
                  'bg-status-danger-bg/20 text-status-danger border-status-danger/35'
                }`}>
                AQI {activeCityDetails.aqi.aqi}
              </span>
            )}
          </div>

          <div className="border-t border-[#2a3340] my-1.5" />

          <div className="grid grid-cols-2 gap-2 text-slate-200">
            {activeCityDetails.weather && (
              <div className="flex items-center gap-1.5">
                <Thermometer weight="light" className="text-sm text-status-warning" size={14} />
                <div>
                  <p className="font-mono text-[10px] leading-tight font-bold">{formatTempTooltip(activeCityDetails.weather.temp)}</p>
                  <p className="text-[8px] text-slate-400 leading-tight font-medium">{activeCityDetails.weather.condition}</p>
                </div>
              </div>
            )}
            {activeCityDetails.aqi && (
              <div className="flex items-center gap-1.5">
                <Wind weight="light" className="text-sm text-status-accent" size={14} />
                <div>
                  <p className="font-mono text-[10px] leading-tight font-bold">{activeCityDetails.aqi.pm25} µg</p>
                  <p className="text-[8px] text-slate-400 leading-tight font-medium">PM2.5</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-[#2a3340]/50 text-[8px] text-slate-400 font-medium">
            <Clock weight="light" className="text-[11px]" size={11} />
            <span>Timezone: {activeCityDetails.weather?.timezone}</span>
          </div>
        </div>
      )}

      {/* Tightened Multi-row/Responsive Legend */}
      <div className="absolute bottom-4 left-6 flex flex-wrap items-center gap-2 max-w-[85%] text-[9px] sm:text-[10px] font-sans text-slate-400 font-medium z-10">
        <div className="flex items-center gap-1 bg-[#1a2029]/95 px-2 py-0.5 rounded-full border border-[#2a3340]/60 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
          <span>Good (0-50)</span>
        </div>
        <div className="flex items-center gap-1 bg-[#1a2029]/95 px-2 py-0.5 rounded-full border border-[#2a3340]/60 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#eab308' }} />
          <span>Moderate (51-100)</span>
        </div>
        <div className="flex items-center gap-1 bg-[#1a2029]/95 px-2 py-0.5 rounded-full border border-[#2a3340]/60 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f97316' }} />
          <span>Unhealthy for Sensitive Groups (101-150)</span>
        </div>
        <div className="flex items-center gap-1 bg-[#1a2029]/95 px-2 py-0.5 rounded-full border border-[#2a3340]/60 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span>Unhealthy (151-200)</span>
        </div>
        <div className="flex items-center gap-1 bg-[#1a2029]/95 px-2 py-0.5 rounded-full border border-[#2a3340]/60 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#a855f7' }} />
          <span>Very Unhealthy (201-300)</span>
        </div>
        <div className="flex items-center gap-1 bg-[#1a2029]/95 px-2 py-0.5 rounded-full border border-[#2a3340]/60 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#991b1b' }} />
          <span>Hazardous (301-500)</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-6 text-[10px] font-sans text-slate-410 font-semibold hidden lg:block z-10 bg-[#1a2029]/80 px-2.5 py-0.5 rounded-full border border-[#2a3340]/50 backdrop-blur-xs">
        Click a location to view details
      </div>
    </div>
  );
}
