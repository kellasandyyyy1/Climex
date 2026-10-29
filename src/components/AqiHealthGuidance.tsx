/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person, Heartbeat, House } from './Icon';
import StatusBadge, { aqiTone } from './StatusBadge';

/** US EPA AQI categories, in order, with plain-language meaning. */
export const AQI_LEVELS = [
  { status: 'Good', min: 0, max: 50, color: '#10b981', meaning: 'Air quality is satisfactory and poses little or no risk.' },
  { status: 'Moderate', min: 51, max: 100, color: '#eab308', meaning: 'Acceptable. Unusually sensitive people may notice effects.' },
  { status: 'Unhealthy for Sensitive Groups', min: 101, max: 150, color: '#f97316', meaning: 'Sensitive groups may feel effects. Most people are fine.' },
  { status: 'Unhealthy', min: 151, max: 200, color: '#ef4444', meaning: 'Everyone may begin to feel effects; sensitive groups more so.' },
  { status: 'Very Unhealthy', min: 201, max: 300, color: '#a855f7', meaning: 'Health alert: everyone may experience serious effects.' },
  { status: 'Hazardous', min: 301, max: 500, color: '#991b1b', meaning: 'Emergency conditions. Everyone is likely to be affected.' },
] as const;

/** Short display label for an AQI category. */
export function aqiShortLabel(status: string) {
  return status === 'Unhealthy for Sensitive Groups' ? 'Unhealthy for sensitive groups' : status;
}

function guidanceFor(aqi: number) {
  if (aqi <= 50) return {
    everyone: 'A great day to be active outside.',
    sensitive: 'No precautions needed.',
    home: 'Open windows to air out your home.',
  };
  if (aqi <= 100) return {
    everyone: 'Fine for most outdoor activities.',
    sensitive: 'If you are unusually sensitive, keep long or intense outdoor exercise shorter.',
    home: 'Ventilating is fine; avoid peak traffic hours.',
  };
  if (aqi <= 150) return {
    everyone: 'Outdoor activity is OK for most people.',
    sensitive: 'Children, older adults and people with asthma or heart disease should cut back on long or intense outdoor exertion.',
    home: 'Keep windows closed during busy traffic hours.',
  };
  if (aqi <= 200) return {
    everyone: 'Reduce long or intense outdoor activity and take more breaks.',
    sensitive: 'Avoid long or intense outdoor activity; move exercise indoors.',
    home: 'Keep windows closed. Run an air purifier if you have one.',
  };
  if (aqi <= 300) return {
    everyone: 'Avoid long or intense outdoor activity.',
    sensitive: 'Stay indoors and keep activity levels low.',
    home: 'Keep windows closed and run an air purifier if available.',
  };
  return {
    everyone: 'Avoid all outdoor activity.',
    sensitive: 'Remain indoors and keep activity levels low.',
    home: 'Seal windows and doors; use an air purifier if available.',
  };
}

/** Thin six-band AQI scale with a marker at the current reading. */
export function AqiScaleBar({ aqi, showTicks = false }: { aqi: number; showTicks?: boolean }) {
  const idx = AQI_LEVELS.findIndex((l) => aqi <= l.max);
  const band = idx === -1 ? AQI_LEVELS.length - 1 : idx;
  const lvl = AQI_LEVELS[band];
  const within = Math.min(1, Math.max(0, (aqi - lvl.min) / (lvl.max - lvl.min || 1)));
  const pct = ((band + within) / AQI_LEVELS.length) * 100;

  return (
    <div className="w-full" aria-hidden="true">
      <div className="relative h-1.5 flex gap-[2px] rounded-full overflow-visible">
        {AQI_LEVELS.map((l, i) => (
          <span
            key={l.status}
            className={`flex-1 h-full ${i === 0 ? 'rounded-l-full' : ''} ${i === AQI_LEVELS.length - 1 ? 'rounded-r-full' : ''}`}
            style={{ backgroundColor: l.color, opacity: i === band ? 1 : 0.35 }}
          />
        ))}
        <span
          className="absolute top-1/2 w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface-1 border-2 border-text-primary shadow-sm"
          style={{ left: `${pct}%` }}
        />
      </div>
      {showTicks && (
        <div className="flex justify-between mt-2 text-[12px] text-text-muted tabular-nums">
          <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300</span><span>500</span>
        </div>
      )}
    </div>
  );
}

/** Plain-language health guidance for the current AQI, with the EPA scale tucked into a disclosure. */
export default function AqiHealthGuidance({ aqi, status, className = '' }: { aqi: number; status: string; className?: string }) {
  const g = guidanceFor(aqi);
  const level = aqiTone(status);
  const rows = [
    { icon: <Person size={18} />, title: 'Most people', text: g.everyone },
    { icon: <Heartbeat size={18} />, title: 'Sensitive groups', text: g.sensitive },
    { icon: <House size={18} />, title: 'At home', text: g.home },
  ];

  return (
    <section className={`card card-pad flex flex-col gap-4 ${className}`} id="aqi-health-guidance-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="card-title">Health guidance</h3>
          <p className="card-subtitle">What today's air means for you</p>
        </div>
        <StatusBadge tone={level.tone} progress={level.progress} size="sm">{aqiShortLabel(status)}</StatusBadge>
      </div>

      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.title} className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-surface-2 text-text-secondary flex items-center justify-center shrink-0">{r.icon}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-text-primary leading-5">{r.title}</p>
              <p className="text-[14px] text-text-secondary leading-snug">{r.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <details className="group border-t border-border-hairline pt-3" id="aqi-standards-card">
        <summary className="flex items-center justify-between min-h-10 cursor-pointer list-none text-[14px] font-medium text-text-primary [&::-webkit-details-marker]:hidden">
          About the AQI scale (US EPA)
          <span className="text-text-muted text-[13px] group-open:hidden">Show</span>
          <span className="text-text-muted text-[13px] hidden group-open:inline">Hide</span>
        </summary>
        <p className="text-[13px] text-text-secondary leading-relaxed mt-1">
          The US EPA Air Quality Index runs from 0 to 500. The higher the number, the more pollution and the greater the health concern.
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {AQI_LEVELS.map((l) => {
            const t = aqiTone(l.status);
            return (
              <li key={l.status} className="flex items-start gap-2.5">
                <span className="w-[68px] shrink-0 text-[13px] font-medium text-text-primary tabular-nums pt-0.5">{l.min}–{l.max}</span>
                <div className="min-w-0 flex flex-col gap-1">
                  <StatusBadge tone={t.tone} progress={t.progress} size="sm" className="self-start">{aqiShortLabel(l.status)}</StatusBadge>
                  <span className="text-[13px] text-text-secondary leading-snug">{l.meaning}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 rounded-xl bg-surface-2 p-3">
          <p className="text-[13px] font-semibold text-text-primary">Public advisory</p>
          <p className="text-[13px] text-text-secondary leading-relaxed mt-0.5">
            Above 100, people with asthma and active children should limit heavy outdoor exercise and keep windows closed.
          </p>
        </div>
      </details>
    </section>
  );
}
