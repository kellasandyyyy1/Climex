/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CaretDown } from './Icon';
import StatusBadge from './StatusBadge';
import type { Alert } from '../types';

const CATEGORY_LABEL: Record<Alert['category'], string> = {
  crypto: 'Crypto',
  weather: 'Weather',
  aqi: 'Air quality',
  currency: 'Currency',
};

/** Turns the compact "5m" / "now" output of getRelativeTime into a readable label. */
export function alertsTimeLabel(rel: string): string {
  return rel === 'now' ? 'Just now' : `${rel} ago`;
}

/**
 * One alert row: severity icon tile, headline, short detail, category + relative time.
 * Clicking (or Enter / Space) toggles the details panel.
 */
export default function AlertsItem({
  item,
  tone,
  icon,
  relativeTime,
  isExpanded,
  isNew,
  onToggle,
  mobileHidden = false,
  className = '',
}: {
  item: Alert;
  tone: 'warning' | 'info';
  icon: React.ReactNode;
  relativeTime: string;
  isExpanded: boolean;
  isNew: boolean;
  onToggle: () => void;
  /** Hide below the md breakpoint (collapsed mobile list). */
  mobileHidden?: boolean;
  className?: string;
}) {
  const extra = item.sourceEvent?.extraInfo && typeof item.sourceEvent.extraInfo === 'object' ? Object.entries(item.sourceEvent.extraInfo) : [];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`${mobileHidden ? 'hidden md:flex' : 'flex'} gap-3 -mx-2 px-2 py-3 rounded-lg cursor-pointer select-none transition-colors duration-700 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${isNew ? 'bg-status-warning-bg' : 'hover:bg-surface-2'} ${className}`}
      id={`alert-item-${item.id}`}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `var(--badge-${tone}-bg)`, color: `var(--badge-${tone}-fg)` }}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[14px] font-medium text-text-primary leading-snug ${isExpanded ? '' : 'line-clamp-2'}`}>{item.headline}</p>
          <CaretDown
            size={14}
            className={`shrink-0 mt-1 text-text-muted transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>

        {item.detail && (
          <p className={`mt-0.5 text-[13px] text-text-secondary leading-relaxed ${isExpanded ? '' : 'line-clamp-1'}`}>{item.detail}</p>
        )}

        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-text-muted">
          {isNew && (
            <StatusBadge tone="attention" progress={null} size="xs">New</StatusBadge>
          )}
          <span>{CATEGORY_LABEL[item.category] ?? item.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={item.createdAt} title={new Date(item.createdAt).toLocaleString()}>{alertsTimeLabel(relativeTime)}</time>
        </div>

        {isExpanded && item.sourceEvent && (
          <dl
            className="mt-3 p-3 bg-surface-2 rounded-lg border border-border-hairline grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[13px] select-text cursor-text animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <dt className="text-text-muted">Metric</dt>
            <dd className="text-text-primary font-medium text-right break-words">{item.sourceEvent.metric}</dd>
            <dt className="text-text-muted">Value</dt>
            <dd className="text-text-primary font-semibold text-right tabular-nums">{item.sourceEvent.value}</dd>
            <dt className="text-text-muted">Applies to</dt>
            <dd className="text-text-primary font-medium text-right break-words">{item.sourceEvent.targetEntity}</dd>
            {extra.length > 0 && (
              <div className="col-span-2 mt-1 pt-2 border-t border-border-hairline flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-text-muted">
                {extra.map(([k, v]) => (
                  <span key={k}>
                    {k}: <span className="text-text-secondary">{String(v)}</span>
                  </span>
                ))}
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
