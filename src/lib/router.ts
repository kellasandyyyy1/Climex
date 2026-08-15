/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

/**
 * Minimal history-based routing.
 *
 * The dashboard itself is a single view driven by `activeTab` state, so this
 * exists only to give standalone pages (like the privacy policy) a real,
 * linkable URL without pulling in a router dependency.
 */

export const ROUTES = {
  dashboard: '/',
  privacy: '/privacy-policy',
} as const;

/** Alternate paths that should resolve to the privacy policy. */
const PRIVACY_ALIASES = ['/privacy-policy', '/privacy'];

export type Route = 'dashboard' | 'privacy';

/** Strips a trailing slash so `/privacy-policy/` matches `/privacy-policy`. */
function normalize(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed.toLowerCase();
}

export function routeFromPath(pathname: string): Route {
  return PRIVACY_ALIASES.includes(normalize(pathname)) ? 'privacy' : 'dashboard';
}

/**
 * Pushes a new path and notifies listeners. `popstate` does not fire for
 * `pushState`, so we dispatch it ourselves to keep `useRoute` in sync.
 */
export function navigate(path: string) {
  if (normalize(window.location.pathname) === normalize(path)) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

/** Current route, kept in sync with back/forward navigation. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => routeFromPath(window.location.pathname));

  useEffect(() => {
    const sync = () => setRoute(routeFromPath(window.location.pathname));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return route;
}

/**
 * Click handler for in-app anchors: keeps normal link behaviour (open in new
 * tab, copy link address) while intercepting plain left-clicks.
 */
export function handleLinkClick(path: string) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    navigate(path);
  };
}
