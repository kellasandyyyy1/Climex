/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// URL path for each page (tab id). The splash screen lives at "/".
export const TAB_PATHS: Record<string, string> = {
  dashboard: '/dashboard',
  updates: '/updates',
  crypto: '/crypto',
  currency: '/currency',
  weather: '/weather',
  aqi: '/air-quality',
  countries: '/countries',
  reports: '/reports',
  settings: '/settings',
  privacy: '/privacy-policy',
  admin: '/admin',
};

const PATH_TABS: Record<string, string> = {
  ...Object.fromEntries(Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab])),
  // Older / alternate addresses
  '/privacy': 'privacy',
};

export const NOT_FOUND_TAB = 'notfound';

export function pathForTab(tab: string): string {
  return TAB_PATHS[tab] ?? TAB_PATHS.dashboard;
}

/** Tab for a pathname; null for the splash ("/"), NOT_FOUND_TAB for unknown paths. */
export function tabFromPath(pathname: string): string | null {
  const clean = pathname.replace(/\/+$/, '').toLowerCase() || '/';
  if (clean === '/') return null;
  return PATH_TABS[clean] ?? NOT_FOUND_TAB;
}

/** True when a click should be left to the browser (new tab, new window, download). */
export function isModifiedClick(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }): boolean {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}
