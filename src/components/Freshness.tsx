/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { relativeAge } from '../lib/offlineData';

/**
 * "Updated 12 min ago" for a data widget. Past its max age the label dims and says "stale",
 * so saved data is never presented as live.
 */
export default function Freshness({
  fetchedAt,
  maxAgeMs,
  now,
  prefix = 'Updated',
  className = '',
}: {
  fetchedAt?: number;
  maxAgeMs: number;
  now: number;
  prefix?: string;
  className?: string;
}) {
  if (!fetchedAt) return null;
  const age = now - fetchedAt;
  const stale = age > maxAgeMs;
  const when = new Date(fetchedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap tabular-nums ${stale ? 'text-text-muted/60' : 'text-text-muted'} ${className}`}
      title={stale ? `Saved ${when}. This may be out of date.` : `Updated ${when}`}
    >
      {prefix} {relativeAge(age)}
      {stale && <span className="font-medium text-status-warning/80">· stale</span>}
    </span>
  );
}
