/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Optional PWA capabilities, all off unless enabled at build time (e.g. VITE_FEATURE_APP_BADGE=true in .env).
const env: Record<string, string | undefined> = (import.meta as any).env ?? {};

export const FEATURES = {
  /** Web Push price alerts (opt-in from the page only; needs VITE_VAPID_PUBLIC_KEY and a sender on the server). */
  pushAlerts: env.VITE_FEATURE_PUSH === 'true',
  /** Periodic Background Sync to refresh cached data (Chromium, installed app only). */
  periodicSync: env.VITE_FEATURE_PERIODIC_SYNC === 'true',
  /** App icon badge with the number of alerts that need attention. */
  appBadge: env.VITE_FEATURE_APP_BADGE === 'true',
};

export const VAPID_PUBLIC_KEY = env.VITE_VAPID_PUBLIC_KEY ?? '';
