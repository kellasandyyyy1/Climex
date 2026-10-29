/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MONITORED_CITIES } from '../lib/config';
import StatusBadge, { aqiTone } from './StatusBadge';
import { Plus, Minus, ArrowCounterClockwise } from './Icon';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

interface MapPanelProps {
  onSelectCity: (city: string) => void;
  selectedCity: string;
  weatherData: any[];
  aqiData: any[];
  tempUnit?: string;
  /** Tailwind height class for the map canvas; when omitted the map keeps a world-shaped aspect ratio. */
  heightClass?: string;
  /** Small-screen layout: summary below the map, shorter list. */
  compact?: boolean;
}

// US EPA AQI bands, in slightly muted tones that sit well on the ivory/charcoal surfaces
const LEVELS = [
  { key: 'good', label: 'Good', max: 50, color: '#3F9C6D' },
  { key: 'moderate', label: 'Moderate', max: 100, color: '#D3A12A' },
  { key: 'sensitive', label: 'Sensitive groups', max: 150, color: '#DD7A35' },
  { key: 'unhealthy', label: 'Unhealthy', max: 200, color: '#D2493A' },
  { key: 'very', label: 'Very unhealthy', max: 300, color: '#8E5BC4' },
  { key: 'hazardous', label: 'Hazardous', max: Infinity, color: '#8C2230' },
] as const;

const levelFor = (aqi: number) => LEVELS.find(l => aqi <= l.max) ?? LEVELS[LEVELS.length - 1];

interface Station {
  city: string;
  country: string;
  lat: number;
  lon: number;
  aqi: number | null;
  status?: string;
  pm25?: number;
  temp?: number;
  condition?: string;
}

export default function MapPanel({ onSelectCity, selectedCity, weatherData, aqiData, tempUnit, heightClass, compact = false }: MapPanelProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [land, setLand] = useState<any>(null);
  const [mapError, setMapError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom and pan
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOrigin = useRef({ x: 0, y: 0 });
  const wasDragged = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load map topology');
        return res.json();
      })
      .then(topology => {
        const geo: any = feature(topology, topology.objects.countries as any);
        // Drop Antarctica so the inhabited world fills the frame
        setLand({ ...geo, features: geo.features.filter((f: any) => f.id !== '010') });
      })
      .catch(err => {
        console.error('Error loading world map atlas:', err);
        setMapError(true);
      });
  }, []);

  const stations: Station[] = useMemo(
    () =>
      MONITORED_CITIES.map(c => {
        const a = aqiData?.find(x => x.city.toLowerCase() === c.city.toLowerCase());
        const w = weatherData?.find(x => x.city.toLowerCase() === c.city.toLowerCase());
        return { city: c.city, country: c.country, lat: c.lat, lon: c.lon, aqi: a?.aqi ?? null, status: a?.status, pm25: a?.pm25, temp: w?.temp, condition: w?.condition };
      }),
    [aqiData, weatherData]
  );

  const pad = compact ? 8 : 16;
  const projection = useMemo(() => {
    const p = geoNaturalEarth1();
    if (land) p.fitExtent([[pad, pad], [dimensions.width - pad, dimensions.height - pad]], land);
    else p.scale(Math.min(dimensions.width / 5.6, dimensions.height * 0.46)).translate([dimensions.width / 2, dimensions.height / 2]);
    return p;
  }, [land, dimensions.width, dimensions.height, pad]);
  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);
  const project = (s: Station) => projection([s.lon, s.lat]) ?? [0, 0];
  const toScreen = ([x, y]: [number, number] | number[]) => ({
    x: (x - dimensions.width / 2) * zoomScale + dimensions.width / 2 + panOffset.x,
    y: (y - dimensions.height / 2) * zoomScale + dimensions.height / 2 + panOffset.y,
  });

  const formatTemp = (tempC: number) => (tempUnit === 'F' ? `${Math.round((tempC * 9) / 5 + 32)}°F` : `${Math.round(tempC)}°C`);

  // Summary: counts per level and the worst readings
  const counts = LEVELS.map(l => ({ ...l, count: stations.filter(s => s.aqi !== null && levelFor(s.aqi).key === l.key).length }));
  const measured = stations.filter(s => s.aqi !== null).length;
  const worst = [...stations].filter(s => s.aqi !== null).sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0)).slice(0, compact ? 3 : 5);

  const zoomTo = (next: number) => {
    const z = Math.min(5, Math.max(1, next));
    setZoomScale(z);
    if (z === 1) setPanOffset({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    wasDragged.current = false;
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    if (Math.abs(e.clientX - dragOrigin.current.x) > 4 || Math.abs(e.clientY - dragOrigin.current.y) > 4) wasDragged.current = true;
    const maxX = (dimensions.width * (zoomScale - 1)) / 2;
    const maxY = (dimensions.height * (zoomScale - 1)) / 2;
    setPanOffset({
      x: Math.min(maxX, Math.max(-maxX, e.clientX - dragStart.current.x)),
      y: Math.min(maxY, Math.max(-maxY, e.clientY - dragStart.current.y)),
    });
  };
  const endDrag = () => setIsDragging(false);

  const hovered = hoveredCity ? stations.find(s => s.city === hoveredCity) : null;
  const hoveredXY = hovered ? toScreen(project(hovered)) : null;
  const k = 1 / zoomScale;
  const isSelected = (s: Station) => s.city.toLowerCase() === selectedCity.toLowerCase();

  const ctrl = 'w-9 h-9 md:w-8 md:h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default';

  const summary = (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Distribution */}
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[13px] font-medium text-text-secondary">Air quality by city</p>
          <p className="text-[12px] text-text-muted tabular-nums">{measured} cities</p>
        </div>
        <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-surface-2" role="img" aria-label={counts.filter(c => c.count).map(c => `${c.count} ${c.label}`).join(', ')}>
          {counts.map(c => c.count > 0 && (
            <span key={c.key} style={{ width: `${(c.count / Math.max(1, measured)) * 100}%`, backgroundColor: c.color }} className="h-full first:rounded-l-full last:rounded-r-full" />
          ))}
        </div>
        <ul className={`mt-3 grid gap-x-4 gap-y-1.5 ${compact ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {counts.map(c => (
            <li key={c.key} className={`flex items-center justify-between gap-2 text-[13px] ${c.count ? 'text-text-primary' : 'text-text-muted'}`}>
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color, opacity: c.count ? 1 : 0.4 }} />
                <span className="truncate">{c.label}</span>
              </span>
              <span className="tabular-nums font-medium">{c.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Worst readings */}
      <div className="border-t border-border-hairline pt-4">
        <p className="text-[13px] font-medium text-text-secondary mb-1.5">Highest readings</p>
        <ul className="flex flex-col -mx-2">
          {worst.map(s => {
            const lvl = levelFor(s.aqi ?? 0);
            return (
              <li key={s.city}>
                <button
                  onClick={() => onSelectCity(s.city)}
                  onMouseEnter={() => setHoveredCity(s.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                  aria-current={isSelected(s) ? 'true' : undefined}
                  className={`w-full flex items-center justify-between gap-3 px-2 h-10 rounded-lg text-left transition-colors cursor-pointer ${isSelected(s) ? 'bg-surface-2' : 'hover:bg-surface-2'}`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lvl.color }} />
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium text-text-primary truncate leading-tight">{s.city}</span>
                      <span className="block text-[12px] text-text-muted truncate leading-tight">{s.country}</span>
                    </span>
                  </span>
                  <span className="text-[14px] font-semibold tabular-nums text-text-primary">{s.aqi}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className={`grid gap-4 md:gap-5 ${compact ? '' : 'lg:grid-cols-[minmax(0,1fr)_260px]'}`} id="global-map-panel-wrapper">
      <div
        ref={containerRef}
        className={`relative w-full ${heightClass ?? (compact ? 'aspect-[1.75/1]' : 'aspect-[2.15/1] min-h-[260px]')} rounded-xl border border-border-hairline bg-surface-2/60 overflow-hidden`}
        id="global-map-panel"
      >
        {/* Zoom controls (joined group) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col overflow-hidden rounded-lg border border-border-hairline bg-surface-1 shadow-xs divide-y divide-border-hairline">
          <button onClick={() => zoomTo(zoomScale + 0.5)} disabled={zoomScale >= 5} className={ctrl} aria-label="Zoom in" title="Zoom in">
            <Plus size={15} />
          </button>
          <button onClick={() => zoomTo(zoomScale - 0.5)} disabled={zoomScale <= 1} className={ctrl} aria-label="Zoom out" title="Zoom out">
            <Minus size={15} />
          </button>
          {zoomScale > 1 && (
            <button onClick={() => zoomTo(1)} className={ctrl} aria-label="Reset view" title="Reset view">
              <ArrowCounterClockwise size={14} />
            </button>
          )}
        </div>

        {!land && !mapError && <span aria-hidden="true" className="skeleton absolute inset-0 rounded-none opacity-70" />}
        {mapError && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
            <span className="text-[12.5px] text-text-muted bg-surface-1/90 border border-border-hairline rounded-md px-2 py-1">Map outline unavailable — stations are still shown</span>
          </div>
        )}

        <svg
          width="100%"
          height="100%"
          className={`select-none ${zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
          style={{ touchAction: zoomScale > 1 ? 'none' : 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          role="img"
          aria-label={`World map of ${stations.length} air quality stations`}
        >
          <g
            transform={`translate(${dimensions.width / 2 + panOffset.x}, ${dimensions.height / 2 + panOffset.y}) scale(${zoomScale}) translate(${-dimensions.width / 2}, ${-dimensions.height / 2})`}
            style={{ transition: isDragging ? 'none' : 'transform 0.18s ease-out' }}
          >
            {land?.features?.map((f: any, idx: number) => {
              const d = pathGenerator(f);
              return d ? <path key={idx} d={d} fill="var(--line)" stroke="var(--surface-muted)" strokeWidth={0.7 * k} /> : null;
            })}

            {/* Pins: unselected first so the selected one sits on top */}
            {[...stations].sort((a, b) => Number(isSelected(a)) - Number(isSelected(b))).map(s => {
              const [x, y] = project(s);
              const lvl = levelFor(s.aqi ?? 0);
              const sel = isSelected(s);
              const hov = hoveredCity === s.city;
              const label = `${s.city}${s.aqi !== null ? ` · ${s.aqi}` : ''}`;
              const labelW = label.length * 6.6 + 16;
              // Keep the selected label inside the frame: flip it to the left of the pin near the right edge
              const flip = toScreen([x, y]).x + (labelW + 14) > dimensions.width - 8;
              return (
                <g
                  key={s.city}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredCity(s.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={() => !wasDragged.current && onSelectCity(s.city)}
                >
                  <circle cx={x} cy={y} r={14 * k} fill="transparent" />
                  {(sel || hov) && <circle cx={x} cy={y} r={10 * k} fill={lvl.color} opacity={0.18} />}
                  <circle cx={x} cy={y} r={(sel || hov ? 5.5 : 4.5) * k} fill={lvl.color} stroke="var(--surface)" strokeWidth={1.75 * k} />
                  {sel && (
                    <g transform={`translate(${flip ? x - (labelW + 12) * k : x + 12 * k}, ${y - 11 * k}) scale(${k})`} className="pointer-events-none">
                      <rect width={labelW} height={22} rx={6} fill="var(--ink)" />
                      <text x={8} y={15} fill="var(--bg-base)" style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                        {label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover card */}
        {hovered && hoveredXY && !isSelected(hovered) && (
          <div
            className="absolute z-20 pointer-events-none w-[210px] p-3 bg-surface-1 border border-border-hairline rounded-xl shadow-md"
            style={{
              left: Math.min(dimensions.width - 222, Math.max(12, hoveredXY.x + 14)),
              top: Math.min(dimensions.height - 118, Math.max(12, hoveredXY.y - 20)),
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-text-primary truncate leading-tight">{hovered.city}</p>
                <p className="text-[12px] text-text-muted truncate">{hovered.country}</p>
              </div>
              {hovered.aqi !== null && <StatusBadge tone={aqiTone(hovered.status).tone} size="xs">AQI {hovered.aqi}</StatusBadge>}
            </div>
            <dl className="mt-2.5 pt-2.5 border-t border-border-hairline grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <dt className="text-text-muted">PM2.5</dt>
                <dd className="text-[13px] font-semibold text-text-primary tabular-nums">{hovered.pm25 ?? '—'} <span className="font-normal text-text-muted">µg/m³</span></dd>
              </div>
              <div>
                <dt className="text-text-muted">Weather</dt>
                <dd className="text-[13px] font-semibold text-text-primary tabular-nums truncate">{hovered.temp !== undefined ? formatTemp(hovered.temp) : '—'}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[12px] text-text-muted">Click to view this city</p>
          </div>
        )}
      </div>

      {summary}
    </div>
  );
}
