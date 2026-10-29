/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CaretDown } from './Icon';
import StatusBadge from './StatusBadge';

/**
 * Polaris-style settings section: description column on the left (desktop),
 * the controls in a card on the right. On mobile only the active section is shown.
 */
export function SettingsSection({
  id,
  title,
  description,
  activeOnMobile,
  children,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  activeOnMobile: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`${activeOnMobile ? 'grid' : 'hidden'} md:grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 md:gap-8 py-0 md:py-8 md:first:pt-0 md:border-t md:first:border-t-0 border-border-hairline`}
    >
      <div className="md:pt-1">
        <h2 id={`${id}-title`} className="text-[15px] font-semibold text-text-primary tracking-tight">{title}</h2>
        <div className="mt-1 text-[13px] md:text-[14px] text-text-secondary leading-relaxed max-w-prose">{description}</div>
      </div>
      <div className="card divide-y divide-border-hairline">{children}</div>
    </section>
  );
}

/** One labelled setting inside a section card: label + help text, control below (mobile) or beside (desktop). */
export function SettingsRow({
  label,
  help,
  htmlFor,
  saved,
  stack = false,
  children,
}: {
  label: string;
  help?: React.ReactNode;
  htmlFor?: string;
  saved?: boolean;
  /** Always put the control under the label (for wide inputs). */
  stack?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`card-pad flex flex-col gap-3 ${stack ? '' : 'sm:flex-row sm:items-center sm:justify-between sm:gap-6'}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {htmlFor ? (
            <label htmlFor={htmlFor} className="text-[14px] font-medium text-text-primary">{label}</label>
          ) : (
            <span className="text-[14px] font-medium text-text-primary">{label}</span>
          )}
          {saved && (
            <StatusBadge tone="success" progress="complete" size="xs">Saved</StatusBadge>
          )}
        </div>
        {help && <p className="mt-0.5 text-[13px] text-text-secondary leading-relaxed">{help}</p>}
      </div>
      <div className={stack ? '' : 'shrink-0'}>{children}</div>
    </div>
  );
}

/** Native select styled to match the rest of the form controls. */
export function SettingsSelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative w-full sm:w-56">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full h-11 sm:h-10 bg-surface-1 border border-border-hairline hover:border-border-strong focus:border-border-strong focus:ring-4 focus:ring-accent/10 rounded-lg pl-3 pr-9 font-sans text-[14px] text-text-primary focus:outline-none cursor-pointer transition-colors"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
    </div>
  );
}

/** Accessible on/off switch. */
export function SettingsSwitch({
  id,
  checked,
  onChange,
  label,
}: {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 h-11 sm:h-10 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <span className="text-[13px] font-medium text-text-secondary w-6 text-right">{checked ? 'On' : 'Off'}</span>
      <span className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-status-success' : 'bg-surface-3 border border-border-strong'}`}>
        <span
          className={`absolute top-1/2 -translate-y-1/2 left-0.5 w-5 h-5 rounded-full bg-surface-1 shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </span>
    </button>
  );
}
