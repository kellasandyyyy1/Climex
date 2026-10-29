/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Loading placeholders shaped like each page's real layout (mobile and desktop),
 * shown while the dashboard data is fetched.
 */

type Size = string; // Tailwind width/height classes

export function Bone({ w = 'w-full', h = 'h-4', className = '' }: { w?: Size; h?: Size; className?: string; key?: React.Key }) {
  return <span aria-hidden="true" className={`skeleton block ${w} ${h} ${className}`} />;
}

const Dot = ({ size = 'w-8 h-8' }: { size?: Size }) => <span aria-hidden="true" className={`skeleton block rounded-full shrink-0 ${size}`} />;

const Card = ({ className = '', children }: { className?: string; children: React.ReactNode; key?: React.Key }) => (
  <div className={`card card-pad ${className}`}>{children}</div>
);

const CardHeader = ({ action = true }: { action?: boolean }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex flex-col gap-2 flex-1">
      <Bone w="w-32" h="h-4" />
      <Bone w="w-48" h="h-3" />
    </div>
    {action && <Bone w="w-16" h="h-6" className="rounded-full" />}
  </div>
);

const Segmented = ({ n = 3 }: { n?: number }) => (
  <div className="flex gap-1 p-1 rounded-[10px] bg-surface-2 border border-border-hairline">
    {Array.from({ length: n }).map((_, i) => (
      <Bone key={i} w="flex-1" h="h-8" className={i === 0 ? 'bg-surface-1' : 'opacity-0'} />
    ))}
  </div>
);

/** Row with avatar, two text lines and a right-aligned value pair (coins, pairs, cities, alerts). */
const Row = ({ avatar = true, square = false }: { avatar?: boolean; square?: boolean; key?: React.Key }) => (
  <div className="flex items-center gap-3 py-2.5">
    {avatar && (square ? <Bone w="w-8" h="h-8" className="rounded-lg shrink-0" /> : <Dot />)}
    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
      <Bone w="w-28" h="h-3.5" />
      <Bone w="w-16" h="h-3" />
    </div>
    <div className="flex flex-col items-end gap-1.5">
      <Bone w="w-20" h="h-3.5" />
      <Bone w="w-12" h="h-3" />
    </div>
  </div>
);

const Rows = ({ n, avatar = true, square = false }: { n: number; avatar?: boolean; square?: boolean }) => (
  <div className="flex flex-col divide-y divide-border-hairline">
    {Array.from({ length: n }).map((_, i) => <Row key={i} avatar={avatar} square={square} />)}
  </div>
);

const Stat = () => (
  <div className="flex flex-col gap-2 min-w-0">
    <Bone w="w-20" h="h-3" />
    <Bone w="w-24" h="h-5" />
  </div>
);

const StatGrid = ({ n = 4, cols = 'grid-cols-2 md:grid-cols-4' }: { n?: number; cols?: string }) => (
  <div className={`grid ${cols} gap-4`}>
    {Array.from({ length: n }).map((_, i) => <Stat key={i} />)}
  </div>
);

const Chart = ({ h = 'h-[200px] md:h-[240px]' }: { h?: Size }) => <Bone w="w-full" h={h} className="rounded-lg" />;

const Hero = () => (
  <Card className="flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <Dot size="w-10 h-10" />
      <div className="flex flex-col gap-2 flex-1">
        <Bone w="w-32" h="h-4" />
        <Bone w="w-24" h="h-3" />
      </div>
    </div>
    <div className="flex items-end gap-3">
      <Bone w="w-48 md:w-64" h="h-9 md:h-11" />
      <Bone w="w-16" h="h-6" className="rounded-full" />
    </div>
  </Card>
);

const List = ({ n = 6, square = false }: { n?: number; square?: boolean }) => (
  <Card className="flex flex-col gap-3">
    <CardHeader />
    <Bone w="w-full" h="h-10" className="rounded-lg" />
    <Rows n={n} square={square} />
  </Card>
);

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 xl:gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bone w="w-6" h="h-6" className="rounded-md" />
                <Bone w="w-16 md:w-24" h="h-3" />
              </div>
              <Bone w="w-12" h="h-5" className="rounded-full hidden md:block" />
            </div>
            <Bone w="w-24 md:w-36" h="h-6 md:h-7" />
            <Bone w="w-20" h="h-3" />
          </Card>
        ))}
      </div>
      <div className="lg:hidden"><Segmented /></div>
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 xl:gap-5">
        <div className="hidden lg:flex lg:col-span-3 flex-col">
          <Card className="flex flex-col gap-3 h-full">
            <CardHeader />
            <Rows n={5} square />
          </Card>
        </div>
        <div className="lg:col-span-6 flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-3">
            <CardHeader />
            <Rows n={4} />
          </div>
          <Card className="flex flex-col gap-4">
            <CardHeader />
            <Bone w="w-52" h="h-8" />
            <Chart />
          </Card>
        </div>
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 md:gap-6">
          <Card className="flex flex-col items-center gap-4">
            <div className="w-full"><CardHeader /></div>
            <Bone w="w-28" h="h-16" />
            <Bone w="w-40" h="h-3" />
            <Bone w="w-full" h="h-10" />
          </Card>
          <Card className="flex flex-col items-center gap-4">
            <Bone w="w-32" h="h-4" />
            <Dot size="w-32 h-32" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function CryptoSkeleton() {
  return (
    <>
      <div className="flex md:hidden flex-col gap-3">
        <Hero />
        <Segmented />
        <Card><StatGrid /></Card>
        <Card className="flex flex-col gap-2"><CardHeader /><Rows n={3} /></Card>
      </div>
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Dot size="w-11 h-11" />
              <div className="flex flex-col gap-2 flex-1"><Bone w="w-36" h="h-4" /><Bone w="w-52" h="h-5" className="rounded-full" /></div>
              <Bone w="w-28" h="h-9" className="rounded-lg" />
            </div>
            <div className="flex items-end gap-3"><Bone w="w-64" h="h-11" /><Bone w="w-20" h="h-7" className="rounded-full" /></div>
            <StatGrid />
          </Card>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between"><Bone w="w-36" h="h-4" /><Bone w="w-40" h="h-8" className="rounded-lg" /></div>
            <Chart h="h-[280px]" />
          </Card>
        </div>
        <div className="lg:col-span-4"><List n={8} /></div>
      </div>
    </>
  );
}

function CurrencySkeleton() {
  return (
    <>
      <div className="flex md:hidden flex-col gap-3">
        <Card className="flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2"><Bone h="h-11" className="rounded-lg" /><Bone w="w-11" h="h-11" className="rounded-lg" /><Bone h="h-11" className="rounded-lg" /></div>
          <Bone h="h-11" className="rounded-lg" />
          <div className="pt-3 border-t border-border-hairline flex flex-col gap-2"><Bone w="w-40" h="h-9" /><Bone w="w-48" h="h-3" /></div>
        </Card>
        <Segmented />
        <Card className="flex flex-col gap-3"><CardHeader /><Chart h="h-[190px]" /></Card>
      </div>
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <Bone w="w-28" h="h-4" />
              <Bone h="h-11" className="rounded-lg" />
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2"><Bone h="h-11" className="rounded-lg" /><Bone w="w-11" h="h-11" className="rounded-lg" /><Bone h="h-11" className="rounded-lg" /></div>
            </div>
            <div className="rounded-xl bg-surface-2/60 p-5 flex flex-col gap-3 justify-center"><Bone w="w-32" h="h-3" /><Bone w="w-48" h="h-11" /><Bone w="w-40" h="h-3" /></div>
          </Card>
          <Card className="flex flex-col gap-4"><CardHeader /><Chart h="h-[260px]" /></Card>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6"><List n={6} /><Card className="flex flex-col gap-4"><Bone w="w-28" h="h-4" /><StatGrid n={2} cols="grid-cols-2" /><Bone h="h-2" className="rounded-full" /></Card></div>
      </div>
    </>
  );
}

function WeatherSkeleton() {
  const Current = () => (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3"><div className="flex flex-col gap-2"><Bone w="w-24" h="h-3" /><Bone w="w-44" h="h-6" /></div><Bone w="w-24" h="h-9" className="rounded-lg" /></div>
      <div className="flex items-center gap-4"><Bone w="w-14" h="h-14" className="rounded-xl" /><Bone w="w-36" h="h-12" /><div className="flex flex-col gap-2"><Bone w="w-20" h="h-4" /><Bone w="w-28" h="h-3" /></div></div>
      <StatGrid />
    </Card>
  );
  return (
    <>
      <div className="flex md:hidden flex-col gap-3">
        <Current />
        <Segmented />
        <Card className="flex flex-col gap-3"><CardHeader action={false} /><div className="grid grid-cols-4 gap-2">{Array.from({ length: 4 }).map((_, i) => <Bone key={i} h="h-24" className="rounded-lg" />)}</div></Card>
      </div>
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3"><List n={8} /></div>
        <div className="lg:col-span-9 flex flex-col gap-6">
          <Current />
          <Card className="flex flex-col gap-4"><CardHeader /><div className="grid grid-cols-7 gap-2">{Array.from({ length: 7 }).map((_, i) => <Bone key={i} h="h-36" className="rounded-lg" />)}</div></Card>
        </div>
      </div>
    </>
  );
}

function AqiSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Bone w="w-full md:w-72" h="h-10" className="rounded-lg" />
        <div className="flex gap-2">{Array.from({ length: 5 }).map((_, i) => <Bone key={i} w="w-16" h="h-9" className="rounded-lg" />)}</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <Card className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex justify-between"><Bone w="w-28" h="h-3" /><Bone w="w-24" h="h-3" /></div>
          <Bone w="w-40" h="h-5" />
          <div className="flex items-end gap-3"><Bone w="w-28" h="h-16" /><Bone w="w-24" h="h-7" className="rounded-full" /></div>
          <Bone h="h-2" className="rounded-full" />
          <Bone w="w-3/4" h="h-4" />
          <div className="grid grid-cols-2 gap-3"><Bone h="h-16" className="rounded-lg" /><Bone h="h-16" className="rounded-lg" /></div>
        </Card>
        <div className="md:hidden"><Segmented n={4} /></div>
        <Card className="hidden md:flex lg:col-span-7 flex-col gap-4">
          <CardHeader />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Bone key={i} h="h-20" className="rounded-lg" />)}</div>
        </Card>
      </div>
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 flex flex-col gap-4"><CardHeader /><Chart h="h-[240px]" /></Card>
        <Card className="lg:col-span-4 flex flex-col gap-4"><CardHeader /><Rows n={3} square /></Card>
      </div>
      <Card className="md:hidden flex flex-col gap-3"><CardHeader /><Rows n={3} square /></Card>
    </div>
  );
}

function CountriesSkeleton() {
  const Profile = () => (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-4"><Bone w="w-14" h="h-10" className="rounded-md" /><div className="flex flex-col gap-2 flex-1"><Bone w="w-40" h="h-6" /><Bone w="w-28" h="h-3" /></div></div>
      <StatGrid />
    </Card>
  );
  return (
    <>
      <div className="flex md:hidden flex-col gap-3">
        <Card className="flex items-center gap-3"><Bone w="w-12" h="h-9" className="rounded-md" /><div className="flex flex-col gap-2 flex-1"><Bone w="w-32" h="h-5" /><Bone w="w-24" h="h-3" /></div><Bone w="w-20" h="h-10" className="rounded-lg" /></Card>
        <Segmented />
        <Card><StatGrid /></Card>
      </div>
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3"><List n={7} square /></div>
        <div className="lg:col-span-9 flex flex-col gap-6"><Profile /><Card className="flex flex-col gap-4"><CardHeader /><Chart h="h-[260px]" /></Card></div>
      </div>
    </>
  );
}

function ReportsSkeleton() {
  const LogRow = () => (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border-hairline">
      <Bone w="w-5" h="h-5" className="rounded-md shrink-0" />
      <Bone w="w-9" h="h-9" className="rounded-lg shrink-0" />
      <div className="flex-1 flex flex-col gap-2 min-w-0"><Bone w="w-48" h="h-4" /><Bone w="w-64 max-w-full" h="h-3" /><Bone w="w-36" h="h-5" className="rounded-full" /></div>
      <Bone w="w-10 sm:w-28" h="h-9" className="rounded-lg shrink-0" />
    </div>
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <Card className="lg:col-span-8 flex flex-col gap-4">
        <CardHeader />
        <div className="flex flex-col sm:flex-row gap-3"><Bone h="h-10" className="rounded-lg flex-1" /><Bone w="w-full sm:w-64" h="h-10" className="rounded-lg" /></div>
        {Array.from({ length: 4 }).map((_, i) => <LogRow key={i} />)}
      </Card>
      <Card className="hidden lg:flex lg:col-span-4 flex-col gap-4">
        <CardHeader action={false} />
        <Bone h="h-32" className="rounded-lg" />
        <Bone h="h-11" className="rounded-lg" />
      </Card>
    </div>
  );
}

function UpdatesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="md:w-96"><Segmented /></div>
        <div className="flex gap-2">{Array.from({ length: 5 }).map((_, i) => <Bone key={i} w="w-20" h="h-9" className="rounded-lg" />)}</div>
      </div>
      <Card className="flex flex-col gap-2">
        <CardHeader />
        <Bone w="w-16" h="h-3" className="mt-3" />
        <Rows n={6} square />
      </Card>
    </div>
  );
}

function DocumentSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="md:hidden"><Segmented /></div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-4 md:gap-8">
          <div className="hidden md:flex flex-col gap-2"><Bone w="w-24" h="h-4" /><Bone w="w-56" h="h-3" /><Bone w="w-44" h="h-3" /></div>
          <Card className="flex flex-col gap-4"><Bone w="w-32" h="h-4" /><Bone w="w-64 max-w-full" h="h-3" /><Bone w="w-full md:w-80" h="h-10" className="rounded-lg" /></Card>
        </div>
      ))}
    </div>
  );
}

const BY_TAB: Record<string, () => React.ReactElement> = {
  dashboard: DashboardSkeleton,
  updates: UpdatesSkeleton,
  crypto: CryptoSkeleton,
  currency: CurrencySkeleton,
  weather: WeatherSkeleton,
  aqi: AqiSkeleton,
  countries: CountriesSkeleton,
  reports: ReportsSkeleton,
  settings: DocumentSkeleton,
  privacy: DocumentSkeleton,
  admin: DocumentSkeleton,
};

export default function PageSkeleton({ tab }: { tab: string }) {
  const Body = BY_TAB[tab] ?? DashboardSkeleton;
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="animate-fade-in">
      <span className="sr-only">Loading…</span>
      <Body />
    </div>
  );
}
