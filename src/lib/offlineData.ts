/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DashboardData, DataSyncStatus } from '../types';

/**
 * Per-type data loading with an on-device copy for offline use.
 * Each type has its own endpoint (so the service worker can cache it with its own strategy),
 * its own "fetched at" time (taken from the response Date header, which survives in the SW cache),
 * and its own max age after which the UI marks it as stale.
 */

export type SectionKey = 'crypto' | 'weather' | 'currency' | 'aqi' | 'countries';
export const SECTION_KEYS: SectionKey[] = ['crypto', 'weather', 'currency', 'aqi', 'countries'];

const MIN = 60 * 1000;
export const SECTIONS: Record<SectionKey, { url: string; maxAgeMs: number; provider: string; providerUrl: string }> = {
  crypto: { url: '/api/crypto', maxAgeMs: 2 * MIN, provider: 'CoinGecko', providerUrl: 'https://api.coingecko.com' },
  weather: { url: '/api/weather', maxAgeMs: 15 * MIN, provider: 'Open-Meteo', providerUrl: 'https://api.open-meteo.com' },
  currency: { url: '/api/currency', maxAgeMs: 60 * MIN, provider: 'Frankfurter', providerUrl: 'https://api.frankfurter.app' },
  aqi: { url: '/api/air-quality', maxAgeMs: 30 * MIN, provider: 'OpenAQ', providerUrl: 'https://api.openaq.org' },
  countries: { url: '/api/countries', maxAgeMs: 30 * 24 * 60 * MIN, provider: 'REST Countries', providerUrl: 'https://restcountries.com' },
};

export interface SectionResult {
  data: any[];
  status: DataSyncStatus['status'];
  fetchedAt: number;
  /** 'network' = from the server or the service worker cache; 'device' = the saved copy in localStorage. */
  source: 'network' | 'device';
}
export type SectionMeta = Pick<SectionResult, 'fetchedAt' | 'source'>;

const SNAPSHOT_KEY = 'climex-snapshot-v1';

export function loadSnapshot(): Partial<Record<SectionKey, SectionResult>> {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSnapshot(sections: Partial<Record<SectionKey, SectionResult>>) {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(sections));
  } catch {
    // Storage full or unavailable: the service worker cache still covers offline use
  }
}

async function fetchSection(key: SectionKey): Promise<SectionResult> {
  const res = await fetch(SECTIONS[key].url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${SECTIONS[key].url} returned HTTP ${res.status}`);
  const json = await res.json();
  if (!json || !Array.isArray(json.data)) throw new Error(`${SECTIONS[key].url} returned an unexpected payload`);
  const served = Date.parse(res.headers.get('date') ?? '');
  return {
    data: json.data,
    status: json.status ?? 'online',
    fetchedAt: Number.isFinite(served) ? Math.min(served, Date.now()) : Date.now(),
    source: 'network',
  };
}

export interface LoadResult {
  data: DashboardData | null;
  meta: Partial<Record<SectionKey, SectionMeta>>;
  /** Types that couldn't be loaded from the network (shown from the device copy if one exists). */
  failed: SectionKey[];
}

export function buildDashboardData(sections: Partial<Record<SectionKey, SectionResult>>): DashboardData | null {
  if (!SECTION_KEYS.every(k => sections[k])) return null;
  const s = sections as Record<SectionKey, SectionResult>;
  const syncStatus: DataSyncStatus[] = SECTION_KEYS.map(k => ({
    provider: SECTIONS[k].provider,
    url: SECTIONS[k].providerUrl,
    status: s[k].source === 'device' ? 'offline' : s[k].status,
    lastSync: new Date(s[k].fetchedAt).toLocaleTimeString(),
  }));
  return {
    crypto: s.crypto.data,
    weather: s.weather.data,
    currency: s.currency.data,
    aqi: s.aqi.data,
    countries: s.countries.data,
    syncStatus,
  };
}

const metaOf = (sections: Partial<Record<SectionKey, SectionResult>>) =>
  Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, { fetchedAt: v!.fetchedAt, source: v!.source }])) as LoadResult['meta'];

/** The saved copy, for an instant first paint before the network answers. */
export function loadSavedDashboard(): LoadResult {
  const saved = loadSnapshot();
  const sections = Object.fromEntries(Object.entries(saved).map(([k, v]) => [k, { ...v!, source: 'device' as const }]));
  return { data: buildDashboardData(sections), meta: metaOf(sections), failed: [] };
}

/** Loads every type; anything that fails falls back to its saved copy. */
export async function loadDashboard(): Promise<LoadResult> {
  const saved = loadSnapshot();
  const results = await Promise.allSettled(SECTION_KEYS.map(fetchSection));
  const sections: Partial<Record<SectionKey, SectionResult>> = {};
  const fresh: Partial<Record<SectionKey, SectionResult>> = { ...saved };
  const failed: SectionKey[] = [];

  results.forEach((r, i) => {
    const key = SECTION_KEYS[i];
    if (r.status === 'fulfilled') {
      sections[key] = r.value;
      fresh[key] = r.value;
    } else {
      failed.push(key);
      if (saved[key]) sections[key] = { ...saved[key]!, source: 'device' };
    }
  });

  if (failed.length < SECTION_KEYS.length) saveSnapshot(fresh);
  return { data: buildDashboardData(sections), meta: metaOf(sections), failed };
}

/** "just now", "12 min ago", "3 h ago", "2 d ago" */
export function relativeAge(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}
