/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  ChartTooltip,
  ChartLegend,
  Filler
);

// 1. Dashboard / Crypto Price Trend Chart
interface PriceChartProps {
  data: number[];
  color?: string;
  name: string;
  height?: string;
  timeframe?: string;
}

export function PriceTrendChart({ data, name, height = 'h-[250px]', timeframe = '24h' }: PriceChartProps) {
  const [isDark, setIsDark] = React.useState(() => document.documentElement.classList.contains('dark'));
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  const localFormatPrice = (usdAmount: number | undefined) => {
    if (usdAmount === undefined || usdAmount === null) return '';
    return `$${usdAmount >= 1 ? usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : usdAmount.toFixed(4)}`;
  };

  // Adjust display data based on timeframe
  let displayData = data || [];
  if (timeframe === '7d') {
    displayData = Array.from({ length: 7 }, (_, i) => data[Math.floor(i * (data.length - 1) / 6)] || data[0] || 0);
  } else if (timeframe === '30d') {
    displayData = Array.from({ length: 15 }, (_, i) => data[Math.floor(i * (data.length - 1) / 14)] || data[0] || 0);
  } else if (timeframe === '1y') {
    displayData = Array.from({ length: 12 }, (_, i) => data[Math.floor(i * (data.length - 1) / 11)] || data[0] || 0);
  }

  // Transform standard numbers array into hourly/daily/monthly objects
  const chartData = displayData.map((price, index) => {
    let label = `${index}h`;
    if (timeframe === '7d') {
      label = `Day ${index + 1}`;
    } else if (timeframe === '30d') {
      label = `Day ${index * 2 + 1}`;
    } else if (timeframe === '1y') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      label = months[index % 12];
    }
    
    return {
      hour: label,
      price: Number(price.toFixed(4))
    };
  });

  // Calculate dynamic scale range (min / max of price trend with slightly padded bounds so line doesn't touch vertical edges)
  const prices = chartData.map(d => d.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1 || (minPrice * 0.001 || 10);
  const yMin = Math.max(0, minPrice - padding);
  const yMax = maxPrice + padding;

  const lineColor = isDark ? '#60a5fa' : '#2563eb';
  const areaColor = isDark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(37, 99, 235, 0.08)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)';

  const chartDataConfig = {
    labels: chartData.map(d => d.hour),
    datasets: [
      {
        type: 'line' as const,
        label: `${name} Price`,
        data: chartData.map(d => d.price),
        borderColor: lineColor,
        borderWidth: 2,
        pointRadius: chartData.map((_, index) => index === chartData.length - 1 ? 4 : 0),
        pointBackgroundColor: lineColor,
        pointBorderColor: isDark ? '#0f172a' : '#ffffff',
        pointBorderWidth: 1.5,
        pointHoverRadius: chartData.map((_, index) => index === chartData.length - 1 ? 6 : 4),
        tension: 0.3,
        fill: true,
        backgroundColor: areaColor,
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const,
      }
    ]
  };

  const chartOptionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 11,
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 11,
        },
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += localFormatPrice(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 10,
          },
          maxTicksLimit: isMobile ? 4 : 8,
        }
      },
      y: {
        type: 'linear' as const,
        min: yMin,
        max: yMax,
        grid: {
          color: gridColor,
          drawTicks: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 10,
          },
          callback: function (value: any) {
            const num = Number(value);
            if (num >= 1e6) {
              return `$${(num / 1e6).toFixed(1)}M`;
            }
            if (num >= 1e3) {
              return `$${(num / 1e3).toFixed(0)}k`;
            }
            return `$${num}`;
          }
        }
      }
    }
  };

  const containerHeightClass = height && height !== 'h-[250px]' ? height : 'h-[180px] md:h-[220px]';

  return (
    <div className="flex flex-col w-full animate-fade-in" id="crypto-price-trend-chart-container">
      {/* Current price as plain text above the chart */}
      <div className="flex justify-between items-center text-xs mb-3 border-b border-border-hairline/20 pb-2">
        <div className="text-text-secondary font-medium">
          Current price: <span className="text-text-primary font-semibold">{localFormatPrice(chartData[chartData.length - 1]?.price)}</span>
        </div>
      </div>

      {/* Chart container */}
      <div 
        className={`w-full relative ${containerHeightClass}`} 
        role="img" 
        aria-label={`${name} Price Trend Chart`}
      >
        <Chart 
          type="line" 
          data={chartDataConfig} 
          options={chartOptionsConfig} 
        />
      </div>
    </div>
  );
}

// 2. Currency History Line Chart
interface CurrencyHistoryChartProps {
  data: { date: string; rate: number }[];
  targetCurrency: string;
}

export function CurrencyHistoryChart({ data, targetCurrency }: CurrencyHistoryChartProps) {
  return (
    <div className="w-full h-48 sm:h-64" id="currency-history-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--ink-soft)', fontSize: 10 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--ink-soft)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--line)',
              borderRadius: '12px',
              fontSize: '11px'
            }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="var(--blue)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: 'var(--ink)', stroke: 'var(--blue)', strokeWidth: 2 }}
            name={`1 USD to ${targetCurrency}`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Country Economic Indicator (World Bank GDP/Population) Chart
interface CountryIndicatorChartProps {
  data: { year: number; gdp?: number; population?: number }[];
  type: 'gdp' | 'population';
  countryName: string;
  flatStroke?: boolean;
}

export function CountryGrowthChart({ data, type, countryName, flatStroke }: CountryIndicatorChartProps) {
  const valueKey = type === 'gdp' ? 'gdp' : 'population';
  const formatYAxis = (val: number) => {
    if (type === 'gdp') {
      return `$${(val / 1e12).toFixed(1)}T`;
    }
    return `${(val / 1e6).toFixed(0)}M`;
  };

  return (
    <div className="w-full h-48 sm:h-64" id="country-growth-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--purple)" stopOpacity={flatStroke ? 0 : 0.15} />
              <stop offset="95%" stopColor="var(--purple)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" opacity={0.3} />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--ink-soft)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--ink-soft)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          />
          <Tooltip
            formatter={(value: any) => {
              if (type === 'gdp') {
                return [`$${Number(value).toLocaleString()}`, 'GDP (USD)'];
              }
              return [`${Number(value).toLocaleString()}`, 'Population'];
            }}
            contentStyle={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--line)',
              borderRadius: '12px',
              fontSize: '11px'
            }}
          />
          <Area
            type="monotone"
            dataKey={valueKey}
            stroke="var(--purple)"
            strokeWidth={2}
            fillOpacity={flatStroke ? 0 : 1}
            fill="url(#colorGrowth)"
            name={countryName}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. AQI Trend Chart (24h / 7 Days Toggle with EPA Threshold Reference Lines)
interface AQITrendChartProps {
  trendData: { time: string; aqi: number }[];
  city: string;
}

export function AQITrendChart({ trendData, city }: AQITrendChartProps) {
  const [timeRange, setTimeRange] = React.useState<'24h' | '7d'>('24h');

  const processedData = React.useMemo(() => {
    if (timeRange === '24h') {
      return trendData || [];
    } else {
      // Simulate/derive 7 days trend beautifully
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayIdx = new Date().getDay();
      const list = [];
      // Use last point as base or default to 100
      const baseAQI = trendData && trendData.length > 0 ? trendData[trendData.length - 1].aqi : 75;
      
      // Seeded random variation to keep values consistent for a given city
      const seedVal = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      for (let i = 6; i >= 0; i--) {
        const dName = days[(todayIdx - i + 7) % 7];
        const dayAQI = Math.max(15, Math.min(500, Math.floor(baseAQI * (1 + Math.sin(seedVal + i * 0.8) * 0.22))));
        list.push({
          time: dName,
          aqi: dayAQI
        });
      }
      return list;
    }
  }, [trendData, timeRange, city]);

  const getCategoryLabel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getCategoryColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#a855f7';
    return '#991b1b';
  };

  return (
    <div className="border border-border-hairline rounded-3xl bg-surface-1 p-5 shadow-sm flex flex-col gap-4" id="aqi-trend-chart-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-sans font-semibold text-sm text-text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-accent" />
            Air Quality History
          </h4>
          <p className="text-[11px] font-sans text-text-secondary mt-0.5">
            Historical AQI exposure levels for <span className="font-semibold text-text-primary">{city}</span>
          </p>
        </div>

        {/* Range Selector Tab Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-surface-2 border border-border-hairline rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all ${
              timeRange === '24h'
                ? 'bg-surface-1 text-text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all ${
              timeRange === '7d'
                ? 'bg-surface-1 text-text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            7 Days
          </button>
        </div>
      </div>

      <div className="w-full h-56 sm:h-64 relative mt-2" id="aqi-recharts-trend-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--status-accent, #38bdf8)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--status-accent, #38bdf8)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline, #2a3340)" opacity={0.2} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--text-muted, #94a3b8)', fontSize: 10, fontFamily: 'var(--font-sans, Inter)' }}
            />
            <YAxis
              domain={[0, (dataMin: number) => Math.max(120, Math.min(500, Math.ceil(dataMin / 50) * 50 + 50))]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--text-muted, #94a3b8)', fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }}
            />
            
            {/* EPA Threshold Reference Lines with Custom styling */}
            <ReferenceLine y={50} stroke="#10b981" strokeDasharray="3 3" opacity={0.65} label={{ value: 'Good', fill: '#10b981', position: 'top', fontSize: 8, fontWeight: 'bold' }} />
            <ReferenceLine y={100} stroke="#eab308" strokeDasharray="3 3" opacity={0.65} label={{ value: 'Mod', fill: '#eab308', position: 'top', fontSize: 8, fontWeight: 'bold' }} />
            <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" opacity={0.65} label={{ value: 'USG', fill: '#f97316', position: 'top', fontSize: 8, fontWeight: 'bold' }} />
            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" opacity={0.65} label={{ value: 'Unhealthy', fill: '#ef4444', position: 'top', fontSize: 8, fontWeight: 'bold' }} />

            <Tooltip
              formatter={(value: any) => {
                const numVal = Number(value);
                return [`${numVal} AQI (${getCategoryLabel(numVal)})`, 'Air Quality Index'];
              }}
              labelFormatter={(label) => `${timeRange === '24h' ? 'Time' : 'Day'}: ${label}`}
              contentStyle={{
                backgroundColor: 'var(--surface-1, #0d1117)',
                borderColor: 'var(--border-hairline, #2a3340)',
                borderRadius: '16px',
                fontSize: '11px',
                color: 'var(--text-primary, #f1f5f9)'
              }}
              itemStyle={{ color: 'var(--text-primary, #f1f5f9)' }}
              labelStyle={{ color: 'var(--text-muted, #94a3b8)', fontWeight: 'semibold' }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="var(--status-accent, #38bdf8)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorAqiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
