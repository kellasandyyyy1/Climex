/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WeatherDay } from '../types';
import { Sun, CloudRain, CloudLightning, CloudSnow, Cloud, Star, WarningCircle } from '@phosphor-icons/react';

interface CalendarGridProps {
  forecast: WeatherDay[];
  onDayClick?: (day: WeatherDay) => void;
}

export default function CalendarGrid({ forecast, onDayClick }: CalendarGridProps) {
  const getIcon = (code: number) => {
    if (code === 0) return <Sun weight="light" className="text-xl text-status-warning" size={20} />;
    if (code >= 61 && code <= 65) return <CloudRain weight="light" className="text-xl text-status-accent" size={20} />;
    if (code >= 95 && code <= 99) return <CloudLightning weight="light" className="text-xl text-purple" size={20} />;
    if (code >= 71 && code <= 77) return <CloudSnow weight="light" className="text-xl text-text-secondary" size={20} />;
    return <Cloud weight="light" className="text-xl text-text-secondary" size={20} />;
  };

  return (
    <div className="border border-border-hairline rounded-3xl bg-surface-1 p-6 shadow-xs" id="calendar-forecast-grid">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-sans font-medium text-sm text-text-primary tracking-tight">7-Day Calendar Forecast</h3>
          <p className="text-xs text-text-secondary">Day cells with contextual micro-alerts</p>
        </div>
        <span className="font-sans text-[10px] text-status-warning bg-status-warning-bg border border-status-warning/15 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
          <Star weight="light" className="text-xs" size={12} />
          Active Outlook
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 border-t border-l border-border-hairline rounded-2xl overflow-hidden">
        {forecast?.map((day, index) => {
          const isToday = index === 0;

          return (
            <div
              key={day.date}
              onClick={() => onDayClick?.(day)}
              className={`flex flex-col justify-between p-4 min-h-[140px] border-r border-b border-border-hairline cursor-pointer transition-colors duration-200 ${isToday
                  ? 'bg-status-warning-bg/40 border-status-warning/25'
                  : 'hover:bg-surface-2'
                }`}
            >
              {/* Header: Day name & index */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted font-medium">
                  {day.date.substring(0, 3)}
                </span>
                {isToday && (
                  <span className="font-sans text-[9px] bg-text-primary text-surface-1 px-1.5 py-0.5 rounded font-bold">
                    TODAY
                  </span>
                )}
              </div>

              {/* Central Weather Icon & Temp */}
              <div className="my-3 flex flex-col items-center">
                {getIcon(day.weatherCode)}
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-sans font-semibold text-sm text-text-primary tabular-nums">
                    {day.tempMax}°
                  </span>
                  <span className="font-sans text-[10px] text-text-secondary tabular-nums">
                    {day.tempMin}°
                  </span>
                </div>
                <p className="text-[9px] text-text-secondary mt-1 text-center line-clamp-1 font-medium">{day.condition}</p>
              </div>

              {/* Footer Event Pill */}
              <div className="mt-auto pt-1">
                {day.alert ? (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-status-danger-bg text-status-danger border border-status-danger/15 text-[8px] font-semibold leading-none">
                    <WarningCircle weight="light" className="text-[10px] flex-shrink-0" size={10} />
                    <span className="truncate">{day.alert}</span>
                  </div>
                ) : (
                  <div className="h-4 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-border-hairline" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
