/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { CaretRight } from './Icon';
import StatusBadge from './StatusBadge';
import type { CryptoCoin } from '../types';

interface Point {
  i: number;
  time: number;
  price: number;
}

const timeLabel = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const hourLabel = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: 'numeric' });

/**
 * Dashboard price card: live price, change since 24h ago, a 24h line against the 24h-ago level,
 * and the day's high / low / range.
 */
export default function DashboardPriceCard({
  coin,
  format,
  logo,
  href,
  onOpen,
  updated,
}: {
  coin: CryptoCoin;
  /** Formats a USD amount in the user's display currency. */
  format: (usd: number) => string;
  logo: React.ReactNode;
  href: string;
  onOpen: (e: React.MouseEvent) => void;
  /** "Updated … ago" label for the price data. */
  updated?: React.ReactNode;
}) {
  const gradientId = `price-fill-${React.useId().replace(/:/g, '')}`;

  // Hourly points ending at the live price; the last point is "now"
  const data: Point[] = React.useMemo(() => {
    const raw = coin.sparkline?.length ? [...coin.sparkline] : [coin.price];
    raw[raw.length - 1] = coin.price;
    const now = Date.now();
    return raw.map((price, i) => ({ i, price, time: now - (raw.length - 1 - i) * 60 * 60 * 1000 }));
  }, [coin.sparkline, coin.price]);

  const open = data[0].price;
  const last = data[data.length - 1].price;
  const delta = last - open;
  const pct = open ? (delta / open) * 100 : 0;
  const up = delta >= 0;
  const high = data.reduce((a, b) => (b.price > a.price ? b : a));
  const low = data.reduce((a, b) => (b.price < a.price ? b : a));
  const rangePct = low.price ? ((high.price - low.price) / low.price) * 100 : 0;

  const pad = (high.price - low.price) * 0.12 || high.price * 0.002;
  const yMin = low.price - pad;
  const yMax = high.price + pad;
  const yTicks = [low.price, (low.price + high.price) / 2, high.price];
  const axisPrice = (v: number) => format(v).replace(/[.,]\d{2}$/, '');
  const lastIndex = data.length - 1;
  const xTicks = [0, 6, 12, 18, lastIndex].filter((v, idx, arr) => v <= lastIndex && arr.indexOf(v) === idx);

  const lineColor = up ? 'var(--success)' : 'var(--danger)';
  const signed = (n: number) => `${n >= 0 ? '+' : '−'}${format(Math.abs(n))}`;

  return (
    <section className="card card-pad flex flex-col gap-4" aria-labelledby="dashboard-price-title">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-surface-2 shrink-0">{logo}</span>
          <div className="min-w-0">
            <h3 id="dashboard-price-title" className="card-title">{coin.name}</h3>
            <p className="card-subtitle">{coin.symbol.toUpperCase()} · Past 24 hours{updated && <> · {updated}</>}</p>
          </div>
        </div>
        <a href={href} onClick={onOpen} className="btn btn-ghost btn-sm -mr-2 shrink-0">
          Details
          <CaretRight size={14} />
        </a>
      </div>

      {/* Price + change */}
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
        <span className="text-[28px] md:text-[32px] font-semibold tracking-[-0.03em] leading-none text-text-primary tabular-nums">
          {format(last)}
        </span>
        <div className="flex items-center gap-2 pb-0.5">
          <StatusBadge tone={up ? 'success' : 'critical'} progress={null} size="sm" className="tabular-nums">
            {up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
          </StatusBadge>
          <span className={`text-[13px] font-medium tabular-nums ${up ? 'text-status-success' : 'text-status-danger'}`}>{signed(delta)}</span>
          <span className="text-[13px] text-text-muted">since 24h ago</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] md:h-[230px] -mx-1" role="img" aria-label={`${coin.name} price over the past 24 hours, ${up ? 'up' : 'down'} ${Math.abs(pct).toFixed(2)} percent`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.16} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="0" />
            <XAxis
              dataKey="i"
              type="number"
              domain={[0, lastIndex]}
              ticks={xTicks}
              tickFormatter={(i: number) => (i === lastIndex ? 'Now' : hourLabel(data[i]?.time ?? 0))}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)' }}
              tickMargin={8}
              padding={{ left: 2, right: 2 }}
            />
            <YAxis
              orientation="right"
              domain={[yMin, yMax]}
              ticks={yTicks}
              tickFormatter={axisPrice}
              tickLine={false}
              axisLine={false}
              width={72}
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)' }}
            />
            <ReferenceLine
              y={open}
              stroke="var(--border-strong)"
              strokeDasharray="4 4"
              label={{ value: '24h ago', position: 'insideBottomLeft', fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
            />
            <Tooltip
              cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as Point;
                const d = p.price - open;
                return (
                  <div className="bg-surface-1 border border-border-hairline rounded-lg shadow-md px-3 py-2 text-[12.5px]">
                    <p className="text-text-muted">{p.i === lastIndex ? 'Now' : timeLabel(p.time)}</p>
                    <p className="font-semibold text-text-primary tabular-nums text-[14px] mt-0.5">{format(p.price)}</p>
                    <p className={`tabular-nums ${d >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                      {signed(d)} vs 24h ago
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)', fill: lineColor }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Day stats */}
      <dl className="grid grid-cols-3 border-t border-border-hairline pt-3 -mx-1 sm:mx-0">
        <div className="pr-2 sm:pr-3 pl-1 sm:pl-0">
          <dt className="stat-label">24h high</dt>
          <dd className="text-[14px] md:text-[15px] font-semibold text-text-primary tabular-nums mt-0.5 whitespace-nowrap">{format(high.price)}</dd>
          <dd className="text-[12px] text-text-muted">{high.i === lastIndex ? 'Now' : timeLabel(high.time)}</dd>
        </div>
        <div className="px-2 sm:px-3 border-l border-border-hairline">
          <dt className="stat-label">24h low</dt>
          <dd className="text-[14px] md:text-[15px] font-semibold text-text-primary tabular-nums mt-0.5 whitespace-nowrap">{format(low.price)}</dd>
          <dd className="text-[12px] text-text-muted">{low.i === lastIndex ? 'Now' : timeLabel(low.time)}</dd>
        </div>
        <div className="pl-2 sm:pl-3 border-l border-border-hairline">
          <dt className="stat-label">24h range</dt>
          <dd className="text-[14px] md:text-[15px] font-semibold text-text-primary tabular-nums mt-0.5">{rangePct.toFixed(2)}%</dd>
          <dd className="hidden sm:block text-[12px] text-text-muted truncate">{format(high.price - low.price)} spread</dd>
        </div>
      </dl>
    </section>
  );
}
