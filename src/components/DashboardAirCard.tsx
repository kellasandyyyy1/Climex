/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CaretRight, TrendUp, TrendDown, Minus } from './Icon';
import StatusBadge, { aqiTone } from './StatusBadge';
import { AqiScaleBar, aqiShortLabel } from './AqiHealthGuidance';
import type { AQIMeasurement } from '../types';

// One plain-language line per level: what it means for going outside today
const ADVICE: Record<AQIMeasurement['status'], string> = {
  Good: 'Great day to be outside. No precautions needed.',
  Moderate: 'Fine for most people. If you’re sensitive, keep long outdoor workouts short.',
  'Unhealthy for Sensitive Groups': 'Children, older adults and people with asthma should limit long time outdoors.',
  Unhealthy: 'Everyone should cut back on long or intense outdoor activity.',
  'Very Unhealthy': 'Avoid long outdoor activity. Sensitive groups should stay indoors.',
  Hazardous: 'Stay indoors and keep windows closed.',
};

/**
 * Dashboard air quality summary: one reading, its level on the AQI scale, what it means,
 * the main pollutant and 4-hour trend, and a link to the full page.
 */
export default function DashboardAirCard({
  aqi,
  href,
  onOpen,
  updated,
}: {
  aqi: AQIMeasurement;
  href: string;
  onOpen: (e: React.MouseEvent) => void;
  /** "Updated … ago" label for the air quality data. */
  updated?: React.ReactNode;
}) {
  const { tone } = aqiTone(aqi.status);
  const valueColor = tone === 'success' ? 'text-status-success' : tone === 'critical' ? 'text-status-danger' : 'text-status-warning';

  const past = aqi.trend?.length >= 5 ? aqi.trend[aqi.trend.length - 5]?.aqi : undefined;
  const diff = past !== undefined ? aqi.aqi - past : 0;
  const trend =
    diff > 0
      ? { Icon: TrendUp, text: `Up ${diff}`, cls: 'text-status-danger' }
      : diff < 0
        ? { Icon: TrendDown, text: `Down ${Math.abs(diff)}`, cls: 'text-status-success' }
        : { Icon: Minus, text: 'Steady', cls: 'text-text-secondary' };

  return (
    <section className="card card-pad flex flex-col gap-4" aria-labelledby="dashboard-air-title" id="aqi-global-snapshot-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="dashboard-air-title" className="card-title">Air quality</h3>
          <p className="card-subtitle truncate">{aqi.city}, {aqi.country}</p>
        </div>
        <a href={href} onClick={onOpen} className="btn btn-ghost btn-sm -mr-2 -mt-1 shrink-0">
          Details
          <CaretRight size={14} />
        </a>
      </div>

      {/* Reading */}
      <div>
        <div className="flex items-end gap-3">
          <span className={`text-[44px] font-semibold tracking-[-0.04em] leading-none tabular-nums ${valueColor}`}>{aqi.aqi}</span>
          <div className="pb-1 flex flex-col items-start gap-1 min-w-0">
            <StatusBadge tone={tone} size="sm">{aqiShortLabel(aqi.status)}</StatusBadge>
            <span className="text-[12px] text-text-muted">US AQI · 0–500 scale</span>
          </div>
        </div>
        <div className="mt-4">
          <AqiScaleBar aqi={aqi.aqi} />
          <div className="mt-1.5 flex justify-between text-[11px] text-text-muted tabular-nums" aria-hidden="true">
            <span>Good</span>
            <span>Unhealthy</span>
            <span>Hazardous</span>
          </div>
        </div>
      </div>

      {/* What it means */}
      <p className="text-[14px] leading-relaxed text-text-primary">{ADVICE[aqi.status] ?? aqi.healthMessage}</p>

      {/* Details */}
      <dl className="grid grid-cols-2 rounded-lg bg-surface-2 divide-x divide-border-hairline">
        <div className="px-3 py-2.5 min-w-0">
          <dt className="text-[12px] text-text-muted">Main pollutant</dt>
          <dd className="text-[14px] font-semibold text-text-primary truncate">
            {aqi.mainPollutant}
            {aqi.mainPollutant === 'PM2.5' && <span className="font-normal text-text-muted"> · {aqi.pm25} µg/m³</span>}
          </dd>
        </div>
        <div className="px-3 py-2.5 min-w-0">
          <dt className="text-[12px] text-text-muted">Last 4 hours</dt>
          <dd className={`text-[14px] font-semibold flex items-center gap-1 ${trend.cls}`}>
            <trend.Icon size={15} />
            {trend.text}
          </dd>
        </div>
      </dl>

      {updated && <p className="text-[12px] -mt-1">{updated}</p>}
    </section>
  );
}
