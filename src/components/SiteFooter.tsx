/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRIVACY_POLICY } from '../content/privacyPolicy';
import { ROUTES, handleLinkClick } from '../lib/router';

interface SiteFooterProps {
  /** Extra classes for page-specific spacing. */
  className?: string;
}

/**
 * Shared site footer, rendered at the bottom of the dashboard and of any
 * standalone page so the legal links stay in one place.
 */
export default function SiteFooter({ className = 'mt-12' }: SiteFooterProps) {
  return (
    <footer
      className={`border-t border-border-hairline py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-text-secondary ${className}`}
      id="climex-footer"
    >
      <p>&copy; 2026 Climex. All rights reserved.</p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <a
          href={ROUTES.privacy}
          onClick={handleLinkClick(ROUTES.privacy)}
          className="hover:text-text-primary transition-colors flex items-center gap-1 font-sans font-medium"
        >
          Privacy Policy
        </a>
        <span aria-hidden="true">•</span>
        <a
          href={`mailto:${PRIVACY_POLICY.contactEmail}`}
          className="hover:text-text-primary transition-colors flex items-center gap-1 font-sans font-medium"
        >
          Support &amp; Resources
        </a>
        <span aria-hidden="true">•</span>
        <span className="font-sans font-medium text-[11px]">Climex Dashboard v1</span>
      </div>
    </footer>
  );
}
