/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type StatusTone = 'success' | 'attention' | 'warning' | 'critical' | 'info' | 'neutral';
// Kept for API compatibility; every status now uses the same dot and the tone carries the meaning.
export type StatusProgress = 'complete' | 'partial' | 'incomplete';

const TONE_STYLE: Record<StatusTone, React.CSSProperties> = {
  success: { backgroundColor: 'var(--badge-success-bg)', color: 'var(--badge-success-fg)' },
  attention: { backgroundColor: 'var(--badge-attention-bg)', color: 'var(--badge-attention-fg)' },
  warning: { backgroundColor: 'var(--badge-warning-bg)', color: 'var(--badge-warning-fg)' },
  critical: { backgroundColor: 'var(--badge-critical-bg)', color: 'var(--badge-critical-fg)' },
  info: { backgroundColor: 'var(--badge-info-bg)', color: 'var(--badge-info-fg)' },
  neutral: { backgroundColor: 'var(--badge-neutral-bg)', color: 'var(--badge-neutral-fg)' },
};

/** Status dot: a small solid circle in the current text color. `size` is the box it sits in. */
export function StatusIcon({
  size = 12,
  className = '',
}: {
  progress?: StatusProgress;
  size?: number;
  className?: string;
}) {
  const dot = Math.max(5, Math.round(size * 0.5));
  return (
    <span aria-hidden="true" className={`inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span className="rounded-full bg-current" style={{ width: dot, height: dot }} />
    </span>
  );
}

/** Soft pill with an optional status dot, used for every live/health/level signal across the app. */
export default function StatusBadge({
  tone = 'neutral',
  progress,
  children,
  size = 'sm',
  className = '',
  title,
}: {
  tone?: StatusTone;
  progress?: StatusProgress | null;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  title?: string;
}) {
  const sizing =
    size === 'xs'
      ? 'h-5 px-2 gap-1.5 text-[11px]'
      : size === 'md'
        ? 'h-7 px-3 gap-2 text-[13px]'
        : 'h-6 px-2.5 gap-1.5 text-[12px]';
  const dot = size === 'md' ? 7 : size === 'xs' ? 5 : 6;

  return (
    <span
      title={title}
      style={TONE_STYLE[tone]}
      className={`inline-flex items-center rounded-full font-sans font-medium leading-none whitespace-nowrap select-none shrink-0 ${sizing} ${className}`}
    >
      {progress !== null && <span aria-hidden="true" className="rounded-full bg-current shrink-0" style={{ width: dot, height: dot }} />}
      {children}
    </span>
  );
}

/** Maps an AQI category to a badge tone. */
export function aqiTone(status?: string): { tone: StatusTone; progress: StatusProgress } {
  switch (status) {
    case 'Good':
      return { tone: 'success', progress: 'complete' };
    case 'Moderate':
      return { tone: 'attention', progress: 'complete' };
    case 'Unhealthy for Sensitive Groups':
      return { tone: 'warning', progress: 'complete' };
    case 'Unhealthy':
    case 'Very Unhealthy':
    case 'Hazardous':
      return { tone: 'critical', progress: 'complete' };
    default:
      return { tone: 'neutral', progress: 'complete' };
  }
}
