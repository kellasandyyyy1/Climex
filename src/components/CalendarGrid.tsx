/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WeatherDay } from '../types';
import StatusBadge from './StatusBadge';
import { Sun, CloudRain, CloudLightning, CloudSnow, Cloud, WarningCircle } from './Icon';

interface CalendarGridProps {
  forecast: WeatherDay[];
  onDayClick?: (day: WeatherDay) => void;
  /** 'grid' = horizontal 7-day strip (tablet/desktop), 'list' = compact rows (mobile). */
  variant?: 'grid' | 'list';
  /** Formats a Celsius value for display (e.g. unit conversion). Defaults to rounded °. */
  formatDeg?: (tempC: number) => string;
}

export default function CalendarGrid({ forecast, onDayClick, variant = 'grid', formatDeg }: CalendarGridProps) {
  const deg = formatDeg || ((t: number) => `${Math.round(t)}°`);
  const days = forecast || [];

  const getIcon = (code: number, size = 24) => {
    if (code === 0) return <Sun weight="regular" className="text-status-warning" size={size} />;
    if (code >= 61 && code <= 65) return <CloudRain weight="regular" className="text-status-accent" size={size} />;
    if (code >= 95 && code <= 99) return <CloudLightning weight="regular" className="text-purple" size={size} />;
    if (code >= 71 && code <= 77) return <CloudSnow weight="regular" className="text-text-secondary" size={size} />;
    return <Cloud weight="regular" className="text-text-secondary" size={size} />;
  };

  const dayLabel = (day: WeatherDay, index: number, short = true) =>
    index === 0 ? 'Today' : short ? day.date.substring(0, 3) : day.date;

  const alerts = days.map((d, i) => ({ d, i })).filter(({ d }) => !!d.alert);
  const weekMin = days.length ? Math.min(...days.map((d) => d.tempMin)) : 0;
  const weekMax = days.length ? Math.max(...days.map((d) => d.tempMax)) : 1;
  const span = weekMax - weekMin || 1;

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="card-title">7-day forecast</h3>
        <p className="card-subtitle">Daily high and low</p>
      </div>
      {alerts.length > 0 ? (
        <StatusBadge tone="warning" progress="partial">{alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}</StatusBadge>
      ) : (
        <StatusBadge tone="success" progress="complete">No alerts</StatusBadge>
      )}
    </div>
  );

  const alertList = alerts.length > 0 && (
    <ul className="flex flex-col gap-2">
      {alerts.map(({ d, i }) => (
        <li key={d.date} className="flex items-start gap-2 rounded-xl bg-status-warning-bg px-3 py-2.5 text-[13px] text-status-warning">
          <WarningCircle size={16} className="shrink-0 mt-0.5" />
          <span><span className="font-semibold">{dayLabel(d, i, false)}:</span> {d.alert}</span>
        </li>
      ))}
    </ul>
  );

  if (days.length === 0) {
    return (
      <div className="card card-pad flex flex-col gap-4" id="calendar-forecast-grid">
        {header}
        <div className="rounded-xl bg-surface-2 py-10 text-center">
          <p className="text-[14px] font-medium text-text-primary">No forecast available yet</p>
          <p className="text-[13px] text-text-muted mt-0.5">Daily forecasts appear once the weather feed syncs.</p>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="card card-pad flex flex-col gap-3" id="calendar-forecast-list">
        {header}
        <ul className="flex flex-col">
          {days.map((day, index) => {
            const left = ((day.tempMin - weekMin) / span) * 100;
            const width = Math.max(6, ((day.tempMax - day.tempMin) / span) * 100);
            return (
              <li
                key={day.date}
                onClick={() => onDayClick?.(day)}
                className={`grid grid-cols-[52px_28px_minmax(0,1fr)_auto] items-center gap-2.5 min-h-12 border-b border-border-hairline last:border-0 ${onDayClick ? 'cursor-pointer' : ''}`}
              >
                <span className={`text-[14px] ${index === 0 ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'} flex items-center gap-1`}>
                  {dayLabel(day, index)}
                  {day.alert && <WarningCircle size={13} className="text-status-warning shrink-0" aria-label="Weather alert" />}
                </span>
                <span className="flex items-center justify-center">{getIcon(day.weatherCode, 22)}</span>
                <span className="text-[13px] text-text-secondary truncate">{day.condition}</span>
                <span className="flex items-center gap-2 tabular-nums">
                  <span className="w-9 text-right text-[13px] text-text-muted">{deg(day.tempMin)}</span>
                  <span className="relative w-14 h-1.5 rounded-full bg-surface-2 overflow-hidden" aria-hidden="true">
                    <span className="absolute inset-y-0 rounded-full bg-status-info" style={{ left: `${left}%`, width: `${Math.min(100 - left, width)}%` }} />
                  </span>
                  <span className="w-9 text-[14px] font-semibold text-text-primary">{deg(day.tempMax)}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {alertList}
      </div>
    );
  }

  return (
    <div className="card card-pad md:p-6 flex flex-col gap-4" id="calendar-forecast-grid">
      {header}

      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
        {days.map((day, index) => {
          const isToday = index === 0;
          return (
            <div
              key={day.date}
              onClick={() => onDayClick?.(day)}
              className={`flex-1 min-w-[96px] flex flex-col items-center gap-2 rounded-xl border px-2 py-3.5 transition-colors ${isToday
                ? 'bg-surface-2 border-border-hairline'
                : 'border-transparent hover:bg-surface-2'
                } ${onDayClick ? 'cursor-pointer' : ''}`}
            >
              <span className={`text-[13px] ${isToday ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
                {dayLabel(day, index)}
              </span>
              {getIcon(day.weatherCode)}
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-[15px] font-semibold text-text-primary">{deg(day.tempMax)}</span>
                <span className="text-[13px] text-text-muted">{deg(day.tempMin)}</span>
              </div>
              <p className="text-[12px] text-text-muted text-center leading-tight line-clamp-2 min-h-[30px]">{day.condition}</p>
              {day.alert ? (
                <StatusBadge tone="warning" progress="partial" size="sm" title={day.alert}>Alert</StatusBadge>
              ) : (
                <span className="h-5" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>

      {alertList}
    </div>
  );
}
