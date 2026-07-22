/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ThemeToggle from './components/ThemeToggle';
import SplashView from './components/SplashView';
import MapPanel from './components/MapPanel';
import StatGauge from './components/StatGauge';
import CalendarGrid from './components/CalendarGrid';
import { PriceTrendChart, CurrencyHistoryChart, CountryGrowthChart, AQITrendChart } from './components/MetricCharts';
import { SyncStatusWidget } from './components/SyncStatusWidget';
import { telemetryLabels } from './telemetryLabels';
import {
  Coins,
  CloudSun,
  Globe,
  CurrencyDollar,
  Bank,
  GridFour,
  Compass,
  CaretDown,
  CaretUp,
  FileText,
  MagnifyingGlass,
  X,
  Gear,
  List,
  Clock,
  Download,
  TrendUp,
  TrendDown,
  CheckCircle,
  WarningCircle,
  Info,
  Cat,
  Database,
  CaretLeft,
  Pencil,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow
} from '@phosphor-icons/react';

const PhosphorIcon = ({ name, className = "text-base", size = 16, weight = "light" }: { name: string; className?: string; size?: number; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }) => {
  const norm = name.toLowerCase().trim();
  if (norm.includes('wind')) {
    return <Wind className={className} size={size} weight={weight} />;
  }
  if (norm.includes('chevron-left') || norm.includes('caret-left')) {
    return <CaretLeft className={className} size={size} weight={weight} />;
  }
  if (norm.includes('pencil') || norm.includes('edit')) {
    return <Pencil className={className} size={size} weight={weight} />;
  }
  if (norm.includes('coin-stack') || norm.includes('crypto')) {
    return <Coins className={className} size={size} weight={weight} />;
  }
  if (norm.includes('cloud-sun') || norm.includes('weather')) {
    return <CloudSun className={className} size={size} weight={weight} />;
  }
  if (norm.includes('globe') || norm.includes('aqi')) {
    return <Globe className={className} size={size} weight={weight} />;
  }
  if (norm.includes('dollar') || norm.includes('currency') || norm.includes('forex')) {
    return <CurrencyDollar className={className} size={size} weight={weight} />;
  }
  if (norm.includes('landmark') || norm.includes('bank') || norm.includes('countries')) {
    return <Bank className={className} size={size} weight={weight} />;
  }
  if (norm.includes('grid-alt') || norm.includes('dashboard')) {
    return <GridFour className={className} size={size} weight={weight} />;
  }
  if (norm.includes('compass')) {
    return <Compass className={className} size={size} weight={weight} />;
  }
  if (norm.includes('chevron-down')) {
    return <CaretDown className={className} size={size} weight={weight} />;
  }
  if (norm.includes('chevron-up')) {
    return <CaretUp className={className} size={size} weight={weight} />;
  }
  if (norm.includes('file') || norm.includes('reports')) {
    return <FileText className={className} size={size} weight={weight} />;
  }
  if (norm.includes('search')) {
    return <MagnifyingGlass className={className} size={size} weight={weight} />;
  }
  if (norm.includes('cog') || norm.includes('settings')) {
    return <Gear className={className} size={size} weight={weight} />;
  }
  if (norm.includes('x') || norm.includes('close')) {
    return <X className={className} size={size} weight={weight} />;
  }
  if (norm.includes('menu')) {
    return <List className={className} size={size} weight={weight} />;
  }
  if (norm.includes('time-five') || norm.includes('clock') || norm.includes('time')) {
    return <Clock className={className} size={size} weight={weight} />;
  }
  if (norm.includes('download')) {
    return <Download className={className} size={size} weight={weight} />;
  }
  if (norm.includes('trending-up')) {
    return <TrendUp className={className} size={size} weight={weight} />;
  }
  if (norm.includes('trending-down')) {
    return <TrendDown className={className} size={size} weight={weight} />;
  }
  if (norm.includes('check-circle')) {
    return <CheckCircle className={className} size={size} weight={weight} />;
  }
  if (norm.includes('error-circle')) {
    return <WarningCircle className={className} size={size} weight={weight} />;
  }
  if (norm.includes('info')) {
    return <Info className={className} size={size} weight={weight} />;
  }
  if (norm.includes('cat')) {
    return <Cat className={className} size={size} weight={weight} />;
  }
  if (norm.includes('data') || norm.includes('database') || norm.includes('hard-drive')) {
    return <Database className={className} size={size} weight={weight} />;
  }
  // Fallbacks
  return <Info className={className} size={size} weight={weight} />;
};
const CryptoLogo = ({ symbol, size = 6, className = "" }: { symbol: string; size?: number; className?: string }) => {
  const [attempt, setAttempt] = React.useState(0);
  const dim = size * 4;
  const style = { width: `${dim}px`, height: `${dim}px` };

  const urls = React.useMemo(() => {
    if (!symbol) return [];
    const sym = symbol.toLowerCase();
    return [
      `https://assets.coincap.io/assets/icons/${sym}@2x.png`,
      `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${sym}.png`,
      `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${sym}.png`
    ];
  }, [symbol]);

  if (!symbol || attempt >= urls.length) {
    return (
      <div
        style={style}
        className={`rounded-full bg-accent-soft text-accent flex items-center justify-center font-mono font-bold text-[10px] uppercase shrink-0 ${className}`}
      >
        {symbol?.slice(0, 2) || '??'}
      </div>
    );
  }

  return (
    <img
      src={urls[attempt]}
      alt={symbol}
      style={style}
      className={`rounded-full object-contain shrink-0 ${className}`}
      onError={() => setAttempt(prev => prev + 1)}
      referrerPolicy="no-referrer"
    />
  );
};

const CountryFlag = ({ code, className = "w-6 h-4" }: { code: string; className?: string }) => {
  const [hasError, setHasError] = React.useState(false);
  if (hasError || !code) {
    return (
      <div className={`rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-[9px] text-zinc-500 uppercase ${className}`}>
        {code || '??'}
      </div>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      alt={code}
      className={`rounded shadow-xs object-cover shrink-0 ${className}`}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

const getCurrencyFlagCode = (currency: string): string => {
  const mapping: Record<string, string> = {
    USD: 'us',
    EUR: 'eu',
    GBP: 'gb',
    JPY: 'jp',
    PHP: 'ph',
    CAD: 'ca',
    AUD: 'au',
    SGD: 'sg',
    INR: 'in',
    AED: 'ae',
    MXN: 'mx',
    CHF: 'ch',
    BRL: 'br',
    ZAR: 'za',
    CNY: 'cn',
    NZD: 'nz',
    KRW: 'kr',
    SEK: 'se',
    NOK: 'no',
    DKK: 'dk',
    HKD: 'hk',
    MYR: 'my',
    THB: 'th',
    IDR: 'id',
    TRY: 'tr',
    RUB: 'ru',
    ILS: 'il'
  };
  return mapping[currency.toUpperCase()] || 'us';
};

const getCurrencyFullName = (currency: string): string => {
  const mapping: Record<string, string> = {
    USD: 'United States Dollar',
    EUR: 'Euro',
    GBP: 'British Pound Sterling',
    JPY: 'Japanese Yen',
    PHP: 'Philippine Peso',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    SGD: 'Singapore Dollar',
    INR: 'Indian Rupee',
    CHF: 'Swiss Franc',
    MXN: 'Mexican Peso',
    BRL: 'Brazilian Real',
    ZAR: 'South African Rand',
    CNY: 'Chinese Yuan',
    NZD: 'New Zealand Dollar',
    KRW: 'South Korean Won',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    HKD: 'Hong Kong Dollar',
    MYR: 'Malaysian Ringgit',
    THB: 'Thai Baht',
    IDR: 'Indonesian Rupiah',
    TRY: 'Turkish Lira',
    RUB: 'Russian Ruble',
    ILS: 'Israeli New Shekel'
  };
  return mapping[currency.toUpperCase()] || 'Foreign Currency';
};

const getPollutantSeverityColorLocal = (name: string, value: number) => {
  let category = 'Good';
  if (name === 'pm25') {
    if (value <= 12.0) category = 'Good';
    else if (value <= 35.4) category = 'Moderate';
    else if (value <= 55.4) category = 'Unhealthy for Sensitive Groups';
    else if (value <= 150.4) category = 'Unhealthy';
    else if (value <= 250.4) category = 'Very Unhealthy';
    else category = 'Hazardous';
  } else if (name === 'pm10') {
    if (value <= 54) category = 'Good';
    else if (value <= 154) category = 'Moderate';
    else if (value <= 254) category = 'Unhealthy for Sensitive Groups';
    else if (value <= 354) category = 'Unhealthy';
    else if (value <= 424) category = 'Very Unhealthy';
    else category = 'Hazardous';
  } else if (name === 'o3') {
    if (value <= 54) category = 'Good';
    else if (value <= 70) category = 'Moderate';
    else if (value <= 85) category = 'Unhealthy for Sensitive Groups';
    else if (value <= 105) category = 'Unhealthy';
    else if (value <= 200) category = 'Very Unhealthy';
    else category = 'Hazardous';
  } else if (name === 'no2') {
    if (value <= 53) category = 'Good';
    else if (value <= 100) category = 'Moderate';
    else if (value <= 360) category = 'Unhealthy for Sensitive Groups';
    else if (value <= 649) category = 'Unhealthy';
    else if (value <= 1249) category = 'Very Unhealthy';
    else category = 'Hazardous';
  } else if (name === 'so2') {
    if (value <= 35) category = 'Good';
    else if (value <= 75) category = 'Moderate';
    else if (value <= 185) category = 'Unhealthy for Sensitive Groups';
    else if (value <= 304) category = 'Unhealthy';
    else if (value <= 604) category = 'Very Unhealthy';
    else category = 'Hazardous';
  } else if (name === 'co') {
    if (value <= 4.4) category = 'Good';
    else if (value <= 9.4) category = 'Moderate';
    else if (value <= 12.4) category = 'Unhealthy for Sensitive Groups';
    else if (value <= 15.4) category = 'Unhealthy';
    else if (value <= 30.4) category = 'Very Unhealthy';
    else category = 'Hazardous';
  }

  if (category === 'Good') return { color: '#10b981', label: 'Good', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20' };
  if (category === 'Moderate') return { color: '#eab308', label: 'Moderate', textClass: 'text-yellow-400', bgClass: 'bg-yellow-500/10 border-yellow-500/20' };
  if (category === 'Unhealthy for Sensitive Groups') return { color: '#f97316', label: 'USG', textClass: 'text-orange-400', bgClass: 'bg-orange-500/10 border-orange-500/20' };
  if (category === 'Unhealthy') return { color: '#ef4444', label: 'Unhealthy', textClass: 'text-red-400', bgClass: 'bg-red-500/10 border-red-500/20' };
  if (category === 'Very Unhealthy') return { color: '#a855f7', label: 'Very Unhealthy', textClass: 'text-purple-400', bgClass: 'bg-purple-500/10 border-purple-500/20' };
  return { color: '#991b1b', label: 'Hazardous', textClass: 'text-red-500', bgClass: 'bg-red-950/20 border-red-900/30' };
};
import { DashboardData, CryptoCoin, WeatherInfo, CurrencyPair, AQIMeasurement, CountryStat, Alert } from './types';
import { MONITORED_CITIES, getAQILevelDetails } from './lib/config';

const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="text-status-warning" size={18} />;
  if (code >= 61 && code <= 65) return <CloudRain className="text-status-accent" size={18} />;
  if (code >= 95 && code <= 99) return <CloudLightning className="text-purple" size={18} />;
  if (code >= 71 && code <= 77) return <CloudSnow className="text-text-secondary" size={18} />;
  return <Cloud className="text-text-secondary" size={18} />;
};

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, rawSetSelectedCity] = useState('Manila');
  const [locationSource, setLocationSource] = useState<'gps' | 'profile' | 'default'>('default');

  const setSelectedCity = (city: string) => {
    rawSetSelectedCity(city);
    localStorage.setItem('climex_profile_location', city);
    setLocationSource('profile');
  };
  const [cryptoSearch, setCryptoSearch] = useState('');
  const [leaderboardSearchOpen, setLeaderboardSearchOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [selectedCoinId, setSelectedCoinId] = useState('bitcoin');
  const [selectedCurrencyId, setSelectedCurrencyId] = useState('USD_EUR');
  const [conversionAmount, setConversionAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  useEffect(() => {
    if (selectedCurrencyId && data?.currency) {
      const found = data.currency.find(c => c.id === selectedCurrencyId);
      if (found) {
        setFromCurrency(found.base);
        setToCurrency(found.target);
      }
    }
  }, [selectedCurrencyId, data?.currency]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('PH');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [countryVisibleCount, setCountryVisibleCount] = useState(6);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cryptoSortField, setCryptoSortField] = useState<'rank' | 'price' | 'change'>('rank');
  const [cryptoSortDirection, setCryptoSortDirection] = useState<'asc' | 'desc'>('asc');
  const [cryptoSubTab, setCryptoSubTab] = useState<'overview' | 'chart' | 'leaderboard'>('overview');
  const [chartTimeframe, setChartTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('24h');
  const [tabletLeaderboardExpanded, setTabletLeaderboardExpanded] = useState(false);
  const [mobileLocationsOpen, setMobileLocationsOpen] = useState(false);
  const [mobileCountriesOpen, setMobileCountriesOpen] = useState(false);
  const [mobileCurrenciesOpen, setMobileCurrenciesOpen] = useState(false);
  const [weatherSearch, setWeatherSearch] = useState('');
  const [weatherSearchDesktopOpen, setWeatherSearchDesktopOpen] = useState(false);
  const [syncStatusDropdownOpen, setSyncStatusDropdownOpen] = useState(false);
  const [isSystemStatusExpanded, setIsSystemStatusExpanded] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});
  const syncStatusRef = React.useRef<HTMLDivElement>(null);
  const popoverContentRef = React.useRef<HTMLDivElement>(null);

  // Search and dropdown states
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const [aqiSearchQuery, setAqiSearchQuery] = useState('');
  const [showAqiSearchDropdown, setShowAqiSearchDropdown] = useState(false);
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('climex_user_name'));
  const [userNameInput, setUserNameInput] = useState(localStorage.getItem('climex_user_name') || '');

  const [updateFrequency, setUpdateFrequency] = useState(() => localStorage.getItem('climex_update_frequency') || 'realtime');
  const [tempUnit, setTempUnit] = useState(() => localStorage.getItem('climex_temp_unit') || 'C');
  const [defaultCurrency, setDefaultCurrency] = useState(() => localStorage.getItem('climex_default_currency') || 'USD');
  const [priceAlerts, setPriceAlerts] = useState(() => localStorage.getItem('climex_price_alerts') !== 'false');

  // Reports tab states
  const [selectedLogs, setSelectedLogs] = useState<string[]>(['crypto', 'weather', 'aqi', 'currency']);
  const [reportsSearchQuery, setReportsSearchQuery] = useState('');
  const [reportsFilter, setReportsFilter] = useState<'all' | 'selected' | 'unselected'>('all');
  const [exportingBundle, setExportingBundle] = useState(false);
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [exportingLogId, setExportingLogId] = useState<string | null>(null);
  const [logErrors, setLogErrors] = useState<Record<string, string>>({});
  const [ledgerCompiledTime, setLedgerCompiledTime] = useState<Date | null>(null);

  // Alert & Real-time connection states
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newlyArrivedIds, setNewlyArrivedIds] = useState<Set<string>>(new Set());
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('connecting');
  const [timeTick, setTimeTick] = useState(0);
  const [showSimControls, setShowSimControls] = useState(false);
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(false);

  // Helper to compute relative times dynamically
  const getRelativeTime = (isoString: string): string => {
    const now = new Date();
    const past = new Date(isoString);
    const diffMs = now.getTime() - past.getTime();
    if (diffMs < 0) return 'now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const triggerSimulation = async (
    category: string,
    severity: string,
    headline: string,
    detail: string,
    sourceMetric: string,
    value: number,
    targetEntity: string
  ) => {
    try {
      await fetch('/api/alerts/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          severity,
          headline,
          detail,
          sourceMetric,
          value,
          targetEntity
        })
      });
    } catch (err) {
      console.error('Failed to trigger simulation:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setTimeTick(prev => prev + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let fallbackPollInterval: any = null;
    let isMounted = true;

    const startFallbackPolling = () => {
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
      fallbackPollInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/alerts');
          if (!response.ok) throw new Error('Polling failed');
          const data = await response.json();
          if (isMounted && data && Array.isArray(data.alerts)) {
            setAlerts(data.alerts);
          }
        } catch (err) {
          console.warn('Alerts fallback polling inactive (handled):', err);
          if (isMounted) setWsStatus('disconnected');
        }
      }, 20000);
    };

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connectWS = () => {
      if (!isMounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;

      try {
        socket = new WebSocket(`${protocol}//${host}/ws`);

        socket.onopen = () => {
          if (!isMounted) return;
          setWsStatus('connected');
          reconnectAttempts = 0; // Reset counter on successful connection
          if (fallbackPollInterval) {
            clearInterval(fallbackPollInterval);
            fallbackPollInterval = null;
          }
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
              setAlerts(data.alerts);
            } else if (data.type === 'new_alert' && data.alert) {
              const newAlert = data.alert;
              setAlerts(prev => {
                if (prev.some(a => a.id === newAlert.id)) return prev;
                return [newAlert, ...prev].slice(0, 50);
              });
              setNewlyArrivedIds(prev => {
                const next = new Set(prev);
                next.add(newAlert.id);
                return next;
              });
              setTimeout(() => {
                if (isMounted) {
                  setNewlyArrivedIds(prev => {
                    const next = new Set(prev);
                    next.delete(newAlert.id);
                    return next;
                  });
                }
              }, 3000);
            }
          } catch (e) {
            console.warn('Error parsing WS alert data (handled):', e);
          }
        };

        socket.onclose = () => {
          if (!isMounted) return;
          startFallbackPolling();

          if (reconnectAttempts < maxReconnectAttempts) {
            setWsStatus('reconnecting');
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectTimeout = setTimeout(connectWS, delay);
          } else {
            setWsStatus('disconnected');
            console.log('Maximum WebSocket reconnection attempts reached. Continuing with high-fidelity HTTP polling fallback.');
          }
        };

        socket.onerror = (err) => {
          // Log as warning rather than console.error to avoid false alarm alerts in logs/preview environments
          console.warn('Real-time feed connection not active (proxy restrictions may apply). Operating via high-fidelity HTTP fallback polling.');
          if (socket) socket.close();
        };
      } catch (err) {
        console.warn('WebSocket setup exception (using polling fallback):', err);
        if (isMounted) {
          startFallbackPolling();
          if (reconnectAttempts < maxReconnectAttempts) {
            setWsStatus('reconnecting');
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectTimeout = setTimeout(connectWS, delay);
          } else {
            setWsStatus('disconnected');
          }
        }
      }
    };

    connectWS();

    const fetchInitial = async () => {
      try {
        const response = await fetch('/api/alerts');
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data && Array.isArray(data.alerts)) {
            setAlerts(data.alerts);
          }
        }
      } catch (e) {
        console.warn('Initial alerts fetch not active (handled):', e);
      }
    };
    fetchInitial();

    return () => {
      isMounted = false;
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
    };
  }, []);

  const formatTemp = (tempC: number | undefined) => {
    if (tempC === undefined || tempC === null) return '';
    if (tempUnit === 'F') {
      const tempF = (tempC * 9 / 5) + 32;
      return `${Math.round(tempF)}°F`;
    }
    return `${tempC}°C`;
  };

  const formatPrice = (usdAmount: number | undefined) => {
    if (usdAmount === undefined || usdAmount === null) return '';
    if (defaultCurrency === 'EUR') {
      const ratePair = data?.currency?.find(c => c.base === 'USD' && c.target === 'EUR') || data?.currency?.[0];
      const rate = ratePair ? ratePair.rate : 0.92;
      const amountEUR = usdAmount * rate;
      return `€${amountEUR >= 1 ? amountEUR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amountEUR.toFixed(4)}`;
    } else if (defaultCurrency === 'PHP') {
      const ratePair = data?.currency?.find(c => c.base === 'USD' && c.target === 'PHP');
      const rate = ratePair ? ratePair.rate : 58.5;
      const amountPHP = usdAmount * rate;
      return `₱${amountPHP >= 1 ? amountPHP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amountPHP.toFixed(4)}`;
    }
    return `$${usdAmount >= 1 ? usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : usdAmount.toFixed(4)}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };
  const searchRef = React.useRef<HTMLDivElement>(null);
  const exploreRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreDropdownOpen(false);
      }
      if (syncStatusRef.current && !syncStatusRef.current.contains(event.target as Node)) {
        setSyncStatusDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowSearchResults(false);
        setExploreDropdownOpen(false);
        setSyncStatusDropdownOpen(false);
      }

      // Ctrl+K or Cmd+K shortcut to focus search input
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setShowSearchResults(true);
        } else if (mobileSearchInputRef.current) {
          setMobileSearchExpanded(true);
          setTimeout(() => {
            mobileSearchInputRef.current?.focus();
          }, 50);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (syncStatusDropdownOpen && popoverContentRef.current) {
      popoverContentRef.current.focus();
    }
  }, [syncStatusDropdownOpen]);

  // Global search matching
  const getGlobalSearchResults = () => {
    if (!globalSearchQuery.trim() || !data) return [];
    const query = globalSearchQuery.toLowerCase().trim();
    const results: Array<{
      type: string;
      id: string;
      title: string;
      subtitle: string;
      icon: string;
      action: () => void;
    }> = [];

    // 1. Crypto Coins
    data.crypto?.forEach(coin => {
      if (coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)) {
        results.push({
          type: 'Crypto',
          id: `crypto-${coin.id}`,
          title: coin.name,
          subtitle: `${coin.symbol.toUpperCase()} • ${formatPrice(coin.price)}`,
          icon: 'bx bx-coin-stack text-amber-500',
          action: () => {
            setSelectedCoinId(coin.id);
            setActiveTab('crypto');
            setGlobalSearchQuery('');
            setShowSearchResults(false);
          }
        });
      }
    });

    // 2. Weather cities
    data.weather?.forEach(w => {
      if (w.city.toLowerCase().includes(query) || w.country.toLowerCase().includes(query)) {
        results.push({
          type: 'Weather',
          id: `weather-${w.city}`,
          title: `${w.city}, ${w.country}`,
          subtitle: `${formatTemp(w.temp)} • ${w.condition}`,
          icon: 'bx bx-cloud-sun text-blue-400',
          action: () => {
            setSelectedCity(w.city);
            setActiveTab('weather');
            setGlobalSearchQuery('');
            setShowSearchResults(false);
          }
        });
      }
    });

    // 3. Air Quality records
    data.aqi?.forEach(a => {
      if (a.city.toLowerCase().includes(query) || a.country.toLowerCase().includes(query)) {
        results.push({
          type: 'Air Quality',
          id: `aqi-${a.city}`,
          title: `${a.city}, ${a.country}`,
          subtitle: `AQI ${a.aqi} • ${a.status}`,
          icon: 'bx bx-globe text-teal-400',
          action: () => {
            const weatherMatch = data.weather?.find(w => w.city.toLowerCase() === a.city.toLowerCase());
            if (weatherMatch) setSelectedCity(weatherMatch.city);
            setActiveTab('aqi');
            setGlobalSearchQuery('');
            setShowSearchResults(false);
          }
        });
      }
    });

    // 4. Currency pairs
    data.currency?.forEach(c => {
      const label = `${c.base}/${c.target}`;
      if (c.base.toLowerCase().includes(query) || c.target.toLowerCase().includes(query) || label.toLowerCase().includes(query)) {
        results.push({
          type: 'Forex',
          id: `forex-${c.base}-${c.target}`,
          title: label,
          subtitle: `Rate: ${c.rate.toFixed(4)} • ${c.change24h >= 0 ? '+' : ''}${c.change24h.toFixed(2)}%`,
          icon: 'bx bx-dollar text-emerald-500',
          action: () => {
            setSelectedCurrencyId(`${c.base}_${c.target}`);
            setActiveTab('currency');
            setGlobalSearchQuery('');
            setShowSearchResults(false);
          }
        });
      }
    });

    // 5. Countries
    data.countries?.forEach(c => {
      if (c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query) || c.capital.toLowerCase().includes(query)) {
        results.push({
          type: 'Country',
          id: `country-${c.code}`,
          title: c.name,
          subtitle: `Capital: ${c.capital} • Pop: ${(c.population / 1_000_000).toFixed(1)}M`,
          icon: 'bx bx-landmark text-indigo-400',
          action: () => {
            setSelectedCountryCode(c.code);
            setActiveTab('countries');
            setGlobalSearchQuery('');
            setShowSearchResults(false);
          }
        });
      }
    });

    // 6. Reports and logs
    const staticReportsList = [
      { id: 'crypto', label: 'Cryptocurrency Ticker Log', desc: 'Top tokens market price index.', size: '4.2 KB', format: 'CSV' },
      { id: 'weather', label: 'Regional Weather Forecasts', desc: 'Forecast metrics for New York, London, Tokyo, and Sydney.', size: '5.8 KB', format: 'CSV' },
      { id: 'aqi', label: 'Air Quality Index Logs', desc: 'Particulate matters (PM2.5, PM10) monitoring stats.', size: '3.1 KB', format: 'CSV' },
      { id: 'currency', label: 'Historical Exchange Rates Log', desc: 'Daily historical FX rates for tracked currency pairs (e.g., EUR/USD, GBP/USD, AUD/USD).', size: '3.5 KB', format: 'CSV' }
    ];

    staticReportsList.forEach(r => {
      if (r.label.toLowerCase().includes(query) || r.desc.toLowerCase().includes(query)) {
        results.push({
          type: 'Report',
          id: `report-${r.id}`,
          title: r.label,
          subtitle: `${r.format} • ${r.size} • ${r.desc}`,
          icon: 'file',
          action: () => {
            setActiveTab('reports');
            setGlobalSearchQuery('');
            setShowSearchResults(false);
          }
        });
      }
    });

    return results.slice(0, 8); // Limit to top 8 matching results
  };

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  const matchedSearchResults = getGlobalSearchResults();

  // Time metrics
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(null);

  const formatLastSynced = (date: Date | null) => {
    const d = date || new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const pad = (num: number) => num.toString().padStart(2, '0');

    const year = d.getUTCFullYear();
    const month = months[d.getUTCMonth()];
    const day = pad(d.getUTCDate());
    const hours = pad(d.getUTCHours());
    const minutes = pad(d.getUTCMinutes());

    return `${month} ${day}, ${year}, ${hours}:${minutes} UTC`;
  };

  const getLogLastUpdated = (reportId: string) => {
    const baseTime = lastSyncedTime || new Date();
    let offsetMs = 0;
    if (reportId === 'crypto') {
      offsetMs = 1.5 * 60 * 1000; // 1.5m offset
    } else if (reportId === 'currency') {
      offsetMs = 4.2 * 60 * 1000; // 4.2m offset
    } else if (reportId === 'weather') {
      offsetMs = 11.7 * 60 * 1000; // 11.7m offset
    } else if (reportId === 'aqi') {
      offsetMs = 44.5 * 60 * 1000; // 44.5m offset
    } else if (reportId === 'ledger') {
      if (ledgerCompiledTime) {
        const diffSecs = Math.floor((Date.now() - ledgerCompiledTime.getTime()) / 1000);
        if (diffSecs < 10) return 'just now';
        if (diffSecs < 60) return `${diffSecs}s ago`;
        return `${Math.floor(diffSecs / 60)}m ago`;
      }
      return 'Ready to compile';
    }

    const d = new Date(baseTime.getTime() - offsetMs);
    const pad = (num: number) => num.toString().padStart(2, '0');
    const hours = pad(d.getUTCHours());
    const minutes = pad(d.getUTCMinutes());

    const diffMins = Math.floor(offsetMs / 60000);
    return `${hours}:${minutes} UTC (${diffMins}m ago)`;
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial visitor location with priority:
  // 1. Device/browser geolocation (GPS)
  // 2. Saved profile/account location
  // 3. Clearly-labeled default city (New York)
  useEffect(() => {
    const saved = localStorage.getItem('climex_profile_location');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          let closestCity = MONITORED_CITIES[0];
          let minDistance = Infinity;
          MONITORED_CITIES.forEach(w => {
            const dy = w.lat - latitude;
            const dx = w.lon - longitude;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDistance) {
              minDistance = dist;
              closestCity = w;
            }
          });
          rawSetSelectedCity(closestCity.city);
          setSelectedCountryCode(closestCity.code);
          setLocationSource('gps');
          console.log(`Geolocation matched closest city: ${closestCity.city}`);
        },
        (error) => {
          console.log('Geolocation permission denied or failed. Falling back.');
          if (saved) {
            rawSetSelectedCity(saved);
            const found = MONITORED_CITIES.find(c => c.city.toLowerCase() === saved.toLowerCase());
            if (found) setSelectedCountryCode(found.code);
            setLocationSource('profile');
          } else {
            rawSetSelectedCity('Manila');
            setSelectedCountryCode('PH');
            setLocationSource('default');
          }
        },
        { timeout: 4000, maximumAge: 300000 }
      );
    } else {
      if (saved) {
        rawSetSelectedCity(saved);
        const found = MONITORED_CITIES.find(c => c.city.toLowerCase() === saved.toLowerCase());
        if (found) setSelectedCountryCode(found.code);
        setLocationSource('profile');
      } else {
        rawSetSelectedCity('Manila');
        setSelectedCountryCode('PH');
        setLocationSource('default');
      }
    }
  }, []);

  // Fetch Dashboard aggregate data from Express Backend
  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error(`Failed to compile statistics: Server returned status ${response.status}`);
      }
      const json = await response.json();
      setData(json);
      setLastSyncedTime(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown server error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch once initially when splash screen launches
  useEffect(() => {
    if (showDashboard && !data) {
      fetchDashboardData();
    }
  }, [showDashboard, data]);

  // Handle active dashboard tab polling and live refresh
  useEffect(() => {
    if (!showDashboard || activeTab !== 'dashboard') return;

    // Refresh immediately when returning to the dashboard route to keep metrics fresh
    if (data) {
      fetchDashboardData();
    }

    let intervalMs = 0;
    if (updateFrequency === 'realtime') {
      intervalMs = 15000; // 15 seconds
    } else if (updateFrequency === 'minute') {
      intervalMs = 60000; // 1 minute
    } else if (updateFrequency === '5minutes') {
      intervalMs = 300000; // 5 minutes
    }

    if (intervalMs > 0) {
      const interval = setInterval(() => {
        fetchDashboardData(true);
      }, intervalMs);
      return () => clearInterval(interval);
    }
  }, [showDashboard, activeTab, updateFrequency]);

  // Collapse status details panel automatically whenever activeTab shifts
  useEffect(() => {
    setSyncStatusDropdownOpen(false);
  }, [activeTab]);

  // Dynamic SWR sync status calculation for navbar badge
  const healthInfo = React.useMemo(() => {
    if (!data || !data.syncStatus) {
      return { color: 'bg-status-success', label: 'healthy', percentage: '90%' };
    }
    const total = data.syncStatus.length;
    const liveCount = data.syncStatus.filter(s => s.status === 'online').length || 0;
    const cachedCount = data.syncStatus.filter(s => s.status === 'stale').length || 0;
    const offlineCount = data.syncStatus.filter(s => s.status === 'offline').length || 0;

    let color = 'bg-status-success';
    let label = 'healthy';
    if (offlineCount === total) {
      color = 'bg-status-danger';
      label = 'down';
    } else if (offlineCount > 0 || cachedCount > 0) {
      color = 'bg-status-warning';
      label = 'degraded';
    }
    return { color, label, percentage: '90%' };
  }, [data]);

  const supportedCurrencies = React.useMemo(() => {
    return Array.from(new Set(['USD', ...(data?.currency?.map(c => c.target) || [])]));
  }, [data?.currency]);

  const getCrossRate = React.useCallback((from: string, to: string) => {
    if (from === to) return 1;
    const rates: Record<string, number> = { USD: 1 };
    if (data?.currency) {
      data.currency.forEach(c => {
        rates[c.target] = c.rate;
      });
    }
    const fromRate = rates[from] ?? 1;
    const toRate = rates[to] ?? 1;
    return toRate / fromRate;
  }, [data?.currency]);

  if (!showDashboard) {
    return (
      <SplashView
        onLaunch={() => {
          localStorage.setItem('climex_name_prompt_dismissed', 'true');
          setShowDashboard(true);
        }}
      />
    );
  }

  // Active items mapping helpers
  const activeWeather = data?.weather?.find(w => w.city.toLowerCase() === selectedCity.toLowerCase()) || data?.weather?.[0];
  const activeAQI = data?.aqi?.find(a => a.city.toLowerCase() === selectedCity.toLowerCase()) || data?.aqi?.[0];
  const activeCoin = data?.crypto?.find(c => c.id === selectedCoinId) || data?.crypto?.[0];
  const activeCurrency = data?.currency?.find(c => c.id === selectedCurrencyId) || data?.currency?.[0];
  const activeCountry = data?.countries?.find(c => c.code === selectedCountryCode) || data?.countries?.[0];

  // Search filter helpers
  const filteredCoins = data?.crypto?.filter(c =>
    c.name.toLowerCase().includes(cryptoSearch.toLowerCase()) ||
    c.symbol.toLowerCase().includes(cryptoSearch.toLowerCase())
  ) || [];

  const filteredCurrencies = data?.currency?.filter(c =>
    c.target.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.base.toLowerCase().includes(currencySearch.toLowerCase())
  ) || [];

  const handleDownloadBundle = async () => {
    if (selectedLogs.length === 0) return;
    setExportingBundle(true);
    setBundleError(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const isRetry = !!bundleError;
    const shouldFail = !isRetry && Math.random() < 0.25;

    if (shouldFail) {
      setBundleError("couldn't generate the file. Retry");
      setExportingBundle(false);
      return;
    }

    let headers = 'Domain,Key,Value,Status,Last Updated\n';
    let rows = '';

    if (selectedLogs.includes('crypto') && data) {
      rows += `Cryptocurrency,Top Coin,${data.crypto?.[0]?.name || 'N/A'} - $${data.crypto?.[0]?.price || 'N/A'},Active,${getLogLastUpdated('crypto')}\n`;
    }
    if (selectedLogs.includes('weather') && data) {
      rows += `Weather,Local Temp,${data.weather?.[0]?.city || 'N/A'} - ${data.weather?.[0]?.temp || 'N/A'}°C,Active,${getLogLastUpdated('weather')}\n`;
    }
    if (selectedLogs.includes('aqi') && data) {
      rows += `Air Quality,Local AQI,${data.aqi?.[0]?.city || 'N/A'} - ${data.aqi?.[0]?.aqi || 'N/A'},Active,${getLogLastUpdated('aqi')}\n`;
    }
    if (selectedLogs.includes('currency') && data) {
      rows += `Currency,Main Rate,${data.currency?.[0]?.base || 'N/A'}/${data.currency?.[0]?.target || 'N/A'} - ${data.currency?.[0]?.rate || 'N/A'},Active,${getLogLastUpdated('currency')}\n`;
    }

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'climex-ledger-export.csv');
    a.click();

    setLedgerCompiledTime(new Date());
    setExportingBundle(false);
    setBundleError(null);
  };

  const handleDownloadLog = async (logId: string) => {
    setExportingLogId(logId);
    setLogErrors(prev => ({ ...prev, [logId]: '' }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const isRetry = !!logErrors[logId];
    const shouldFail = !isRetry && Math.random() < 0.25;

    if (shouldFail) {
      setLogErrors(prev => ({ ...prev, [logId]: "couldn't generate the file. Retry" }));
      setExportingLogId(null);
      return;
    }

    let headers = '';
    let rows = '';

    if (logId === 'crypto' && data) {
      headers = 'Rank,Name,Symbol,Price (USD),24h Change (%),Market Cap,Volume (24h)\n';
      rows = data.crypto.map(c => `${c.rank},${c.name},${c.symbol},${c.price},${c.change24h},${c.marketCap},${c.volume24h}`).join('\n');
    } else if (logId === 'weather' && data) {
      headers = 'City,Country,Temp (°C),Feels Like,Humidity (%),Wind Speed (km/h),Condition\n';
      rows = data.weather.map(w => `${w.city},${w.country},${w.temp},${w.feelsLike},${w.humidity},${w.windSpeed},${w.condition}`).join('\n');
    } else if (logId === 'aqi' && data) {
      headers = 'City,Country,AQI,Status,PM2.5,PM10,CO,Ozone\n';
      rows = data.aqi.map(a => `${a.city},${a.country},${a.aqi},${a.status},${a.pm25},${a.pm10},${a.co},${a.o3}`).join('\n');
    } else if (logId === 'currency' && data) {
      headers = 'Date,Base,Target,Exchange Rate,24h Change (%),Volume\n';
      const rowList: string[] = [];
      data.currency.forEach(c => {
        // Main current rate
        rowList.push(`2026-07-21,${c.base},${c.target},${c.rate},${c.change24h || 0},${c.volume || 12500}`);
        // Add historical days if available in history, otherwise generate realistic historical rates
        if (c.history && c.history.length > 0) {
          c.history.forEach((hist) => {
            rowList.push(`${hist.date},${c.base},${c.target},${hist.rate},${((Math.random() - 0.5) * 1.5).toFixed(2)},${Math.floor((c.volume || 12500) * (0.9 + Math.random() * 0.2))}`);
          });
        } else {
          // Fallback daily history for the last 5 days
          for (let i = 1; i <= 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const historicalRate = (c.rate * (1 + (Math.sin(i) * 0.012))).toFixed(4);
            const historicalChange = (Math.sin(i) * 0.85).toFixed(2);
            rowList.push(`${dateStr},${c.base},${c.target},${historicalRate},${historicalChange},${Math.floor((c.volume || 12500) * (0.95 - i * 0.01))}`);
          }
        }
      });
      rows = rowList.join('\n');
    } else {
      headers = 'Date,Refresh Status\n';
      rows = `${new Date().toLocaleString()},Success\n`;
    }

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `climex-${logId}-export.csv`);
    a.click();

    setExportingLogId(null);
    setLogErrors(prev => {
      const copy = { ...prev };
      delete copy[logId];
      return copy;
    });
  };

  const handleExportCSV = (domain: string) => {
    if (domain === 'ledger') {
      handleDownloadBundle();
    } else {
      handleDownloadLog(domain);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-surface-0 text-text-primary" id="climex-dashboard-container">
      {/* Glow Ambient behind top-right of bento */}
      <div className="ambient-glow" />

      {/* Main Header Nav */}
      <header className="sticky top-0 z-30 border-b border-border-hairline bg-surface-0/85 backdrop-blur-md px-3 py-2.5 md:px-6 md:py-4 flex justify-center w-full animate-fade-in" id="climex-main-header">
        <div className="max-w-7xl w-full flex items-center justify-between gap-3 md:gap-6" id="climex-main-header-inner">
          {/* If mobileSearchExpanded is active (on mobile), show full search bar only */}
          {mobileSearchExpanded ? (
            <div ref={searchRef} className="flex items-center gap-3 w-full animate-fade-in">
              <button
                onClick={() => {
                  setMobileSearchExpanded(false);
                  setGlobalSearchQuery('');
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border-hairline bg-surface-1 text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer"
                title="Back"
              >
                <PhosphorIcon name="chevron-left" className="text-base" />
              </button>
              <div className="relative flex-1">
                <PhosphorIcon name="search" className="text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  autoFocus
                  placeholder="Search assets, locations, or reports..."
                  className="w-full bg-surface-2 border border-border-hairline focus:bg-surface-1 focus:border-border-strong rounded-full pl-10 pr-8 py-2 font-sans text-xs focus:outline-none transition-all duration-300 text-text-primary shadow-inner"
                  value={globalSearchQuery}
                  onChange={(e) => {
                    setGlobalSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />
                {globalSearchQuery && (
                  <button
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer flex items-center justify-center"
                  >
                    <PhosphorIcon name="x" className="text-sm" />
                  </button>
                )}

                <AnimatePresence>
                  {showSearchResults && globalSearchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 w-full mt-2 bg-surface-1/95 border border-border-hairline rounded-3xl p-3 shadow-xl z-50 backdrop-blur-md max-h-[320px] overflow-y-auto flex flex-col gap-1 scrollbar-thin"
                    >
                      {matchedSearchResults.length > 0 ? (
                        matchedSearchResults.map(result => (
                          <button
                            key={result.id}
                            onClick={() => {
                              result.action();
                              setMobileSearchExpanded(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-2 text-left transition-colors cursor-pointer group w-full"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-surface-2 border border-border-hairline flex items-center justify-center">
                                <PhosphorIcon name={result.icon} className="text-sm" />
                              </div>
                              <div>
                                <p className="font-sans font-semibold text-xs text-text-primary group-hover:text-status-accent transition-colors">{result.title}</p>
                                <p className="text-[10px] text-text-secondary leading-tight">{result.subtitle}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted bg-surface-2 px-1.5 py-0.5 rounded flex-shrink-0">
                              {result.type}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-xs text-text-secondary font-medium">No results found for "{globalSearchQuery}"</p>
                          <p className="text-[10px] text-text-muted mt-1">Try another keyword (e.g. BTC, New York, EUR)</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
              {/* Left Section: Logo + 3-Item Nav */}
              <div className="flex items-center gap-5">
                {/* Logo */}
                <div
                  className="flex items-center gap-3 cursor-pointer select-none transition-all duration-200 hover:opacity-90"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setGlobalSearchQuery('');
                    setShowSearchResults(false);
                  }}
                >
                  <div className="relative">
                    <img
                      src="/img/v1bg.png"
                      alt="Logo"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                        if (sibling) {
                          sibling.classList.remove('hidden');
                          sibling.classList.add('flex');
                        }
                      }}
                      className="h-9 w-auto max-w-[160px] object-contain block transition-transform duration-200 hover:scale-125 active:scale-95"
                    />
                    <div className="hidden items-center gap-2 px-5 py-1.5 rounded-xl border border-dashed border-border-strong/30 bg-surface-1 text-text-secondary text-xs font-mono tracking-tight font-medium h-9 transition-transform duration-200 hover:scale-105 active:scale-95">
                      <div className="w-2 h-2 rounded-full bg-status-warning shrink-0" />
                      <span>LOGO PLACEHOLDER</span>
                    </div>
                  </div>
                </div>

                {/* Subtle vertical divider to group navigation tabs visually */}
                <div className="hidden lg:block w-[1px] h-5 bg-border-hairline/60" />

                {/* Redesigned 3-Item Desktop Pill Navigation */}
                <nav className="hidden lg:flex items-center gap-2.5 p-1 bg-surface-2 rounded-[20px] border border-border-hairline shadow-xs animate-fade-in" id="desktop-pill-nav">

                  {/* Dashboard */}
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[12px] font-sans font-semibold text-xs tracking-tight transition-all duration-250 ease-out active:scale-98 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-text-primary/30 ${activeTab === 'dashboard'
                      ? 'bg-surface-1 text-text-primary border border-border-strong/10 shadow-xs font-bold hover:bg-surface-1/90 hover:scale-[1.02]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-3/85 hover:scale-[1.02]'
                      }`}
                  >
                    <PhosphorIcon name="grid-alt" className="text-sm" />
                    <span>Dashboard</span>
                  </button>

                  {/* Explore with Dropdown */}
                  <div
                    ref={exploreRef}
                    className="relative"
                    onMouseEnter={() => setExploreDropdownOpen(true)}
                    onMouseLeave={() => setExploreDropdownOpen(false)}
                  >
                    <button
                      onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-[12px] font-sans font-semibold text-xs tracking-tight transition-all duration-250 ease-out active:scale-98 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-text-primary/30 ${['crypto', 'currency', 'weather', 'aqi', 'countries'].includes(activeTab)
                        ? 'bg-surface-1 text-text-primary border border-border-strong/10 shadow-xs font-bold hover:bg-surface-1/90 hover:scale-[1.02]'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-3/85 hover:scale-[1.02]'
                        }`}
                    >
                      <PhosphorIcon name="compass" className="text-sm" />
                      <span>Explore</span>
                      <PhosphorIcon name="chevron-down" className={`text-xs transition-transform duration-200 ${exploreDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {exploreDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[560px] bg-surface-1/95 border border-border-hairline rounded-3xl p-6 shadow-xl z-50 backdrop-blur-md grid grid-cols-3 gap-6 pointer-events-auto"
                        >
                          {/* Column 1: Markets */}
                          <div>
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">Markets</span>
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => { setActiveTab('crypto'); setExploreDropdownOpen(false); }}
                                className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-2 text-left transition-colors cursor-pointer group w-full"
                              >
                                <div className="w-8 h-8 rounded-lg bg-status-warning-bg flex items-center justify-center text-status-warning group-hover:scale-105 transition-transform flex-shrink-0">
                                  <PhosphorIcon name="coin-stack" className="text-base" />
                                </div>
                                <div>
                                  <p className="font-sans font-semibold text-xs text-text-primary group-hover:text-status-accent transition-colors">Crypto</p>
                                  <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">Digital asset indices</p>
                                </div>
                              </button>

                              <button
                                onClick={() => { setActiveTab('currency'); setExploreDropdownOpen(false); }}
                                className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-2 text-left transition-colors cursor-pointer group w-full"
                              >
                                <div className="w-8 h-8 rounded-lg bg-status-success-bg flex items-center justify-center text-status-success group-hover:scale-105 transition-transform flex-shrink-0">
                                  <PhosphorIcon name="dollar" className="text-base" />
                                </div>
                                <div>
                                  <p className="font-sans font-semibold text-xs text-text-primary group-hover:text-status-accent transition-colors">Currency</p>
                                  <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">Foreign exchange rates</p>
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Column 2: Environment */}
                          <div>
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">Environment</span>
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => { setActiveTab('weather'); setExploreDropdownOpen(false); }}
                                className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-2 text-left transition-colors cursor-pointer group w-full"
                              >
                                <div className="w-8 h-8 rounded-lg bg-status-info-bg flex items-center justify-center text-status-info group-hover:scale-105 transition-transform flex-shrink-0">
                                  <PhosphorIcon name="cloud-sun" className="text-base" />
                                </div>
                                <div>
                                  <p className="font-sans font-semibold text-xs text-text-primary group-hover:text-status-accent transition-colors">Weather</p>
                                  <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">Regional forecasts</p>
                                </div>
                              </button>

                              <button
                                onClick={() => { setActiveTab('aqi'); setExploreDropdownOpen(false); }}
                                className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-2 text-left transition-colors cursor-pointer group w-full"
                              >
                                <div className="w-8 h-8 rounded-lg bg-status-accent-bg flex items-center justify-center text-status-accent group-hover:scale-105 transition-transform flex-shrink-0">
                                  <PhosphorIcon name="globe" className="text-base" />
                                </div>
                                <div>
                                  <p className="font-sans font-semibold text-xs text-text-primary group-hover:text-status-accent transition-colors">Air Quality</p>
                                  <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">Global AQI metrics</p>
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Column 3: Reference */}
                          <div>
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">Reference</span>
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => { setActiveTab('countries'); setExploreDropdownOpen(false); }}
                                className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-2 text-left transition-colors cursor-pointer group w-full"
                              >
                                <div className="w-8 h-8 rounded-lg bg-status-indigo-bg flex items-center justify-center text-status-indigo group-hover:scale-105 transition-transform flex-shrink-0">
                                  <PhosphorIcon name="landmark" className="text-base" />
                                </div>
                                <div>
                                  <p className="font-sans font-semibold text-xs text-text-primary group-hover:text-status-accent transition-colors">Countries</p>
                                  <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">Sovereign stats</p>
                                </div>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Reports */}
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[12px] font-sans font-semibold text-xs tracking-tight transition-all duration-250 ease-out active:scale-98 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-text-primary/30 ${activeTab === 'reports'
                      ? 'bg-surface-1 text-text-primary border border-border-hairline/80 shadow-xs font-bold hover:bg-surface-1/90 hover:scale-[1.02]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-3/85 hover:scale-[1.02]'
                      }`}
                  >
                    <PhosphorIcon name="file" className="text-sm" />
                    <span>Reports</span>
                  </button>
                </nav>
              </div>

              {/* Center Section: Promoted Global Search Bar (Responsive Desktop) */}
              <div ref={searchRef} className="hidden md:block relative flex-grow max-w-[340px] mx-auto focus-within:max-w-[385px] transition-all duration-300 ease-out">
                <div className="relative">
                  <PhosphorIcon name="search" className="text-base absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search assets, locations, or reports..."
                    className="w-full bg-surface-2 border border-border-hairline/60 focus:bg-surface-1 focus:border-border-strong focus:ring-2 focus:ring-text-primary/15 rounded-full pl-10 pr-12 py-2 font-sans text-xs focus:outline-none transition-all duration-300 text-text-primary shadow-inner"
                    value={globalSearchQuery}
                    onChange={(e) => {
                      setGlobalSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                  />
                  {globalSearchQuery ? (
                    <button
                      onClick={() => setGlobalSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer flex items-center justify-center animate-fade-in"
                    >
                      <PhosphorIcon name="x" className="text-sm" />
                    </button>
                  ) : (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center bg-surface-3 border border-border-strong/15 text-[10px] font-sans text-text-muted px-1.5 py-0.5 rounded pointer-events-none select-none">
                      ⌘K
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showSearchResults && globalSearchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 w-full mt-2 bg-surface-1/95 border border-border-hairline rounded-3xl p-3 shadow-xl z-50 backdrop-blur-md max-h-[320px] overflow-y-auto flex flex-col gap-1 scrollbar-thin"
                    >
                      {matchedSearchResults.length > 0 ? (
                        matchedSearchResults.map(result => (
                          <button
                            key={result.id}
                            onClick={result.action}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-2 text-left transition-colors cursor-pointer group w-full"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-surface-2 border border-border-hairline flex items-center justify-center">
                                <PhosphorIcon name={result.icon} className="text-sm" />
                              </div>
                              <div>
                                <p className="font-sans font-semibold text-xs text-text-primary group-hover:text-status-accent transition-colors">{result.title}</p>
                                <p className="text-[10px] text-text-secondary leading-tight">{result.subtitle}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted bg-surface-2 px-1.5 py-0.5 rounded flex-shrink-0">
                              {result.type}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-xs text-text-secondary font-medium">No results found for "{globalSearchQuery}"</p>
                          <p className="text-[10px] text-text-muted mt-1">Try another keyword (e.g. BTC, New York, EUR)</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Section: Settings and theme toggle (No profile avatar KA) */}
              <div className="flex items-center gap-1.5 md:gap-3">
                {/* Search Icon Button for narrower viewports (mobile/tablet) */}
                <button
                  onClick={() => setMobileSearchExpanded(true)}
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-border-hairline bg-surface-1 text-text-secondary hover:text-text-primary hover:bg-surface-2 hover:border-border-strong/40 transition-all duration-200 active:scale-95 cursor-pointer"
                  title="Search"
                >
                  <PhosphorIcon name="search" className="text-base" />
                </button>



                {/* Icon 1: Theme Switcher with friendly hover/click transition - hidden on mobile */}
                <div className="hidden md:flex items-center justify-center transition-all duration-200 active:scale-95">
                  <ThemeToggle />
                </div>

                {/* Icon 2: Settings Button with friendly hover/click transition - hidden on mobile */}
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 ${activeTab === 'settings'
                    ? 'border-border-strong text-text-primary bg-surface-2'
                    : 'border-border-hairline bg-surface-1 text-text-secondary hover:text-text-primary hover:bg-surface-2 hover:border-border-strong/40'
                    }`}
                  title="Settings"
                >
                  <PhosphorIcon name="cog" className="text-base" />
                </button>

                {/* Responsive Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border-hairline bg-surface-1 hover:bg-surface-2 text-text-secondary hover:text-text-primary active:scale-95 cursor-pointer transition-all duration-200"
                  aria-label="Toggle navigation menu"
                  id="mobile-menu-toggle-btn"
                >
                  {mobileMenuOpen ? <PhosphorIcon name="x" className="text-base" /> : <PhosphorIcon name="menu" className="text-base" />}
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile Scrollable horizontal navigation tab bar */}
      <div className="lg:hidden sticky top-[57px] md:top-[69px] z-20 w-full overflow-x-auto scrollbar-none border-b border-border-hairline bg-surface-1/90 backdrop-blur-md py-2 px-3 md:py-3 md:px-4 flex items-center gap-1.5 md:gap-2" id="mobile-scrollable-nav">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'grid-alt' },
          { id: 'crypto', label: 'Crypto', icon: 'coin-stack' },
          { id: 'currency', label: 'Currency', icon: 'dollar' },
          { id: 'weather', label: 'Weather', icon: 'cloud-sun' },
          { id: 'aqi', label: 'Air Quality', icon: 'globe' },
          { id: 'countries', label: 'Countries', icon: 'landmark' },
          { id: 'reports', label: 'Reports', icon: 'file' },
          { id: 'settings', label: 'Settings', icon: 'cog' }
        ].map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 md:gap-1.5 md:px-3 md:py-2 rounded-full font-sans font-semibold text-xs whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer ${isActive
                ? 'bg-status-warning text-black font-bold shadow-xs'
                : 'text-text-secondary bg-surface-2 border border-border-hairline/40 hover:text-text-primary'
                }`}
            >
              <PhosphorIcon name={item.icon} className="text-xs md:text-sm" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-1 border-b border-border-hairline p-5 absolute top-[57px] md:top-[69px] left-0 right-0 z-40 flex flex-col gap-4 shadow-lg animate-slide-up" id="mobile-menu-dropdown">

          {/* Mobile Global Search */}
          <div className="relative">
            <PhosphorIcon name="search" className="text-sm absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search BTC, New York, EUR..."
              className="w-full bg-surface-2 border border-border-hairline focus:border-status-accent rounded-full pl-9 pr-4 py-2 font-sans text-xs focus:outline-none text-text-primary"
              value={globalSearchQuery}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans font-semibold text-xs tracking-tight transition-all text-left cursor-pointer ${activeTab === 'dashboard'
                ? 'bg-surface-2 text-text-primary border border-border-hairline/45 font-bold shadow-xs'
                : 'text-text-secondary hover:bg-surface-2/50'
                }`}
            >
              <PhosphorIcon name="grid-alt" className="text-base" />
              <span>Dashboard</span>
            </button>

            {/* Explore Group */}
            <div className="mt-2">
              <span className="block px-4 text-[9px] font-mono uppercase tracking-wider text-text-muted mb-1.5">Explore</span>
              <div className="pl-4 flex flex-col gap-1 border-l border-border-hairline/50 ml-6">
                {[
                  { id: 'crypto', label: 'Crypto', icon: 'coin-stack' },
                  { id: 'currency', label: 'Currency', icon: 'dollar' },
                  { id: 'weather', label: 'Weather', icon: 'cloud-sun' },
                  { id: 'aqi', label: 'Air Quality', icon: 'globe' },
                  { id: 'countries', label: 'Countries', icon: 'landmark' }
                ].map(sub => {
                  const isSubActive = activeTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => { setActiveTab(sub.id); setMobileMenuOpen(false); }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-sans font-medium text-xs tracking-tight transition-all text-left cursor-pointer ${isSubActive
                        ? 'bg-surface-2 text-text-primary border border-border-hairline/30 font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                      <PhosphorIcon name={sub.icon} className="text-sm" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans font-semibold text-xs tracking-tight transition-all text-left cursor-pointer mt-2 ${activeTab === 'reports'
                ? 'bg-surface-2 text-text-primary border border-border-hairline/45 font-bold shadow-xs'
                : 'text-text-secondary hover:bg-surface-2/50'
                }`}
            >
              <PhosphorIcon name="file" className="text-base" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans font-semibold text-xs tracking-tight transition-all text-left cursor-pointer mt-2 ${activeTab === 'settings'
                ? 'bg-surface-2 text-text-primary border border-border-hairline/45 font-bold shadow-xs'
                : 'text-text-secondary hover:bg-surface-2/50'
                }`}
            >
              <PhosphorIcon name="cog" className="text-base" />
              <span>Settings</span>
            </button>
          </div>

          {/* Preferences Row for Mobile (Includes Theme Switcher) */}
          <div className="flex items-center justify-between border-t border-border-hairline/60 pt-4 mt-2">
            <span className="text-xs font-sans font-semibold text-text-secondary">Switch Theme</span>
            <div className="flex items-center justify-center transition-all duration-200 active:scale-95">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton & Error Tickers */}
      {loading && !data && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center items-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-full border-2 border-border-hairline border-t-status-accent animate-spin mb-4" />
          <p className="font-sans font-medium text-sm text-text-secondary">Loading...</p>
        </main>
      )}

      {error && !data && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center items-center min-h-[60vh]" id="error-screen">
          <div className="w-12 h-12 rounded-full bg-status-danger-bg text-status-danger flex items-center justify-center mb-4">
            <PhosphorIcon name="error-circle" className="text-2xl" />
          </div>
          <h3 className="font-sans font-semibold text-base text-text-primary mb-2">Interrupted</h3>
          <p className="font-body text-xs text-text-secondary max-w-md text-center leading-relaxed mb-6">
            {error}. The server-side proxy proxies are currently unresponsive or rate-limited.
          </p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-2.5 bg-text-primary text-surface-1 font-sans font-medium text-xs rounded-full shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
          >
            Retry Connection
          </button>
        </main>
      )}

      {/* Main Content Pane */}
      {data && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 z-10 relative flex flex-col gap-4 md:gap-6">

          {/* Header Greeting Stripe */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 border-b border-border-hairline pb-3 md:pb-4" id="dashboard-welcome-stripe">
            <div>
              <h1 className="font-sans font-light text-xl md:text-3xl tracking-tight text-text-primary leading-none">
                {userName ? (
                  <>
                    {getGreeting()}, <span className="font-medium">{userName}</span>
                  </>
                ) : (
                  <>
                    {getGreeting()}, <span className="font-medium">trader</span>
                  </>
                )}
              </h1>

              {/* Dynamic Breadcrumbs Trail */}
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] md:text-xs font-sans text-text-secondary select-none">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setGlobalSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="hover:text-text-primary transition-colors cursor-pointer outline-none focus-visible:underline"
                >
                  Dashboard
                </button>
                {activeTab !== 'dashboard' && (
                  <>
                    <PhosphorIcon name="caret-right" className="text-[10px] text-text-muted" />
                    {['crypto', 'currency', 'weather', 'aqi', 'countries'].includes(activeTab) ? (
                      <>
                        <span className="text-text-muted">Explore</span>
                        <PhosphorIcon name="caret-right" className="text-[10px] text-text-muted" />
                        <span className="text-text-primary font-medium capitalize">
                          {activeTab === 'aqi' ? 'Air Quality' : activeTab}
                        </span>
                      </>
                    ) : (
                      <span className="text-text-primary font-medium capitalize">{activeTab}</span>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Last Synced Clock */}
            <SyncStatusWidget lastSynced={lastSyncedTime} currentTime={currentTime} />
          </div>

          {/* ==================== TAB 1: DASHBOARD HOME ==================== */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-4 md:gap-6 animate-fade-in" id="dashboard-tab-view">

              {/* KPI Strip */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" id="kpi-strip">
                {[
                  {
                    title: 'Bitcoin Price',
                    titleMobile: 'Bitcoin',
                    value: formatPrice(data.crypto?.[0]?.price),
                    change: data.crypto?.[0]?.change24h,
                    unit: defaultCurrency,
                    unitMobile: defaultCurrency,
                    textColor: 'text-status-warning',
                    tab: 'crypto',
                    showLocationBadge: false
                  },
                  {
                    title: "Today's Weather",
                    titleMobile: 'Weather',
                    value: formatTemp(activeWeather?.temp),
                    change: null,
                    unit: `Weather — ${selectedCity}`,
                    unitMobile: `Weather — ${selectedCity}`,
                    textColor: 'text-status-accent',
                    tab: 'weather',
                    showLocationBadge: true
                  },
                  {
                    title: 'USD to EUR',
                    titleMobile: 'USD/EUR',
                    value: data.currency?.[0]?.rate?.toFixed(4),
                    change: data.currency?.[0]?.change24h,
                    unit: 'Current rate',
                    unitMobile: 'Current rate',
                    textColor: 'text-status-info',
                    tab: 'currency',
                    showLocationBadge: false
                  },
                  {
                    title: 'Air Quality',
                    titleMobile: 'Air Quality',
                    value: activeAQI ? `${activeAQI.aqi} AQI` : `${Math.floor(data.aqi?.reduce((acc, curr) => acc + curr.aqi, 0) / data.aqi?.length)} AQI`,
                    change: null,
                    unit: `Air quality — ${selectedCity}`,
                    unitMobile: `Air quality — ${selectedCity}`,
                    textColor: 'text-status-success',
                    tab: 'aqi',
                    showLocationBadge: true
                  }
                ].map((kpi, idx) => {
                  // Determine icon based on index or key
                  const icons = ['crypto', 'weather', 'currency', 'aqi'];
                  const iconName = icons[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (kpi.tab) {
                          setActiveTab(kpi.tab);
                        }
                      }}
                      className="bg-surface-2 p-3.5 md:p-5 rounded-2xl flex flex-col justify-between min-h-[95px] md:min-h-[110px] transition-all duration-200 hover:bg-surface-3/50 hover:border-border-hairline active:scale-[0.98] cursor-pointer border border-transparent"
                    >
                      <div className="flex items-start justify-between gap-1.5 w-full">
                        <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                          <span className={`p-1 rounded-lg bg-surface-3 text-text-secondary ${kpi.textColor || ''} shrink-0`}>
                            <PhosphorIcon name={iconName} className="text-xs md:text-sm" />
                          </span>
                          <span className="text-[10px] md:text-[11px] font-sans font-semibold text-text-secondary leading-none truncate">
                            <span className="hidden md:inline">{kpi.title}</span>
                            <span className="inline md:hidden">{kpi.titleMobile}</span>
                          </span>
                        </div>
                        {kpi.change !== null && (
                          <span className={`text-[9px] md:text-[10px] font-sans font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full shrink-0 ${kpi.change >= 0 ? 'bg-status-success-bg text-status-success' : 'bg-status-danger-bg text-status-danger'
                            }`}>
                            {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="mt-2 md:mt-4">
                        <p className="font-sans font-semibold md:font-light text-base md:text-2xl tracking-tight text-text-primary tabular-nums leading-none">
                          {kpi.value}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 md:mt-1.5 flex-wrap min-w-0">
                          <span className="text-[9px] md:text-[10px] font-sans text-text-muted font-medium truncate">
                            <span className="hidden md:inline">{kpi.unit}</span>
                            {kpi.unitMobile !== '' && (
                              <span className="inline md:hidden">{kpi.unitMobile || kpi.unit}</span>
                            )}
                          </span>
                          {kpi.showLocationBadge && (
                            <>
                              {locationSource === 'default' ? (
                                <span
                                  className="text-[8px] bg-surface-3 text-text-muted px-1.5 py-0.2 rounded border border-border-hairline/35 font-sans font-medium cursor-help"
                                  title={`Showing ${selectedCity} — tap to change`}
                                >
                                  default
                                </span>
                              ) : locationSource === 'gps' ? (
                                <span
                                  className="text-[8px] bg-status-success-bg text-status-success px-1.5 py-0.2 rounded font-sans font-medium"
                                  title="Detected via your browser geolocation"
                                >
                                  GPS
                                </span>
                              ) : (
                                <span
                                  className="text-[8px] bg-status-info-bg text-status-info px-1.5 py-0.2 rounded font-sans font-medium"
                                  title="Saved in your profile preferences"
                                >
                                  profile
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">

                {/* Left Column (Timeline/Recent Updates) — Span 3 - order-3 on mobile */}
                <div className="lg:col-span-3 flex flex-col justify-between order-3 lg:order-none" id="dashboard-alerts-insights-panel">
                  <div className="p-1 bg-transparent flex flex-col justify-between h-full min-h-[420px]">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-sans font-medium text-sm text-text-primary">Alerts & insights</h3>
                        {wsStatus === 'connected' ? (
                          <div className="flex items-center gap-1.5 text-text-muted shrink-0 select-none">
                            <span className="text-[10px] font-sans font-normal uppercase tracking-wider">Live feed</span>
                          </div>
                        ) : wsStatus === 'reconnecting' || wsStatus === 'connecting' ? (
                          <div className="flex items-center gap-1.5 text-status-warning shrink-0 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse shrink-0" />
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">Reconnecting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-text-muted shrink-0 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <span className="text-[10px] font-sans font-normal uppercase tracking-wider">Offline</span>
                          </div>
                        )}
                      </div>

                      {(() => {
                        const visibleAlerts = isAlertsExpanded ? alerts : alerts.slice(0, 5);
                        const needsAttentionGroup = visibleAlerts.filter(item => item.severity === 'needs-attention');
                        const fyiGroup = visibleAlerts.filter(item => item.severity === 'fyi');

                        return (
                          <div className="flex flex-col gap-4 w-full">
                            {/* Fixed height scrollable container matching Watchlist panel height (~420px max) */}
                            <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-border-hairline" id="alerts-scrollable-container">
                              {/* Needs attention group */}
                              <div id="alerts-needs-attention-group" className="flex flex-col">
                                <h4 className="text-[11px] font-medium tracking-wide text-text-muted uppercase mb-2 font-sans">Needs attention</h4>

                                {needsAttentionGroup.length === 0 ? (
                                  <p className="text-xs text-text-muted py-3 italic font-sans">No active priority alerts.</p>
                                ) : (
                                  needsAttentionGroup.map((item, idx, arr) => {
                                    const isExpanded = !!expandedAlerts[item.id];
                                    const isNew = newlyArrivedIds.has(item.id);
                                    return (
                                      <div
                                        key={item.id}
                                        onClick={() => setExpandedAlerts(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                        className={`flex gap-3 py-3 ${idx < arr.length - 1 ? 'border-b border-border-hairline/50' : ''} cursor-pointer select-none group transition-all duration-1000 ${isNew ? 'bg-status-warning/15 -mx-3 px-3 rounded-xl' : 'bg-transparent'
                                          }`}
                                        id={`alert-item-${item.id}`}
                                      >
                                        <div className="flex-shrink-0 mt-0.5 text-white opacity-95">
                                          <PhosphorIcon name={item.icon} className="text-white" size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2 min-w-0 w-full">
                                            <span className="text-[14px] font-medium text-text-primary leading-snug truncate flex-1 pr-1 font-sans">
                                              {item.headline}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0 text-text-muted mt-0.5">
                                              <span className="text-[12px] font-normal font-sans">{getRelativeTime(item.createdAt)}</span>
                                              <span className={`inline-block transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <PhosphorIcon name="chevron-down" size={14} className="text-text-muted" />
                                              </span>
                                            </div>
                                          </div>
                                          <p className={`text-[13px] text-text-secondary leading-relaxed font-normal mt-1 transition-[max-height] duration-300 ease-in-out overflow-hidden font-sans ${isExpanded ? 'max-h-[200px] line-clamp-none' : 'max-h-[20px] line-clamp-1'
                                            }`}>
                                            {item.detail}
                                          </p>

                                          {isExpanded && item.sourceEvent && (
                                            <div className="mt-2.5 p-2.5 bg-surface-3/40 rounded-xl border border-border-hairline/30 flex flex-col gap-1 text-[11px] font-sans text-text-secondary select-text animate-fade-in">
                                              <div className="flex justify-between items-center text-[10px] text-text-muted uppercase tracking-wider border-b border-border-hairline/30 pb-1 mb-1 font-sans">
                                                <span>Audit Data Trace</span>
                                                <span className="text-[9px] font-sans font-normal text-status-warning bg-status-warning/10 px-1 py-0.2 rounded">Event Bound</span>
                                              </div>
                                              <div className="flex justify-between font-sans">
                                                <span className="text-text-muted">Metric Source:</span>
                                                <span className="text-text-primary font-medium">{item.sourceEvent.metric}</span>
                                              </div>
                                              <div className="flex justify-between font-sans">
                                                <span className="text-text-muted">Trigger Value:</span>
                                                <span className="text-text-primary font-semibold">{item.sourceEvent.value}</span>
                                              </div>
                                              <div className="flex justify-between font-sans">
                                                <span className="text-text-muted">Target Entity:</span>
                                                <span className="text-text-primary font-medium">{item.sourceEvent.targetEntity}</span>
                                              </div>
                                              {item.sourceEvent.extraInfo && Object.keys(item.sourceEvent.extraInfo).length > 0 && (
                                                <div className="mt-1.5 pt-1.5 border-t border-border-hairline/30 text-[10px] text-text-muted flex flex-wrap gap-x-3 gap-y-1 font-sans">
                                                  {Object.entries(item.sourceEvent.extraInfo).map(([k, v]) => (
                                                    <span key={k}>{k}: <span className="text-text-secondary font-sans">{String(v)}</span></span>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* For your information group */}
                              <div id="alerts-fyi-group" className="flex flex-col">
                                <h4 className="text-[11px] font-medium tracking-wide text-text-muted uppercase mb-2 font-sans">For your information</h4>

                                {fyiGroup.length === 0 ? (
                                  <p className="text-xs text-text-muted py-3 italic font-sans">No active information alerts.</p>
                                ) : (
                                  fyiGroup.map((item, idx, arr) => {
                                    const isExpanded = !!expandedAlerts[item.id];
                                    const isNew = newlyArrivedIds.has(item.id);
                                    return (
                                      <div
                                        key={item.id}
                                        onClick={() => setExpandedAlerts(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                        className={`flex gap-3 py-3 ${idx < arr.length - 1 ? 'border-b border-border-hairline/50' : ''} cursor-pointer select-none group transition-all duration-1000 ${isNew ? 'bg-status-warning/15 -mx-3 px-3 rounded-xl' : 'bg-transparent'
                                          }`}
                                        id={`alert-item-${item.id}`}
                                      >
                                        <div className="flex-shrink-0 mt-0.5 text-white opacity-95">
                                          <PhosphorIcon name={item.icon} className="text-white" size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2 min-w-0 w-full">
                                            <span className="text-[14px] font-medium text-text-primary leading-snug truncate flex-1 pr-1 font-sans">
                                              {item.headline}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0 text-text-muted mt-0.5">
                                              <span className="text-[12px] font-normal font-sans">{getRelativeTime(item.createdAt)}</span>
                                              <span className={`inline-block transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <PhosphorIcon name="chevron-down" size={14} className="text-text-muted" />
                                              </span>
                                            </div>
                                          </div>
                                          <p className={`text-[13px] text-text-secondary leading-relaxed font-normal mt-1 transition-[max-height] duration-300 ease-in-out overflow-hidden font-sans ${isExpanded ? 'max-h-[200px] line-clamp-none' : 'max-h-[20px] line-clamp-1'
                                            }`}>
                                            {item.detail}
                                          </p>

                                          {isExpanded && item.sourceEvent && (
                                            <div className="mt-2.5 p-2.5 bg-surface-3/40 rounded-xl border border-border-hairline/30 flex flex-col gap-1 text-[11px] font-sans text-text-secondary select-text animate-fade-in">
                                              <div className="flex justify-between items-center text-[10px] text-text-muted uppercase tracking-wider border-b border-border-hairline/30 pb-1 mb-1 font-sans">
                                                <span>Audit Data Trace</span>
                                                <span className="text-[9px] font-sans font-normal text-status-warning bg-status-warning/10 px-1 py-0.2 rounded">Event Bound</span>
                                              </div>
                                              <div className="flex justify-between font-sans">
                                                <span className="text-text-muted">Metric Source:</span>
                                                <span className="text-text-primary font-medium">{item.sourceEvent.metric}</span>
                                              </div>
                                              <div className="flex justify-between font-sans">
                                                <span className="text-text-muted">Trigger Value:</span>
                                                <span className="text-text-primary font-semibold">{item.sourceEvent.value}</span>
                                              </div>
                                              <div className="flex justify-between font-sans">
                                                <span className="text-text-muted">Target Entity:</span>
                                                <span className="text-text-primary font-medium">{item.sourceEvent.targetEntity}</span>
                                              </div>
                                              {item.sourceEvent.extraInfo && Object.keys(item.sourceEvent.extraInfo).length > 0 && (
                                                <div className="mt-1.5 pt-1.5 border-t border-border-hairline/30 text-[10px] text-text-muted flex flex-wrap gap-x-3 gap-y-1 font-sans">
                                                  {Object.entries(item.sourceEvent.extraInfo).map(([k, v]) => (
                                                    <span key={k}>{k}: <span className="text-text-secondary font-sans">{String(v)}</span></span>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* View All / Collapse Button */}
                            {alerts.length > 5 && (
                              <button
                                onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
                                className="w-full mt-1 py-2 px-3 bg-surface-2 hover:bg-surface-3 border border-border-hairline rounded-xl text-xs font-sans font-medium text-text-primary transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 hover:border-border-strong select-none"
                                id="view-all-alerts-btn"
                              >
                                <PhosphorIcon name={isAlertsExpanded ? "caret-up" : "menu"} size={12} className="text-text-secondary" />
                                {isAlertsExpanded ? "Show less" : `View all alerts history (${alerts.length})`}
                              </button>
                            )}
                          </div>
                        );
                      })()}


                    </div>

                    {/* Minimal System Status Footer */}
                    <div className="mt-6 pt-4 border-t border-border-hairline/50 flex items-center justify-between text-[11px] text-text-muted font-normal" id="system-status-footer">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0" />
                        <span>services available</span>
                      </div>
                      <span>Synced 09:30 UTC</span>
                    </div>
                  </div>
                </div>

                {/* Center Area (Search + Watchlist Table + Price Trend Chart) — Span 6 - order-1 on mobile */}
                <div className="lg:col-span-6 flex flex-col gap-6 order-1 lg:order-none">

                  {/* Watchlist table card (List panel - no border, hairline row dividers) */}
                  <div className="p-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <div>
                        <h3 className="font-sans font-semibold text-sm text-text-primary tracking-tight">Market Watchlist</h3>
                        <p className="text-xs text-text-secondary">Track real-time digital asset indices</p>
                      </div>
                      {/* Filter Pill */}
                      <div className="relative">
                        <PhosphorIcon name="search" className="text-sm absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                          type="text"
                          placeholder="Filter list..."
                          value={cryptoSearch}
                          onChange={(e) => setCryptoSearch(e.target.value)}
                          className="pl-8 pr-4 py-1.5 rounded-full border border-border-hairline bg-surface-2 font-sans text-xs focus:outline-none focus:border-border-strong w-full sm:w-44 text-text-primary"
                        />
                      </div>
                    </div>

                    {/* Table with hairline dividers */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border-hairline text-[11px] font-sans font-semibold text-text-muted">
                            <th className="pb-3">Asset Pair</th>
                            <th className="pb-3 text-right">Price</th>
                            <th className="pb-3 text-right">24h Change</th>
                            <th className="pb-3 text-center hidden sm:table-cell">Market Trend</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-sans divide-y divide-border-hairline">
                          {filteredCoins.slice(0, 4).map((coin) => (
                            <tr key={coin.id} className="hover:bg-surface-2 cursor-pointer transition-colors" onClick={() => { setSelectedCoinId(coin.id); setActiveTab('crypto'); }}>
                              <td className="py-3 flex items-center gap-2.5">
                                <CryptoLogo symbol={coin.symbol} size={6} />
                                <div>
                                  <p className="font-medium text-text-primary leading-tight">{coin.name}</p>
                                  <p className="text-[10px] text-text-secondary capitalize leading-tight">Crypto Index</p>
                                </div>
                              </td>
                              <td className="py-3 text-right font-mono font-medium text-text-primary tabular-nums">
                                {formatPrice(coin.price)}
                              </td>
                              <td className={`py-3 text-right font-mono font-medium tabular-nums ${coin.change24h >= 0 ? 'text-status-success' : 'text-status-danger'
                                }`}>
                                {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                              </td>
                              <td className="py-3 text-center hidden sm:table-cell">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${coin.change24h >= 0 ? 'bg-status-success-bg text-status-success' : 'bg-status-danger-bg text-status-danger'
                                  }`}>
                                  {coin.change24h >= 0 ? <PhosphorIcon name="trending-up" className="text-[10px]" /> : <PhosphorIcon name="trending-down" className="text-[10px]" />}
                                  {coin.change24h >= 0 ? 'Bullish' : 'Bearish'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bottom line chart card (Primary feature panel - keeping border + 2px top accent border) */}
                  <div className="border border-border-hairline border-t-2 border-t-status-warning rounded-2xl md:rounded-3xl bg-surface-1 p-4 md:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-sans font-medium text-sm text-text-primary tracking-tight">{activeCoin?.name} Live Feed</h3>
                        <p className="text-xs text-text-secondary">Aggregated hourly price activity (24 hours)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[10px] font-medium text-text-secondary bg-surface-2 px-2.5 py-0.5 rounded-full border border-border-hairline">
                          {activeCoin?.symbol} to USD
                        </span>
                      </div>
                    </div>
                    <PriceTrendChart data={activeCoin?.sparkline || []} name={activeCoin?.name || 'Index'} />
                  </div>

                </div>

                {/* Right Column (Global Snapshot Dark Card + Air Quality Gauge) — Span 3 - order-2 on mobile */}
                <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6 order-2 lg:order-none">

                  {/* Global Snapshot dark card (Keeping border + 2px top accent border) */}
                  <div className="border border-border-hairline border-t-2 border-t-status-accent rounded-2xl md:rounded-3xl bg-surface-2 p-4 md:p-5 shadow-sm flex flex-col justify-between min-h-[220px] md:min-h-[250px] relative overflow-hidden" id="aqi-global-snapshot-card">
                    {(() => {
                      const formatAqiTime = (lastUpdated: any) => {
                        if (!lastUpdated) return 'Recently';
                        const d = new Date(lastUpdated);
                        if (isNaN(d.getTime())) return 'Recently';
                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';
                      };

                      const aqiStatusMap = {
                        Good: {
                          colorClass: 'text-status-success border-status-success/20 bg-status-success-bg/10',
                          dotClass: 'bg-status-success',
                          badgeText: 'Good',
                          textColor: 'text-status-success',
                          insight: 'Air quality is satisfactory. Safe for all normal outdoor activities.',
                        },
                        Moderate: {
                          colorClass: 'text-status-warning border-status-warning/20 bg-status-warning-bg/10',
                          dotClass: 'bg-status-warning',
                          badgeText: 'Moderate',
                          textColor: 'text-status-warning',
                          insight: 'Acceptable air quality. Sensitive groups should limit prolonged outdoor exertion.',
                        },
                        'Unhealthy for Sensitive Groups': {
                          colorClass: 'text-orange-500 border-orange-500/20 bg-orange-500/10',
                          dotClass: 'bg-orange-500',
                          badgeText: 'Sensitive Groups',
                          textColor: 'text-orange-500',
                          insight: 'Sensitive groups may experience health effects. General public not likely affected.',
                        },
                        Unhealthy: {
                          colorClass: 'text-status-danger border-status-danger/20 bg-status-danger-bg/10',
                          dotClass: 'bg-status-danger',
                          badgeText: 'Unhealthy',
                          textColor: 'text-status-danger',
                          insight: 'Elevated risk. Everyone should consider reducing heavy outdoor activities.',
                        },
                        'Very Unhealthy': {
                          colorClass: 'text-purple-500 border-purple-500/20 bg-purple-500/10',
                          dotClass: 'bg-purple-500',
                          badgeText: 'Very Unhealthy',
                          textColor: 'text-purple-500',
                          insight: 'Health alert: everyone may experience more serious health effects.',
                        },
                        Hazardous: {
                          colorClass: 'text-status-danger border-status-danger/20 bg-status-danger-bg/10',
                          dotClass: 'bg-status-danger',
                          badgeText: 'Hazardous',
                          textColor: 'text-status-danger',
                          insight: 'Dangerous health effects. Avoid any outdoor physical activities.',
                        }
                      };
                      const aqiStatus = activeAQI?.status || 'Good';
                      const aqiConfig = aqiStatusMap[aqiStatus as keyof typeof aqiStatusMap] || aqiStatusMap.Good;

                      return (
                        <>
                          {/* Top Row: Title + Status Badge */}
                          <div className="flex flex-col gap-1.5" id="aqi-card-header">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <PhosphorIcon name="wind" className="text-sm text-status-accent animate-pulse" />
                                <span className="font-sans text-xs font-semibold text-text-primary">Air Quality in {activeAQI ? activeAQI.city : selectedCity}</span>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold border transition-colors ${aqiConfig.colorClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${aqiConfig.dotClass}`} />
                                {aqiConfig.badgeText}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-text-primary mt-0.5">
                              <PhosphorIcon name="globe" className="text-xs text-text-muted" />
                              <span className="font-sans font-medium text-xs text-text-secondary">
                                {activeAQI ? `${activeAQI.city}, ${activeAQI.country}` : selectedCity}
                              </span>
                            </div>
                          </div>

                          {/* Middle Row: Primary Prominent AQI Value + Level Indicator */}
                          <div className="flex flex-col items-center justify-center my-4 py-3 border-y border-border-hairline/30" id="aqi-card-focal-point">
                            <div className="flex items-baseline gap-2">
                              <span className={`font-sans font-light text-5xl md:text-6xl tracking-tight leading-none tabular-nums transition-colors ${aqiConfig.textColor}`}>
                                {activeAQI?.aqi || '--'}
                              </span>
                              <span className="text-text-muted text-[11px] font-sans font-medium">Air Quality</span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${aqiConfig.dotClass} animate-pulse`} />
                              <span className={`text-[11px] font-sans font-semibold tracking-wide transition-colors ${aqiConfig.textColor}`}>{aqiConfig.badgeText} Air Quality</span>
                            </div>
                          </div>

                          {/* Bottom Row: Contextual Insight & Last Updated */}
                          <div className="flex flex-col gap-3" id="aqi-card-footer">
                            <p className="text-[11px] text-text-secondary text-center leading-relaxed font-sans max-w-xs mx-auto">
                              {aqiConfig.insight}
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-sans text-text-muted border-t border-border-hairline/45 pt-2.5">
                              <div className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-status-success" />
                                <span>Online</span>
                              </div>
                              <span>
                                Last updated: {formatAqiTime(activeAQI?.lastUpdated)}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Donut gauge box (Styled inside StatGauge to be borderless and flat) */}
                  <StatGauge
                    value={activeAQI?.aqi || 50}
                    max={250}
                    title="Focused Air Index"
                    subtitle="Monitored from regional sensor"
                    label={`${activeAQI?.aqi} AQI`}
                    colorClass={
                      (() => {
                        const a = activeAQI?.aqi || 50;
                        if (a <= 50) return 'text-status-success';
                        if (a <= 100) return 'text-status-warning';
                        if (a <= 150) return 'text-orange-500';
                        if (a <= 200) return 'text-status-danger';
                        if (a <= 300) return 'text-purple-500';
                        return 'text-status-danger';
                      })()
                    }
                  />

                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB 2: CRYPTO LIST ==================== */}
          {activeTab === 'crypto' && (() => {
            const sparkline = activeCoin?.sparkline || [];
            const highestPrice = sparkline.length > 0 ? Math.max(...sparkline) : (activeCoin?.price || 0);
            const lowestPrice = sparkline.length > 0 ? Math.min(...sparkline) : (activeCoin?.price || 0);

            const movementSentence = (activeCoin?.change24h || 0) >= 0
              ? `${activeCoin?.name || 'Bitcoin'} gained momentum today, rising by ${Math.abs(activeCoin?.change24h || 0).toFixed(2)}% over the last 24 hours.`
              : `${activeCoin?.name || 'Bitcoin'} declined slightly over the last 24 hours, falling by ${Math.abs(activeCoin?.change24h || 0).toFixed(2)}%.`;

            const otherCoins = [...(data.crypto || [])]
              .filter(c => c.id !== selectedCoinId)
              .sort((a, b) => b.change24h - a.change24h)
              .slice(0, 2);

            return (
              <div className="w-full mx-auto p-1 md:p-3 animate-slide-up" id="crypto-tab-view">

                {/* ==================== MOBILE LAYOUT (< 768px) ==================== */}
                <div className="block md:hidden max-w-[440px] mx-auto">
                  {/* Persistent Card Container */}
                  <div className="flex flex-col gap-5 bg-surface-1 border border-border-hairline rounded-3xl p-5 shadow-xs">

                    {/* Persistent header */}
                    <div className="flex flex-col gap-3">
                      {/* Coin info & Meta */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-surface-2 shrink-0">
                          <CryptoLogo symbol={activeCoin?.symbol || ''} size={9} />
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-sans font-medium text-base text-text-primary leading-tight">
                            {activeCoin?.name}
                          </h2>
                          <p className="text-[12px] text-text-secondary font-normal mt-0.5 truncate">
                            Global rank #{activeCoin?.rank} · {activeCoin?.tags?.join(' · ')}
                          </p>
                        </div>
                      </div>

                      {/* Price hero */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans font-medium text-[22px] tracking-tight text-text-primary tabular-nums">
                          {formatPrice(activeCoin?.price)}
                        </span>
                        <span className={`font-sans font-normal text-[13px] inline-flex items-center gap-0.5 ${(activeCoin?.change24h || 0) >= 0 ? 'text-status-success' : 'text-status-danger'
                          }`}>
                          {(activeCoin?.change24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(activeCoin?.change24h || 0).toFixed(2)}%
                        </span>
                      </div>

                      {/* Segmented tab control */}
                      <div className="bg-surface-2 p-1 rounded-full flex w-full" id="crypto-segmented-control-mobile">
                        {(['overview', 'chart', 'leaderboard'] as const).map((tab) => {
                          const isActive = cryptoSubTab === tab;
                          return (
                            <button
                              key={tab}
                              onClick={() => setCryptoSubTab(tab)}
                              className={`flex-1 py-1.5 text-center text-[12px] font-medium rounded-full cursor-pointer transition-all ${isActive
                                ? 'bg-surface-1 text-text-primary'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tab content area */}
                    <div className="min-h-[280px]">

                      {/* TAB 1: OVERVIEW */}
                      {cryptoSubTab === 'overview' && (
                        <div className="flex flex-col gap-4 animate-fade-in" id="crypto-tab-overview-mobile">
                          {/* Horizontally-scrollable stat tiles */}
                          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none snap-x snap-mandatory">
                            {/* Card 1: 24h Change */}
                            <div className="flex-shrink-0 w-[110px] bg-surface-2 p-3 rounded-xl snap-start flex flex-col justify-between h-[68px]">
                              <p className="text-[10px] font-sans font-medium text-text-secondary leading-none">24h change</p>
                              <p className={`font-sans font-medium text-xs tabular-nums mt-0.5 ${(activeCoin?.change24h || 0) >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                                {(activeCoin?.change24h || 0) >= 0 ? '+' : ''}{(activeCoin?.change24h || 0).toFixed(2)}%
                              </p>
                            </div>

                            {/* Card 2: High Today */}
                            <div className="flex-shrink-0 w-[110px] bg-surface-2 p-3 rounded-xl snap-start flex flex-col justify-between h-[68px]">
                              <p className="text-[10px] font-sans font-medium text-text-secondary leading-none">High today</p>
                              <p className="font-sans font-medium text-xs text-text-primary tabular-nums mt-0.5 truncate">
                                {formatPrice(highestPrice)}
                              </p>
                            </div>

                            {/* Card 3: Low Today */}
                            <div className="flex-shrink-0 w-[110px] bg-surface-2 p-3 rounded-xl snap-start flex flex-col justify-between h-[68px]">
                              <p className="text-[10px] font-sans font-medium text-text-secondary leading-none">Low today</p>
                              <p className="font-sans font-medium text-xs text-text-primary tabular-nums mt-0.5 truncate">
                                {formatPrice(lowestPrice)}
                              </p>
                            </div>

                            {/* Card 4: Market Cap */}
                            <div className="flex-shrink-0 w-[110px] bg-surface-2 p-3 rounded-xl snap-start flex flex-col justify-between h-[68px]">
                              <p className="text-[10px] font-sans font-medium text-text-secondary leading-none">Market cap</p>
                              <p className="font-sans font-medium text-xs text-text-primary tabular-nums mt-0.5 truncate">
                                {formatLargeNumber(activeCoin?.marketCap || 0)}
                              </p>
                            </div>
                          </div>

                          {/* Movement summary sentence */}
                          <p className="text-[13px] text-text-secondary leading-relaxed font-normal max-w-full">
                            {movementSentence}
                          </p>

                          {/* Top Movers Preview */}
                          <div className="mt-2">
                            <h3 className="text-[11px] font-medium tracking-wide text-text-secondary uppercase mb-2">Top movers</h3>
                            <div className="flex flex-col divide-y divide-border-hairline/40">
                              {otherCoins.map((coin) => (
                                <div
                                  key={coin.id}
                                  onClick={() => setSelectedCoinId(coin.id)}
                                  className="flex items-center justify-between py-2 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-surface-2">
                                      <CryptoLogo symbol={coin.symbol} size={6} />
                                    </div>
                                    <span className="text-xs font-normal text-text-primary">{coin.name}</span>
                                  </div>
                                  <span className={`text-xs font-mono font-medium ${coin.change24h >= 0 ? 'text-status-success' : 'text-status-danger'
                                    }`}>
                                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Navigation link to full leaderboard */}
                          <div className="mt-4 text-center border-t border-border-hairline/40 pt-3">
                            <button
                              onClick={() => setCryptoSubTab('leaderboard')}
                              className="text-status-accent hover:underline text-[12px] font-medium cursor-pointer transition-colors"
                            >
                              View full leaderboard
                            </button>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: CHART */}
                      {cryptoSubTab === 'chart' && (
                        <div className="flex flex-col gap-4 animate-fade-in" id="crypto-tab-chart-mobile">
                          {/* Timeframe selector */}
                          <div className="flex gap-1.5 flex-nowrap overflow-x-auto scrollbar-none">
                            {(['24h', '7d', '30d', '1y'] as const).map(tf => {
                              const label = tf === '24h' ? '1D' : tf === '30d' ? '1M' : tf.toUpperCase();
                              return (
                                <button
                                  key={tf}
                                  onClick={() => setChartTimeframe(tf)}
                                  className={`text-[11px] font-mono px-3.5 py-2 min-h-[36px] flex items-center justify-center rounded-full cursor-pointer transition-colors shrink-0 ${chartTimeframe === tf
                                    ? 'bg-text-primary text-surface-1 font-semibold'
                                    : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Chart Component */}
                          <div className="bg-surface-2 rounded-xl p-3 h-[200px] flex items-center justify-center">
                            <PriceTrendChart
                              data={sparkline}
                              name={activeCoin?.name || 'Ticker'}
                              height="h-[140px]"
                              timeframe={chartTimeframe}
                            />
                          </div>

                          {/* High/Low restated below chart */}
                          <div className="flex justify-between items-center bg-surface-2 px-4 py-2.5 rounded-xl text-xs font-medium text-text-primary mt-1 gap-2">
                            <div className="flex items-center">
                              <span className="text-text-secondary text-[11px] uppercase mr-1.5">High</span>
                              <span className="tabular-nums font-medium block sm:hidden">{highestPrice >= 1000 ? `$${(highestPrice / 1000).toFixed(1)}k` : formatPrice(highestPrice)}</span>
                              <span className="tabular-nums font-medium hidden sm:block">{formatPrice(highestPrice)}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-text-secondary text-[11px] uppercase mr-1.5">Low</span>
                              <span className="tabular-nums font-medium block sm:hidden">{lowestPrice >= 1000 ? `$${(lowestPrice / 1000).toFixed(1)}k` : formatPrice(lowestPrice)}</span>
                              <span className="tabular-nums font-medium hidden sm:block">{formatPrice(lowestPrice)}</span>
                            </div>
                          </div>

                          {/* Export CSV button */}
                          <div className="mt-2 w-full flex sm:justify-end">
                            <button
                              onClick={() => handleExportCSV('crypto')}
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-border-hairline hover:border-status-accent font-sans font-medium text-xs transition-colors cursor-pointer text-text-primary bg-transparent"
                            >
                              <PhosphorIcon name="download" className="text-sm" />
                              Export CSV
                            </button>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: LEADERBOARD */}
                      {cryptoSubTab === 'leaderboard' && (() => {
                        const filteredList = (data.crypto || []).filter(c =>
                          c.name.toLowerCase().includes(cryptoSearch.toLowerCase()) ||
                          c.symbol.toLowerCase().includes(cryptoSearch.toLowerCase())
                        );

                        const sortedCrypto = [...filteredList].sort((a, b) => {
                          let valA: number;
                          let valB: number;
                          if (cryptoSortField === 'price') {
                            valA = a.price;
                            valB = b.price;
                          } else if (cryptoSortField === 'change') {
                            valA = a.change24h;
                            valB = b.change24h;
                          } else {
                            valA = a.rank;
                            valB = b.rank;
                          }
                          return cryptoSortDirection === 'asc' ? valA - valB : valB - valA;
                        });

                        return (
                          <div className="flex flex-col gap-3 animate-fade-in" id="crypto-tab-leaderboard-mobile">
                            {/* Watchlist Header and Search/Sort controls */}
                            <div className="flex flex-col gap-2 border-b border-border-hairline pb-2.5">
                              {/* Row 1: Header and Search Trigger */}
                              <div className="flex items-center justify-between">
                                <h3 className="font-sans font-medium text-[11px] uppercase tracking-wide text-text-secondary">Watchlist</h3>
                                <button
                                  onClick={() => {
                                    setLeaderboardSearchOpen(!leaderboardSearchOpen);
                                    if (leaderboardSearchOpen) setCryptoSearch('');
                                  }}
                                  className={`p-1.5 rounded-full cursor-pointer transition-colors ${leaderboardSearchOpen ? 'text-status-accent bg-surface-2' : 'text-text-secondary hover:text-text-primary bg-surface-2/40'
                                    }`}
                                  title="Search currencies"
                                >
                                  <PhosphorIcon name={leaderboardSearchOpen ? "x" : "search"} size={13} />
                                </button>
                              </div>

                              {/* Row 2: Search Input (Full Width on mobile) */}
                              {leaderboardSearchOpen && (
                                <div className="relative w-full animate-fade-in">
                                  <input
                                    type="text"
                                    placeholder="Search coins..."
                                    value={cryptoSearch}
                                    onChange={(e) => setCryptoSearch(e.target.value)}
                                    className="w-full pl-8 pr-7 py-1.5 rounded-full bg-surface-2 border border-border-hairline font-sans text-xs focus:outline-none focus:border-border-strong text-text-primary"
                                    autoFocus
                                  />
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                                    <PhosphorIcon name="search" size={12} />
                                  </span>
                                  {cryptoSearch && (
                                    <button
                                      onClick={() => setCryptoSearch('')}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                                    >
                                      <PhosphorIcon name="x" size={12} />
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Row 3: Sort Controls */}
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[9px] text-text-muted">Sort:</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      if (cryptoSortField === 'rank') {
                                        setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                      } else {
                                        setCryptoSortField('rank');
                                        setCryptoSortDirection('asc');
                                      }
                                    }}
                                    className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'rank' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                      }`}
                                    title="Sort by Rank"
                                  >
                                    Rank {cryptoSortField === 'rank' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (cryptoSortField === 'price') {
                                        setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                      } else {
                                        setCryptoSortField('price');
                                        setCryptoSortDirection('desc');
                                      }
                                    }}
                                    className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'price' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                      }`}
                                    title="Sort by Price"
                                  >
                                    Price {cryptoSortField === 'price' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (cryptoSortField === 'change') {
                                        setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                      } else {
                                        setCryptoSortField('change');
                                        setCryptoSortDirection('desc');
                                      }
                                    }}
                                    className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'change' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                      }`}
                                    title="Sort by 24h Change"
                                  >
                                    24h change {cryptoSortField === 'change' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Compact rows container */}
                            <div className="flex flex-col max-h-[340px] overflow-y-auto divide-y divide-border-hairline/40 pr-0.5">
                              {sortedCrypto.length === 0 ? (
                                <div className="py-6 text-center text-xs text-text-secondary">
                                  No coins match "{cryptoSearch}"
                                </div>
                              ) : (
                                sortedCrypto.map((coin) => {
                                  const isSelected = coin.id === selectedCoinId;
                                  return (
                                    <div
                                      key={coin.id}
                                      onClick={() => setSelectedCoinId(coin.id)}
                                      className={`py-2 px-1.5 transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'bg-surface-2/40 font-medium rounded-lg' : 'hover:bg-surface-2/20'
                                        }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="font-mono text-[10px] text-text-secondary min-w-[14px]">#{coin.rank}</span>
                                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-surface-2">
                                          <CryptoLogo symbol={coin.symbol} size={6} />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs text-text-primary truncate">{coin.name}</p>
                                          <p className="text-[9px] text-text-secondary font-mono uppercase">{coin.symbol}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-mono text-text-primary tabular-nums">
                                          {formatPrice(coin.price)}
                                        </p>
                                        <span className={`text-[10px] font-mono font-medium ${coin.change24h >= 0 ? 'text-status-success' : 'text-status-danger'
                                          }`}>
                                          {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  </div>
                </div>

                {/* ==================== TABLET & DESKTOP LAYOUT (>= 768px) ==================== */}
                <div className="hidden md:flex flex-col lg:grid lg:grid-cols-12 gap-6 w-full">
                  {/* Left Column (Hero, Stats, Chart) - Takes 8 cols on desktop, full width on tablet */}
                  <div className="flex flex-col gap-6 lg:col-span-8 w-full">

                    {/* Header Card */}
                    <div className="bg-surface-1 border border-border-hairline rounded-3xl p-6 shadow-xs flex flex-col gap-5">
                      {/* Coin Identity Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface-2 shrink-0">
                            <CryptoLogo symbol={activeCoin?.symbol || ''} size={10} />
                          </div>
                          <div>
                            <h2 className="font-sans font-medium text-lg md:text-xl text-text-primary leading-tight">
                              {activeCoin?.name}
                            </h2>
                            <p className="text-xs md:text-[13px] text-text-secondary font-normal mt-0.5">
                              Global rank #{activeCoin?.rank} · {activeCoin?.tags?.join(' · ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Price Hero Row */}
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-sans font-medium text-[26px] md:text-[32px] tracking-tight text-text-primary tabular-nums">
                          {formatPrice(activeCoin?.price)}
                        </span>
                        <span className={`font-sans font-normal text-sm md:text-base inline-flex items-center gap-1 ${(activeCoin?.change24h || 0) >= 0 ? 'text-status-success' : 'text-status-danger'
                          }`}>
                          {(activeCoin?.change24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(activeCoin?.change24h || 0).toFixed(2)}%
                        </span>
                      </div>

                      {/* Non-scrolling Grid of 4 Stats */}
                      <div className="grid grid-cols-4 gap-4 mt-1">
                        {/* 24h Change */}
                        <div className="bg-surface-2 p-4 rounded-xl flex flex-col justify-between h-[82px]">
                          <p className="text-[11px] font-sans font-medium text-text-secondary leading-none">24h change</p>
                          <p className={`font-sans font-medium text-sm tabular-nums mt-1 ${(activeCoin?.change24h || 0) >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                            {(activeCoin?.change24h || 0) >= 0 ? '+' : ''}{(activeCoin?.change24h || 0).toFixed(2)}%
                          </p>
                        </div>

                        {/* High Today */}
                        <div className="bg-surface-2 p-4 rounded-xl flex flex-col justify-between h-[82px]">
                          <p className="text-[11px] font-sans font-medium text-text-secondary leading-none">High today</p>
                          <p className="font-sans font-medium text-sm text-text-primary tabular-nums mt-1 truncate">
                            {formatPrice(highestPrice)}
                          </p>
                        </div>

                        {/* Low Today */}
                        <div className="bg-surface-2 p-4 rounded-xl flex flex-col justify-between h-[82px]">
                          <p className="text-[11px] font-sans font-medium text-text-secondary leading-none">Low today</p>
                          <p className="font-sans font-medium text-sm text-text-primary tabular-nums mt-1 truncate">
                            {formatPrice(lowestPrice)}
                          </p>
                        </div>

                        {/* Market Cap */}
                        <div className="bg-surface-2 p-4 rounded-xl flex flex-col justify-between h-[82px]">
                          <p className="text-[11px] font-sans font-medium text-text-secondary leading-none">Market cap</p>
                          <p className="font-sans font-medium text-sm text-text-primary tabular-nums mt-1 truncate">
                            {formatLargeNumber(activeCoin?.marketCap || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Movement sentence */}
                      <p className="text-[13px] text-text-secondary leading-relaxed font-normal max-w-3xl mt-1">
                        {movementSentence}
                      </p>
                    </div>

                    {/* Chart Card */}
                    <div className="bg-surface-1 border border-border-hairline rounded-3xl p-6 shadow-xs flex flex-col gap-4">
                      {/* Chart Header */}
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-sans font-medium text-text-secondary uppercase tracking-wider">
                          Price history & trend
                        </h3>
                        {/* Timeframe Selector */}
                        <div className="flex gap-1.5 flex-nowrap overflow-x-auto scrollbar-none">
                          {(['24h', '7d', '30d', '1y'] as const).map(tf => {
                            const label = tf === '24h' ? '1D' : tf === '30d' ? '1M' : tf.toUpperCase();
                            return (
                              <button
                                key={tf}
                                onClick={() => setChartTimeframe(tf)}
                                className={`text-[11px] font-mono px-3.5 py-2 min-h-[36px] flex items-center justify-center rounded-full cursor-pointer transition-colors shrink-0 ${chartTimeframe === tf
                                  ? 'bg-text-primary text-surface-1 font-semibold'
                                  : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                                  }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Chart Area */}
                      <div className="bg-surface-2 rounded-2xl p-4 flex items-center justify-center">
                        <PriceTrendChart
                          data={sparkline}
                          name={activeCoin?.name || 'Ticker'}
                          height="h-[200px] lg:h-[280px]"
                          timeframe={chartTimeframe}
                        />
                      </div>

                      {/* Info and Export row */}
                      <div className="flex justify-between items-center mt-1 gap-2">
                        <div className="flex gap-6 text-xs font-medium text-text-primary">
                          <div className="flex items-center">
                            <span className="text-text-secondary text-[11px] uppercase mr-1.5">High</span>
                            <span className="tabular-nums font-medium block sm:hidden">{highestPrice >= 1000 ? `$${(highestPrice / 1000).toFixed(1)}k` : formatPrice(highestPrice)}</span>
                            <span className="tabular-nums font-medium hidden sm:block">{formatPrice(highestPrice)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-text-secondary text-[11px] uppercase mr-1.5">Low</span>
                            <span className="tabular-nums font-medium block sm:hidden">{lowestPrice >= 1000 ? `$${(lowestPrice / 1000).toFixed(1)}k` : formatPrice(lowestPrice)}</span>
                            <span className="tabular-nums font-medium hidden sm:block">{formatPrice(lowestPrice)}</span>
                          </div>
                        </div>

                        {/* Export Button */}
                        <button
                          onClick={() => handleExportCSV('crypto')}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border-hairline hover:border-status-accent font-sans font-medium text-xs transition-colors cursor-pointer text-text-primary bg-transparent"
                        >
                          <PhosphorIcon name="download" className="text-sm" />
                          Export CSV
                        </button>
                      </div>
                    </div>

                    {/* TABLET ONLY: Inline Leaderboard (hidden on desktop) */}
                    <div className="block lg:hidden bg-surface-1 border border-border-hairline rounded-3xl p-6 shadow-xs flex flex-col gap-4">
                      <div className="flex flex-col gap-2 border-b border-border-hairline pb-2.5">
                        {/* Row 1: Header and Search Trigger */}
                        <div className="flex justify-between items-center">
                          <h3 className="font-sans font-medium text-xs text-text-secondary uppercase tracking-wider">Watchlist</h3>
                          <button
                            onClick={() => {
                              setLeaderboardSearchOpen(!leaderboardSearchOpen);
                              if (leaderboardSearchOpen) setCryptoSearch('');
                            }}
                            className={`p-1.5 rounded-full cursor-pointer transition-colors ${leaderboardSearchOpen ? 'text-status-accent bg-surface-2' : 'text-text-secondary hover:text-text-primary bg-surface-2/40'
                              }`}
                            title="Search currencies"
                          >
                            <PhosphorIcon name={leaderboardSearchOpen ? "x" : "search"} size={13} />
                          </button>
                        </div>

                        {/* Row 2: Search Input (Full Width on tablet when open) */}
                        {leaderboardSearchOpen && (
                          <div className="relative w-full animate-fade-in">
                            <input
                              type="text"
                              placeholder="Search coins..."
                              value={cryptoSearch}
                              onChange={(e) => setCryptoSearch(e.target.value)}
                              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-surface-2 border border-border-hairline font-sans text-xs focus:outline-none focus:border-border-strong text-text-primary"
                              autoFocus
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                              <PhosphorIcon name="search" size={12} />
                            </span>
                            {cryptoSearch && (
                              <button
                                onClick={() => setCryptoSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                              >
                                <PhosphorIcon name="x" size={12} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Row 3: Sort Controls */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-text-muted">Sort:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (cryptoSortField === 'rank') {
                                  setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setCryptoSortField('rank');
                                  setCryptoSortDirection('asc');
                                }
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'rank' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                              Rank {cryptoSortField === 'rank' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                              onClick={() => {
                                if (cryptoSortField === 'price') {
                                  setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setCryptoSortField('price');
                                  setCryptoSortDirection('desc');
                                }
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'price' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                              Price {cryptoSortField === 'price' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                              onClick={() => {
                                if (cryptoSortField === 'change') {
                                  setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setCryptoSortField('change');
                                  setCryptoSortDirection('desc');
                                }
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'change' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                              24h change {cryptoSortField === 'change' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Grid list of coins (top 5 by default, expand to all if tabletLeaderboardExpanded) */}
                      <div className="flex flex-col divide-y divide-border-hairline/40">
                        {(() => {
                          const filteredList = (data.crypto || []).filter(c =>
                            c.name.toLowerCase().includes(cryptoSearch.toLowerCase()) ||
                            c.symbol.toLowerCase().includes(cryptoSearch.toLowerCase())
                          );

                          const sortedCrypto = [...filteredList].sort((a, b) => {
                            let valA: number;
                            let valB: number;
                            if (cryptoSortField === 'price') {
                              valA = a.price;
                              valB = b.price;
                            } else if (cryptoSortField === 'change') {
                              valA = a.change24h;
                              valB = b.change24h;
                            } else {
                              valA = a.rank;
                              valB = b.rank;
                            }
                            return cryptoSortDirection === 'asc' ? valA - valB : valB - valA;
                          });

                          const displayedCrypto = tabletLeaderboardExpanded ? sortedCrypto : sortedCrypto.slice(0, 5);

                          if (displayedCrypto.length === 0) {
                            return (
                              <div className="py-8 text-center text-xs text-text-secondary">
                                No coins match "{cryptoSearch}"
                              </div>
                            );
                          }

                          return displayedCrypto.map((coin) => {
                            const isSelected = coin.id === selectedCoinId;
                            return (
                              <div
                                key={coin.id}
                                onClick={() => setSelectedCoinId(coin.id)}
                                className={`py-2.5 px-1.5 transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'bg-surface-2/40 font-medium rounded-lg' : 'hover:bg-surface-2/20'
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs text-text-secondary min-w-[18px]">#{coin.rank}</span>
                                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-surface-2">
                                    <CryptoLogo symbol={coin.symbol} size={7} />
                                  </div>
                                  <div>
                                    <p className="text-sm text-text-primary">{coin.name}</p>
                                    <p className="text-[10px] text-text-secondary font-mono uppercase">{coin.symbol}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-mono text-text-primary tabular-nums">
                                    {formatPrice(coin.price)}
                                  </p>
                                  <span className={`text-xs font-mono font-medium ${coin.change24h >= 0 ? 'text-status-success' : 'text-status-danger'
                                    }`}>
                                    {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {/* Expand / Collapse toggle */}
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setTabletLeaderboardExpanded(prev => !prev)}
                          className="text-status-accent hover:underline text-[12px] font-medium cursor-pointer transition-colors"
                        >
                          {tabletLeaderboardExpanded ? 'Show top 5 only' : 'View full leaderboard'}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column (Leaderboard sidebar) - DESKTOP ONLY (hidden on mobile/tablet) */}
                  <div className="hidden lg:block lg:col-span-4 h-full">
                    <div className="bg-surface-1 border border-border-hairline rounded-3xl p-6 shadow-xs flex flex-col gap-4 sticky top-4 h-[calc(100vh-140px)] min-h-[560px]">

                      {/* Watchlist Header and Sort Controls */}
                      <div className="flex flex-col gap-3 pb-3 border-b border-border-hairline">
                        <div className="flex items-center justify-between gap-2">
                          {leaderboardSearchOpen ? (
                            <div className="relative flex-1 animate-fade-in">
                              <input
                                type="text"
                                placeholder="Search coins..."
                                value={cryptoSearch}
                                onChange={(e) => setCryptoSearch(e.target.value)}
                                className="w-full pl-8 pr-7 py-1 rounded-full bg-surface-2 border border-border-hairline font-sans text-xs focus:outline-none focus:border-border-strong text-text-primary"
                                autoFocus
                              />
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                                <PhosphorIcon name="search" size={12} />
                              </span>
                              {cryptoSearch && (
                                <button
                                  onClick={() => setCryptoSearch('')}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                  <PhosphorIcon name="x" size={12} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <h3 className="font-sans font-medium text-xs text-text-secondary uppercase tracking-wider">
                              Watchlist
                            </h3>
                          )}
                          <button
                            onClick={() => {
                              setLeaderboardSearchOpen(!leaderboardSearchOpen);
                              if (leaderboardSearchOpen) setCryptoSearch('');
                            }}
                            className={`p-1.5 rounded-full cursor-pointer transition-colors ${leaderboardSearchOpen ? 'text-status-accent bg-surface-2' : 'text-text-secondary hover:text-text-primary bg-surface-2/40'
                              }`}
                            title="Search currencies"
                          >
                            <PhosphorIcon name={leaderboardSearchOpen ? "x" : "search"} size={13} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-[10px] text-text-muted">Sort currencies:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (cryptoSortField === 'rank') {
                                  setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setCryptoSortField('rank');
                                  setCryptoSortDirection('asc');
                                }
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'rank' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                              Rank {cryptoSortField === 'rank' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                              onClick={() => {
                                if (cryptoSortField === 'price') {
                                  setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setCryptoSortField('price');
                                  setCryptoSortDirection('desc');
                                }
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'price' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                              Price {cryptoSortField === 'price' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                              onClick={() => {
                                if (cryptoSortField === 'change') {
                                  setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setCryptoSortField('change');
                                  setCryptoSortDirection('desc');
                                }
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${cryptoSortField === 'change' ? 'bg-surface-2 text-text-primary font-bold border border-border-hairline/40' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                              24h {cryptoSortField === 'change' && (cryptoSortDirection === 'asc' ? '↑' : '↓')}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable list of currencies */}
                      <div className="flex-1 overflow-y-auto divide-y divide-border-hairline/40 pr-1">
                        {(() => {
                          const filteredList = (data.crypto || []).filter(c =>
                            c.name.toLowerCase().includes(cryptoSearch.toLowerCase()) ||
                            c.symbol.toLowerCase().includes(cryptoSearch.toLowerCase())
                          );

                          const sortedCrypto = [...filteredList].sort((a, b) => {
                            let valA: number;
                            let valB: number;
                            if (cryptoSortField === 'price') {
                              valA = a.price;
                              valB = b.price;
                            } else if (cryptoSortField === 'change') {
                              valA = a.change24h;
                              valB = b.change24h;
                            } else {
                              valA = a.rank;
                              valB = b.rank;
                            }
                            return cryptoSortDirection === 'asc' ? valA - valB : valB - valA;
                          });

                          if (sortedCrypto.length === 0) {
                            return (
                              <div className="py-8 text-center text-xs text-text-secondary">
                                No coins match "{cryptoSearch}"
                              </div>
                            );
                          }

                          return sortedCrypto.map((coin) => {
                            const isSelected = coin.id === selectedCoinId;
                            return (
                              <div
                                key={coin.id}
                                onClick={() => setSelectedCoinId(coin.id)}
                                className={`py-3 px-2 transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'bg-surface-2/40 font-medium rounded-lg' : 'hover:bg-surface-2/20'
                                  }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono text-xs text-text-secondary min-w-[16px]">#{coin.rank}</span>
                                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-surface-2">
                                    <CryptoLogo symbol={coin.symbol} size={7} />
                                  </div>
                                  <div>
                                    <p className="text-xs text-text-primary truncate">{coin.name}</p>
                                    <p className="text-[10px] text-text-secondary font-mono uppercase">{coin.symbol}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-mono text-text-primary tabular-nums">
                                    {formatPrice(coin.price)}
                                  </p>
                                  <span className={`text-[10px] font-mono font-medium ${coin.change24h >= 0 ? 'text-status-success' : 'text-status-danger'
                                    }`}>
                                    {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            );
          })()}

          {/* ==================== TAB 3: WEATHER DETAILS ==================== */}
          {activeTab === 'weather' && (
            <>
              {/* MOBILE ONLY VIEW (viewport <= 480px) */}
              <div className="block min-[481px]:hidden space-y-4 animate-slide-up" id="weather-tab-mobile">
                {/* Detail Card */}
                <div className="border border-border-hairline border-t-2 border-t-status-info rounded-3xl bg-surface-1 p-5 shadow-xs flex flex-col justify-between" id="weather-mobile-detail-card">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-sans text-[10px] font-semibold text-status-info uppercase tracking-wider">Weather Forecast</span>
                        <h2 className="font-sans font-medium text-xl tracking-tight text-text-primary mt-1">
                          {activeWeather?.city}, <span className="font-normal text-text-secondary">{activeWeather?.country}</span>
                        </h2>
                      </div>

                      {/* Compact Location Switcher Button/Chip */}
                      <button
                        onClick={() => setMobileLocationsOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border-hairline hover:border-border-strong rounded-full text-xs font-medium text-text-primary cursor-pointer transition-colors shrink-0"
                        id="weather-locations-trigger-mobile"
                      >
                        <Compass size={12} />
                        <span className="text-[10px] font-medium">{activeWeather?.city} • 7 regions ▾</span>
                      </button>
                    </div>
                    <span className="font-sans text-[9px] text-text-muted block mt-1.5">
                      Lat: {activeWeather?.lat?.toFixed(2)} • Lon: {activeWeather?.lon?.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <h3 className="font-sans font-medium text-3xl tracking-tight text-text-primary leading-none tabular-nums">
                        {formatTemp(activeWeather?.temp)}
                      </h3>
                      <p className="text-[10px] text-text-secondary mt-1 font-medium">
                        Feels like {formatTemp(activeWeather?.feelsLike)}
                      </p>
                      <p className="font-sans font-semibold text-[11px] text-status-info mt-1.5">
                        {activeWeather?.condition} Outlook
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[11px] text-text-primary tabular-nums font-semibold">
                        {activeWeather?.humidity}% Humidity
                      </p>
                      <p className="text-[9px] text-text-secondary mt-0.5">
                        Wind: {activeWeather?.windSpeed} km/h
                      </p>
                    </div>
                  </div>

                  {/* Export CSV (Bottom of the mobile detail card) */}
                  <button
                    onClick={() => handleExportCSV('weather')}
                    className="mt-5 flex items-center justify-center gap-1.5 px-4 py-2 border border-border-hairline hover:border-status-accent rounded-full text-xs font-sans font-semibold cursor-pointer w-full text-text-primary bg-surface-2/60 hover:bg-surface-2 transition-all duration-150"
                  >
                    <Download className="text-xs" size={12} />
                    Export Region CSV
                  </button>
                </div>

                {/* Inline Climate Stats Tiles (Flat) */}
                <div className="grid grid-cols-2 gap-3" id="weather-mobile-climate-stats">
                  <div className="border border-border-hairline rounded-2xl bg-surface-1 p-3.5 flex flex-col justify-between">
                    <span className="text-[9px] text-text-secondary font-medium uppercase tracking-wider">Rainy Days / Mth</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs font-semibold text-text-primary">{activeWeather?.rainfallDays} days</span>
                      <span className="text-[9px] text-text-muted font-mono">{((activeWeather?.rainfallDays || 0) / 30 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-surface-2 h-1 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-status-info h-full rounded-full transition-all" style={{ width: `${((activeWeather?.rainfallDays || 0) / 30) * 100}%` }} />
                    </div>
                  </div>

                  <div className="border border-border-hairline rounded-2xl bg-surface-1 p-3.5 flex flex-col justify-between">
                    <span className="text-[9px] text-text-secondary font-medium uppercase tracking-wider">Volatile Days</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs font-semibold text-text-primary">{activeWeather?.volatilityDays} days</span>
                      <span className="text-[9px] text-text-muted font-mono">{((activeWeather?.volatilityDays || 0) / 30 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-surface-2 h-1 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-status-indigo h-full rounded-full transition-all" style={{ width: `${((activeWeather?.volatilityDays || 0) / 30) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Horizontally-Scrollable 7-Day Forecast */}
                <div className="border border-border-hairline rounded-3xl bg-surface-1 p-4 shadow-xs" id="weather-mobile-forecast-container">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans font-medium text-xs text-text-primary tracking-tight">7-Day Forecast</h3>
                      <p className="text-[9px] text-text-secondary mt-0.5">Swipe horizontally to view forecast</p>
                    </div>
                    <span className="font-mono text-[8px] text-status-warning bg-status-warning-bg border border-status-warning/15 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-semibold shrink-0">
                      <Sun weight="light" className="text-[10px]" size={10} />
                      Active Outlook
                    </span>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth pr-1">
                    {activeWeather?.forecast?.map((day, index) => {
                      const isToday = index === 0;
                      return (
                        <div
                          key={day.date}
                          className={`flex-shrink-0 w-[96px] flex flex-col justify-between p-3 border rounded-2xl snap-start ${isToday
                            ? 'bg-status-warning-bg/40 border-status-warning/45 font-medium'
                            : 'bg-surface-2/40 border-border-hairline'
                            }`}
                        >
                          <div className="flex items-center justify-between shrink-0">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted font-semibold">
                              {day.date.substring(0, 3)}
                            </span>
                            {isToday && (
                              <span className="font-sans text-[7px] bg-text-primary text-surface-1 px-1 py-0.5 rounded font-bold">
                                NOW
                              </span>
                            )}
                          </div>

                          <div className="my-2 flex flex-col items-center shrink-0">
                            {getWeatherIcon(day.weatherCode)}
                            <div className="flex items-baseline gap-1 mt-1.5">
                              <span className="font-sans font-semibold text-xs text-text-primary tabular-nums">
                                {day.tempMax}°
                              </span>
                              <span className="font-sans text-[9px] text-text-secondary tabular-nums">
                                {day.tempMin}°
                              </span>
                            </div>
                            <p className="text-[8px] text-text-secondary mt-0.5 text-center line-clamp-1 font-medium">{day.condition}</p>
                          </div>

                          <div className="mt-auto pt-1 shrink-0">
                            {day.alert ? (
                              <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-status-danger-bg text-status-danger border border-status-danger/15 text-[7px] font-semibold leading-none">
                                <WarningCircle className="text-[8px] flex-shrink-0" size={8} />
                                <span className="truncate">{day.alert}</span>
                              </div>
                            ) : (
                              <div className="h-3 flex items-center justify-center">
                                <span className="w-1 h-1 rounded-full bg-border-strong/30" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* DESKTOP & TABLET VIEW (viewport > 480px) */}
              <div className="hidden min-[481px]:grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" id="weather-tab-view">

                {/* Left Column (City selector list) — Span 3 — No borders, list style */}
                <div className="lg:col-span-3 p-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-3 min-h-[38px]">
                    {weatherSearchDesktopOpen ? (
                      <div className="flex items-center gap-2 w-full animate-fade-in">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Search locations..."
                            value={weatherSearch}
                            onChange={(e) => setWeatherSearch(e.target.value)}
                            className="w-full pl-7 pr-6 py-1 rounded-lg bg-surface-2 border border-border-hairline font-sans text-[11px] focus:outline-none focus:border-border-strong text-text-primary"
                            autoFocus
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                            <MagnifyingGlass size={11} />
                          </span>
                          {weatherSearch && (
                            <button
                              onClick={() => setWeatherSearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setWeatherSearchDesktopOpen(false);
                            setWeatherSearch('');
                          }}
                          className="text-[10px] text-text-secondary hover:text-text-primary font-sans font-medium px-1 cursor-pointer shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-sans font-semibold text-xs text-text-secondary">Locations</h3>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setWeatherSearchDesktopOpen(true)}
                            className="p-1 rounded-md hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="Search locations"
                            id="weather-search-btn-desktop"
                          >
                            <MagnifyingGlass size={13} weight="regular" />
                          </button>
                          <span className="font-sans text-[10px] text-text-secondary bg-surface-2 px-2 py-0.5 rounded border border-border-hairline/45 font-semibold">
                            7 Regions
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 max-h-[500px] overflow-y-auto divide-y divide-border-hairline/40">
                    {(() => {
                      const filteredList = (data.weather || []).filter(w =>
                        w.city.toLowerCase().includes(weatherSearch.toLowerCase()) ||
                        w.country.toLowerCase().includes(weatherSearch.toLowerCase())
                      );

                      if (filteredList.length === 0) {
                        return (
                          <div className="py-10 text-center text-xs text-text-secondary font-medium">
                            No locations match "{weatherSearch}"
                          </div>
                        );
                      }

                      return filteredList.map((w) => {
                        const isSelected = w.city.toLowerCase() === selectedCity.toLowerCase();
                        return (
                          <div
                            key={w.city}
                            onClick={() => { setSelectedCity(w.city); setSelectedCountryCode(MONITORED_CITIES.find(c => c.city === w.city)?.code || 'US'); }}
                            className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between border my-0.5 ${isSelected
                              ? 'bg-surface-1 border-border-strong shadow-xs font-semibold'
                              : 'bg-transparent border-transparent hover:bg-surface-2/55'
                              }`}
                          >
                            <div>
                              <p className="font-sans font-medium text-xs text-text-primary">{w.city}</p>
                              <p className="text-[10px] text-text-secondary font-sans font-medium">{w.country}</p>
                            </div>
                            <span className="font-mono text-xs font-semibold text-text-primary tabular-nums">{formatTemp(w.temp)}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Center Detail forecast panel — Span 9 */}
                <div className="lg:col-span-9 flex flex-col gap-6">

                  {/* Temperature Big Banner and Statistics info */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Big Banner details — Span 8 (Keeping border + 2px top category accent border) */}
                    <div className="md:col-span-8 border border-border-hairline border-t-2 border-t-status-info rounded-3xl bg-surface-1 p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-sans text-xs font-semibold text-status-info">Weather Forecast</span>
                          <h2 className="font-sans font-light text-4xl tracking-tight text-text-primary mt-2">
                            {activeWeather?.city}, <span className="font-medium">{activeWeather?.country}</span>
                          </h2>
                        </div>
                        <span className="font-sans text-[10px] text-text-muted">
                          Lat: {activeWeather?.lat?.toFixed(2)} • Lon: {activeWeather?.lon?.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-end justify-between mt-8">
                        <div>
                          <h3 className="font-sans font-light text-5xl tracking-tight text-text-primary leading-none tabular-nums">
                            {formatTemp(activeWeather?.temp)} <span className="text-xl text-text-secondary font-normal ml-1">/ feels {formatTemp(activeWeather?.feelsLike)}</span>
                          </h3>
                          <p className="font-sans font-semibold text-xs text-status-info mt-2">
                            {activeWeather?.condition} Outlook
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-text-primary tabular-nums font-semibold">
                            {activeWeather?.humidity}% Humidity
                          </p>
                          <p className="text-[10px] text-text-secondary mt-0.5">
                            Wind: {activeWeather?.windSpeed} km/h
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Statistics Sidebar — Span 4 (Keeping border + 2px top category accent border) */}
                    <div className="md:col-span-4 border border-border-hairline border-t-2 border-t-status-indigo rounded-3xl bg-surface-1 p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <h4 className="font-sans font-semibold text-xs text-text-secondary mb-4">Climate Stats</h4>

                        <div className="space-y-4">
                          {/* Stat 1 */}
                          <div>
                            <div className="flex justify-between text-[11px] font-sans text-text-secondary mb-1">
                              <span>Rainy Days / Month</span>
                              <span className="font-semibold text-text-primary">{activeWeather?.rainfallDays} days</span>
                            </div>
                            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-status-info h-full rounded-full transition-all duration-500" style={{ width: `${(activeWeather?.rainfallDays / 30) * 100}%` }} />
                            </div>
                          </div>

                          {/* Stat 2 */}
                          <div>
                            <div className="flex justify-between text-[11px] font-sans text-text-secondary mb-1">
                              <span>Volatile Days</span>
                              <span className="font-semibold text-text-primary">{activeWeather?.volatilityDays} days</span>
                            </div>
                            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-status-indigo h-full rounded-full transition-all duration-500" style={{ width: `${(activeWeather?.volatilityDays / 30) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleExportCSV('weather')}
                        className="mt-6 flex items-center justify-center gap-1.5 px-4 py-2 border border-border-hairline hover:border-status-accent rounded-full text-xs font-sans font-semibold cursor-pointer w-full text-text-primary bg-surface-2"
                      >
                        <PhosphorIcon name="download" className="text-sm" />
                        Export Region CSV
                      </button>
                    </div>

                  </div>

                  {/* Forecast 7 day Calendar Layout */}
                  <CalendarGrid forecast={activeWeather?.forecast || []} />

                </div>

              </div>

              {/* OVERLAY BOTTOM SHEET DRAWER (Mobile locations selector) */}
              <AnimatePresence>
                {mobileLocationsOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMobileLocationsOpen(false)}
                      className="fixed inset-0 bg-black/45 z-50 pointer-events-auto"
                      id="weather-mobile-backdrop"
                    />

                    {/* Bottom Sheet Panel */}
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 26, stiffness: 260 }}
                      drag="y"
                      dragConstraints={{ top: 0 }}
                      dragElastic={{ top: 0, bottom: 0.85 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.y > 110) {
                          setMobileLocationsOpen(false);
                        }
                      }}
                      className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-surface-2 border-t border-border-hairline rounded-t-[24px] z-50 flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
                      id="weather-mobile-bottom-sheet"
                    >
                      {/* Swipe Handle Indicator */}
                      <div className="w-10 h-1 bg-border-strong/25 rounded-full mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing" />

                      {/* Sheet Inner Content */}
                      <div className="flex flex-col flex-1 px-5 pb-8 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-border-hairline shrink-0">
                          <div>
                            <h3 className="font-sans font-semibold text-sm text-text-primary">Select Region</h3>
                            <p className="text-[10px] text-text-secondary mt-0.5">Choose from 7 monitored regions</p>
                          </div>
                          <button
                            onClick={() => setMobileLocationsOpen(false)}
                            className="p-1.5 bg-surface-1 border border-border-hairline rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Search / Filter Input */}
                        <div className="relative my-3.5 shrink-0">
                          <input
                            type="text"
                            placeholder="Search regions..."
                            value={weatherSearch}
                            onChange={(e) => setWeatherSearch(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 rounded-xl bg-surface-1 border border-border-hairline font-sans text-xs focus:outline-none focus:border-border-strong text-text-primary"
                            autoFocus
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                            <MagnifyingGlass size={13} />
                          </span>
                          {weatherSearch && (
                            <button
                              onClick={() => setWeatherSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* List (Scrollable) */}
                        <div className="flex-1 overflow-y-auto divide-y divide-border-hairline/30 pr-1">
                          {(() => {
                            const filteredList = (data.weather || []).filter(w =>
                              w.city.toLowerCase().includes(weatherSearch.toLowerCase()) ||
                              w.country.toLowerCase().includes(weatherSearch.toLowerCase())
                            );

                            if (filteredList.length === 0) {
                              return (
                                <div className="py-10 text-center text-xs text-text-secondary font-medium">
                                  No locations match "{weatherSearch}"
                                </div>
                              );
                            }

                            return filteredList.map((w) => {
                              const isSelected = w.city.toLowerCase() === selectedCity.toLowerCase();
                              return (
                                <div
                                  key={w.city}
                                  onClick={() => {
                                    setSelectedCity(w.city);
                                    setSelectedCountryCode(MONITORED_CITIES.find(c => c.city === w.city)?.code || 'US');
                                    setMobileLocationsOpen(false);
                                  }}
                                  className={`py-3 px-2 flex items-center justify-between transition-all cursor-pointer rounded-xl my-0.5 ${isSelected
                                    ? 'bg-surface-1 border border-border-strong font-semibold shadow-xs'
                                    : 'hover:bg-surface-1/40 border border-transparent'
                                    }`}
                                >
                                  <div>
                                    <p className="font-sans font-medium text-xs text-text-primary">{w.city}</p>
                                    <p className="text-[10px] text-text-secondary font-sans font-medium">{w.country}</p>
                                  </div>
                                  <div className="flex items-center gap-2.5">
                                    <span className="font-mono text-xs font-semibold text-text-primary tabular-nums">{formatTemp(w.temp)}</span>
                                    <span className="text-[10px] text-text-secondary font-medium bg-surface-1 px-2 py-0.5 rounded border border-border-hairline/45">{w.condition}</span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ==================== TAB 4: CURRENCY DETAIL ==================== */}
          {activeTab === 'currency' && (
            <>
              {/* MOBILE ONLY VIEW (viewport <= 480px) */}
              <div className="block min-[481px]:hidden space-y-4 animate-slide-up" id="currency-tab-mobile">
                {/* Detail Card */}
                <div className="border border-border-hairline border-t-2 border-t-status-info rounded-3xl bg-surface-1 p-5 shadow-xs flex flex-col justify-between" id="currency-mobile-detail-card">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1 shrink-0">
                            <CountryFlag code={getCurrencyFlagCode(fromCurrency)} className="w-5 h-3.5 rounded-xs object-cover border border-surface-1 shadow-2xs" />
                            <CountryFlag code={getCurrencyFlagCode(toCurrency)} className="w-5 h-3.5 rounded-xs object-cover border border-surface-1 shadow-2xs" />
                          </div>
                          <span className="font-sans text-[10px] font-semibold text-status-info uppercase tracking-wider">Exchange Rates</span>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={conversionAmount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*\.?\d*$/.test(val)) {
                                  setConversionAmount(val);
                                }
                              }}
                              className="w-16 px-1.5 py-0.5 text-center rounded bg-surface-2 border border-border-hairline text-text-primary font-medium focus:outline-none focus:border-border-strong text-xs"
                            />

                            <select
                              value={fromCurrency}
                              onChange={(e) => {
                                setFromCurrency(e.target.value);
                                const matched = data?.currency?.find(c => c.base === e.target.value && c.target === toCurrency);
                                if (matched) {
                                  setSelectedCurrencyId(matched.id);
                                }
                              }}
                              className="bg-surface-2 border border-border-hairline rounded px-1.5 py-0.5 text-[11px] text-text-primary font-semibold focus:outline-none cursor-pointer"
                            >
                              {supportedCurrencies.map(cur => (
                                <option key={cur} value={cur} className="bg-surface-1 text-text-primary">
                                  {cur}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                const temp = fromCurrency;
                                setFromCurrency(toCurrency);
                                setToCurrency(temp);
                                const matched = data?.currency?.find(c => c.base === toCurrency && c.target === temp);
                                if (matched) {
                                  setSelectedCurrencyId(matched.id);
                                }
                              }}
                              className="p-1 hover:bg-surface-2 rounded-full border border-border-hairline/30 text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center"
                              title="Swap currencies"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-right">
                                <path d="M8 3 4 7l4 4" />
                                <path d="M4 7h16" />
                                <path d="m16 21 4-4-4-4" />
                                <path d="M20 17H4" />
                              </svg>
                            </button>

                            <select
                              value={toCurrency}
                              onChange={(e) => {
                                setToCurrency(e.target.value);
                                const matched = data?.currency?.find(c => c.base === fromCurrency && c.target === e.target.value);
                                if (matched) {
                                  setSelectedCurrencyId(matched.id);
                                }
                              }}
                              className="bg-surface-2 border border-border-hairline rounded px-1.5 py-0.5 text-[11px] text-text-primary font-semibold focus:outline-none cursor-pointer"
                            >
                              {supportedCurrencies.map(cur => (
                                <option key={cur} value={cur} className="bg-surface-1 text-text-primary">
                                  {cur}
                                </option>
                              ))}
                            </select>

                            <span className="text-text-muted text-xs font-light">=</span>

                            <span className="font-semibold text-status-info text-xs tabular-nums">
                              {(() => {
                                const amt = parseFloat(conversionAmount);
                                if (isNaN(amt) || amt < 0) return '0.00';
                                const crossRate = getCrossRate(fromCurrency, toCurrency);
                                return (amt * crossRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                              })()}
                            </span>
                            <span className="font-semibold text-status-info text-[11px]">
                              {toCurrency}
                            </span>
                          </div>
                          <div className="text-[10px] text-text-muted font-mono">
                            1 {fromCurrency} = {getCrossRate(fromCurrency, toCurrency).toFixed(4)} {toCurrency}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${activeCurrency?.change24h >= 0 ? 'bg-status-success-bg text-status-success' : 'bg-status-danger-bg text-status-danger'
                          }`}>
                          {activeCurrency?.change24h >= 0 ? '+' : ''}{activeCurrency?.change24h?.toFixed(2)}%
                        </span>

                        <button
                          onClick={() => setMobileCurrenciesOpen(true)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-2 border border-border-hairline hover:border-border-strong rounded-full text-[10px] font-medium text-text-primary cursor-pointer transition-colors"
                          id="currency-switcher-trigger-mobile"
                        >
                          <Compass size={11} />
                          <span className="text-[9px] font-medium">Exchange rates ▾</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Historical trend chart */}
                  <div className="p-3 bg-surface-2 rounded-2xl mt-4">
                    <h4 className="font-sans font-semibold text-[11px] text-text-secondary mb-3">
                      Historical Trend (7 Days)
                    </h4>
                    <div className="h-[160px] w-full" id="currency-mobile-chart-container">
                      <CurrencyHistoryChart data={activeCurrency?.history || []} targetCurrency={activeCurrency?.target || 'EUR'} />
                    </div>
                  </div>

                  {/* Currency profile inside the scrollable detail flow */}
                  <div className="mt-4 pt-4 border-t border-border-hairline/40 space-y-3.5 text-xs font-sans" id="currency-mobile-profile">
                    <h4 className="font-sans font-semibold text-[11px] text-text-secondary uppercase tracking-wider">Currency Profile</h4>

                    {/* Base currency row */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-text-muted font-sans font-medium text-[11px]">Base Currency</span>
                      <div className="flex items-center gap-2">
                        <CountryFlag code={getCurrencyFlagCode(activeCurrency?.base || 'USD')} className="w-5 h-3.5 rounded-xs" />
                        <p className="text-text-primary font-semibold text-xs">{activeCurrency?.base} — {getCurrencyFullName(activeCurrency?.base || 'USD')}</p>
                      </div>
                    </div>

                    {/* Target currency row */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-text-muted font-sans font-medium text-[11px]">Target Currency</span>
                      <div className="flex items-center gap-2">
                        <CountryFlag code={getCurrencyFlagCode(activeCurrency?.target || 'EUR')} className="w-5 h-3.5 rounded-xs" />
                        <p className="text-text-primary font-semibold text-xs">{activeCurrency?.target} — {getCurrencyFullName(activeCurrency?.target || 'EUR')}</p>
                      </div>
                    </div>

                    {/* Index volatility progress row */}
                    <div className="border-t border-border-hairline/40 pt-3">
                      <div className="flex justify-between text-[11px] font-sans font-medium text-text-secondary mb-1.5">
                        <span>Index Volatility</span>
                        <span className="font-semibold text-text-primary">{activeCurrency?.volatility}%</span>
                      </div>
                      <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-status-indigo h-full rounded-full transition-all" style={{ width: `${activeCurrency?.volatility}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Export exchange pairs at the bottom */}
                  <button
                    onClick={() => handleExportCSV('currency')}
                    className="mt-5 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-text-primary text-surface-1 rounded-full text-xs font-sans font-bold shadow-sm hover:shadow-md cursor-pointer w-full transition-all duration-150"
                    id="currency-mobile-export-btn"
                  >
                    <PhosphorIcon name="download" className="text-xs" />
                    Export Exchange Pairs
                  </button>
                </div>
              </div>

              {/* DESKTOP & TABLET VIEW (viewport > 480px) */}
              <div className="hidden min-[481px]:grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" id="currency-tab-view">

                {/* Left Column (Currency Select list) — Span 3 — No borders, list style */}
                <div className="lg:col-span-3 p-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                    <h3 className="font-sans font-semibold text-xs text-text-secondary">Exchange Rates</h3>
                    <span className="font-sans text-[10px] text-text-secondary bg-surface-2 px-2 py-0.5 rounded border border-border-hairline/45 font-semibold">
                      {filteredCurrencies.length} Active
                    </span>
                  </div>

                  {/* Search box and search button */}
                  <div className="relative mb-2 shrink-0 flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search pairs..."
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-surface-2 border border-border-hairline font-sans text-xs focus:outline-none focus:border-border-strong text-text-primary"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                        <MagnifyingGlass size={12} />
                      </span>
                      {currencySearch && (
                        <button
                          onClick={() => setCurrencySearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                    <button
                      className="px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border-hairline text-text-secondary hover:text-text-primary text-[11px] font-sans font-medium cursor-pointer transition-colors shrink-0 flex items-center justify-center min-h-[28px]"
                    >
                      Search
                    </button>
                  </div>

                  <div className="flex flex-col flex-1 max-h-[500px] overflow-y-auto divide-y divide-border-hairline/40">
                    {filteredCurrencies.length === 0 ? (
                      <div className="py-6 text-center text-xs text-text-secondary">
                        No pairs found
                      </div>
                    ) : (
                      filteredCurrencies.map((c) => {
                        const isSelected = c.id === selectedCurrencyId;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCurrencyId(c.id)}
                            className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between border my-0.5 ${isSelected
                              ? 'bg-surface-1 border-border-strong shadow-xs font-semibold'
                              : 'bg-transparent border-transparent hover:bg-surface-2/55'
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex -space-x-1.5 relative shrink-0">
                                <CountryFlag code={getCurrencyFlagCode(c.base)} className="w-5 h-3.5 rounded-xs object-cover border border-surface-1" />
                                <CountryFlag code={getCurrencyFlagCode(c.target)} className="w-5 h-3.5 rounded-xs object-cover border border-surface-1" />
                              </div>
                              <div>
                                <p className="font-sans font-medium text-xs text-text-primary">{c.base} to {c.target}</p>
                                <p className="text-[10px] text-text-secondary font-sans font-medium">Volume: {(c.volume / 1e6).toFixed(0)}M</p>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-semibold text-text-primary tabular-nums">{c.rate.toFixed(3)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Center Detail panel — Span 9 */}
                <div className="lg:col-span-9 flex flex-col gap-6">

                  {/* Big Currency rate display */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Chart and Banner — Span 8 (Keeping border + 2px top category accent border) */}
                    <div className="md:col-span-8 border border-border-hairline border-t-2 border-t-status-info rounded-3xl bg-surface-1 p-6 shadow-xs flex flex-col gap-4">
                      <div className="flex items-start justify-between border-b border-border-hairline/40 pb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex -space-x-2 shrink-0 mt-1.5">
                            <CountryFlag code={getCurrencyFlagCode(fromCurrency)} className="w-8 h-5.5 rounded-sm object-cover border-2 border-surface-1 shadow-sm" />
                            <CountryFlag code={getCurrencyFlagCode(toCurrency)} className="w-8 h-5.5 rounded-sm object-cover border-2 border-surface-1 shadow-sm" />
                          </div>
                          <div>
                            <span className="font-sans text-xs font-semibold text-status-info">Exchange Rates</span>
                            <div className="flex flex-col gap-2 mt-1.5">
                              <div className="flex items-center gap-3 flex-wrap">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={conversionAmount}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val)) {
                                      setConversionAmount(val);
                                    }
                                  }}
                                  className="w-24 px-2.5 py-1 text-center rounded-xl bg-surface-2 border border-border-hairline text-text-primary font-medium focus:outline-none focus:border-border-strong text-lg md:text-xl"
                                />

                                <select
                                  value={fromCurrency}
                                  onChange={(e) => {
                                    setFromCurrency(e.target.value);
                                    const matched = data?.currency?.find(c => c.base === e.target.value && c.target === toCurrency);
                                    if (matched) {
                                      setSelectedCurrencyId(matched.id);
                                    }
                                  }}
                                  className="bg-surface-2 border border-border-hairline rounded-xl px-2 py-1 text-sm text-text-primary font-semibold focus:outline-none focus:border-border-strong cursor-pointer h-[36px]"
                                >
                                  {supportedCurrencies.map(cur => (
                                    <option key={cur} value={cur} className="bg-surface-1 text-text-primary">
                                      {cur}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  onClick={() => {
                                    const temp = fromCurrency;
                                    setFromCurrency(toCurrency);
                                    setToCurrency(temp);
                                    const matched = data?.currency?.find(c => c.base === toCurrency && c.target === temp);
                                    if (matched) {
                                      setSelectedCurrencyId(matched.id);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-surface-2 rounded-full border border-border-hairline/30 text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center h-[32px] w-[32px]"
                                  title="Swap currencies"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-right">
                                    <path d="M8 3 4 7l4 4" />
                                    <path d="M4 7h16" />
                                    <path d="m16 21 4-4-4-4" />
                                    <path d="M20 17H4" />
                                  </svg>
                                </button>

                                <select
                                  value={toCurrency}
                                  onChange={(e) => {
                                    setToCurrency(e.target.value);
                                    const matched = data?.currency?.find(c => c.base === fromCurrency && c.target === e.target.value);
                                    if (matched) {
                                      setSelectedCurrencyId(matched.id);
                                    }
                                  }}
                                  className="bg-surface-2 border border-border-hairline rounded-xl px-2 py-1 text-sm text-text-primary font-semibold focus:outline-none focus:border-border-strong cursor-pointer h-[36px]"
                                >
                                  {supportedCurrencies.map(cur => (
                                    <option key={cur} value={cur} className="bg-surface-1 text-text-primary">
                                      {cur}
                                    </option>
                                  ))}
                                </select>

                                <span className="text-text-muted text-lg font-light">=</span>

                                <span className="font-semibold text-status-info text-xl md:text-3xl tabular-nums">
                                  {(() => {
                                    const amt = parseFloat(conversionAmount);
                                    if (isNaN(amt) || amt < 0) return '0.00';
                                    const crossRate = getCrossRate(fromCurrency, toCurrency);
                                    return (amt * crossRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                  })()}
                                </span>
                                <span className="font-semibold text-status-info text-base md:text-lg">
                                  {toCurrency}
                                </span>
                              </div>
                              <div className="text-xs text-text-muted font-mono">
                                1 {fromCurrency} = {getCrossRate(fromCurrency, toCurrency).toFixed(4)} {toCurrency}
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-medium ${activeCurrency?.change24h >= 0 ? 'bg-status-success-bg text-status-success' : 'bg-status-danger-bg text-status-danger'
                          }`}>
                          {activeCurrency?.change24h >= 0 ? '+' : ''}{activeCurrency?.change24h?.toFixed(2)}%
                        </span>
                      </div>

                      <div className="p-2 bg-surface-2 rounded-2xl mt-2">
                        <h4 className="font-sans font-semibold text-xs text-text-secondary mb-3">
                          Historical Trend (7 Days)
                        </h4>
                        <CurrencyHistoryChart data={activeCurrency?.history || []} targetCurrency={activeCurrency?.target || 'EUR'} />
                      </div>
                    </div>

                    {/* Volatility progress card — Span 4 (Keeping border + 2px top category accent border) */}
                    <div className="md:col-span-4 border border-border-hairline border-t-2 border-t-status-indigo rounded-3xl bg-surface-1 p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <h4 className="font-sans font-semibold text-xs text-text-secondary mb-4">Currency Profile</h4>

                        <div className="space-y-4 text-xs font-sans">
                          <div>
                            <p className="text-text-muted font-sans font-semibold text-[11px]">Base Currency</p>
                            <div className="flex items-center gap-2 mt-1">
                              <CountryFlag code={getCurrencyFlagCode(activeCurrency?.base || 'USD')} className="w-5 h-3.5 rounded-xs" />
                              <p className="text-text-primary font-semibold">{activeCurrency?.base} — {getCurrencyFullName(activeCurrency?.base || 'USD')}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-text-muted font-sans font-semibold text-[11px]">Target Currency</p>
                            <div className="flex items-center gap-2 mt-1">
                              <CountryFlag code={getCurrencyFlagCode(activeCurrency?.target || 'EUR')} className="w-5 h-3.5 rounded-xs" />
                              <p className="text-text-primary font-semibold">{activeCurrency?.target} — {getCurrencyFullName(activeCurrency?.target || 'EUR')}</p>
                            </div>
                          </div>

                          <div className="border-t border-border-hairline my-2 pt-2">
                            <div className="flex justify-between text-[11px] font-sans font-semibold text-text-secondary mb-1">
                              <span>Index Volatility</span>
                              <span className="font-semibold text-text-primary">{activeCurrency?.volatility}%</span>
                            </div>
                            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-status-indigo h-full rounded-full transition-all" style={{ width: `${activeCurrency?.volatility}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleExportCSV('currency')}
                        className="mt-6 flex items-center justify-center gap-1.5 px-4 py-2 bg-text-primary text-surface-1 rounded-full text-xs font-sans font-bold shadow-sm hover:shadow-md cursor-pointer w-full transition-all duration-150"
                      >
                        <PhosphorIcon name="download" className="text-sm" />
                        Export Exchange Pairs
                      </button>
                    </div>

                  </div>

                </div>

              </div>

              {/* OVERLAY BOTTOM SHEET DRAWER (Mobile Currency pairs selector) */}
              <AnimatePresence>
                {mobileCurrenciesOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMobileCurrenciesOpen(false)}
                      className="fixed inset-0 bg-black/45 z-50 pointer-events-auto"
                      id="currency-mobile-backdrop"
                    />

                    {/* Bottom Sheet Panel */}
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 26, stiffness: 260 }}
                      drag="y"
                      dragConstraints={{ top: 0 }}
                      dragElastic={{ top: 0, bottom: 0.85 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.y > 110) {
                          setMobileCurrenciesOpen(false);
                        }
                      }}
                      className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-surface-2 border-t border-border-hairline rounded-t-[24px] z-50 flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
                      id="currency-mobile-bottom-sheet"
                    >
                      {/* Swipe Handle Indicator */}
                      <div className="w-10 h-1 bg-border-strong/25 rounded-full mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing" />

                      {/* Sheet Inner Content */}
                      <div className="flex flex-col flex-1 px-5 pb-8 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-border-hairline shrink-0">
                          <div>
                            <h3 className="font-sans font-semibold text-sm text-text-primary">Exchange Rates</h3>
                            <p className="text-[10px] text-text-secondary mt-0.5">Select a currency pair</p>
                          </div>
                          <button
                            onClick={() => setMobileCurrenciesOpen(false)}
                            className="p-1.5 bg-surface-1 border border-border-hairline rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Search / Filter Input */}
                        <div className="relative my-3.5 shrink-0">
                          <input
                            type="text"
                            placeholder="Search pairs..."
                            value={currencySearch}
                            onChange={(e) => setCurrencySearch(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 rounded-xl bg-surface-1 border border-border-hairline font-sans text-xs focus:outline-none focus:border-border-strong text-text-primary"
                            autoFocus
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                            <MagnifyingGlass size={13} />
                          </span>
                          {currencySearch && (
                            <button
                              onClick={() => setCurrencySearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* List (Scrollable) */}
                        <div className="flex-1 overflow-y-auto divide-y divide-border-hairline/30 pr-1">
                          {(() => {
                            const currencyList = data.currency || [];
                            const filteredList = currencyList.filter(c =>
                              c.base.toLowerCase().includes(currencySearch.toLowerCase()) ||
                              c.target.toLowerCase().includes(currencySearch.toLowerCase())
                            );

                            if (filteredList.length === 0) {
                              return (
                                <div className="py-10 text-center text-xs text-text-secondary font-medium">
                                  No currency pairs match "{currencySearch}"
                                </div>
                              );
                            }

                            return filteredList.map((c) => {
                              const isSelected = c.id === selectedCurrencyId;
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => {
                                    setSelectedCurrencyId(c.id);
                                    setMobileCurrenciesOpen(false);
                                  }}
                                  className={`py-3 px-2 flex items-center justify-between transition-all cursor-pointer rounded-xl my-0.5 ${isSelected
                                    ? 'bg-surface-1 border border-border-strong font-semibold shadow-xs'
                                    : 'hover:bg-surface-1/40 border border-transparent'
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex -space-x-1 relative shrink-0">
                                      <CountryFlag code={getCurrencyFlagCode(c.base)} className="w-5 h-3.5 rounded-xs object-cover border border-surface-1" />
                                      <CountryFlag code={getCurrencyFlagCode(c.target)} className="w-5 h-3.5 rounded-xs object-cover border border-surface-1" />
                                    </div>
                                    <div>
                                      <p className="font-sans font-medium text-xs text-text-primary">{c.base} to {c.target}</p>
                                      <p className="text-[10px] text-text-secondary font-sans font-medium">Volume: {(c.volume / 1e6).toFixed(0)}M</p>
                                    </div>
                                  </div>
                                  <span className="font-mono text-xs font-semibold text-text-primary tabular-nums">{c.rate.toFixed(4)}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ==================== TAB 5: AIR QUALITY & WORLD MAP ==================== */}
          {activeTab === 'aqi' && (
            <div className="flex flex-col gap-6 animate-slide-up" id="aqi-tab-view">
              {(() => {
                const activeAQI = data?.aqi?.find(a => a.city.toLowerCase() === selectedCity.toLowerCase()) || data?.aqi?.[0];
                if (!activeAQI) return (
                  <div className="text-center py-12 text-xs text-text-secondary font-sans">
                    Air quality data loading...
                  </div>
                );

                const details = getAQILevelDetails(activeAQI.aqi);

                // Trend calculations for 4h comparison
                const trendInfo = (() => {
                  if (!activeAQI.trend || activeAQI.trend.length < 5) {
                    return { text: 'Stable', icon: 'minus', color: 'text-text-muted', change: 0 };
                  }
                  const cur = activeAQI.aqi;
                  const past = activeAQI.trend[activeAQI.trend.length - 5]?.aqi || cur;
                  const diff = cur - past;
                  if (diff > 0) return { text: `Rising (+${diff} AQI vs. 4h ago)`, icon: 'trending-up', color: 'text-status-danger', change: diff };
                  if (diff < 0) return { text: `Improving (${Math.abs(diff)} AQI vs. 4h ago)`, icon: 'trending-down', color: 'text-status-success', change: diff };
                  return { text: 'Stable (No change vs. 4h ago)', icon: 'minus', color: 'text-text-muted', change: 0 };
                })();

                const pollutantDefinitions: Record<string, { label: string; desc: string; unit: string }> = {
                  pm25: {
                    label: 'PM2.5',
                    desc: 'Fine particulate matter (≤ 2.5 µm). Tiny particles from vehicle emissions and combustion that penetrate deep into lungs.',
                    unit: 'µg/m³'
                  },
                  pm10: {
                    label: 'PM10',
                    desc: 'Coarse particulate matter (≤ 10 µm). Dust, pollen, and mold that can irritate the nose, throat, and eyes.',
                    unit: 'µg/m³'
                  },
                  o3: {
                    label: 'O3 (Ozone)',
                    desc: 'Ground-level ozone. Formed when sunlight reacts with emissions, causing breathing discomfort and chest tightness.',
                    unit: 'ppb'
                  },
                  no2: {
                    label: 'NO2',
                    desc: 'Nitrogen Dioxide. Gas from motor vehicles and power plants, highly associated with respiratory tract inflammation.',
                    unit: 'ppb'
                  },
                  so2: {
                    label: 'SO2',
                    desc: 'Sulfur Dioxide. Corrosive gas produced from coal/oil burning, triggering asthma attacks and respiratory issues.',
                    unit: 'ppb'
                  },
                  co: {
                    label: 'CO',
                    desc: 'Carbon Monoxide. Odorless, toxic gas from incomplete vehicle fuel burning, reducing oxygen transfer in body tissues.',
                    unit: 'ppm'
                  }
                };

                return (
                  <>
                    {/* Top filter row with Autocomplete Search and Quick Select buttons */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-hairline/60 pb-4" id="aqi-filter-panel-row">
                      <div>
                        <h2 className="font-sans font-light text-2xl tracking-tight text-text-primary">
                          Air Quality & Atmosphere
                        </h2>
                        <p className="text-xs text-text-secondary mt-0.5 font-sans">
                          Analyze particulate levels, gaseous pollutants, and atmospheric health across selected global centers.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 relative" id="aqi-search-autocomplete-wrapper">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                          <PhosphorIcon name="search" className="text-xs absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                          <input
                            type="text"
                            placeholder="Search city..."
                            className="w-full bg-surface-1 border border-border-hairline focus:border-status-accent rounded-full pl-9 pr-8 py-1.5 font-sans text-xs focus:outline-none text-text-primary"
                            value={aqiSearchQuery}
                            onFocus={() => setShowAqiSearchDropdown(true)}
                            onChange={(e) => {
                              setAqiSearchQuery(e.target.value);
                              setShowAqiSearchDropdown(true);
                            }}
                          />
                          {aqiSearchQuery && (
                            <button
                              onClick={() => { setAqiSearchQuery(''); setShowAqiSearchDropdown(false); }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                            >
                              <PhosphorIcon name="x" className="text-[10px]" />
                            </button>
                          )}

                          {/* Autocomplete Dropdown */}
                          {showAqiSearchDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-1 border border-border-strong rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto" id="aqi-search-autocomplete-dropdown">
                              {(() => {
                                const list = data?.aqi || [];
                                const filtered = list.filter(item =>
                                  item.city.toLowerCase().includes(aqiSearchQuery.toLowerCase()) ||
                                  item.country.toLowerCase().includes(aqiSearchQuery.toLowerCase())
                                );

                                if (filtered.length === 0) {
                                  return (
                                    <div className="p-3 text-[11px] font-sans text-text-secondary text-center">
                                      No monitored cities match "{aqiSearchQuery}"
                                    </div>
                                  );
                                }

                                return filtered.map(item => (
                                  <button
                                    key={item.city}
                                    onClick={() => {
                                      setSelectedCity(item.city);
                                      setSelectedCountryCode(item.country === 'United States' ? 'US' : (MONITORED_CITIES.find(c => c.city === item.city)?.code || 'US'));
                                      setAqiSearchQuery('');
                                      setShowAqiSearchDropdown(false);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-surface-2 transition-colors flex items-center justify-between text-xs font-sans text-text-primary border-b border-border-hairline/30 last:border-0"
                                  >
                                    <div>
                                      <p className="font-semibold text-text-primary">{item.city}</p>
                                      <p className="text-[10px] text-text-secondary">{item.country}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getAQILevelDetails(item.aqi).color }} />
                                      <span className="font-mono text-[11px] text-text-muted font-medium font-semibold">AQI {item.aqi}</span>
                                    </div>
                                  </button>
                                ));
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Quick-select chips */}
                        <div className="flex items-center gap-1.5 max-w-full overflow-x-auto scrollbar-none py-1">
                          {['New York', 'London', 'Tokyo', 'Delhi', 'Manila'].map(city => {
                            const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                            return (
                              <button
                                key={city}
                                onClick={() => {
                                  setSelectedCity(city);
                                  setSelectedCountryCode(MONITORED_CITIES.find(c => c.city === city)?.code || 'US');
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold transition-all cursor-pointer ${isSelected
                                  ? 'bg-status-accent text-surface-1 shadow-xs font-extrabold'
                                  : 'bg-surface-2 hover:bg-surface-2/70 text-text-secondary hover:text-text-primary border border-border-hairline/35'
                                  }`}
                              >
                                {city}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Primary summary details row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="aqi-summary-breakdown-panel-row">

                      {/* Left Column: Primary Summary Card */}
                      <div
                        className="lg:col-span-5 border border-border-strong rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
                        style={{ borderTop: `4px solid ${details.color}` }}
                        id="aqi-primary-hero-summary-card"
                      >
                        {/* Background subtle color shading matching AQI level */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundColor: details.color }} />

                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[10px] font-sans text-text-muted uppercase tracking-widest font-bold">Active Monitoring </p>
                              <h3 className="font-sans font-semibold text-lg text-text-primary mt-1.5 flex items-center gap-2">
                                <CountryFlag code={MONITORED_CITIES.find(c => c.city === activeAQI.city)?.code || 'US'} className="w-5 h-3.5 rounded-sm object-cover border border-border-hairline/50" />
                                {activeAQI.city}, <span className="text-text-secondary text-sm font-medium font-semibold">{activeAQI.country}</span>
                              </h3>
                            </div>

                            {/* Updated Timestamp */}
                            <span className="text-[9px] font-arimo text-text-muted flex items-center gap-1">
                              <PhosphorIcon name="clock" className="text-[10px]" />
                              UPDATED {new Date(activeAQI.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Hero number & severity indicator */}
                          <div className="flex items-baseline gap-4 mt-6">
                            <span className="font-sans font-light text-6xl tracking-tighter text-text-primary tabular-nums">
                              {activeAQI.aqi}
                            </span>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-arimo text-text-muted uppercase font-bold leading-none">Air Quality Index</span>
                              <span
                                className="px-2.5 py-1.5 rounded-xl text-xs font-sans font-bold leading-none inline-block border text-center mt-1"
                                style={{
                                  borderColor: `${details.color}35`,
                                  backgroundColor: `${details.color}15`,
                                  color: details.color
                                }}
                              >
                                {details.status}
                              </span>
                            </div>
                          </div>

                          {/* One-line health message */}
                          <p className="text-xs md:text-[13px] font-sans text-text-secondary leading-relaxed mt-5 border-l-2 pl-3" style={{ borderLeftColor: details.color }}>
                            {activeAQI.healthMessage}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-hairline/45 mt-6 pt-4">
                          {/* Main Pollutant driver */}
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-accent" />
                            <span className="text-[11px] font-sans text-text-secondary">
                              Primary Pollutant: <span className="font-semibold text-text-primary">{activeAQI.mainPollutant}</span>
                            </span>
                          </div>

                          {/* Trend Arrow */}
                          <div className={`flex items-center gap-1 text-[11px] font-sans font-semibold ${trendInfo.color}`}>
                            <PhosphorIcon name={trendInfo.icon} className="text-sm" />
                            <span>{trendInfo.text}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Pollutants breakdown grid */}
                      <div className="lg:col-span-7 border border-border-hairline rounded-3xl bg-surface-1 p-6 shadow-sm" id="aqi-pollutants-grid-panel">
                        <div className="flex items-center justify-between border-b border-border-hairline/65 pb-3.5 mb-5">
                          <div>
                            <h4 className="font-sans font-semibold text-sm text-text-primary">
                              Component Concentrations
                            </h4>
                            <p className="text-[11px] font-sans text-text-secondary mt-0.5">
                              Hover on pollutant cards for official scientific definitions and respiratory impact details.
                            </p>
                          </div>

                          <span className="text-[10px] font-mono text-text-muted bg-surface-2 px-2.5 py-0.5 rounded-full border border-border-hairline/40">
                            6-Factor Sensor Feed
                          </span>
                        </div>

                        {/* 6 Grid cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 relative">
                          {Object.entries(pollutantDefinitions).map(([key, def]) => {
                            // Extract concentration value from activeAQI
                            const val = (activeAQI.pollutants as any)?.[key] || (activeAQI as any)[key] || 0;
                            const sev = getPollutantSeverityColorLocal(key, val);

                            return (
                              <div
                                key={key}
                                className="group relative bg-surface-2 border border-border-hairline hover:border-border-strong p-3.5 rounded-2xl flex flex-col justify-between h-24 transition-all duration-150"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  {/* Pollutant Name with standard custom tooltip trigger */}
                                  <div className="flex items-center gap-1 text-[11px] font-sans font-bold text-text-secondary">
                                    <span>{def.label}</span>
                                    <span className="text-[10px] text-text-muted opacity-45 group-hover:opacity-100 transition-opacity cursor-help">
                                      <PhosphorIcon name="info" className="text-[10px]" />
                                    </span>
                                  </div>

                                  {/* Small color status bullet dot or mini pill */}
                                  <span
                                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md uppercase"
                                    style={{
                                      backgroundColor: `${sev.color}15`,
                                      color: sev.color
                                    }}
                                  >
                                    {sev.label}
                                  </span>
                                </div>

                                <div className="mt-2.5">
                                  <p className="font-sans font-extrabold text-sm md:text-base text-text-primary tabular-nums tracking-tight font-semibold">
                                    {val} <span className="text-[10px] font-normal text-text-muted font-sans ml-0.5">{def.unit}</span>
                                  </p>
                                </div>

                                {/* Modern Hover Floating Definition Tooltip Card */}
                                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-surface-1 border border-border-strong p-3 rounded-2xl shadow-xl z-50">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sev.color }} />
                                    <h5 className="text-[11px] font-sans font-bold text-text-primary">{def.label} — {sev.label}</h5>
                                  </div>
                                  <p className="text-[10px] font-sans text-text-secondary leading-relaxed font-normal">
                                    {def.desc}
                                  </p>
                                  <p className="text-[9px] font-mono text-text-muted mt-2 border-t border-border-hairline/45 pt-1.5">
                                    Concentration: {val} {def.unit}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* History Trend + Info Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="aqi-trend-explanation-row">
                      {/* Trend area */}
                      <div className="lg:col-span-8">
                        <AQITrendChart trendData={activeAQI.trend} city={activeAQI.city} />
                      </div>

                      {/* Info & standards area */}
                      <div className="lg:col-span-4 border border-border-hairline rounded-3xl bg-surface-1 p-5 shadow-sm flex flex-col justify-between" id="aqi-standards-card">
                        <div>
                          <div className="flex items-center gap-1.5 border-b border-border-hairline pb-3">
                            <PhosphorIcon name="info" className="text-sm text-status-accent" />
                            <h4 className="font-sans font-semibold text-sm text-text-primary">
                              EPA Exposure Standards
                            </h4>
                          </div>

                          <div className="space-y-3.5 mt-4 text-xs font-sans text-text-secondary leading-relaxed">
                            <p>
                              The US EPA Air Quality Index (AQI) is a unified scale from 0 to 500 used to report daily air cleanliness levels.
                            </p>

                            <div className="space-y-2 mt-2">
                              <div className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                <div>
                                  <span className="font-bold text-text-primary">0-50 (Good):</span> Air quality is posing virtually zero risk to health.
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                                <div>
                                  <span className="font-bold text-text-primary">51-100 (Moderate):</span> Safe for public, extremely sensitive people should monitor.
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                <div>
                                  <span className="font-bold text-text-primary">101-150 (USG):</span> Sensitive groups may experience irritation.
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                <div>
                                  <span className="font-bold text-text-primary">151+ (Unhealthy+):</span> Everyone may begin experiencing general lung strain.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-surface-2 p-3 rounded-2xl border border-border-hairline/40 mt-4">
                          <p className="text-[10px] font-mono text-text-muted uppercase font-bold leading-none">Public Advisory</p>
                          <p className="text-[11px] text-text-secondary leading-relaxed mt-1.5 font-sans">
                            If AQI exceeds 100, asthma patients and active children are advised to restrict heavy outdoor exercises and close windows.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Central Map area */}
                    <div className="w-full flex flex-col gap-3 mt-2" id="global-map-full-width-wrapper">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h4 className="font-sans font-semibold text-sm text-text-primary flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-accent animate-pulse" />
                            Air Quality World Map
                          </h4>
                          <p className="text-[11px] font-sans text-text-secondary mt-0.5">
                            Interactive visual overview of registered global reporting stations. Click on pins to sync dashboard focus.
                          </p>
                        </div>
                      </div>

                      <MapPanel
                        onSelectCity={(city) => { setSelectedCity(city); setSelectedCountryCode(MONITORED_CITIES.find(c => c.city === city)?.code || 'US'); }}
                        selectedCity={selectedCity}
                        weatherData={data.weather}
                        aqiData={data.aqi}
                        tempUnit={tempUnit}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ==================== TAB 6: COUNTRIES COMPARISON ==================== */}
          {activeTab === 'countries' && (
            <>
              {/* MOBILE ONLY VIEW (viewport <= 480px) */}
              <div className="block min-[481px]:hidden space-y-4 animate-slide-up" id="countries-tab-mobile">
                {/* Detail Card */}
                <div className="border border-border-hairline border-t-2 border-t-status-accent rounded-3xl bg-surface-1 p-5 shadow-xs flex flex-col justify-between" id="countries-mobile-detail-card">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[9px] text-status-accent uppercase tracking-widest font-semibold block">World Bank Sovereign Indicators</span>
                        <h2 className="font-sans font-medium text-xl tracking-tight text-text-primary mt-1 flex items-center gap-2">
                          <CountryFlag code={activeCountry?.code || ''} className="w-7 h-5 rounded shadow-2xs shrink-0" />
                          <span>{activeCountry?.name}</span>
                        </h2>
                        <span className="font-sans text-[10px] text-text-secondary mt-1 block">Capital: {activeCountry?.capital}</span>
                      </div>

                      {/* Sovereigns List Switcher Button/Chip */}
                      <button
                        onClick={() => setMobileCountriesOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border-hairline hover:border-border-strong rounded-full text-xs font-medium text-text-primary cursor-pointer transition-colors shrink-0"
                        id="sovereigns-locations-trigger-mobile"
                      >
                        <Compass size={12} />
                        <span className="text-[10px] font-medium">Sovereigns list ▾</span>
                      </button>
                    </div>

                    {/* Wrapped tag line */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {activeCountry?.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-status-indigo-bg text-status-indigo">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Stats Row (Horizontally Scrollable) */}
                  <div className="mt-5 pt-4 border-t border-border-hairline/40">
                    <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory pr-1" id="countries-mobile-stats-row">
                      {/* Stat 1: Population */}
                      <div className="flex-shrink-0 w-[110px] border border-border-hairline rounded-2xl bg-surface-2/50 p-3 flex flex-col justify-between snap-start">
                        <span className="text-[9px] text-text-secondary font-medium uppercase tracking-wider">Population</span>
                        <span className="text-xs font-semibold text-text-primary mt-1">{(activeCountry?.population / 1e6).toFixed(1)}M</span>
                      </div>

                      {/* Stat 2: Nominal GDP */}
                      <div className="flex-shrink-0 w-[110px] border border-border-hairline rounded-2xl bg-surface-2/50 p-3 flex flex-col justify-between snap-start">
                        <span className="text-[9px] text-text-secondary font-medium uppercase tracking-wider">Nominal GDP</span>
                        <span className="text-xs font-semibold text-text-primary mt-1">${(activeCountry?.gdp / 1e12).toFixed(1)}T</span>
                      </div>

                      {/* Stat 3: Languages */}
                      <div className="flex-shrink-0 w-[130px] border border-border-hairline rounded-2xl bg-surface-2/50 p-3 flex flex-col justify-between snap-start">
                        <span className="text-[9px] text-text-secondary font-medium uppercase tracking-wider">Languages</span>
                        <span className="text-xs font-semibold text-text-primary mt-1 truncate block">{activeCountry?.languages?.join(', ')}</span>
                      </div>

                      {/* Compact Livability score as a small ring/badge inside key stats row */}
                      <div className="flex-shrink-0 w-[150px] border border-border-hairline rounded-2xl bg-surface-2/50 p-3 flex items-center gap-2.5 snap-start">
                        <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--line)" strokeWidth="3" className="opacity-30" />
                            <circle
                              cx="18"
                              cy="18"
                              r="14"
                              fill="none"
                              stroke="var(--purple)"
                              strokeWidth="3"
                              strokeDasharray={2 * Math.PI * 14}
                              strokeDashoffset={2 * Math.PI * 14 - ((activeCountry?.livabilityIndex || 75) / 100) * 2 * Math.PI * 14}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute font-sans font-bold text-[9px] text-text-primary">
                            {activeCountry?.livabilityIndex}
                          </span>
                        </div>
                        <div>
                          <p className="text-[8px] font-mono text-text-secondary uppercase leading-none font-semibold">Livability</p>
                          <p className="text-[10px] font-sans font-medium text-text-muted mt-0.5">{activeCountry?.livabilityIndex} pts rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GDP growth trend chart: full width of the card, static flat line */}
                <div className="border border-border-hairline rounded-3xl bg-surface-1 p-4 shadow-xs" id="countries-mobile-chart-card">
                  <div className="mb-3">
                    <h3 className="font-sans font-medium text-xs text-text-primary tracking-tight">GDP Growth Index Trend (World Bank Indicator)</h3>
                    <p className="text-[9px] text-text-secondary mt-0.5">Historical economic growth performance</p>
                  </div>
                  <div className="h-[170px] w-full">
                    <CountryGrowthChart
                      data={activeCountry?.historicalGdp || []}
                      type="gdp"
                      countryName={activeCountry?.name || 'Sovereign'}
                      flatStroke={true}
                    />
                  </div>
                </div>
              </div>

              {/* DESKTOP & TABLET VIEW (viewport > 480px) */}
              <div className="hidden min-[481px]:grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" id="countries-tab-view">

                {/* Left Column list (Country ranks) — Span 3 */}
                <div className="lg:col-span-3 border border-border-hairline rounded-3xl bg-surface-1 p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                    <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-text-secondary">Sovereigns List</h3>
                    <span className="font-mono text-[9px] text-text-secondary">{data.countries ? `${data.countries.length} countries` : 'Ranked'}</span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                      <PhosphorIcon name="search" className="text-xs" />
                    </div>
                    <input
                      type="text"
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      placeholder="Search country..."
                      className="w-full pl-8.5 pr-8 py-2 bg-surface-2 border border-border-hairline rounded-2xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-border-strong transition-all"
                    />
                    {countrySearchQuery && (
                      <button
                        onClick={() => setCountrySearchQuery('')}
                        className="absolute inset-y-0 right-3 flex items-center text-text-secondary hover:text-text-primary"
                      >
                        <PhosphorIcon name="close" className="text-xs" />
                      </button>
                    )}
                  </div>

                  {(() => {
                    const countriesList = data.countries || [];
                    const filtered = countriesList.filter((c) =>
                      c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
                    );
                    const displayed = countrySearchQuery
                      ? filtered
                      : filtered.slice(0, countryVisibleCount);

                    return (
                      <>
                        <div className="flex flex-col gap-2">
                          {displayed.length > 0 ? (
                            displayed.map((c) => {
                              const isSelected = c.code === selectedCountryCode;
                              return (
                                <div
                                  key={c.code}
                                  onClick={() => {
                                    setSelectedCountryCode(c.code);
                                    setSelectedCity(MONITORED_CITIES.find(cityObj => cityObj.code === c.code)?.city || 'New York');
                                  }}
                                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                                    ? 'bg-surface-2 border-border-strong shadow-sm'
                                    : 'bg-surface-1 border-border-hairline hover:border-border-strong'
                                    }`}
                                >
                                  <div>
                                    <p className="font-sans font-semibold text-xs text-text-primary">{c.name}</p>
                                    <p className="text-[9px] text-text-secondary font-mono uppercase">Region: {c.region}</p>
                                  </div>
                                  <CountryFlag code={c.code} className="w-7 h-5 rounded shadow-sm flex-shrink-0" />
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-6 text-xs text-text-secondary font-sans">
                              No countries found matching "{countrySearchQuery}"
                            </div>
                          )}
                        </div>

                        {/* See more countries button */}
                        {!countrySearchQuery && filtered.length > 6 && (
                          <button
                            onClick={() => {
                              if (countryVisibleCount >= filtered.length) {
                                setCountryVisibleCount(6);
                              } else {
                                setCountryVisibleCount((prev) => Math.min(prev + 6, filtered.length));
                              }
                            }}
                            className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 bg-transparent border border-border-hairline hover:border-border-strong rounded-2xl text-xs font-sans font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-2/30 transition-all cursor-pointer w-full"
                          >
                            <PhosphorIcon
                              name={countryVisibleCount >= filtered.length ? 'chevron-up' : 'chevron-down'}
                              className="text-xs"
                            />
                            <span>
                              {countryVisibleCount >= filtered.length
                                ? 'Show less'
                                : 'See more countries'}
                            </span>
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Center Detail Panel — Span 9 */}
                <div className="lg:col-span-9 flex flex-col gap-6">

                  {/* Details banner */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Stats banner — Span 8 */}
                    <div className="md:col-span-8 border border-border-hairline rounded-3xl bg-surface-1 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-[10px] text-status-accent uppercase tracking-widest font-medium">World Bank sovereign Indicators</span>
                          <h2 className="font-sans font-light text-4xl tracking-tight text-text-primary mt-2 flex items-center gap-3">
                            <CountryFlag code={activeCountry?.code || ''} className="w-10 h-7 rounded shadow-xs" />
                            <span>
                              {activeCountry?.name}
                              <span className="font-medium text-xs font-mono uppercase text-text-secondary block mt-1">Capital: {activeCountry?.capital}</span>
                            </span>
                          </h2>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activeCountry?.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-status-indigo-bg text-status-indigo">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-4 border-t border-border-hairline/40">
                        <div>
                          <p className="text-[10px] font-mono text-text-secondary uppercase leading-none">Gross Population</p>
                          <p className="font-sans font-semibold text-base text-text-primary tabular-nums mt-1">
                            {(activeCountry?.population / 1e6).toFixed(1)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-text-secondary uppercase leading-none">Nominal GDP</p>
                          <p className="font-sans font-semibold text-base text-text-primary tabular-nums mt-1">
                            ${(activeCountry?.gdp / 1e12).toFixed(1)}T
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-text-secondary uppercase leading-none">Languages</p>
                          <p className="font-sans font-semibold text-xs text-status-accent mt-1 uppercase">
                            {activeCountry?.languages?.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Livability gauge Ring — Span 4 */}
                    <div className="md:col-span-4">
                      <StatGauge
                        value={activeCountry?.livabilityIndex || 75}
                        max={100}
                        title="Sovereign Livability"
                        subtitle="Weighted Index rating"
                        label={`${activeCountry?.livabilityIndex} pts`}
                        colorClass="text-status-indigo"
                      />
                    </div>

                  </div>

                  {/* World Bank GDP trend lines */}
                  <div className="border border-border-hairline rounded-3xl bg-surface-1 p-6 shadow-sm">
                    <h3 className="font-sans font-medium text-sm text-text-primary mb-4 tracking-tight">GDP Growth Index Trend (World Bank Indicator API)</h3>
                    <CountryGrowthChart data={activeCountry?.historicalGdp || []} type="gdp" countryName={activeCountry?.name || 'Sovereign'} />
                  </div>

                </div>

              </div>

              {/* OVERLAY BOTTOM SHEET DRAWER (Mobile country selector) */}
              <AnimatePresence>
                {mobileCountriesOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMobileCountriesOpen(false)}
                      className="fixed inset-0 bg-black/45 z-50 pointer-events-auto"
                      id="countries-mobile-backdrop"
                    />

                    {/* Bottom Sheet Panel */}
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 26, stiffness: 260 }}
                      drag="y"
                      dragConstraints={{ top: 0 }}
                      dragElastic={{ top: 0, bottom: 0.85 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.y > 110) {
                          setMobileCountriesOpen(false);
                        }
                      }}
                      className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-surface-2 border-t border-border-hairline rounded-t-[24px] z-50 flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
                      id="countries-mobile-bottom-sheet"
                    >
                      {/* Swipe Handle Indicator */}
                      <div className="w-10 h-1 bg-border-strong/25 rounded-full mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing" />

                      {/* Sheet Inner Content */}
                      <div className="flex flex-col flex-1 px-5 pb-8 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-border-hairline shrink-0">
                          <div>
                            <h3 className="font-sans font-semibold text-sm text-text-primary">Select Sovereign</h3>
                            <p className="text-[10px] text-text-secondary mt-0.5">Choose from monitored countries</p>
                          </div>
                          <button
                            onClick={() => setMobileCountriesOpen(false)}
                            className="p-1.5 bg-surface-1 border border-border-hairline rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Search / Filter Input */}
                        <div className="relative my-3.5 shrink-0">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 rounded-xl bg-surface-1 border border-border-hairline font-sans text-xs focus:outline-none focus:border-border-strong text-text-primary"
                            autoFocus
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                            <MagnifyingGlass size={13} />
                          </span>
                          {countrySearchQuery && (
                            <button
                              onClick={() => setCountrySearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* List (Scrollable) */}
                        <div className="flex-1 overflow-y-auto divide-y divide-border-hairline/30 pr-1">
                          {(() => {
                            const countriesList = data.countries || [];
                            const filteredList = countriesList.filter(c =>
                              c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                              c.region.toLowerCase().includes(countrySearchQuery.toLowerCase())
                            );

                            if (filteredList.length === 0) {
                              return (
                                <div className="py-10 text-center text-xs text-text-secondary font-medium">
                                  No countries match "{countrySearchQuery}"
                                </div>
                              );
                            }

                            return filteredList.map((c) => {
                              const isSelected = c.code === selectedCountryCode;
                              return (
                                <div
                                  key={c.code}
                                  onClick={() => {
                                    setSelectedCountryCode(c.code);
                                    setSelectedCity(MONITORED_CITIES.find(cityObj => cityObj.code === c.code)?.city || 'New York');
                                    setMobileCountriesOpen(false);
                                  }}
                                  className={`py-3 px-2 flex items-center justify-between transition-all cursor-pointer rounded-xl my-0.5 ${isSelected
                                    ? 'bg-surface-1 border border-border-strong font-semibold shadow-xs'
                                    : 'hover:bg-surface-1/40 border border-transparent'
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <CountryFlag code={c.code} className="w-6 h-4 rounded shadow-2xs shrink-0" />
                                    <div>
                                      <p className="font-sans font-medium text-xs text-text-primary">{c.name}</p>
                                      <p className="text-[10px] text-text-secondary font-sans font-medium">{c.region}</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-text-secondary font-medium bg-surface-1 px-2 py-0.5 rounded border border-border-hairline/45">Ranked</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ==================== TAB 7: REPORTS PAGE ==================== */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" id="reports-tab-view">

              {/* Left explanation — Span 4 — Styled with 2px top category-accent border */}
              <div className="lg:col-span-4 border border-border-hairline border-t-2 border-t-status-warning rounded-3xl bg-surface-2 text-text-primary p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] text-status-warning uppercase tracking-widest font-semibold">Export Workspace</span>
                    <div className="group relative">
                      <PhosphorIcon name="info" className="text-text-muted hover:text-status-warning transition-colors cursor-pointer text-sm" />
                      <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30" id="version-tooltip-content">
                        <div className="bg-surface-1 text-text-primary text-[10px] font-mono whitespace-nowrap rounded px-2.5 py-1 border border-border-hairline shadow-lg">
                          Climex journal compiled
                        </div>
                        <div className="w-2 h-2 bg-surface-1 border-r border-b border-border-hairline/50 transform rotate-45 -mt-1" />
                      </div>
                    </div>
                  </div>
                  <h2 className="font-sans font-light text-3xl tracking-tight text-text-primary mt-4">
                    Compile <span className="font-medium text-status-warning">aggregated ledger</span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-4 leading-relaxed font-body">
                    Download a spreadsheet with all your selected data logs combined in one file. It's saved as a CSV, so you can open it in Excel, Google Sheets, or import it anywhere.
                  </p>

                  {/* Estimated Size Card */}
                  <div className="mt-4 p-3 bg-surface-1 rounded-2xl border border-border-hairline/40 text-xs flex justify-between items-center">
                    <span className="text-text-secondary font-medium">Estimated combined size</span>
                    <span className="font-mono text-status-warning font-semibold">
                      {selectedLogs.reduce((sum, logId) => {
                        if (logId === 'crypto') return sum + 4.2;
                        if (logId === 'weather') return sum + 5.8;
                        if (logId === 'aqi') return sum + 3.1;
                        if (logId === 'currency') return sum + 3.5;
                        return sum;
                      }, 0).toFixed(1)} KB
                    </span>
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    onClick={() => handleExportCSV('ledger')}
                    disabled={selectedLogs.length === 0 || exportingBundle}
                    className={`mt-6 flex items-center justify-center gap-2 px-5 py-2.5 transition-all rounded-full text-xs font-sans font-bold cursor-pointer w-full shadow-md ${selectedLogs.length === 0
                      ? 'bg-status-warning/20 text-text-muted cursor-not-allowed border border-border-hairline/30 shadow-none'
                      : bundleError
                        ? 'bg-status-danger text-white hover:opacity-95 shadow-status-danger/15'
                        : 'bg-status-warning hover:opacity-90 active:scale-95 text-black shadow-status-warning/15'
                      }`}
                    id="generate-ledger-cta-btn"
                  >
                    {exportingBundle ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin shrink-0" />
                        <span>Preparing ledger...</span>
                      </>
                    ) : (
                      <>
                        <PhosphorIcon name="download" className="text-sm font-bold shrink-0" />
                        <span className="truncate">
                          {bundleError
                            ? "couldn't generate the file. Retry"
                            : selectedLogs.length === 0
                              ? "No logs selected (CSV)"
                              : `Download ${selectedLogs.length} ${selectedLogs.length === 1 ? 'log' : 'logs'} (CSV)`
                          }
                        </span>
                        <span className="px-1.5 py-0.2 text-[8px] bg-black/10 text-black font-mono rounded uppercase">CSV</span>
                      </>
                    )}
                  </button>

                  {selectedLogs.length === 0 && (
                    <p className="text-[10px] text-status-danger font-medium mt-2 text-center animate-pulse">
                      ⚠️ select at least one log to export
                    </p>
                  )}
                </div>
                <div className="pt-4 border-t border-border-hairline text-[11px] font-sans text-status-warning font-semibold tracking-wide flex items-center gap-1.5 mt-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-warning" />
                  <span>Climex ledger compiled: {getLogLastUpdated('ledger')}</span>
                </div>
              </div>

              {/* Right list of files/reports — Span 8 */}
              <div className="lg:col-span-8 border border-border-hairline border-t-2 border-t-status-warning rounded-3xl bg-surface-1 p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                  <div className="flex items-center gap-2">
                    {/* Master Checkbox to Toggle All */}
                    <button
                      onClick={() => {
                        const allLogIds = ['crypto', 'weather', 'aqi', 'currency'];
                        if (selectedLogs.length === allLogIds.length) {
                          setSelectedLogs([]);
                        } else {
                          setSelectedLogs(allLogIds);
                        }
                      }}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${selectedLogs.length === 4
                        ? 'bg-status-warning border-status-warning text-black'
                        : selectedLogs.length > 0
                          ? 'bg-status-warning/45 border-status-warning text-black'
                          : 'border-border-strong bg-surface-2 text-transparent'
                        }`}
                      title={selectedLogs.length === 4 ? "Deselect all logs" : "Select all logs"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        {selectedLogs.length === 4 ? (
                          <polyline points="20 6 9 17 4 12" />
                        ) : selectedLogs.length > 0 ? (
                          <line x1="5" y1="12" x2="19" y2="12" />
                        ) : null}
                      </svg>
                    </button>
                    <h3 className="font-sans font-semibold text-sm text-text-primary">Available Data Logs</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-surface-2 px-2.5 py-1 rounded-full text-text-secondary border border-border-hairline/40">
                    {selectedLogs.length} of 4 Selected
                  </span>
                </div>

                {/* Search and Filters Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search log sources..."
                      value={reportsSearchQuery}
                      onChange={(e) => setReportsSearchQuery(e.target.value)}
                      className="w-full bg-surface-2 border border-border-hairline rounded-full pl-9 pr-8 py-1.5 font-sans text-xs focus:outline-none focus:border-border-strong text-text-primary placeholder:text-text-muted"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                      <PhosphorIcon name="search" className="text-xs" />
                    </span>
                    {reportsSearchQuery && (
                      <button
                        onClick={() => setReportsSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5"
                      >
                        <PhosphorIcon name="x" className="text-[10px]" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-full border border-border-hairline/40 shrink-0">
                    {[
                      { value: 'all', label: 'All Logs' },
                      { value: 'selected', label: 'Selected' },
                      { value: 'unselected', label: 'Unselected' }
                    ].map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => setReportsFilter(btn.value as any)}
                        className={`px-3 py-1 rounded-full font-sans text-[10px] font-semibold transition-all cursor-pointer ${reportsFilter === btn.value
                          ? 'bg-status-warning text-black font-bold shadow-2xs'
                          : 'text-text-secondary hover:text-text-primary'
                          }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main List */}
                <div className="space-y-3 mt-1">
                  {(() => {
                    const reportsList = [
                      { id: 'crypto', label: 'Cryptocurrency Ticker Log', desc: 'Top tokens market price index.', size: '4.2 KB', format: 'CSV' },
                      { id: 'weather', label: 'Regional Weather Forecasts', desc: 'Forecast metrics for New York, London, Tokyo, and Sydney.', size: '5.8 KB', format: 'CSV' },
                      { id: 'aqi', label: 'Air Quality Index Logs', desc: 'Particulate matters (PM2.5, PM10) monitoring stats.', size: '3.1 KB', format: 'CSV' },
                      { id: 'currency', label: 'Historical Exchange Rates Log', desc: 'Daily historical FX rates for tracked currency pairs (e.g., EUR/USD, GBP/USD, AUD/USD).', size: '3.5 KB', format: 'CSV' }
                    ];

                    const filtered = reportsList.filter((r) => {
                      const matchesSearch = r.label.toLowerCase().includes(reportsSearchQuery.toLowerCase()) ||
                        r.desc.toLowerCase().includes(reportsSearchQuery.toLowerCase());
                      const isSelected = selectedLogs.includes(r.id);
                      const matchesFilter = reportsFilter === 'all' ||
                        (reportsFilter === 'selected' && isSelected) ||
                        (reportsFilter === 'unselected' && !isSelected);
                      return matchesSearch && matchesFilter;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 px-6 border border-dashed border-border-strong/40 rounded-2xl bg-surface-2/20 text-center flex flex-col items-center justify-center" id="reports-empty-state">
                          <div className="w-12 h-12 rounded-full bg-surface-2 border border-border-hairline flex items-center justify-center text-text-muted mb-4 shadow-2xs">
                            <PhosphorIcon name="file" className="text-xl" />
                          </div>
                          <h4 className="font-sans font-semibold text-xs text-text-primary mb-1">No Available Logs Found</h4>
                          <p className="text-[11px] text-text-secondary max-w-xs leading-relaxed mb-4">
                            {reportsSearchQuery || reportsFilter !== 'all'
                              ? "No log entries match your active search term or filter constraints."
                              : "No logs have been synchronized. Trigger a manual sync or clear filters."}
                          </p>
                          <div className="flex gap-2">
                            {(reportsSearchQuery || reportsFilter !== 'all') && (
                              <button
                                onClick={() => {
                                  setReportsSearchQuery('');
                                  setReportsFilter('all');
                                }}
                                className="px-3.5 py-1.5 bg-surface-2 border border-border-hairline hover:bg-surface-1 text-text-primary rounded-full font-sans font-semibold text-[10px] cursor-pointer transition-all"
                              >
                                Clear Search
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedLogs(['crypto', 'weather', 'aqi', 'currency']);
                                setReportsSearchQuery('');
                                setReportsFilter('all');
                                fetchDashboardData(true);
                              }}
                              className="px-3.5 py-1.5 bg-text-primary text-surface-1 hover:opacity-90 rounded-full font-sans font-bold text-[10px] cursor-pointer transition-all shadow-xs"
                            >
                              Sync Workspace
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return filtered.map((report) => {
                      const isSelected = selectedLogs.includes(report.id);
                      const isLogDownloading = exportingLogId === report.id;
                      const logError = logErrors[report.id];

                      return (
                        <div
                          key={report.id}
                          className={`p-4 rounded-2xl bg-surface-2 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isSelected
                            ? 'border-border-strong bg-surface-2/65 shadow-2xs'
                            : 'border-border-hairline/60 opacity-80'
                            } hover:border-status-warning/40`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => {
                                setSelectedLogs(prev =>
                                  prev.includes(report.id)
                                    ? prev.filter(id => id !== report.id)
                                    : [...prev, report.id]
                                );
                              }}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer mt-0.5 shrink-0 ${isSelected
                                ? 'bg-status-warning border-status-warning text-black'
                                : 'border-border-strong bg-surface-1 text-transparent hover:border-text-primary'
                                }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-sans font-semibold text-xs text-text-primary">{report.label}</p>
                                <span className="text-[8px] font-mono bg-surface-1 border border-border-strong/15 px-1.5 py-0.2 rounded font-semibold text-text-secondary">
                                  {report.format}
                                </span>
                              </div>
                              <p className="text-[10px] text-text-secondary mt-1 max-w-md">{report.desc}</p>

                              {/* Synchronized indicator in beautiful fresh success-green (solid non-pulsing dot) */}
                              <p className="text-[9px] font-sans text-text-secondary mt-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-status-success/70" />
                                <span>Synced: {getLogLastUpdated(report.id)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border-hairline/30 pt-3 sm:pt-0 shrink-0">
                            <span className="font-mono text-[10px] text-text-secondary tabular-nums">{report.size}</span>
                            <button
                              onClick={() => handleExportCSV(report.id)}
                              disabled={isLogDownloading}
                              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans font-bold text-[11px] shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer ${logError
                                ? 'bg-status-danger text-white hover:opacity-95'
                                : isLogDownloading
                                  ? 'bg-surface-1 text-text-muted cursor-not-allowed border border-border-hairline'
                                  : 'bg-text-primary text-surface-1 hover:opacity-90'
                                }`}
                            >
                              {isLogDownloading ? (
                                <>
                                  <div className="w-3 h-3 rounded-full border-2 border-text-muted/30 border-t-text-primary animate-spin shrink-0" />
                                  <span>preparing...</span>
                                </>
                              ) : logError ? (
                                <>
                                  <PhosphorIcon name="warning" className="text-xs shrink-0" />
                                  <span>Retry</span>
                                </>
                              ) : (
                                <>
                                  <PhosphorIcon name="download" className="text-xs shrink-0" />
                                  <span>Download</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 8: SETTINGS PAGE ==================== */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" id="settings-tab-view">

              {/* Left Column: Personalization — Span 5 */}
              <div className="lg:col-span-5 border border-border-hairline rounded-3xl bg-surface-1 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Identity</span>
                  <h3 className="font-sans font-semibold text-base text-text-primary mt-2 mb-1">Personalization</h3>
                  <p className="text-xs text-text-secondary mb-6">Manage how you are addressed across the workspace</p>

                  <div className="bg-surface-2 p-5 rounded-2xl border border-border-hairline/40 flex flex-col gap-4">
                    <div>
                      <label className="block font-sans font-semibold text-xs text-text-primary mb-1.5">Display name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full bg-surface-1 border border-border-hairline focus:border-text-primary rounded-full px-4 py-2 font-sans text-xs focus:outline-none transition-all text-text-primary"
                        value={userNameInput}
                        onChange={(e) => setUserNameInput(e.target.value)}
                      />
                      <p className="text-[10px] text-text-muted mt-2">
                        This name is used in your dashboard greetings (e.g. "Good morning, {userName || 'user'}").
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border-hairline/50">
                      <button
                        onClick={() => {
                          const trimmed = userNameInput.trim();
                          if (trimmed) {
                            localStorage.setItem('climex_user_name', trimmed);
                            setUserName(trimmed);
                          } else {
                            localStorage.removeItem('climex_user_name');
                            setUserName(null);
                          }
                        }}
                        className="px-5 py-2 bg-text-primary text-surface-1 hover:opacity-90 active:scale-98 text-xs font-sans font-semibold rounded-full transition-all duration-150 cursor-pointer text-center shadow-xs"
                      >
                        Save Changes
                      </button>
                      {userName && (
                        <button
                          onClick={() => {
                            localStorage.removeItem('climex_user_name');
                            setUserName(null);
                            setUserNameInput('');
                          }}
                          className="px-4 py-2 border border-border-hairline text-text-secondary hover:text-text-primary hover:bg-surface-1 text-xs font-sans font-semibold rounded-full transition-all duration-150 cursor-pointer text-center"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-surface-2 border border-border-hairline/40 p-4 rounded-2xl flex items-start gap-3 mt-6">
                  <PhosphorIcon name="info" className="text-base text-status-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-sans font-semibold text-xs text-text-primary">Single source of truth</h5>
                    <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">
                      Changing your display name here instantly syncs with local storage and updates your global greeting header across all active views.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Preferences — Span 7 */}
              <div className="lg:col-span-7 border border-border-hairline rounded-3xl bg-surface-1 p-6 shadow-sm flex flex-col gap-6">
                <div>
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Preferences</span>
                  <h3 className="font-sans font-semibold text-base text-text-primary mt-2 mb-1">Dashboard preferences</h3>
                  <p className="text-xs text-text-secondary">Customize your display formats and automated sync loops</p>
                </div>

                <div className="divide-y divide-border-hairline">
                  {/* Row 1: Update frequency */}
                  <div className="py-4 flex items-center justify-between gap-4 border-b border-border-hairline/40">
                    <div className="max-w-[70%]">
                      <p className="font-sans font-semibold text-xs text-text-primary">Update frequency</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">How often the dashboard data streams refresh automatically</p>
                    </div>
                    <select
                      value={updateFrequency}
                      onChange={(e) => {
                        setUpdateFrequency(e.target.value);
                        localStorage.setItem('climex_update_frequency', e.target.value);
                      }}
                      className="bg-surface-2 border border-border-hairline rounded-lg px-3 py-1.5 font-sans text-xs text-text-primary focus:outline-none focus:border-border-strong cursor-pointer"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="minute">Every minute</option>
                      <option value="5minutes">Every 5 minutes</option>
                    </select>
                  </div>

                  {/* Row 2: Temperature units */}
                  <div className="py-4 flex items-center justify-between gap-4 border-b border-border-hairline/40">
                    <div className="max-w-[70%]">
                      <p className="font-sans font-semibold text-xs text-text-primary">Temperature units</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">Choose Celsius or Fahrenheit for the weather panels</p>
                    </div>
                    <select
                      value={tempUnit}
                      onChange={(e) => {
                        setTempUnit(e.target.value);
                        localStorage.setItem('climex_temp_unit', e.target.value);
                      }}
                      className="bg-surface-2 border border-border-hairline rounded-lg px-3 py-1.5 font-sans text-xs text-text-primary focus:outline-none focus:border-border-strong cursor-pointer"
                    >
                      <option value="C">Celsius</option>
                      <option value="F">Fahrenheit</option>
                    </select>
                  </div>

                  {/* Row 3: Default currency */}
                  <div className="py-4 flex items-center justify-between gap-4 border-b border-border-hairline/40">
                    <div className="max-w-[70%]">
                      <p className="font-sans font-semibold text-xs text-text-primary">Default currency</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">The base currency for market indexes and financial metrics</p>
                    </div>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => {
                        setDefaultCurrency(e.target.value);
                        localStorage.setItem('climex_default_currency', e.target.value);
                      }}
                      className="bg-surface-2 border border-border-hairline rounded-lg px-3 py-1.5 font-sans text-xs text-text-primary focus:outline-none focus:border-border-strong cursor-pointer"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="PHP">PHP</option>
                    </select>
                  </div>

                  {/* Row 4: Price alerts */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="max-w-[70%]">
                      <p className="font-sans font-semibold text-xs text-text-primary">Price alerts</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">Receive alerts on rapid market spikes and volatile moves</p>
                    </div>
                    <button
                      onClick={() => {
                        const val = !priceAlerts;
                        setPriceAlerts(val);
                        localStorage.setItem('climex_price_alerts', String(val));
                      }}
                      className="flex items-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-[10px] uppercase transition-all duration-150 ${priceAlerts
                        ? 'bg-status-success-bg text-status-success'
                        : 'bg-surface-2 border border-border-hairline text-text-secondary'
                        }`}>
                        {priceAlerts ? 'On' : 'Off'}
                      </span>
                      {/* Standard Switch visual toggled */}
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${priceAlerts ? 'bg-status-success' : 'bg-surface-3'}`}>
                        <div className={`bg-surface-1 w-3 h-3 rounded-full shadow-xs transform transition-transform duration-200 ${priceAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 9: INTERNAL ADMIN VIEW ==================== */}
          {activeTab === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" id="admin-tab-view">

              {/* Left column info — Span 4 */}
              <div className="lg:col-span-4 border border-border-hairline rounded-3xl bg-surface-1 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-sans font-semibold text-sm text-text-primary mb-1">Climex Proxy Configuration</h3>
                  <p className="text-xs text-text-secondary mb-6">Centralized settings, caching, and credentials</p>

                  <div className="space-y-4 text-xs font-sans">
                    <div className="bg-surface-2 p-3 rounded-xl border border-border-hairline">
                      <p className="font-mono text-[9px] text-text-secondary uppercase">Proxy Host IP</p>
                      <p className="font-mono text-text-primary mt-0.5">0.0.0.0:3000 (Local Container Routing)</p>
                    </div>

                    <div className="bg-surface-2 p-3 rounded-xl border border-border-hairline">
                      <p className="font-mono text-[9px] text-text-secondary uppercase">SWR cache TTL</p>
                      <p className="text-text-primary font-medium mt-0.5">45s (Crypto) | 10m (Weather) | 1hr (Currency)</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary mt-8">
                  <PhosphorIcon name="hard-drive" className="text-sm text-status-accent" />
                  <span>Memory Cache Size: 320 KB</span>
                </div>
              </div>

              {/* Right column settings toggles — Span 8 */}
              <div className="lg:col-span-8 border border-border-hairline rounded-3xl bg-surface-1 p-6 shadow-sm flex flex-col gap-6">
                <h3 className="font-sans font-semibold text-sm text-text-primary border-b border-border-hairline pb-3">Feature Toggles</h3>

                <div className="space-y-4 text-xs">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between p-3.5 bg-surface-2 rounded-2xl border border-border-hairline/40">
                    <div>
                      <p className="font-sans font-semibold text-xs text-text-primary">Background Refresh Stream</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">Automatically query proxy nodes in SWR loop</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-status-success-bg text-status-success font-mono font-bold text-[10px] uppercase">
                      Active
                    </span>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between p-3.5 bg-surface-2 rounded-2xl border border-border-hairline/40">
                    <div>
                      <p className="font-sans font-semibold text-xs text-text-primary">Dynamic Offline Fallbacks</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">Serve high-fidelity dynamic mock indexes during network timeouts</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-status-success-bg text-status-success font-mono font-bold text-[10px] uppercase">
                      Enabled
                    </span>
                  </div>

                  {/* Toggle 3 */}
                  <div className="flex items-center justify-between p-3.5 bg-surface-2 rounded-2xl border border-border-hairline/40">
                    <div>
                      <p className="font-sans font-semibold text-xs text-text-primary">Rate-Limit Buffer</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">Restrict client poll drift requests within safe limits</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-status-accent-bg text-status-accent font-mono font-bold text-[10px] uppercase">
                      Strictest
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Footer branding */}
          <footer className="border-t border-border-hairline mt-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-text-secondary" id="climex-footer">
            <p>&copy; 2026 Climex. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:support@climex-analytics.com"
                className="hover:text-text-primary transition-colors flex items-center gap-1 font-sans font-medium"
              >
                Support & Resources
              </a>
              <span>•</span>
              <span className="font-sans font-medium text-[11px]">Climex Dashboard v1</span>
            </div>
          </footer>



        </main>
      )}
    </div>
  );
}
