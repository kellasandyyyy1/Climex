/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/** Display labels for global-search result types, in the order groups are shown. */
export const SEARCH_GROUP_LABELS: Record<string, string> = {
  Crypto: 'Crypto',
  Weather: 'Weather',
  'Air Quality': 'Air quality',
  Forex: 'Currency',
  Country: 'Countries',
  Report: 'Reports',
};

/** Queries offered when the search box is focused but empty. */
export const SEARCH_SUGGESTIONS = ['Bitcoin', 'Tokyo', 'EUR', 'Japan', 'Air quality'];

/** Wraps the first case-insensitive occurrence of `query` inside `text` in a subtle highlight. */
export default function SearchHighlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-status-accent-bg text-text-primary font-semibold rounded-[3px]">{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}
