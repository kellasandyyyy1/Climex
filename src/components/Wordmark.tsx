/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/** Climex wordmark: ink lettering in light mode, ivory in dark mode (follows the app's .dark class). */
export default function Wordmark({ className = 'h-[22px]' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`} role="img" aria-label="Climex">
      <img src="/icons/climex-wordmark-light.png" alt="" width={1284} height={336} className="wordmark-light h-full w-auto" draggable={false} />
      <img src="/icons/climex-wordmark-dark.png" alt="" width={1284} height={336} className="wordmark-dark h-full w-auto" draggable={false} />
    </span>
  );
}
