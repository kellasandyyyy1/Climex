/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StatGaugeProps {
  value: number; // 0 to 100
  max?: number;
  title: string;
  subtitle?: string;
  label: string;
  colorClass?: string; // e.g. "text-accent"
}

export default function StatGauge({
  value,
  max = 100,
  title,
  subtitle,
  label,
  colorClass = 'text-status-accent'
}: StatGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-surface-2 rounded-2xl md:rounded-3xl text-center border border-border-hairline/20" id={`gauge-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h4 className="font-sans font-medium text-xs text-text-secondary uppercase tracking-wider mb-1">{title}</h4>
      {subtitle && <p className="text-[10px] text-text-muted mb-2 md:mb-4 font-medium">{subtitle}</p>}
      
      <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border-hairline opacity-50 dark:opacity-20"
            strokeWidth={strokeWidth}
          />
          {/* Active fill */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Absolute centered labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-sans font-bold text-2xl tracking-tight text-text-primary tabular-nums">
            {label}
          </span>
          <span className="text-[9px] font-mono text-text-secondary uppercase mt-0.5 font-semibold">
            {percentage.toFixed(0)}% Cap
          </span>
        </div>
      </div>
    </div>
  );
}
