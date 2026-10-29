/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ThemeToggle from './components/ThemeToggle';
import SplashView from './components/SplashView';
import MapPanel from './components/MapPanel';
import CalendarGrid from './components/CalendarGrid';
import { PriceTrendChart, CurrencyHistoryChart, CountryGrowthChart, AQITrendChart } from './components/MetricCharts';
import { SyncStatusWidget } from './components/SyncStatusWidget';
import StatusBadge, { StatusIcon, aqiTone } from './components/StatusBadge';
import { pathForTab, tabFromPath, isModifiedClick, NOT_FOUND_TAB } from './lib/routes';
import AlertsItem from './components/AlertsItem';
import DashboardPriceCard from './components/DashboardPriceCard';
import DashboardAirCard from './components/DashboardAirCard';
import PageSkeleton from './components/PageSkeleton';
import Freshness from './components/Freshness';
import Wordmark from './components/Wordmark';
import { loadDashboard, loadSavedDashboard, SECTIONS, type SectionKey, type SectionMeta } from './lib/offlineData';
import { FEATURES } from './lib/features';
import SearchHighlight, { SEARCH_GROUP_LABELS, SEARCH_SUGGESTIONS } from './components/SearchHighlight';
import { SettingsSection, SettingsRow, SettingsSelect, SettingsSwitch } from './components/SettingsControls';
import PrivacyPolicy from './components/PrivacyPolicy';
import AqiHealthGuidance, { AqiScaleBar, aqiShortLabel } from './components/AqiHealthGuidance';
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
  Bell,
  Database,
  CaretLeft,
  CaretRight,
  Pencil,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow
} from './components/Icon';

const PhosphorIcon = ({ name, className = "text-base", size = 16, weight = "regular" }: { name: string; className?: string; size?: number; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }) => {
  const norm = name.toLowerCase().trim();
  if (norm.includes('wind')) {
    return <Wind className={className} size={size} weight={weight} />;
  }
  if (norm.includes('chevron-right') || norm.includes('caret-right')) {
    return <CaretRight className={className} size={size} weight={weight} />;
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
  if (norm.includes('chevron-down') || norm.includes('caret-down')) {
    return <CaretDown className={className} size={size} weight={weight} />;
  }
  if (norm.includes('chevron-up') || norm.includes('caret-up')) {
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
  if (norm.includes('bell') || norm.includes('updates')) {
    return <Bell className={className} size={size} weight={weight} />;
  }
  if (norm.includes('warning') || norm.includes('alert')) {
    return <WarningCircle className={className} size={size} weight={weight} />;
  }
  // Fallbacks
  return <Info className={className} size={size} weight={weight} />;
};
// Navigation: Explore menu entries (desktop dropdown + mobile drawer) and mobile tab strip order
const EXPLORE_ITEMS = [
  { id: 'crypto', label: 'Crypto', icon: 'coin-stack', description: 'Prices and 24h moves for top coins' },
  { id: 'currency', label: 'Currency', icon: 'dollar', description: 'Exchange rates and a converter' },
  { id: 'weather', label: 'Weather', icon: 'cloud-sun', description: 'Conditions and 7-day forecasts' },
  { id: 'aqi', label: 'Air Quality', icon: 'globe', description: 'Pollutants and health guidance' },
  { id: 'countries', label: 'Countries', icon: 'landmark', description: 'Population and economic indicators' },
];
const MOBILE_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'updates', label: 'Updates' },
  ...EXPLORE_ITEMS.map(({ id, label }) => ({ id, label })),
  { id: 'reports', label: 'Reports' },
];

// Data type behind each page, for its "Data updated …" label
const PAGE_SECTION: Record<string, SectionKey | undefined> = {
  crypto: 'crypto',
  currency: 'currency',
  weather: 'weather',
  aqi: 'aqi',
  countries: 'countries',
};

// Page heading + one-line description shown in the header stripe for each tab
const PAGE_META: Record<string, { title: string; description: string }> = {
  updates: { title: 'Updates', description: 'Every alert and insight from markets, weather and air quality.' },
  notfound: { title: 'Page not found', description: 'That address doesn’t match a page in Climex.' },
  crypto: { title: 'Crypto', description: 'Live prices, 24h movement and trends for the top digital assets.' },
  weather: { title: 'Weather', description: 'Current conditions and the 7-day outlook for tracked cities.' },
  currency: { title: 'Currency', description: 'Convert between currencies and follow exchange-rate trends.' },
  aqi: { title: 'Air Quality', description: 'Pollutant levels and health guidance for monitored cities.' },
  countries: { title: 'Countries', description: 'Population, economy and growth indicators by country.' },
  reports: { title: 'Reports', description: 'Download data logs as CSV, one at a time or combined.' },
  settings: { title: 'Settings', description: 'Preferences for units, refresh rate and display.' },
  admin: { title: 'Admin', description: 'System status and data source configuration.' },
  privacy: { title: 'Privacy', description: 'How Climex handles your data.' },
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
        className={`rounded-full bg-accent-soft text-accent flex items-center justify-center font-mono font-bold text-[11.5px] uppercase shrink-0 ${className}`}
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
      <div className={`rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-[10.5px] text-zinc-500 uppercase ${className}`}>
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
  // The URL is the source of truth for the current page: "/" shows the splash, every other path a tab
  const launchedAsApp = window.location.pathname === '/' && new URLSearchParams(window.location.search).get('source') === 'pwa';
  if (launchedAsApp) window.history.replaceState({ tab: 'dashboard' }, '', pathForTab('dashboard'));
  const [showDashboard, setShowDashboard] = useState(() => launchedAsApp || tabFromPath(window.location.pathname) !== null);
  const [activeTab, setActiveTabState] = useState(() => tabFromPath(window.location.pathname) ?? 'dashboard');
  // Navigate to a page: update state and push its URL so refresh, back/forward and shared links work
  const setActiveTab = React.useCallback((tab: string) => {
    setActiveTabState(tab);
    setShowDashboard(true);
    const path = pathForTab(tab);
    if (window.location.pathname !== path) {
      window.history.pushState({ tab }, '', path);
      window.scrollTo({ top: 0 });
    }
  }, []);
  const [updatesSeverity, setUpdatesSeverity] = useState<'all' | 'needs-attention' | 'fyi'>('all');
  const [updatesCategory, setUpdatesCategory] = useState<'all' | 'crypto' | 'weather' | 'aqi' | 'currency'>('all');
  const [updatesLimit, setUpdatesLimit] = useState(20);
  const [dashMobileSection, setDashMobileSection] = useState<'watchlist' | 'alerts' | 'air'>('watchlist');
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1);
  const [searchRecent, setSearchRecent] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('climex_recent_searches') || '[]');
      return Array.isArray(parsed) ? parsed.filter((q): q is string => typeof q === 'string').slice(0, 5) : [];
    } catch {
      return [];
    }
  });
  const [settingsSection, setSettingsSection] = useState<'profile' | 'display' | 'data'>('profile');
  const [settingsSavedKey, setSettingsSavedKey] = useState<string | null>(null);
  const [countriesMobileSection, setCountriesMobileSection] = useState<'profile' | 'growth' | 'list'>('profile');
  const [countriesMobileShowAll, setCountriesMobileShowAll] = useState(false);
  const [weatherMobileSection, setWeatherMobileSection] = useState<'now' | 'forecast' | 'cities'>('now');
  const [aqiMobileSection, setAqiMobileSection] = useState<'overview' | 'pollutants' | 'history' | 'map'>('overview');
  const [aqiPollutantInfo, setAqiPollutantInfo] = useState<string>('pm25');
  const [currencyMobileSection, setCurrencyMobileSection] = useState<'trend' | 'pairs' | 'details'>('trend');
  const [savedBoot] = useState(loadSavedDashboard);
  const [data, setData] = useState<DashboardData | null>(savedBoot.data);
  const [sectionMeta, setSectionMeta] = useState<Partial<Record<SectionKey, SectionMeta>>>(savedBoot.meta);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false);
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
  // Alerts start from the copy saved on this device, so they're still there offline
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('climex-alerts-v1') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      if (alerts.length) localStorage.setItem('climex-alerts-v1', JSON.stringify(alerts.slice(0, 50)));
    } catch {
      // ignore storage errors
    }
  }, [alerts]);
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

  // Helper function to safely fetch and parse JSON API responses
  const safeApiFetch = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    if (!contentType.includes('application/json') && !text.trim().startsWith('{') && !text.trim().startsWith('[')) {
      throw new Error(`Received non-JSON content-type: "${contentType}" from ${url}`);
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse JSON response from ${url}`);
    }
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
      await safeApiFetch('/api/alerts/simulate', {
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
    const handleLocationRoute = () => {
      if (window.location.pathname === '/privacy') {
        setActiveTab('privacy');
      }
    };
    handleLocationRoute();
    window.addEventListener('popstate', handleLocationRoute);
    return () => window.removeEventListener('popstate', handleLocationRoute);
  }, []);

  const navigateToTab = (tab: string, path?: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (path) {
      window.history.pushState({}, '', path);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let fallbackPollInterval: any = null;
    let isMounted = true;

    const startFallbackPolling = () => {
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
      fallbackPollInterval = setInterval(async () => {
        try {
          const data = await safeApiFetch('/api/alerts');
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
        const data = await safeApiFetch('/api/alerts');
        if (isMounted && data && Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
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

  useEffect(() => {
    if (!FEATURES.appBadge || !('setAppBadge' in navigator)) return;
    const count = alerts.filter(a => a.severity === 'needs-attention').length;
    (count > 0 ? (navigator as any).setAppBadge(count) : (navigator as any).clearAppBadge?.())?.catch?.(() => undefined);
  }, [alerts]);

  // Browser back/forward: follow the URL
  React.useEffect(() => {
    const onPopState = () => {
      const tab = tabFromPath(window.location.pathname);
      if (tab === null) {
        setShowDashboard(false);
        return;
      }
      setActiveTabState(tab);
      setShowDashboard(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Tab title follows the current page
  React.useEffect(() => {
    document.title = !showDashboard
      ? 'Climex — Real-time market and climate dashboard'
      : `${activeTab === 'dashboard' ? 'Dashboard' : PAGE_META[activeTab]?.title ?? 'Page not found'} · Climex`;
  }, [activeTab, showDashboard]);

  // Keep the active mobile tab visible in the horizontally scrolling tab strip
  React.useEffect(() => {
    document.getElementById(`mobile-tab-${activeTab}`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeTab]);

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
        setMobileMenuOpen(false);
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

    // Results stay grouped by type (insertion order); cap each type so one group can't crowd out the others
    const searchPerType: Record<string, number> = {};
    return results
      .filter(r => {
        searchPerType[r.type] = (searchPerType[r.type] || 0) + 1;
        return searchPerType[r.type] <= 4;
      })
      .slice(0, 14);
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
    let savedGps: { lat: number; lon: number; city: string } | null = null;
    try {
      savedGps = JSON.parse(localStorage.getItem('climex_location_v1') || 'null');
    } catch {
      savedGps = null;
    }
    const useSavedGps = () => {
      if (!savedGps?.city) return false;
      const found = MONITORED_CITIES.find(c => c.city === savedGps!.city);
      rawSetSelectedCity(savedGps.city);
      if (found) setSelectedCountryCode(found.code);
      setLocationSource('gps');
      return true;
    };
    const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    // Offline, or relaunching the installed app: use the saved location instead of asking again
    if ((!navigator.onLine || isStandalone) && useSavedGps()) return;

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
          try {
            // Stored on this device only, rounded to ~1 km
            localStorage.setItem('climex_location_v1', JSON.stringify({
              lat: Math.round(latitude * 100) / 100,
              lon: Math.round(longitude * 100) / 100,
              city: closestCity.city,
              savedAt: Date.now(),
            }));
          } catch {
            // ignore storage errors
          }
        },
        (error) => {
          // Denied, timed out or offline: last saved location, then saved city, then the default (changeable via city search)
          if (useSavedGps()) return;
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
      if (useSavedGps()) return;
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
      // Each data type loads separately; anything that fails is shown from its saved copy
      const result = await loadDashboard();
      if (result.data) {
        setData(result.data);
        setSectionMeta(result.meta);
        const allLive = result.failed.length === 0;
        setLastSyncedTime(allLive ? new Date() : new Date(Math.min(...Object.values(result.meta).map(m => m!.fetchedAt))));
        setError(null);
      } else if (!data) {
        setError(result.failed.length ? `Couldn't load ${result.failed.join(', ')}` : 'An unknown server error occurred');
      }
      setFetchFailed(result.failed.length > 0);
    } catch (err) {
      console.error('Failed to fetch live dashboard statistics:', err);
      setFetchFailed(true);
      if (!data) setError(err instanceof Error ? err.message : 'An unknown server error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load fresh data once the dashboard opens (a saved copy may already be on screen)
  const initialFetchDone = React.useRef(false);
  useEffect(() => {
    if (showDashboard && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchDashboardData();
    }
  }, [showDashboard]);

  // Connectivity: show the offline banner, and refresh everything when the connection comes back
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      fetchDashboardData(true);
      safeApiFetch('/api/alerts')
        .then(res => res && Array.isArray(res.alerts) && setAlerts(res.alerts))
        .catch(() => undefined);
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

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
          setActiveTab('dashboard');
        }}
        onOpenPrivacy={() => setActiveTab('privacy')}
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

      {/* Main Header Nav */}
      {(() => {
        const exploreIds = EXPLORE_ITEMS.map(i => i.id);
        const goTo = (id: string) => {
          setActiveTab(id);
          setExploreDropdownOpen(false);
          setMobileMenuOpen(false);
          setGlobalSearchQuery('');
          setShowSearchResults(false);
        };
        const shortcutLabel = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
        // Real links: plain clicks navigate in-app, modified clicks (new tab/window) are left to the browser
        const linkTo = (id: string) => ({
          href: pathForTab(id),
          onClick: (e: React.MouseEvent) => {
            if (isModifiedClick(e)) return;
            e.preventDefault();
            goTo(id);
          },
        });
        const needsAttentionCount = alerts.filter(a => a.severity === 'needs-attention').length;

        // ---- Global search: results panel, keyboard navigation, recents ----
        const searchHasQuery = globalSearchQuery.trim().length > 0;
        const searchQuickLinks = [
          ...EXPLORE_ITEMS.map(i => ({ id: i.id, label: i.label, icon: i.icon, description: i.description })),
          { id: 'reports', label: 'Reports', icon: 'reports', description: 'Download data logs as CSV' },
        ];
        const searchRememberQuery = (q: string) => {
          const v = q.trim();
          if (!v) return;
          const next = [v, ...searchRecent.filter(r => r.toLowerCase() !== v.toLowerCase())].slice(0, 5);
          setSearchRecent(next);
          try { localStorage.setItem('climex_recent_searches', JSON.stringify(next)); } catch { /* storage unavailable */ }
        };
        const searchClearRecent = () => {
          setSearchRecent([]);
          setSearchActiveIndex(-1);
          try { localStorage.removeItem('climex_recent_searches'); } catch { /* storage unavailable */ }
        };
        const searchApplyQuery = (q: string) => {
          setGlobalSearchQuery(q);
          setShowSearchResults(true);
          setSearchActiveIndex(q.trim() ? 0 : -1);
        };
        const searchOnChange = (value: string) => {
          setGlobalSearchQuery(value);
          setShowSearchResults(true);
          setSearchActiveIndex(value.trim() ? 0 : -1);
        };
        // Flat list of keyboard-navigable entries, in the same order they are rendered
        const searchEntries = (onPick?: () => void): Array<{ key: string; run: () => void }> =>
          searchHasQuery
            ? matchedSearchResults.map(r => ({
                key: r.id,
                run: () => {
                  searchRememberQuery(globalSearchQuery);
                  r.action();
                  setSearchActiveIndex(-1);
                  onPick?.();
                },
              }))
            : [
                ...searchRecent.map(q => ({ key: `recent-${q}`, run: () => searchApplyQuery(q) })),
                ...searchQuickLinks.map(l => ({
                  key: `link-${l.id}`,
                  run: () => {
                    goTo(l.id);
                    setSearchActiveIndex(-1);
                    onPick?.();
                  },
                })),
              ];
        const searchKeyDown = (onPick?: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
          const entries = searchEntries(onPick);
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setShowSearchResults(true);
            if (entries.length === 0) return;
            const next = e.key === 'ArrowDown'
              ? (searchActiveIndex + 1) % entries.length
              : searchActiveIndex <= 0 ? entries.length - 1 : searchActiveIndex - 1;
            setSearchActiveIndex(next);
            document.getElementById(`search-option-${next}`)?.scrollIntoView({ block: 'nearest' });
          } else if (e.key === 'Enter') {
            const target = entries[searchActiveIndex] ?? (searchHasQuery ? entries[0] : undefined);
            if (target) {
              e.preventDefault();
              target.run();
            }
          }
        };
        const searchComboboxProps = {
          role: 'combobox' as const,
          'aria-expanded': showSearchResults,
          'aria-controls': 'global-search-listbox',
          'aria-autocomplete': 'list' as const,
          'aria-activedescendant': showSearchResults && searchActiveIndex >= 0 ? `search-option-${searchActiveIndex}` : undefined,
        };

        const searchResultsPanel = (variant: 'desktop' | 'mobile', onPick?: () => void) => {
          const entries = searchEntries(onPick);
          const isMobile = variant === 'mobile';
          const rowHeight = isMobile ? 'min-h-[52px]' : 'min-h-[44px]';
          const option = (idx: number, icon: string, title: React.ReactNode, subtitle?: React.ReactNode, trailing?: React.ReactNode) => (
            <button
              key={entries[idx]?.key ?? idx}
              id={`search-option-${idx}`}
              type="button"
              role="option"
              aria-selected={idx === searchActiveIndex}
              onMouseEnter={() => setSearchActiveIndex(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => entries[idx]?.run()}
              className={`flex items-center gap-3 w-full ${rowHeight} px-3 py-2 rounded-lg text-left cursor-pointer transition-colors aria-selected:bg-surface-2`}
            >
              <span className="w-9 h-9 rounded-lg bg-surface-2 text-text-secondary flex items-center justify-center shrink-0" aria-hidden="true">
                <PhosphorIcon name={icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-text-primary truncate">{title}</span>
                {subtitle && <span className="block text-[13px] text-text-muted leading-snug truncate">{subtitle}</span>}
              </span>
              {trailing ?? <PhosphorIcon name="caret-right" size={14} className="shrink-0 text-text-muted" />}
            </button>
          );
          const groupLabel = (label: string, right?: React.ReactNode) => (
            <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-1 text-[12.5px] font-semibold text-text-muted" role="presentation">
              <span>{label}</span>
              {right}
            </div>
          );
          const suggestionChips = (
            <div className="flex flex-wrap gap-2 px-3 pt-1 pb-2">
              {SEARCH_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => searchApplyQuery(s)}
                  className={`inline-flex items-center gap-1.5 ${isMobile ? 'h-10' : 'h-8'} px-3 rounded-full border border-border-hairline bg-surface-1 text-[13px] text-text-secondary hover:text-text-primary hover:bg-surface-2 cursor-pointer transition-colors`}
                >
                  <PhosphorIcon name="search" size={12} className="text-text-muted" />
                  {s}
                </button>
              ))}
            </div>
          );

          // Group results by type, keeping a flat index for keyboard navigation
          const groups: Array<{ type: string; items: Array<{ r: typeof matchedSearchResults[number]; idx: number }> }> = [];
          matchedSearchResults.forEach((r, idx) => {
            let g = groups.find(x => x.type === r.type);
            if (!g) {
              g = { type: r.type, items: [] };
              groups.push(g);
            }
            g.items.push({ r, idx });
          });

          let body: React.ReactNode;
          if (searchHasQuery && !data) {
            body = (
              <div className="px-4 py-8 text-center">
                <p className="text-[14px] font-medium text-text-primary">Loading data…</p>
                <p className="text-[13px] text-text-muted mt-1">Results will appear as soon as live data arrives.</p>
              </div>
            );
          } else if (searchHasQuery && matchedSearchResults.length === 0) {
            body = (
              <div className="py-6">
                <div className="px-4 text-center">
                  <span className="mx-auto w-10 h-10 rounded-full bg-surface-2 text-text-muted flex items-center justify-center">
                    <PhosphorIcon name="search" size={18} />
                  </span>
                  <p className="mt-3 text-[14px] font-medium text-text-primary break-words">No results for “{globalSearchQuery.trim()}”</p>
                  <p className="text-[13px] text-text-muted mt-1">Check the spelling, or try a coin, city, currency or country.</p>
                </div>
                <div className="mt-4">
                  {groupLabel('Try searching for')}
                  {suggestionChips}
                </div>
              </div>
            );
          } else if (searchHasQuery) {
            body = groups.map(g => (
              <div key={g.type} role="group" aria-label={SEARCH_GROUP_LABELS[g.type] ?? g.type}>
                {groupLabel(SEARCH_GROUP_LABELS[g.type] ?? g.type, <span className="font-normal tabular-nums">{g.items.length}</span>)}
                {g.items.map(({ r, idx }) =>
                  option(
                    idx,
                    r.icon,
                    <SearchHighlight text={r.title} query={globalSearchQuery} />,
                    <SearchHighlight text={r.subtitle} query={globalSearchQuery} />
                  )
                )}
              </div>
            ));
          } else {
            body = (
              <>
                {searchRecent.length > 0 && (
                  <div role="group" aria-label="Recent searches">
                    {groupLabel(
                      'Recent searches',
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={searchClearRecent}
                        className="font-medium text-text-secondary hover:text-text-primary cursor-pointer px-1 -mx-1 rounded"
                      >
                        Clear
                      </button>
                    )}
                    {searchRecent.map((q, i) => option(i, 'clock', q, undefined, <span className="text-[12.5px] text-text-muted shrink-0">Search</span>))}
                  </div>
                )}
                {searchRecent.length === 0 && (
                  <div>
                    {groupLabel('Try searching for')}
                    {suggestionChips}
                  </div>
                )}
                <div role="group" aria-label="Jump to">
                  {groupLabel('Jump to')}
                  {searchQuickLinks.map((l, i) => option(searchRecent.length + i, l.icon, l.label, l.description))}
                </div>
              </>
            );
          }

          return (
            <AnimatePresence>
              {showSearchResults && (
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isMobile ? 0 : 6 }}
                  transition={{ duration: 0.12 }}
                  id="global-search-listbox"
                  role="listbox"
                  aria-label="Search results"
                  className={
                    isMobile
                      ? 'absolute left-0 right-0 top-full h-[calc(100dvh-3.5rem)] bg-surface-1 border-t border-border-hairline overflow-y-auto overscroll-contain z-50 px-2 pb-6 flex flex-col'
                      : 'absolute top-full left-0 w-full min-w-[360px] mt-2 bg-surface-1 border border-border-hairline rounded-xl shadow-lg z-50 flex flex-col overflow-hidden'
                  }
                >
                  <div className={isMobile ? '' : 'max-h-[min(460px,70vh)] overflow-y-auto p-1.5'}>{body}</div>
                  {!isMobile && entries.length > 0 && (
                    <div className="flex items-center gap-3 px-3 py-2 border-t border-border-hairline bg-surface-2/60 text-[12px] text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <kbd className="h-5 min-w-5 px-1 inline-flex items-center justify-center rounded border border-border-hairline bg-surface-1 font-sans text-[12px]">↑</kbd>
                        <kbd className="h-5 min-w-5 px-1 inline-flex items-center justify-center rounded border border-border-hairline bg-surface-1 font-sans text-[12px]">↓</kbd>
                        to navigate
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <kbd className="h-5 px-1 inline-flex items-center justify-center rounded border border-border-hairline bg-surface-1 font-sans text-[12px]">Enter</kbd>
                        to open
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <kbd className="h-5 px-1 inline-flex items-center justify-center rounded border border-border-hairline bg-surface-1 font-sans text-[12px]">Esc</kbd>
                        to close
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          );
        };

        const navLink = (id: string, label: string, isActive: boolean, extra?: React.ReactNode, onClick?: () => void) => {
          const className = `relative h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-[14px] font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'}`;
          const body = (
            <>
              {label}
              {extra}
              {isActive && <span className="absolute left-3 right-3 -bottom-[14px] h-[2px] rounded-full bg-text-primary" aria-hidden="true" />}
            </>
          );
          return onClick ? (
            <button onClick={onClick} aria-current={isActive ? 'page' : undefined} className={className}>{body}</button>
          ) : (
            <a {...linkTo(id)} aria-current={isActive ? 'page' : undefined} className={className}>{body}</a>
          );
        };

        return (
          <>
            <header className="sticky top-0 z-30 h-14 md:h-16 border-b border-border-hairline bg-surface-0/90 backdrop-blur-md px-3 md:px-6 xl:px-10 flex justify-center w-full" id="climex-main-header">
              <div className="max-w-7xl xl:max-w-[1840px] w-full h-full flex items-center justify-between gap-3 md:gap-6 min-[1680px]:grid min-[1680px]:grid-cols-[minmax(0,1fr)_480px_minmax(0,1fr)]" id="climex-main-header-inner">
                {mobileSearchExpanded ? (
                  /* Mobile: full-width search */
                  <div ref={searchRef} className="flex items-center gap-2 w-full min-[1680px]:col-span-3">
                    <button
                      onClick={() => {
                        setMobileSearchExpanded(false);
                        setGlobalSearchQuery('');
                        setShowSearchResults(false);
                        setSearchActiveIndex(-1);
                      }}
                      className="btn btn-ghost btn-icon shrink-0 w-11 h-11"
                      aria-label="Close search"
                    >
                      <PhosphorIcon name="chevron-left" size={20} />
                    </button>
                    <div className="relative flex-1">
                      <PhosphorIcon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input
                        ref={mobileSearchInputRef}
                        type="search"
                        autoFocus
                        enterKeyHint="search"
                        placeholder="Search coins, cities, currencies…"
                        aria-label="Search"
                        {...searchComboboxProps}
                        className="w-full h-11 bg-surface-1 border border-border-hairline focus:border-border-strong focus:ring-4 focus:ring-accent/10 rounded-xl pl-10 pr-11 font-sans text-[16px] focus:outline-none transition-all text-text-primary placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden"
                        value={globalSearchQuery}
                        onChange={(e) => searchOnChange(e.target.value)}
                        onFocus={() => setShowSearchResults(true)}
                        onClick={() => setShowSearchResults(true)}
                        onKeyDown={searchKeyDown(() => setMobileSearchExpanded(false))}
                      />
                      {globalSearchQuery && (
                        <button
                          onClick={() => {
                            searchOnChange('');
                            mobileSearchInputRef.current?.focus();
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 cursor-pointer"
                          aria-label="Clear search"
                        >
                          <PhosphorIcon name="x" size={16} />
                        </button>
                      )}
                    </div>
                    {/* Results fill the screen under the header (positioned against the sticky header) */}
                    {searchResultsPanel('mobile', () => setMobileSearchExpanded(false))}
                  </div>
                ) : (
                  <>
                    {/* Left: logo + primary navigation */}
                    <div className="flex items-center gap-6 min-w-0">
                      <a
                        {...linkTo('dashboard')}
                        className="flex items-center gap-2 shrink-0 rounded-lg -ml-1 px-1 py-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        aria-label="Climex home"
                      >
                        <Wordmark className="h-[17px] md:h-[19px]" />
                      </a>

                      <nav className="hidden lg:flex items-center gap-1" id="desktop-primary-nav" aria-label="Primary">
                        {navLink('dashboard', 'Dashboard', activeTab === 'dashboard')}

                        <div
                          ref={exploreRef}
                          className="relative"
                          onMouseEnter={() => setExploreDropdownOpen(true)}
                          onMouseLeave={() => setExploreDropdownOpen(false)}
                        >
                          {navLink(
                            'explore',
                            'Explore',
                            exploreIds.includes(activeTab),
                            <PhosphorIcon name="chevron-down" size={14} className={`text-text-muted transition-transform duration-200 ${exploreDropdownOpen ? 'rotate-180' : ''}`} />,
                            () => setExploreDropdownOpen(!exploreDropdownOpen)
                          )}

                          <AnimatePresence>
                            {exploreDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.14, ease: 'easeOut' }}
                                className="absolute top-full left-0 pt-3 z-50"
                              >
                                <div className="w-[520px] bg-surface-1 border border-border-hairline rounded-xl shadow-lg overflow-hidden">
                                  <div className="grid grid-cols-2 gap-1 p-2">
                                    {EXPLORE_ITEMS.map(item => {
                                      const isActive = activeTab === item.id;
                                      return (
                                        <a
                                          key={item.id}
                                          {...linkTo(item.id)}
                                          aria-current={isActive ? 'page' : undefined}
                                          className={`flex items-start gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${isActive ? 'bg-surface-2' : 'hover:bg-surface-2'}`}
                                        >
                                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${isActive ? 'bg-surface-1 border-border-strong text-text-primary' : 'bg-surface-2 border-transparent text-text-secondary'}`}>
                                            <PhosphorIcon name={item.icon} size={18} />
                                          </span>
                                          <span className="min-w-0">
                                            <span className="block text-sm font-medium text-text-primary">{item.label}</span>
                                            <span className="block text-[13px] text-text-muted leading-snug mt-0.5">{item.description}</span>
                                          </span>
                                        </a>
                                      );
                                    })}
                                  </div>
                                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-surface-2/60 border-t border-border-hairline text-[12.5px] text-text-muted">
                                    <span>Live data from public market, weather and air-quality sources.</span>
                                    <StatusBadge tone="success" progress="complete" size="xs">Live</StatusBadge>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {navLink(
                          'updates',
                          'Updates',
                          activeTab === 'updates',
                          needsAttentionCount > 0 ? (
                            <StatusBadge tone="warning" progress={null} size="xs" className="tabular-nums" title={`${needsAttentionCount} need attention`}>{needsAttentionCount}</StatusBadge>
                          ) : undefined
                        )}
                        {navLink('reports', 'Reports', activeTab === 'reports')}
                      </nav>
                    </div>

                    {/* Center: search (tablet and up) */}
                    <div ref={searchRef} className="hidden md:block relative flex-1 max-w-[420px] ml-auto lg:flex-none lg:w-[300px] xl:w-[360px] min-[1680px]:w-full! min-[1680px]:max-w-none min-[1680px]:ml-0">
                      <PhosphorIcon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search coins, cities…"
                        aria-label="Search"
                        {...searchComboboxProps}
                        className="w-full h-9 bg-surface-1 border border-border-hairline hover:border-border-strong focus:border-border-strong focus:ring-4 focus:ring-accent/10 rounded-lg pl-9 pr-16 font-sans text-sm focus:outline-none transition-all text-text-primary placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden"
                        value={globalSearchQuery}
                        onChange={(e) => searchOnChange(e.target.value)}
                        onFocus={() => setShowSearchResults(true)}
                        onClick={() => setShowSearchResults(true)}
                        onKeyDown={searchKeyDown()}
                      />
                      {globalSearchQuery ? (
                        <button
                          onClick={() => {
                            searchOnChange('');
                            searchInputRef.current?.focus();
                          }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 cursor-pointer"
                          aria-label="Clear search"
                        >
                          <PhosphorIcon name="x" size={14} />
                        </button>
                      ) : (
                        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 inline-flex items-center rounded-md border border-border-hairline bg-surface-2 font-sans text-[12px] font-medium text-text-muted pointer-events-none select-none">
                          {shortcutLabel}
                        </kbd>
                      )}
                      {searchResultsPanel('desktop')}
                    </div>

                    {/* Right: utilities */}
                    <div className="flex items-center gap-1 shrink-0 min-[1680px]:justify-self-end">
                      <button
                        onClick={() => setMobileSearchExpanded(true)}
                        className="md:hidden btn btn-ghost btn-icon"
                        aria-label="Search"
                      >
                        <PhosphorIcon name="search" size={18} />
                      </button>
                      <div className="hidden md:flex">
                        <ThemeToggle />
                      </div>
                      <a
                        {...linkTo('settings')}
                        className={`hidden md:inline-flex btn btn-ghost btn-icon ${activeTab === 'settings' ? 'bg-surface-2 text-text-primary' : ''}`}
                        aria-label="Settings"
                        aria-current={activeTab === 'settings' ? 'page' : undefined}
                        title="Settings"
                      >
                        <PhosphorIcon name="cog" size={18} />
                      </a>
                      <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden btn btn-ghost btn-icon"
                        aria-label="Open menu"
                        aria-expanded={mobileMenuOpen}
                        id="mobile-menu-toggle-btn"
                      >
                        <PhosphorIcon name="menu" size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </header>

            {/* Mobile & tablet: underline tab strip */}
            <nav className="lg:hidden sticky top-14 md:top-16 z-20 w-full bg-surface-0/90 backdrop-blur-md border-b border-border-hairline" id="mobile-scrollable-nav" aria-label="Sections">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-2 md:px-5 touch-pan-x">
                {MOBILE_TABS.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <a
                      key={item.id}
                      id={`mobile-tab-${item.id}`}
                      {...linkTo(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative h-11 px-3 shrink-0 inline-flex items-center gap-1.5 text-[14px] font-medium whitespace-nowrap transition-colors cursor-pointer ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                      {item.label}
                      {item.id === 'updates' && needsAttentionCount > 0 && (
                        <StatusBadge tone="warning" progress={null} size="xs" className="tabular-nums">{needsAttentionCount}</StatusBadge>
                      )}
                      {isActive && <span className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full bg-text-primary" aria-hidden="true" />}
                    </a>
                  );
                })}
              </div>
            </nav>

            {/* Mobile & tablet: slide-in menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50" id="mobile-menu-dropdown" role="dialog" aria-modal="true" aria-label="Menu">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 bg-black/30"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <motion.aside
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween', duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-0 h-full w-[86%] max-w-[360px] bg-surface-1 border-l border-border-hairline shadow-xl flex flex-col"
                  >
                    <div className="h-14 px-4 flex items-center justify-between border-b border-border-hairline shrink-0">
                      <Wordmark className="h-[17px]" />
                      <button onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost btn-icon" aria-label="Close menu">
                        <PhosphorIcon name="x" size={18} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileSearchExpanded(true);
                        }}
                        className="w-full h-10 px-3 flex items-center gap-2 rounded-lg border border-border-hairline bg-surface-0 text-[15px] text-text-muted text-left cursor-pointer hover:border-border-strong transition-colors"
                      >
                        <PhosphorIcon name="search" size={16} />
                        Search coins, cities, currencies…
                      </button>

                      {[
                        { title: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'grid-alt' }, { id: 'updates', label: 'Updates', icon: 'bell' }, { id: 'reports', label: 'Reports', icon: 'file' }] },
                        { title: 'Explore', items: EXPLORE_ITEMS },
                        { title: 'Account', items: [{ id: 'settings', label: 'Settings', icon: 'cog' }, { id: 'privacy', label: 'Privacy', icon: 'info' }] },
                      ].map(section => (
                        <div key={section.title}>
                          <p className="eyebrow px-3 mb-1.5">{section.title}</p>
                          <div className="flex flex-col gap-0.5">
                            {section.items.map(item => {
                              const isActive = activeTab === item.id;
                              return (
                                <a
                                  key={item.id}
                                  {...linkTo(item.id)}
                                  className="list-row"
                                  aria-selected={isActive}
                                  aria-current={isActive ? 'page' : undefined}
                                >
                                  <PhosphorIcon name={item.icon} size={18} className={isActive ? 'text-text-primary' : 'text-text-muted'} />
                                  <span className={`text-[15px] ${isActive ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>{item.label}</span>
                                  {item.id === 'updates' && needsAttentionCount > 0 && (
                                    <StatusBadge tone="warning" progress={null} size="xs" className="ml-auto tabular-nums">{needsAttentionCount}</StatusBadge>
                                  )}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 py-3 border-t border-border-hairline flex items-center justify-between shrink-0">
                      <span className="text-sm font-medium text-text-secondary">Appearance</span>
                      <ThemeToggle />
                    </div>
                  </motion.aside>
                </div>
              )}
            </AnimatePresence>
          </>
        );
      })()}

      {/* Offline / failed-fetch banner */}
      {(isOffline || fetchFailed) && data && (
        <div className="w-full border-b border-border-hairline bg-surface-2/80" role="status" aria-live="polite" id="offline-banner">
          <div className="max-w-7xl xl:max-w-[1840px] mx-auto px-4 md:px-6 xl:px-10 min-h-10 py-2 flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-text-secondary min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-status-warning shrink-0" aria-hidden="true" />
              <span className="truncate">{isOffline ? 'Offline — showing last saved data' : 'Can’t reach Climex right now — showing last saved data'}</span>
            </span>
            {!isOffline && (
              <button onClick={() => fetchDashboardData(true)} disabled={refreshing} className="btn btn-ghost btn-sm -mr-2 shrink-0">
                {refreshing ? 'Retrying…' : 'Retry'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton & Error Tickers */}
      {error && !data && (
        <main className="flex-1 max-w-7xl xl:max-w-[1840px] w-full mx-auto p-4 md:p-6 xl:px-10 xl:py-5 flex flex-col justify-center items-center min-h-[60vh]" id="error-screen">
          <div className="w-12 h-12 rounded-full bg-status-danger-bg text-status-danger flex items-center justify-center mb-4">
            <PhosphorIcon name="error-circle" className="text-2xl" />
          </div>
          <h3 className="font-sans font-semibold text-base text-text-primary mb-2">Interrupted</h3>
          <p className="font-body text-xs text-text-secondary max-w-md text-center leading-relaxed mb-6">
            {error}. The server-side proxy proxies are currently unresponsive or rate-limited.
          </p>
          <button
            onClick={() => fetchDashboardData()}
            className="btn btn-primary"
          >
            Retry Connection
          </button>
        </main>
      )}

      {/* Main Content Pane (header stays mounted from the first paint; body is a skeleton until data arrives) */}
      {(data || (loading && !error)) && (
        <main className="flex-1 max-w-7xl xl:max-w-[1840px] w-full mx-auto p-4 md:p-6 xl:px-10 xl:py-5 z-10 relative flex flex-col gap-4 md:gap-6 xl:gap-5">

          {/* Header Greeting Stripe */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 md:border-b md:border-border-hairline md:pb-4 xl:pb-3" id="dashboard-welcome-stripe">
            <div className="min-w-0">
              {/* Breadcrumbs (hidden on the dashboard itself) */}
              {activeTab !== 'dashboard' && (
                <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 mb-2 text-[13px] font-sans text-text-muted select-none">
                  <a
                    href={pathForTab('dashboard')}
                    onClick={(e) => {
                      if (isModifiedClick(e)) return;
                      e.preventDefault();
                      setActiveTab('dashboard');
                      setGlobalSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="hover:text-text-primary hover:underline underline-offset-2 transition-colors cursor-pointer outline-none focus-visible:underline"
                  >
                    Dashboard
                  </a>
                  <PhosphorIcon name="caret-right" size={12} className="text-text-muted" />
                  {['crypto', 'currency', 'weather', 'aqi', 'countries'].includes(activeTab) && (
                    <>
                      <span>Explore</span>
                      <PhosphorIcon name="caret-right" size={12} className="text-text-muted" />
                    </>
                  )}
                  <span className="text-text-secondary font-medium" aria-current="page">{PAGE_META[activeTab]?.title ?? activeTab}</span>
                </nav>
              )}

              <h1 className="font-display font-normal text-2xl md:text-[32px] tracking-tight text-text-primary leading-tight">
                {activeTab === 'dashboard' ? (
                  <>
                    {getGreeting()}, <span className="font-medium">{userName || 'trader'}</span>
                  </>
                ) : (
                  PAGE_META[activeTab]?.title ?? activeTab
                )}
              </h1>
              <p className="mt-1 text-sm text-text-secondary max-w-2xl">
                {activeTab === 'dashboard'
                  ? 'Here’s what’s moving across markets, weather and air quality right now.'
                  : PAGE_META[activeTab]?.description}
              </p>
              {PAGE_SECTION[activeTab] && (
                <Freshness
                  fetchedAt={sectionMeta[PAGE_SECTION[activeTab]!]?.fetchedAt}
                  maxAgeMs={SECTIONS[PAGE_SECTION[activeTab]!].maxAgeMs}
                  now={currentTime.getTime()}
                  prefix="Data updated"
                  className="mt-1.5 text-[12.5px]"
                />
              )}
            </div>
            {/* Last Synced Clock */}
            <div className="hidden md:block">
              <SyncStatusWidget lastSynced={lastSyncedTime} currentTime={currentTime} />
            </div>
          </div>

          {!data ? (
            <PageSkeleton tab={activeTab} />
          ) : (
          <>
          {/* ==================== TAB 1: DASHBOARD HOME ==================== */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-4 md:gap-6 xl:gap-5 animate-fade-in" id="dashboard-tab-view">

              {/* KPI Strip */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 xl:gap-5" id="kpi-strip">
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
                  // Mobile: one short status line under the value; age only shown once data is stale
                  const kpiMeta = sectionMeta[kpi.tab as SectionKey];
                  const kpiStale = !!kpiMeta && currentTime.getTime() - kpiMeta.fetchedAt > SECTIONS[kpi.tab as SectionKey].maxAgeMs;
                  const mobileLabel = ({ crypto: 'Bitcoin', weather: 'Weather', currency: 'USD → EUR', aqi: 'Air quality' } as Record<string, string>)[kpi.tab];
                  const aqiLevel = activeAQI?.status === 'Unhealthy for Sensitive Groups' ? 'Sensitive groups' : activeAQI?.status;
                  const mobileStatus =
                    kpi.change !== null && kpi.change !== undefined ? (
                      <span className={`font-medium tabular-nums ${kpi.change >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                        {kpi.change >= 0 ? '▲' : '▼'} {Math.abs(kpi.change).toFixed(1)}%<span className="font-normal text-text-muted"> 24h</span>
                      </span>
                    ) : kpi.tab === 'weather' ? (
                      <span className="truncate"><span className="capitalize">{activeWeather?.condition?.toLowerCase()}</span><span className="text-text-muted"> · {selectedCity}</span></span>
                    ) : (
                      <span className="truncate">
                        <span className={`font-medium ${aqiTone(activeAQI?.status).tone === 'success' ? 'text-status-success' : aqiTone(activeAQI?.status).tone === 'critical' ? 'text-status-danger' : 'text-status-warning'}`}>{aqiLevel}</span>
                        <span className="text-text-muted"> · {selectedCity}</span>
                      </span>
                    );
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (kpi.tab) {
                          setActiveTab(kpi.tab);
                        }
                      }}
                      className="bg-surface-1 px-3.5 py-3 md:p-5 xl:px-5 xl:py-4 rounded-2xl flex flex-col justify-between md:min-h-[110px] xl:min-h-0 transition-all duration-200 hover:border-border-strong active:scale-[0.98] cursor-pointer border border-border-hairline shadow-xs"
                    >
                      {/* Mobile */}
                      <div className="md:hidden flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 text-text-secondary">
                          <PhosphorIcon name={iconName} size={14} className="shrink-0" />
                          <span className="text-[12.5px] font-medium truncate">{mobileLabel}</span>
                        </div>
                        <p className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-text-primary tabular-nums leading-none truncate">{kpi.value}</p>
                        <p className="mt-1.5 flex items-center gap-1 min-w-0 text-[12px] leading-tight text-text-secondary">
                          {mobileStatus}
                        </p>
                        {kpiStale && (
                          <Freshness fetchedAt={kpiMeta?.fetchedAt} maxAgeMs={SECTIONS[kpi.tab as SectionKey].maxAgeMs} now={currentTime.getTime()} prefix="" className="mt-1 text-[11px]" />
                        )}
                      </div>

                      {/* Tablet & desktop */}
                      <div className="hidden md:contents">
                      <div className="flex items-start justify-between gap-1.5 w-full">
                        <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                          <span className={`p-1 rounded-lg bg-surface-3 text-text-secondary ${kpi.textColor || ''} shrink-0`}>
                            <PhosphorIcon name={iconName} className="text-xs md:text-sm" />
                          </span>
                          <span className="text-[11.5px] md:text-[12.5px] font-sans font-semibold text-text-secondary leading-none truncate">
                            <span className="hidden md:inline">{kpi.title}</span>
                            <span className="inline md:hidden">{kpi.titleMobile}</span>
                          </span>
                        </div>
                        {kpi.change !== null && kpi.change !== undefined ? (
                          <StatusBadge tone={kpi.change >= 0 ? 'success' : 'critical'} progress={null} size="xs" className="tabular-nums">
                            <PhosphorIcon name={kpi.change >= 0 ? 'trending-up' : 'trending-down'} size={11} />
                            {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                          </StatusBadge>
                        ) : kpi.tab === 'aqi' && activeAQI ? (
                          <span className="hidden md:inline-flex">
                            <StatusBadge {...aqiTone(activeAQI.status)} size="xs">
                              {activeAQI.status === 'Unhealthy for Sensitive Groups' ? 'Sensitive' : activeAQI.status}
                            </StatusBadge>
                          </span>
                        ) : kpi.tab === 'weather' && activeWeather?.condition ? (
                          <StatusBadge tone="info" progress={null} size="xs" className="capitalize">
                            {activeWeather.condition}
                          </StatusBadge>
                        ) : null}
                      </div>
                      <div className="mt-2 md:mt-4 xl:mt-3">
                        <p className="font-sans font-semibold text-base md:text-[26px] tracking-[-0.02em] text-text-primary tabular-nums leading-none">
                          {kpi.value}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 md:mt-1.5 flex-wrap min-w-0">
                          <span className="text-[10.5px] md:text-[11.5px] font-sans text-text-muted font-medium truncate">
                            <span className="hidden md:inline">{kpi.unit}</span>
                            {kpi.unitMobile !== '' && (
                              <span className="inline md:hidden">{kpi.unitMobile || kpi.unit}</span>
                            )}
                          </span>
                          {kpi.showLocationBadge && (
                            <>
                              {locationSource === 'default' ? (
                                <span
                                  className="text-[10px] bg-surface-2 text-text-secondary px-1.5 py-0.2 rounded border border-border-hairline/35 font-sans font-medium cursor-help"
                                  title={`Showing ${selectedCity} — tap to change`}
                                >
                                  default
                                </span>
                              ) : locationSource === 'gps' ? (
                                <span
                                  className="text-[10px] bg-status-success-bg text-status-success px-1.5 py-0.2 rounded font-sans font-medium"
                                  title="Detected via your browser geolocation"
                                >
                                  GPS
                                </span>
                              ) : (
                                <span
                                  className="text-[10px] bg-status-info-bg text-status-info px-1.5 py-0.2 rounded font-sans font-medium"
                                  title="Saved in your profile preferences"
                                >
                                  profile
                                </span>
                              )}
                            </>
                          )}
                          <Freshness
                            fetchedAt={sectionMeta[kpi.tab as SectionKey]?.fetchedAt}
                            maxAgeMs={SECTIONS[kpi.tab as SectionKey].maxAgeMs}
                            now={currentTime.getTime()}
                            prefix=""
                            className="ml-auto text-[11px]"
                          />
                        </div>
                      </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              <div className="lg:hidden segmented segmented-full" role="group" aria-label="Dashboard sections">
                {([
                  ['watchlist', 'Watchlist'],
                  ['alerts', `Alerts${alerts.length ? ` (${alerts.length})` : ''}`],
                  ['air', 'Air quality'],
                ] as const).map(([id, label]) => (
                  <button key={id} aria-pressed={dashMobileSection === id} onClick={() => setDashMobileSection(id)}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 xl:gap-5">

                {/* Left Column (Timeline/Recent Updates) — Span 3 - order-3 on mobile */}
                <div className={`lg:col-span-3 flex-col order-3 lg:order-none lg:flex ${dashMobileSection === 'alerts' ? 'flex' : 'hidden'}`} id="dashboard-alerts-insights-panel">
                  {(() => {
                    const ALERTS_DESKTOP_LIMIT = 5;
                    const ALERTS_MOBILE_LIMIT = 3;
                    const visibleAlerts = isAlertsExpanded ? alerts : alerts.slice(0, ALERTS_DESKTOP_LIMIT);
                    const needsAttentionAll = alerts.filter(item => item.severity === 'needs-attention');
                    const fyiAll = alerts.filter(item => item.severity === 'fyi');
                    const needsAttentionGroup = visibleAlerts.filter(item => item.severity === 'needs-attention');
                    const fyiGroup = visibleAlerts.filter(item => item.severity === 'fyi');
                    // On mobile (collapsed) only the first few rows in display order are shown
                    const alertsMobileHidden = (displayIndex: number) =>
                      !isAlertsExpanded && displayIndex >= ALERTS_MOBILE_LIMIT;
                    const fyiMobileAllHidden = !isAlertsExpanded && fyiGroup.length > 0 && needsAttentionGroup.length >= ALERTS_MOBILE_LIMIT;
                    const toggleAlert = (id: string) => setExpandedAlerts(prev => ({ ...prev, [id]: !prev[id] }));

                    const groupHeader = (label: string, count: number, tone: 'warning' | 'info') => (
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-[13px] font-semibold text-text-secondary">{label}</h4>
                        <StatusBadge tone={count > 0 ? tone : 'neutral'} progress={null} size="xs" className="tabular-nums">{count}</StatusBadge>
                      </div>
                    );

                    return (
                      <section className="card flex flex-col lg:h-full" aria-labelledby="alerts-panel-title">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 px-4 md:px-5 pt-4 md:pt-5">
                          <div className="min-w-0">
                            <h3 id="alerts-panel-title" className="card-title">Alerts & insights</h3>
                            <p className="card-subtitle">
                              {alerts.length === 0
                                ? 'Signals from markets, weather and air quality'
                                : `${needsAttentionAll.length} need${needsAttentionAll.length === 1 ? 's' : ''} attention · ${fyiAll.length} update${fyiAll.length === 1 ? '' : 's'}`}
                            </p>
                          </div>
                          {wsStatus === 'connected' ? (
                            <StatusBadge tone="success" progress="complete">Live</StatusBadge>
                          ) : wsStatus === 'reconnecting' || wsStatus === 'connecting' ? (
                            <StatusBadge tone="attention" progress="partial">Reconnecting</StatusBadge>
                          ) : (
                            <StatusBadge tone="critical" progress="incomplete">Offline</StatusBadge>
                          )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-h-0 px-4 md:px-5 pt-3 pb-2">
                          {alerts.length === 0 ? (
                            <div className="flex items-start gap-3 py-4" id="alerts-empty-state">
                              <span className="w-8 h-8 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center shrink-0">
                                <PhosphorIcon name="check-circle" size={16} />
                              </span>
                              <div>
                                <p className="text-[14px] font-medium text-text-primary">All quiet</p>
                                <p className="text-[13px] text-text-secondary leading-relaxed mt-0.5">Nothing needs your attention. Price spikes, weather and air-quality changes will show up here.</p>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`flex flex-col gap-4 ${isAlertsExpanded ? 'max-h-[70vh] lg:max-h-[440px] overflow-y-auto pr-1 -mr-1' : ''}`}
                              id="alerts-scrollable-container"
                            >
                              {/* Needs attention group */}
                              <div id="alerts-needs-attention-group" className="flex flex-col">
                                {groupHeader('Needs attention', needsAttentionAll.length, 'warning')}
                                {needsAttentionGroup.length === 0 ? (
                                  <p className="flex items-center gap-2 py-2 text-[13px] text-text-secondary">
                                    <PhosphorIcon name="check-circle" size={16} className="text-status-success shrink-0" />
                                    Nothing needs your attention right now.
                                  </p>
                                ) : (
                                  <div className="flex flex-col divide-y divide-border-hairline">
                                    {needsAttentionGroup.map((item, idx) => (
                                      <React.Fragment key={item.id}>
                                        <AlertsItem
                                          item={item}
                                          tone="warning"
                                          icon={<PhosphorIcon name={item.icon} size={16} />}
                                          relativeTime={getRelativeTime(item.createdAt)}
                                          isExpanded={!!expandedAlerts[item.id]}
                                          isNew={newlyArrivedIds.has(item.id)}
                                          onToggle={() => toggleAlert(item.id)}
                                          mobileHidden={alertsMobileHidden(idx)}
                                        />
                                      </React.Fragment>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* For your information group */}
                              <div id="alerts-fyi-group" className={`flex-col ${fyiMobileAllHidden ? 'hidden md:flex' : 'flex'}`}>
                                {groupHeader('For your information', fyiAll.length, 'info')}
                                {fyiGroup.length === 0 ? (
                                  <p className="flex items-center gap-2 py-2 text-[13px] text-text-secondary">
                                    <PhosphorIcon name="info" size={16} className="text-text-muted shrink-0" />
                                    No new updates right now.
                                  </p>
                                ) : (
                                  <div className="flex flex-col divide-y divide-border-hairline">
                                    {fyiGroup.map((item, idx) => (
                                      <React.Fragment key={item.id}>
                                        <AlertsItem
                                          item={item}
                                          tone="info"
                                          icon={<PhosphorIcon name={item.icon} size={16} />}
                                          relativeTime={getRelativeTime(item.createdAt)}
                                          isExpanded={!!expandedAlerts[item.id]}
                                          isNew={newlyArrivedIds.has(item.id)}
                                          onToggle={() => toggleAlert(item.id)}
                                          mobileHidden={alertsMobileHidden(needsAttentionGroup.length + idx)}
                                        />
                                      </React.Fragment>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* View all / collapse (3 on mobile, 5 on desktop) */}
                          {alerts.length > ALERTS_MOBILE_LIMIT && (
                            <a
                              href={pathForTab('updates')}
                              onClick={(e) => {
                                if (isModifiedClick(e)) return;
                                e.preventDefault();
                                setActiveTab('updates');
                              }}
                              className={`btn btn-secondary w-full mt-3 h-11 md:h-9 ${alerts.length > ALERTS_DESKTOP_LIMIT ? '' : 'md:hidden'}`}
                              id="view-all-alerts-btn"
                            >
                              View all {alerts.length} in Updates
                              <PhosphorIcon name="caret-right" size={14} />
                            </a>
                          )}
                        </div>

                        {/* Footer: service status */}
                        <div className="mt-auto px-4 md:px-5 py-3 border-t border-border-hairline flex items-center justify-between gap-3 text-[12.5px] text-text-muted" id="system-status-footer">
                          <StatusBadge tone="success" progress="complete">All services operational</StatusBadge>
                          <span className="tabular-nums">{lastSyncedTime ? `Updated ${lastSyncedTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Updating…'}</span>
                        </div>
                      </section>
                    );
                  })()}
                </div>

                {/* Center Area (Search + Watchlist Table + Price Trend Chart) — Span 6 - order-1 on mobile */}
                <div className={`lg:col-span-6 flex-col gap-4 md:gap-6 order-1 lg:order-none lg:flex ${dashMobileSection === 'watchlist' ? 'flex' : 'hidden'}`}>

                  {/* Watchlist table card (List panel - no border, hairline row dividers) */}
                  <div className="p-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <div>
                        <h3 className="font-sans font-semibold text-sm text-text-primary tracking-tight">Market Watchlist</h3>
                        <p className="text-xs text-text-secondary">
                          Track real-time digital asset indices ·{' '}
                          <Freshness fetchedAt={sectionMeta.crypto?.fetchedAt} maxAgeMs={SECTIONS.crypto.maxAgeMs} now={currentTime.getTime()} />
                        </p>
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
                          <tr className="border-b border-border-hairline text-[12.5px] font-sans font-semibold text-text-muted">
                            <th className="pb-3">Asset Pair</th>
                            <th className="pb-3 text-right">Price</th>
                            <th className="pb-3 text-right">24h Change</th>
                            <th className="pb-3 text-center hidden sm:table-cell">Market Trend</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-sans divide-y divide-border-hairline">
                          {filteredCoins.slice(0, 4).map((coin, _i, rows) => {
                            const topMoverId = rows.reduce((best, c) => (Math.abs(c.change24h) > Math.abs(best.change24h) ? c : best), rows[0])?.id;
                            const isTopMover = coin.id === topMoverId && rows.length > 1;
                            return (
                            <tr key={coin.id} className="hover:bg-surface-2 cursor-pointer transition-colors" onClick={() => { setSelectedCoinId(coin.id); setActiveTab('crypto'); }}>
                              <td className="py-3 flex items-center gap-2.5">
                                <CryptoLogo symbol={coin.symbol} size={6} />
                                <div>
                                  <p className="font-semibold text-text-primary leading-tight flex items-center gap-1.5">
                                    {coin.name}
                                    {isTopMover && <StatusBadge tone="info" progress={null} size="xs">Top mover</StatusBadge>}
                                  </p>
                                  <p className="text-[11.5px] text-text-muted uppercase tracking-wide leading-tight mt-0.5">{coin.symbol}</p>
                                </div>
                              </td>
                              <td className="py-3 text-right font-mono font-medium text-text-primary tabular-nums">
                                {formatPrice(coin.price)}
                              </td>
                              <td className={`py-3 text-right font-mono font-semibold tabular-nums ${coin.change24h >= 0 ? 'text-status-success' : 'text-status-danger'
                                }`}>
                                {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                              </td>
                              <td className="py-3 text-center hidden sm:table-cell">
                                <StatusBadge tone={coin.change24h >= 0 ? 'success' : 'critical'} progress={coin.change24h >= 0 ? 'complete' : 'incomplete'}>
                                  {coin.change24h >= 0 ? 'Bullish' : 'Bearish'}
                                </StatusBadge>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 24h price card for the selected coin */}
                  {activeCoin && (
                    <DashboardPriceCard
                      coin={activeCoin}
                      format={(v) => formatPrice(v)}
                      logo={<CryptoLogo symbol={activeCoin.symbol} size={9} />}
                      updated={<Freshness fetchedAt={sectionMeta.crypto?.fetchedAt} maxAgeMs={SECTIONS.crypto.maxAgeMs} now={currentTime.getTime()} />}
                      href={pathForTab('crypto')}
                      onOpen={(e) => {
                        if (isModifiedClick(e)) return;
                        e.preventDefault();
                        setSelectedCoinId(activeCoin.id);
                        setActiveTab('crypto');
                      }}
                    />
                  )}

                </div>

                {/* Right Column (Global Snapshot Dark Card + Air Quality Gauge) — Span 3 - order-2 on mobile */}
                <div className={`lg:col-span-3 flex-col gap-4 md:gap-6 order-2 lg:order-none lg:flex ${dashMobileSection === 'air' ? 'flex' : 'hidden'}`}>

                  {/* Air quality summary for the selected city */}
                  {activeAQI && (
                    <DashboardAirCard
                      aqi={activeAQI}
                      href={pathForTab('aqi')}
                      onOpen={(e) => {
                        if (isModifiedClick(e)) return;
                        e.preventDefault();
                        setActiveTab('aqi');
                      }}
                      updated={<Freshness fetchedAt={sectionMeta.aqi?.fetchedAt} maxAgeMs={SECTIONS.aqi.maxAgeMs} now={currentTime.getTime()} />}
                    />
                  )}

                </div>

              </div>
            </div>
          )}

          {/* ==================== UPDATES (full alerts feed) ==================== */}
          {activeTab === 'updates' && (() => {
            const severityCounts = {
              all: alerts.length,
              'needs-attention': alerts.filter(a => a.severity === 'needs-attention').length,
              fyi: alerts.filter(a => a.severity === 'fyi').length,
            };
            const categories = [
              { id: 'all', label: 'All topics' },
              { id: 'crypto', label: 'Crypto' },
              { id: 'currency', label: 'Currency' },
              { id: 'weather', label: 'Weather' },
              { id: 'aqi', label: 'Air quality' },
            ] as const;
            const filtered = alerts
              .filter(a => updatesSeverity === 'all' || a.severity === updatesSeverity)
              .filter(a => updatesCategory === 'all' || a.category === updatesCategory)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const shown = filtered.slice(0, updatesLimit);

            // Group by calendar day: Today / Yesterday / date
            const dayLabel = (iso: string) => {
              const d = new Date(iso);
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);
              if (d.toDateString() === today.toDateString()) return 'Today';
              if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
              return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
            };
            const groups: { label: string; items: typeof shown }[] = [];
            shown.forEach(item => {
              const label = dayLabel(item.createdAt);
              const last = groups[groups.length - 1];
              if (last && last.label === label) last.items.push(item);
              else groups.push({ label, items: [item] });
            });

            return (
              <div className="flex flex-col gap-4 animate-fade-in" id="updates-tab-view">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="segmented segmented-full md:w-auto md:inline-flex" role="group" aria-label="Filter by importance">
                    {([
                      ['all', 'All', 'All'],
                      ['needs-attention', 'Attention', 'Needs attention'],
                      ['fyi', 'Info', 'For your info'],
                    ] as const).map(([id, shortLabel, label]) => (
                      <button key={id} aria-pressed={updatesSeverity === id} onClick={() => { setUpdatesSeverity(id); setUpdatesLimit(20); }} className="whitespace-nowrap md:flex-none md:px-3.5">
                        <span className="md:hidden">{shortLabel}</span>
                        <span className="hidden md:inline">{label}</span>{' '}
                        <span className="text-text-muted tabular-nums">{severityCounts[id]}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setUpdatesCategory(c.id); setUpdatesLimit(20); }}
                        aria-pressed={updatesCategory === c.id}
                        className={`h-9 px-3 shrink-0 rounded-lg text-[13px] font-medium border transition-colors cursor-pointer ${updatesCategory === c.id ? 'bg-text-primary text-surface-0 border-text-primary' : 'bg-surface-1 text-text-secondary border-border-hairline hover:border-border-strong hover:text-text-primary'}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feed */}
                <section className="card" aria-labelledby="updates-feed-title">
                  <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-b border-border-hairline">
                    <div className="min-w-0">
                      <h2 id="updates-feed-title" className="card-title">
                        {filtered.length} {filtered.length === 1 ? 'update' : 'updates'}
                      </h2>
                      <p className="card-subtitle">
                        {lastSyncedTime ? `Last checked ${lastSyncedTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Checking for updates…'}
                      </p>
                    </div>
                    {wsStatus === 'connected' ? (
                      <StatusBadge tone="success" progress="complete">Live</StatusBadge>
                    ) : wsStatus === 'reconnecting' || wsStatus === 'connecting' ? (
                      <StatusBadge tone="attention" progress="partial">Reconnecting</StatusBadge>
                    ) : (
                      <StatusBadge tone="critical" progress="incomplete">Offline</StatusBadge>
                    )}
                  </div>

                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center text-center gap-2 px-6 py-12">
                      <span className="w-10 h-10 rounded-full bg-status-success-bg text-status-success flex items-center justify-center">
                        <PhosphorIcon name="check-circle" size={20} />
                      </span>
                      <p className="text-[15px] font-medium text-text-primary">
                        {alerts.length === 0 ? 'All quiet for now' : 'No updates match these filters'}
                      </p>
                      <p className="text-[13px] text-text-secondary max-w-sm">
                        {alerts.length === 0
                          ? 'Price spikes, weather changes and air-quality shifts will appear here as they happen.'
                          : 'Try another topic or switch back to all updates.'}
                      </p>
                      {alerts.length > 0 && (
                        <button className="btn btn-secondary btn-sm mt-2" onClick={() => { setUpdatesSeverity('all'); setUpdatesCategory('all'); }}>
                          Clear filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 md:px-5 pb-2">
                      {groups.map(group => (
                        <div key={group.label}>
                          <p className="eyebrow pt-4 pb-1">{group.label}</p>
                          <div className="flex flex-col divide-y divide-border-hairline">
                            {group.items.map(item => (
                              <React.Fragment key={item.id}>
                                <AlertsItem
                                  item={item}
                                  tone={item.severity === 'needs-attention' ? 'warning' : 'info'}
                                  icon={<PhosphorIcon name={item.icon} size={16} />}
                                  relativeTime={getRelativeTime(item.createdAt)}
                                  isExpanded={!!expandedAlerts[item.id]}
                                  isNew={newlyArrivedIds.has(item.id)}
                                  onToggle={() => setExpandedAlerts(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                />
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                      {filtered.length > shown.length && (
                        <button className="btn btn-secondary w-full my-3 h-11 md:h-9" onClick={() => setUpdatesLimit(l => l + 20)}>
                          Show {Math.min(20, filtered.length - shown.length)} more
                        </button>
                      )}
                    </div>
                  )}
                </section>
              </div>
            );
          })()}

          {/* ==================== NOT FOUND ==================== */}
          {activeTab === NOT_FOUND_TAB && (
            <section className="card card-pad flex flex-col items-center text-center gap-3 py-14 animate-fade-in" id="not-found-view">
              <span className="w-12 h-12 rounded-full bg-surface-2 text-text-secondary flex items-center justify-center">
                <PhosphorIcon name="compass" size={22} />
              </span>
              <p className="text-[15px] font-medium text-text-primary">We couldn’t find {window.location.pathname}</p>
              <p className="text-[13px] text-text-secondary max-w-sm">The link may be old or mistyped. Head back to the dashboard or pick a page from the menu.</p>
              <button className="btn btn-primary mt-2" onClick={() => setActiveTab('dashboard')}>Go to dashboard</button>
            </section>
          )}

          {/* ==================== TAB 2: CRYPTO LIST ==================== */}
          {activeTab === 'crypto' && (() => {
            const sparkline = activeCoin?.sparkline || [];
            const highestPrice = sparkline.length > 0 ? Math.max(...sparkline) : (activeCoin?.price || 0);
            const lowestPrice = sparkline.length > 0 ? Math.min(...sparkline) : (activeCoin?.price || 0);
            const cryptoChange = activeCoin?.change24h || 0;
            const cryptoIsUp = cryptoChange >= 0;
            const cryptoChangeText = `${cryptoIsUp ? '▲' : '▼'} ${Math.abs(cryptoChange).toFixed(2)}%`;
            const cryptoAll = data.crypto || [];

            const movementSentence = cryptoIsUp
              ? `${activeCoin?.name || 'Bitcoin'} is up ${Math.abs(cryptoChange).toFixed(2)}% over the last 24 hours.`
              : `${activeCoin?.name || 'Bitcoin'} is down ${Math.abs(cryptoChange).toFixed(2)}% over the last 24 hours.`;

            const otherCoins = [...cryptoAll]
              .filter(c => c.id !== selectedCoinId)
              .sort((a, b) => b.change24h - a.change24h)
              .slice(0, 3);

            // One filtered + sorted list shared by the mobile Markets view and the desktop sidebar
            const cryptoQuery = cryptoSearch.trim().toLowerCase();
            const cryptoSorted = cryptoAll
              .filter(c => c.name.toLowerCase().includes(cryptoQuery) || c.symbol.toLowerCase().includes(cryptoQuery))
              .sort((a, b) => {
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
            const cryptoListLimit = 5;
            const cryptoMobileList = tabletLeaderboardExpanded ? cryptoSorted : cryptoSorted.slice(0, cryptoListLimit);

            const cryptoToggleSort = (field: 'rank' | 'price' | 'change') => {
              if (cryptoSortField === field) {
                setCryptoSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setCryptoSortField(field);
                setCryptoSortDirection(field === 'rank' ? 'asc' : 'desc');
              }
            };

            const cryptoTimeframes = [
              { id: '24h', label: '1D' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '1M' },
              { id: '1y', label: '1Y' },
            ] as const;

            const cryptoStats = [
              { label: 'Day high', value: formatPrice(highestPrice) },
              { label: 'Day low', value: formatPrice(lowestPrice) },
              { label: 'Market cap', value: formatLargeNumber(activeCoin?.marketCap || 0) },
              { label: 'Volume (24h)', value: formatLargeNumber(activeCoin?.volume24h || 0) },
            ];

            const renderCryptoTimeframes = (full: boolean) => (
              <div className={`segmented shrink-0 ${full ? 'segmented-full [&>button]:h-10' : ''}`} role="group" aria-label="Chart timeframe">
                {cryptoTimeframes.map(tf => (
                  <button key={tf.id} type="button" onClick={() => setChartTimeframe(tf.id)} aria-pressed={chartTimeframe === tf.id}>
                    {tf.label}
                  </button>
                ))}
              </div>
            );

            const renderCryptoSort = (mobile: boolean) => (
              <div className={`segmented segmented-full ${mobile ? '[&>button]:h-10' : ''}`} role="group" aria-label="Sort coins">
                {([['rank', 'Rank'], ['price', 'Price'], ['change', mobile ? '24h' : '24h change']] as const).map(([field, label]) => (
                  <button key={field} type="button" onClick={() => cryptoToggleSort(field)} aria-pressed={cryptoSortField === field}>
                    {label}{cryptoSortField === field ? (cryptoSortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                ))}
              </div>
            );

            const cryptoSearchField = (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <PhosphorIcon name="search" size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or symbol"
                  aria-label="Search coins"
                  value={cryptoSearch}
                  onChange={(e) => setCryptoSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-2 border border-border-hairline font-sans text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong focus:bg-surface-1 transition-colors"
                />
                {cryptoSearch && (
                  <button
                    type="button"
                    onClick={() => setCryptoSearch('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-3 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <PhosphorIcon name="x" size={14} />
                  </button>
                )}
              </div>
            );

            const cryptoEmpty = (
              <div className="py-10 px-4 flex flex-col items-center text-center gap-1.5">
                <span className="w-10 h-10 rounded-full bg-surface-2 inline-flex items-center justify-center text-text-muted mb-1">
                  <PhosphorIcon name="search" size={18} />
                </span>
                <p className="text-[14px] font-medium text-text-primary">No coins found</p>
                <p className="text-[13px] text-text-muted">Nothing matches "{cryptoSearch}".</p>
                <button type="button" onClick={() => setCryptoSearch('')} className="btn btn-secondary btn-sm mt-2">
                  Clear search
                </button>
              </div>
            );

            const renderCryptoRow = (coin: CryptoCoin, extraClass = '') => {
              const isSelected = coin.id === selectedCoinId;
              const up = coin.change24h >= 0;
              return (
                <button
                  type="button"
                  key={coin.id}
                  onClick={() => setSelectedCoinId(coin.id)}
                  className={`list-row min-h-[52px] ${extraClass}`}
                  aria-selected={isSelected}
                >
                  <span className="w-6 shrink-0 text-[13px] text-text-muted tabular-nums">{coin.rank}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-surface-2 shrink-0">
                    <CryptoLogo symbol={coin.symbol} size={8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-text-primary truncate">{coin.name}</p>
                    <p className="text-[12px] text-text-muted">{coin.symbol.toUpperCase()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-medium text-text-primary tabular-nums">{formatPrice(coin.price)}</p>
                    <p className={`text-[12px] font-medium tabular-nums ${up ? 'text-status-success' : 'text-status-danger'}`}>
                      {up ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                    </p>
                  </div>
                </button>
              );
            };

            return (
              <div className="w-full mx-auto md:p-3 animate-slide-up" id="crypto-tab-view">

                {/* ==================== MOBILE LAYOUT (< 768px) ==================== */}
                {/* Hero (coin + price + 24h change) stays on top; sections switch below so each view is ~1 screen */}
                <div className="flex md:hidden flex-col gap-3 max-w-[480px] mx-auto">

                  {/* Selected coin hero */}
                  <section className="card px-4 py-3.5" aria-label="Selected coin">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-surface-2 shrink-0">
                        <CryptoLogo symbol={activeCoin?.symbol || ''} size={8} />
                      </div>
                      <h2 className="flex-1 min-w-0 text-[15px] font-semibold text-text-primary leading-tight truncate">
                        {activeCoin?.name} <span className="font-normal text-text-muted">{activeCoin?.symbol?.toUpperCase()}</span>
                      </h2>
                      <StatusBadge tone="neutral" progress={null} size="xs">#{activeCoin?.rank}</StatusBadge>
                    </div>
                    <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1 mt-2.5">
                      <p className="text-[30px] font-semibold tracking-[-0.03em] leading-none text-text-primary tabular-nums">{formatPrice(activeCoin?.price)}</p>
                      <span className="flex items-center gap-1.5 pb-0.5">
                        <StatusBadge tone={cryptoIsUp ? 'success' : 'critical'} progress={null} size="sm">{cryptoChangeText}</StatusBadge>
                        <span className="text-[12.5px] text-text-muted">24h</span>
                      </span>
                    </div>
                  </section>

                  {/* In-page section switcher */}
                  <div className="segmented segmented-full [&>button]:h-10" role="group" aria-label="Crypto sections" id="crypto-segmented-control-mobile">
                    {([['overview', 'Overview'], ['chart', 'Chart'], ['leaderboard', 'Markets']] as const).map(([tab, label]) => (
                      <button key={tab} type="button" role="tab" onClick={() => setCryptoSubTab(tab)} aria-pressed={cryptoSubTab === tab} aria-selected={cryptoSubTab === tab}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* VIEW: OVERVIEW */}
                  {cryptoSubTab === 'overview' && (
                    <div className="flex flex-col gap-3" id="crypto-tab-overview-mobile">
                      <dl className="card grid grid-cols-2 overflow-hidden [&>div]:border-border-hairline [&>div:nth-child(even)]:border-l [&>div:nth-child(n+3)]:border-t">
                        {cryptoStats.map(s => (
                          <div key={s.label} className="px-4 py-3 min-w-0">
                            <dt className="text-[12.5px] text-text-muted">{s.label}</dt>
                            <dd className="text-[16px] font-semibold text-text-primary tabular-nums mt-0.5 truncate">{s.value}</dd>
                          </div>
                        ))}
                      </dl>

                      <section className="card card-pad">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="card-title">Top movers</h3>
                          <button type="button" onClick={() => setCryptoSubTab('leaderboard')} className="btn btn-ghost btn-sm -mr-2">
                            All markets
                            <PhosphorIcon name="chevron-right" size={14} />
                          </button>
                        </div>
                        <div className="flex flex-col -mx-2">
                          {otherCoins.map(coin => renderCryptoRow(coin))}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* VIEW: CHART */}
                  {cryptoSubTab === 'chart' && (
                    <section className="card card-pad flex flex-col gap-3" id="crypto-tab-chart-mobile">
                      {renderCryptoTimeframes(true)}
                      <PriceTrendChart
                        data={sparkline}
                        name={activeCoin?.name || 'Ticker'}
                        height="h-[180px]"
                        timeframe={chartTimeframe}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-surface-2 px-3 py-2.5 min-w-0">
                          <p className="stat-label">High</p>
                          <p className="text-[15px] font-semibold text-text-primary tabular-nums truncate mt-0.5">{formatPrice(highestPrice)}</p>
                        </div>
                        <div className="rounded-lg bg-surface-2 px-3 py-2.5 min-w-0">
                          <p className="stat-label">Low</p>
                          <p className="text-[15px] font-semibold text-text-primary tabular-nums truncate mt-0.5">{formatPrice(lowestPrice)}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleExportCSV('crypto')} className="btn btn-secondary w-full h-10">
                        <PhosphorIcon name="download" size={15} />
                        Export CSV
                      </button>
                    </section>
                  )}

                  {/* VIEW: MARKETS */}
                  {cryptoSubTab === 'leaderboard' && (
                    <section className="card card-pad flex flex-col gap-3" id="crypto-tab-leaderboard-mobile">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="card-title">Markets</h3>
                        <StatusBadge tone="neutral" progress={null}>{cryptoAll.length} coins</StatusBadge>
                      </div>
                      {cryptoSearchField}
                      {renderCryptoSort(true)}
                      <div className="flex flex-col -mx-2">
                        {cryptoSorted.length === 0 ? cryptoEmpty : cryptoMobileList.map(coin => renderCryptoRow(coin))}
                      </div>
                      {cryptoSorted.length > cryptoListLimit && (
                        <button type="button" onClick={() => setTabletLeaderboardExpanded(prev => !prev)} className="btn btn-secondary w-full h-10">
                          {tabletLeaderboardExpanded ? 'Show fewer' : `Show all ${cryptoSorted.length}`}
                        </button>
                      )}
                    </section>
                  )}
                </div>

                {/* ==================== TABLET & DESKTOP LAYOUT (>= 768px) ==================== */}
                <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">

                  {/* Main column: hero + chart */}
                  <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">

                    {/* Selected coin hero */}
                    <section className="card card-pad" aria-label="Selected coin">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-surface-2 shrink-0">
                            <CryptoLogo symbol={activeCoin?.symbol || ''} size={11} />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-[17px] font-semibold text-text-primary leading-tight truncate">
                              {activeCoin?.name} <span className="text-[15px] font-normal text-text-muted">{activeCoin?.symbol?.toUpperCase()}</span>
                            </h2>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <StatusBadge tone="neutral" progress={null} size="xs">Rank #{activeCoin?.rank}</StatusBadge>
                              {activeCoin?.tags?.map(tag => (
                                <React.Fragment key={tag}><StatusBadge tone="info" progress={null} size="xs">{tag}</StatusBadge></React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleExportCSV('crypto')} className="btn btn-secondary shrink-0">
                          <PhosphorIcon name="download" size={15} />
                          Export CSV
                        </button>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="stat-hero">{formatPrice(activeCoin?.price)}</span>
                        <StatusBadge tone={cryptoIsUp ? 'success' : 'critical'} progress={null} size="md">{cryptoChangeText}</StatusBadge>
                        <span className="text-[13px] text-text-muted">past 24h</span>
                      </div>
                      <p className="card-subtitle mt-2">{movementSentence}</p>

                      <dl className="mt-5 pt-4 border-t border-border-hairline grid grid-cols-2 md:grid-cols-4 gap-4">
                        {cryptoStats.map(s => (
                          <div key={s.label} className="min-w-0">
                            <dt className="stat-label">{s.label}</dt>
                            <dd className="stat-value mt-1 truncate">{s.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>

                    {/* Price chart */}
                    <section className="card card-pad">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                          <h3 className="card-title">Price history</h3>
                          <p className="card-subtitle">{activeCoin?.name} in {defaultCurrency}</p>
                        </div>
                        {renderCryptoTimeframes(false)}
                      </div>
                      <PriceTrendChart
                        data={sparkline}
                        name={activeCoin?.name || 'Ticker'}
                        height="h-[240px] lg:h-[300px]"
                        timeframe={chartTimeframe}
                      />
                    </section>
                  </div>

                  {/* Markets list: sidebar on desktop, full-width card (top 5 + expand) on tablet */}
                  <aside className="lg:col-span-4 lg:sticky lg:top-4 card card-pad flex flex-col gap-3 lg:max-h-[calc(100vh-140px)] lg:min-h-[480px]" aria-label="Markets">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="card-title">Markets</h3>
                      <StatusBadge tone="neutral" progress={null}>{cryptoAll.length} coins</StatusBadge>
                    </div>
                    {cryptoSearchField}
                    {renderCryptoSort(false)}
                    <div className="flex flex-col -mx-2 px-0.5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
                      {cryptoSorted.length === 0
                        ? cryptoEmpty
                        : cryptoSorted.map((coin, idx) => renderCryptoRow(coin, !tabletLeaderboardExpanded && idx >= cryptoListLimit ? 'hidden lg:flex' : ''))}
                    </div>
                    {cryptoSorted.length > cryptoListLimit && (
                      <button type="button" onClick={() => setTabletLeaderboardExpanded(prev => !prev)} className="btn btn-secondary w-full lg:hidden">
                        {tabletLeaderboardExpanded ? 'Show fewer' : `Show all ${cryptoSorted.length}`}
                      </button>
                    )}
                  </aside>

                </div>

              </div>
            );
          })()}

          {/* ==================== TAB 3: WEATHER DETAILS ==================== */}
          {activeTab === 'weather' && (() => {
            const weatherList = data.weather || [];
            const weatherToday = activeWeather?.forecast?.[0];
            const weatherDeg = (c: number) => tempUnit === 'F' ? `${Math.round((c * 9) / 5 + 32)}°` : `${Math.round(c)}°`;
            const weatherSelect = (city: string) => {
              setSelectedCity(city);
              setSelectedCountryCode(MONITORED_CITIES.find(c => c.city === city)?.code || 'US');
            };
            const weatherFiltered = weatherList.filter(w =>
              w.city.toLowerCase().includes(weatherSearch.toLowerCase()) ||
              w.country.toLowerCase().includes(weatherSearch.toLowerCase())
            );
            const weatherPct = (n: number | undefined) => Math.min(100, Math.max(0, ((n || 0) / 30) * 100));

            if (!activeWeather) {
              return (
                <div className="card card-pad py-12 flex flex-col items-center text-center animate-slide-up" id="weather-empty-state">
                  <span className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted">
                    <PhosphorIcon name="cloud-sun" size={24} className="" />
                  </span>
                  <p className="card-title mt-3">Weather data is loading</p>
                  <p className="card-subtitle max-w-xs">Current conditions and forecasts for monitored cities will appear here shortly.</p>
                </div>
              );
            }

            const weatherStatTiles = [
              { label: 'Humidity', value: `${activeWeather.humidity}%`, pct: activeWeather.humidity, bar: 'bg-status-info' },
              { label: 'Wind', value: `${activeWeather.windSpeed} km/h`, pct: null as number | null, bar: '' },
              { label: 'Rainy days / month', value: `${activeWeather.rainfallDays} ${activeWeather.rainfallDays === 1 ? 'day' : 'days'}`, pct: weatherPct(activeWeather.rainfallDays), bar: 'bg-status-info' },
              { label: 'Volatile days / month', value: `${activeWeather.volatilityDays} ${activeWeather.volatilityDays === 1 ? 'day' : 'days'}`, pct: weatherPct(activeWeather.volatilityDays), bar: 'bg-status-indigo' },
            ];

            return (
            <>
              {/* ===== MOBILE (< 768px): hero + in-page section switcher ===== */}
              <div className="md:hidden flex flex-col gap-3 animate-slide-up" id="weather-tab-mobile">
                {/* Hero: city, temperature, condition — always first screen */}
                <section className="card card-pad" id="weather-mobile-detail-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="eyebrow">Current conditions</p>
                      <h2 className="text-[17px] font-semibold tracking-tight text-text-primary mt-1 truncate">
                        {activeWeather.city}<span className="font-normal text-text-secondary">, {activeWeather.country}</span>
                      </h2>
                    </div>
                    <button
                      onClick={() => setMobileLocationsOpen(true)}
                      className="btn btn-secondary btn-sm h-10 shrink-0"
                      id="weather-locations-trigger-mobile"
                      aria-label={`Change city (${weatherList.length} cities)`}
                    >
                      <Compass size={15} />
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-3">
                    <div className="min-w-0">
                      <p className="stat-hero text-[44px]">{formatTemp(activeWeather.temp)}</p>
                      <p className="text-[15px] font-medium text-text-primary mt-1">{activeWeather.condition}</p>
                      <p className="text-[13px] text-text-secondary mt-0.5">Feels like {formatTemp(activeWeather.feelsLike)}</p>
                    </div>
                    <span className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center shrink-0 [&>svg]:size-9" aria-hidden="true">
                      {getWeatherIcon(activeWeather.weatherCode)}
                    </span>
                  </div>

                  <dl className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border-hairline">
                    <div>
                      <dt className="text-[12px] text-text-muted">High / Low</dt>
                      <dd className="text-[15px] font-semibold text-text-primary tabular-nums">
                        {weatherToday ? `${weatherDeg(weatherToday.tempMax)} / ${weatherDeg(weatherToday.tempMin)}` : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-text-muted">Humidity</dt>
                      <dd className="text-[15px] font-semibold text-text-primary tabular-nums">{activeWeather.humidity}%</dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-text-muted">Wind</dt>
                      <dd className="text-[15px] font-semibold text-text-primary tabular-nums">{activeWeather.windSpeed} km/h</dd>
                    </div>
                  </dl>
                </section>

                {/* Section switcher */}
                <div className="segmented segmented-full" role="group" aria-label="Weather sections">
                  <button aria-pressed={weatherMobileSection === 'now'} onClick={() => setWeatherMobileSection('now')}>Now</button>
                  <button aria-pressed={weatherMobileSection === 'forecast'} onClick={() => setWeatherMobileSection('forecast')}>7-day</button>
                  <button aria-pressed={weatherMobileSection === 'cities'} onClick={() => setWeatherMobileSection('cities')}>Cities</button>
                </div>

                {weatherMobileSection === 'now' && (
                  <div className="flex flex-col gap-3 animate-fade-in" id="weather-mobile-now">
                    {/* Next days preview */}
                    {(activeWeather.forecast || []).length > 1 && (
                      <section className="card card-pad" id="weather-mobile-next-days">
                        <div className="flex items-center justify-between">
                          <h3 className="card-title">Next few days</h3>
                          <button onClick={() => setWeatherMobileSection('forecast')} className="btn btn-ghost btn-sm h-10 -mr-2">
                            See 7-day
                            <PhosphorIcon name="caret-right" size={14} className="" />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {(activeWeather.forecast || []).slice(1, 5).map((day) => (
                            <div key={day.date} className="rounded-xl bg-surface-2 py-2.5 flex flex-col items-center gap-1">
                              <span className="text-[12px] font-medium text-text-secondary">{day.date.substring(0, 3)}</span>
                              {getWeatherIcon(day.weatherCode)}
                              <span className="text-[13px] font-semibold text-text-primary tabular-nums">
                                {weatherDeg(day.tempMax)}<span className="font-normal text-text-muted"> {weatherDeg(day.tempMin)}</span>
                              </span>
                              {day.alert && <span className="w-1.5 h-1.5 rounded-full bg-status-warning" title={day.alert} />}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Monthly climate */}
                    <section className="card card-pad" id="weather-mobile-climate-stats">
                      <h3 className="card-title">Monthly climate</h3>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {weatherStatTiles.slice(2).map((s) => (
                          <div key={s.label} className="rounded-xl bg-surface-2 p-3">
                            <p className="text-[12px] text-text-muted leading-tight">{s.label}</p>
                            <p className="text-[15px] font-semibold text-text-primary tabular-nums mt-1">{s.value}</p>
                            <div className="w-full bg-surface-3 h-1 rounded-full overflow-hidden mt-2">
                              <div className={`${s.bar} h-full rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[12px] text-text-muted mt-3 tabular-nums">
                        {activeWeather.lat?.toFixed(2)}°, {activeWeather.lon?.toFixed(2)}°{activeWeather.timezone ? ` · ${activeWeather.timezone}` : ''}
                      </p>
                      <button
                        onClick={() => handleExportCSV('weather')}
                        className="btn btn-secondary w-full h-10 mt-3"
                      >
                        <Download size={15} />
                        Export region CSV
                      </button>
                    </section>
                  </div>
                )}

                {weatherMobileSection === 'forecast' && (
                  <div className="animate-fade-in" id="weather-mobile-forecast-container">
                    <CalendarGrid variant="list" forecast={activeWeather.forecast || []} formatDeg={weatherDeg} />
                  </div>
                )}

                {weatherMobileSection === 'cities' && (
                  <section className="card card-pad animate-fade-in" id="weather-mobile-cities">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="card-title">Cities</h3>
                        <p className="card-subtitle">{weatherList.length} monitored locations</p>
                      </div>
                      <button onClick={() => setMobileLocationsOpen(true)} className="btn btn-secondary btn-icon h-10 w-10" aria-label="Search cities">
                        <MagnifyingGlass size={16} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2 -mx-1">
                      {weatherList.slice(0, 5).map((w) => {
                        const isSelected = w.city.toLowerCase() === selectedCity.toLowerCase();
                        return (
                          <button
                            key={w.city}
                            onClick={() => weatherSelect(w.city)}
                            className="list-row justify-between min-h-12"
                            aria-selected={isSelected}
                          >
                            <span className="min-w-0">
                              <span className="block text-[14px] font-medium text-text-primary truncate">{w.city}</span>
                              <span className="block text-[12px] text-text-muted truncate">{w.condition}</span>
                            </span>
                            <span className="text-[15px] font-semibold text-text-primary tabular-nums shrink-0">{formatTemp(w.temp)}</span>
                          </button>
                        );
                      })}
                    </div>
                    {weatherList.length > 5 && (
                      <button onClick={() => setMobileLocationsOpen(true)} className="btn btn-ghost w-full h-10 mt-1">
                        Show all {weatherList.length} cities
                      </button>
                    )}
                  </section>
                )}
              </div>

              {/* ===== TABLET & DESKTOP (>= 768px) ===== */}
              <div className="hidden md:grid grid-cols-12 gap-6 animate-slide-up" id="weather-tab-view">

                {/* Locations list */}
                <aside className="col-span-4 lg:col-span-3 card card-pad flex flex-col gap-2 self-start" aria-label="Locations">
                  <div className="flex items-center justify-between gap-2 min-h-9">
                    {weatherSearchDesktopOpen ? (
                      <div className="flex items-center gap-2 w-full animate-fade-in">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Search locations"
                            value={weatherSearch}
                            onChange={(e) => setWeatherSearch(e.target.value)}
                            className="w-full h-9 pl-8 pr-7 rounded-lg bg-surface-2 border border-border-hairline text-[14px] focus:outline-none focus:border-border-strong text-text-primary"
                            autoFocus
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                            <MagnifyingGlass size={14} />
                          </span>
                          {weatherSearch && (
                            <button
                              onClick={() => setWeatherSearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5"
                              aria-label="Clear search"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setWeatherSearchDesktopOpen(false);
                            setWeatherSearch('');
                          }}
                          className="btn btn-ghost btn-sm shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="card-title">Locations</h3>
                          <p className="card-subtitle">{weatherList.length} cities</p>
                        </div>
                        <button
                          onClick={() => setWeatherSearchDesktopOpen(true)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Search locations"
                          aria-label="Search locations"
                          id="weather-search-btn-desktop"
                        >
                          <MagnifyingGlass size={16} />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 max-h-[560px] overflow-y-auto scroll-fade -mx-1 px-1 pb-4">
                    {weatherFiltered.length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-[14px] font-medium text-text-primary">No matches</p>
                        <p className="text-[13px] text-text-muted mt-0.5">No locations match "{weatherSearch}"</p>
                      </div>
                    ) : weatherFiltered.map((w) => {
                      const isSelected = w.city.toLowerCase() === selectedCity.toLowerCase();
                      return (
                        <div
                          key={w.city}
                          onClick={() => weatherSelect(w.city)}
                          className="list-row justify-between" aria-selected={isSelected}
                        >
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-text-primary truncate">{w.city}</p>
                            <p className="text-[12px] text-text-muted truncate">{w.country}</p>
                          </div>
                          <span className="text-[14px] font-semibold text-text-primary tabular-nums shrink-0">{formatTemp(w.temp)}</span>
                        </div>
                      );
                    })}
                  </div>
                </aside>

                {/* Detail column */}
                <div className="col-span-8 lg:col-span-9 flex flex-col gap-6 min-w-0">

                  {/* Current conditions hero */}
                  <section className="card card-pad md:p-6" id="weather-current-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="eyebrow">Current conditions</p>
                        <h2 className="text-2xl font-semibold tracking-tight text-text-primary mt-1 truncate">
                          {activeWeather.city}<span className="font-normal text-text-secondary">, {activeWeather.country}</span>
                        </h2>
                        <p className="text-[13px] text-text-muted mt-0.5 tabular-nums">
                          {activeWeather.lat?.toFixed(2)}°, {activeWeather.lon?.toFixed(2)}°{activeWeather.timezone ? ` · ${activeWeather.timezone}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleExportCSV('weather')}
                        className="btn btn-secondary btn-sm shrink-0"
                      >
                        <PhosphorIcon name="download" size={15} className="" />
                        Export CSV
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6">
                      <span className="w-[72px] h-[72px] rounded-2xl bg-surface-2 flex items-center justify-center shrink-0 [&>svg]:size-10" aria-hidden="true">
                        {getWeatherIcon(activeWeather.weatherCode)}
                      </span>
                      <p className="text-6xl font-semibold tracking-[-0.03em] text-text-primary leading-none tabular-nums">
                        {formatTemp(activeWeather.temp)}
                      </p>
                      <div>
                        <p className="text-lg font-medium text-text-primary leading-tight">{activeWeather.condition}</p>
                        <p className="text-[14px] text-text-secondary mt-1">Feels like {formatTemp(activeWeather.feelsLike)}</p>
                        {weatherToday && (
                          <p className="text-[14px] text-text-secondary tabular-nums">
                            High {weatherDeg(weatherToday.tempMax)} · Low {weatherDeg(weatherToday.tempMin)}
                          </p>
                        )}
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6" id="weather-climate-stats">
                      {weatherStatTiles.map((s) => (
                        <div key={s.label} className="rounded-xl bg-surface-2 p-3.5">
                          <dt className="stat-label">{s.label}</dt>
                          <dd className="stat-value mt-1">{s.value}</dd>
                          {s.pct !== null ? (
                            <div className="w-full bg-surface-3 h-1 rounded-full overflow-hidden mt-2.5" aria-hidden="true">
                              <div className={`${s.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${s.pct}%` }} />
                            </div>
                          ) : (
                            <div className="h-1 mt-2.5" aria-hidden="true" />
                          )}
                        </div>
                      ))}
                    </dl>
                  </section>

                  {/* 7-day forecast strip */}
                  <CalendarGrid forecast={activeWeather.forecast || []} formatDeg={weatherDeg} />
                </div>
              </div>

              {/* OVERLAY BOTTOM SHEET (mobile city picker) */}
              <AnimatePresence>
                {mobileLocationsOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMobileLocationsOpen(false)}
                      className="fixed inset-0 bg-black/45 z-50 pointer-events-auto"
                      id="weather-mobile-backdrop"
                    />

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
                      className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-surface-1 border-t border-border-hairline rounded-t-[24px] z-50 flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
                      id="weather-mobile-bottom-sheet"
                      role="dialog"
                      aria-label="Select city"
                    >
                      <div className="w-10 h-1 bg-border-strong/40 rounded-full mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing" />

                      <div className="flex flex-col flex-1 px-4 pb-8 overflow-hidden">
                        <div className="flex items-center justify-between pb-3 shrink-0">
                          <div>
                            <h3 className="card-title">Select city</h3>
                            <p className="card-subtitle">{weatherList.length} monitored locations</p>
                          </div>
                          <button
                            onClick={() => setMobileLocationsOpen(false)}
                            className="btn btn-secondary btn-icon h-10 w-10 rounded-full shrink-0"
                            aria-label="Close"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="relative mb-3 shrink-0">
                          <input
                            type="text"
                            placeholder="Search cities"
                            value={weatherSearch}
                            onChange={(e) => setWeatherSearch(e.target.value)}
                            className="w-full h-11 pl-9 pr-9 rounded-xl bg-surface-2 border border-border-hairline text-[15px] focus:outline-none focus:border-border-strong text-text-primary"
                            autoFocus
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                            <MagnifyingGlass size={16} />
                          </span>
                          {weatherSearch && (
                            <button
                              onClick={() => setWeatherSearch('')}
                              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary cursor-pointer"
                              aria-label="Clear search"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 -mx-1 px-1">
                          {weatherFiltered.length === 0 ? (
                            <div className="py-10 text-center">
                              <p className="text-[14px] font-medium text-text-primary">No matches</p>
                              <p className="text-[13px] text-text-muted mt-0.5">No locations match "{weatherSearch}"</p>
                            </div>
                          ) : weatherFiltered.map((w) => {
                            const isSelected = w.city.toLowerCase() === selectedCity.toLowerCase();
                            return (
                              <div
                                key={w.city}
                                onClick={() => {
                                  weatherSelect(w.city);
                                  setMobileLocationsOpen(false);
                                }}
                                className="list-row justify-between min-h-12"
                                aria-selected={isSelected}
                              >
                                <div className="min-w-0">
                                  <p className="text-[14px] font-medium text-text-primary truncate">{w.city}</p>
                                  <p className="text-[12px] text-text-muted truncate">{w.country} · {w.condition}</p>
                                </div>
                                <span className="text-[15px] font-semibold text-text-primary tabular-nums shrink-0">{formatTemp(w.temp)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
            );
          })()}

          {/* ==================== TAB 4: CURRENCY DETAIL ==================== */}
          {activeTab === 'currency' && (() => {
            const currencyRate = getCrossRate(fromCurrency, toCurrency);
            const currencyAmountNum = parseFloat(conversionAmount);
            const currencyConverted = isNaN(currencyAmountNum) || currencyAmountNum < 0 ? 0 : currencyAmountNum * currencyRate;
            const currencyConvertedText = currencyConverted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const currencyChange = activeCurrency?.change24h ?? 0;
            const currencyIsUp = currencyChange >= 0;
            const currencyChangeText = `${currencyIsUp ? '▲' : '▼'} ${Math.abs(currencyChange).toFixed(2)}%`;
            const currencyPairMatches = activeCurrency?.base === fromCurrency && activeCurrency?.target === toCurrency;
            const currencyVolatility = activeCurrency?.volatility ?? 0;
            const currencyVolTone: 'success' | 'attention' | 'warning' = currencyVolatility < 30 ? 'success' : currencyVolatility < 60 ? 'attention' : 'warning';
            const currencyVolLabel = currencyVolatility < 30 ? 'Low' : currencyVolatility < 60 ? 'Moderate' : 'High';
            const currencyPairLabel = activeCurrency ? `${activeCurrency.base} to ${activeCurrency.target}` : 'Exchange rate';
            const currencyListLimit = 5;

            const currencySetFrom = (val: string) => {
              setFromCurrency(val);
              const matched = data?.currency?.find(c => c.base === val && c.target === toCurrency);
              if (matched) {
                setSelectedCurrencyId(matched.id);
              }
            };
            const currencySetTo = (val: string) => {
              setToCurrency(val);
              const matched = data?.currency?.find(c => c.base === fromCurrency && c.target === val);
              if (matched) {
                setSelectedCurrencyId(matched.id);
              }
            };
            const currencySwap = () => {
              const temp = fromCurrency;
              setFromCurrency(toCurrency);
              setToCurrency(temp);
              const matched = data?.currency?.find(c => c.base === toCurrency && c.target === temp);
              if (matched) {
                setSelectedCurrencyId(matched.id);
              }
            };
            // Picking a pair also loads it into the converter so the hero, chart and details agree
            const currencySelectPair = (c: CurrencyPair) => {
              setSelectedCurrencyId(c.id);
              setFromCurrency(c.base);
              setToCurrency(c.target);
            };

            const currencySelectCls = "h-11 w-full min-w-0 rounded-lg bg-surface-2 border border-border-hairline px-3 text-[15px] font-semibold text-text-primary focus:outline-none focus:border-border-strong focus:bg-surface-1 cursor-pointer";

            const currencyAmountField = (
              <label className="flex flex-col gap-1.5">
                <span className="stat-label">Amount</span>
                <div className="relative">
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
                    className="h-11 w-full rounded-lg bg-surface-2 border border-border-hairline pl-3 pr-14 text-[17px] font-medium text-text-primary tabular-nums focus:outline-none focus:border-border-strong focus:bg-surface-1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-text-muted pointer-events-none">{fromCurrency}</span>
                </div>
              </label>
            );

            const currencyPairFields = (
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
                <label className="flex flex-col gap-1.5 min-w-0">
                  <span className="stat-label flex items-center gap-1.5">
                    <CountryFlag code={getCurrencyFlagCode(fromCurrency)} className="w-5 h-3.5 rounded-xs object-cover" />
                    From
                  </span>
                  <select value={fromCurrency} onChange={(e) => currencySetFrom(e.target.value)} className={currencySelectCls}>
                    {supportedCurrencies.map(cur => (
                      <option key={cur} value={cur} className="bg-surface-1 text-text-primary">{cur}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={currencySwap}
                  className="btn btn-secondary btn-icon h-11 w-11"
                  title="Swap currencies"
                  aria-label="Swap currencies"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                </button>
                <label className="flex flex-col gap-1.5 min-w-0">
                  <span className="stat-label flex items-center gap-1.5">
                    <CountryFlag code={getCurrencyFlagCode(toCurrency)} className="w-5 h-3.5 rounded-xs object-cover" />
                    To
                  </span>
                  <select value={toCurrency} onChange={(e) => currencySetTo(e.target.value)} className={currencySelectCls}>
                    {supportedCurrencies.map(cur => (
                      <option key={cur} value={cur} className="bg-surface-1 text-text-primary">{cur}</option>
                    ))}
                  </select>
                </label>
              </div>
            );

            const currencyResult = (
              <div className="min-w-0">
                <p className="stat-label">{conversionAmount || '0'} {fromCurrency} equals</p>
                <p className="stat-hero mt-1.5 break-words">
                  {currencyConvertedText} <span className="text-[20px] md:text-[24px] font-semibold text-text-secondary tracking-normal">{toCurrency}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[13px] text-text-muted tabular-nums">1 {fromCurrency} = {currencyRate.toFixed(4)} {toCurrency}</span>
                  {currencyPairMatches && (
                    <StatusBadge tone={currencyIsUp ? 'success' : 'critical'} progress={null}>{currencyChangeText} 24h</StatusBadge>
                  )}
                </div>
              </div>
            );

            const currencySearchField = (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <MagnifyingGlass size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search pairs, e.g. EUR"
                  aria-label="Search currency pairs"
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-2 border border-border-hairline font-sans text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong focus:bg-surface-1 transition-colors"
                />
                {currencySearch && (
                  <button
                    type="button"
                    onClick={() => setCurrencySearch('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-3 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );

            const currencyEmpty = (
              <div className="py-10 px-4 flex flex-col items-center text-center gap-1.5">
                <span className="w-10 h-10 rounded-full bg-surface-2 inline-flex items-center justify-center text-text-muted mb-1">
                  <MagnifyingGlass size={18} />
                </span>
                <p className="text-[14px] font-medium text-text-primary">No pairs found</p>
                <p className="text-[13px] text-text-muted">Nothing matches "{currencySearch}".</p>
                <button type="button" onClick={() => setCurrencySearch('')} className="btn btn-secondary btn-sm mt-2">
                  Clear search
                </button>
              </div>
            );

            const renderCurrencyRow = (c: CurrencyPair, onPick: () => void) => {
              const up = c.change24h >= 0;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={onPick}
                  className="list-row min-h-[52px]"
                  aria-selected={c.id === selectedCurrencyId}
                >
                  <div className="flex -space-x-1.5 shrink-0">
                    <CountryFlag code={getCurrencyFlagCode(c.base)} className="w-6 h-4 rounded-xs object-cover border border-surface-1" />
                    <CountryFlag code={getCurrencyFlagCode(c.target)} className="w-6 h-4 rounded-xs object-cover border border-surface-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-text-primary truncate">{c.base} to {c.target}</p>
                    <p className="text-[12px] text-text-muted">Volume {(c.volume / 1e6).toFixed(0)}M</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-medium text-text-primary tabular-nums">{c.rate.toFixed(4)}</p>
                    <p className={`text-[12px] font-medium tabular-nums ${up ? 'text-status-success' : 'text-status-danger'}`}>
                      {up ? '▲' : '▼'} {Math.abs(c.change24h).toFixed(2)}%
                    </p>
                  </div>
                </button>
              );
            };

            const currencyTrendHeader = (
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex -space-x-1.5 shrink-0">
                    <CountryFlag code={getCurrencyFlagCode(activeCurrency?.base || 'USD')} className="w-6 h-4 rounded-xs object-cover border border-surface-1" />
                    <CountryFlag code={getCurrencyFlagCode(activeCurrency?.target || 'EUR')} className="w-6 h-4 rounded-xs object-cover border border-surface-1" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="card-title truncate">{currencyPairLabel}</h3>
                    <p className="card-subtitle">Last 7 days · now {activeCurrency?.rate?.toFixed(4)}</p>
                  </div>
                </div>
                <StatusBadge tone={currencyIsUp ? 'success' : 'critical'} progress={null}>{currencyChangeText}</StatusBadge>
              </div>
            );

            const currencyDetails = (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="min-w-0">
                  <dt className="stat-label">Base</dt>
                  <dd className="flex items-center gap-2 mt-1 min-w-0">
                    <CountryFlag code={getCurrencyFlagCode(activeCurrency?.base || 'USD')} className="w-5 h-3.5 rounded-xs object-cover shrink-0" />
                    <span className="text-[14px] font-semibold text-text-primary">{activeCurrency?.base}</span>
                  </dd>
                  <dd className="text-[13px] text-text-muted truncate">{getCurrencyFullName(activeCurrency?.base || 'USD')}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="stat-label">Target</dt>
                  <dd className="flex items-center gap-2 mt-1 min-w-0">
                    <CountryFlag code={getCurrencyFlagCode(activeCurrency?.target || 'EUR')} className="w-5 h-3.5 rounded-xs object-cover shrink-0" />
                    <span className="text-[14px] font-semibold text-text-primary">{activeCurrency?.target}</span>
                  </dd>
                  <dd className="text-[13px] text-text-muted truncate">{getCurrencyFullName(activeCurrency?.target || 'EUR')}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="flex items-center justify-between gap-2">
                    <span className="stat-label">Volatility index</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-text-primary tabular-nums">{currencyVolatility}%</span>
                      <StatusBadge tone={currencyVolTone} progress={null} size="xs">{currencyVolLabel}</StatusBadge>
                    </span>
                  </dt>
                  <dd className="mt-2 w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-status-indigo h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, currencyVolatility))}%` }} />
                  </dd>
                </div>
              </dl>
            );

            return (
            <>
              {/* ==================== MOBILE LAYOUT (< 768px) ==================== */}
              {/* Converter result stays on top; Trend / Pairs / Details switch below it */}
              <div className="flex md:hidden flex-col gap-3 w-full max-w-[480px] mx-auto animate-slide-up" id="currency-tab-mobile">
                <section className="card px-4 py-3.5 flex flex-col gap-2.5" id="currency-mobile-detail-card" aria-label="Currency converter">
                  {/* From · swap · To, with flags inside the pickers */}
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    {([['From', fromCurrency, currencySetFrom], ['To', toCurrency, currencySetTo]] as const).map(([label, value, onChange], i) => (
                      <React.Fragment key={label}>
                        {i === 1 && (
                          <button type="button" onClick={currencySwap} className="btn btn-secondary btn-icon h-11 w-11" aria-label="Swap currencies" title="Swap currencies">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M8 3 4 7l4 4" />
                              <path d="M4 7h16" />
                              <path d="m16 21 4-4-4-4" />
                              <path d="M20 17H4" />
                            </svg>
                          </button>
                        )}
                        <label className="relative min-w-0">
                          <span className="sr-only">{label} currency</span>
                          <CountryFlag code={getCurrencyFlagCode(value)} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-3.5 rounded-xs object-cover pointer-events-none" />
                          <select value={value} onChange={(e) => onChange(e.target.value)} className={`${currencySelectCls} pl-10`}>
                            {supportedCurrencies.map(cur => (
                              <option key={cur} value={cur} className="bg-surface-1 text-text-primary">{cur}</option>
                            ))}
                          </select>
                        </label>
                      </React.Fragment>
                    ))}
                  </div>
                  {/* Amount */}
                  <label className="relative">
                    <span className="sr-only">Amount in {fromCurrency}</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={conversionAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val)) setConversionAmount(val);
                      }}
                      className="h-11 w-full rounded-lg bg-surface-2 border border-border-hairline pl-3 pr-14 text-[16px] font-medium text-text-primary tabular-nums focus:outline-none focus:border-border-strong focus:bg-surface-1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-text-muted pointer-events-none">{fromCurrency}</span>
                  </label>
                  {/* Result */}
                  <div className="pt-2.5 border-t border-border-hairline flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                    <p className="text-[30px] font-semibold tracking-[-0.03em] leading-none text-text-primary tabular-nums break-all">
                      {currencyConvertedText} <span className="text-[17px] font-semibold text-text-secondary tracking-normal">{toCurrency}</span>
                    </p>
                    {currencyPairMatches && (
                      <StatusBadge tone={currencyIsUp ? 'success' : 'critical'} progress={null}>{currencyChangeText} 24h</StatusBadge>
                    )}
                  </div>
                  <p className="text-[12.5px] text-text-muted tabular-nums -mt-1">1 {fromCurrency} = {currencyRate.toFixed(4)} {toCurrency}</p>
                </section>

                <div className="segmented segmented-full [&>button]:h-10" role="group" aria-label="Currency sections">
                  {([['trend', 'Trend'], ['pairs', 'Pairs'], ['details', 'Details']] as const).map(([tab, label]) => (
                    <button key={tab} type="button" role="tab" onClick={() => setCurrencyMobileSection(tab)} aria-pressed={currencyMobileSection === tab} aria-selected={currencyMobileSection === tab}>
                      {label}
                    </button>
                  ))}
                </div>

                {currencyMobileSection === 'trend' && (
                  <section className="card card-pad" id="currency-mobile-chart-container">
                    {currencyTrendHeader}
                    <CurrencyHistoryChart data={activeCurrency?.history || []} targetCurrency={activeCurrency?.target || 'EUR'} />
                  </section>
                )}

                {currencyMobileSection === 'pairs' && (
                  <section className="card card-pad flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="card-title">Exchange rates</h3>
                      <StatusBadge tone="neutral" progress={null}>{filteredCurrencies.length} pairs</StatusBadge>
                    </div>
                    {currencySearchField}
                    <div className="flex flex-col -mx-2">
                      {filteredCurrencies.length === 0
                        ? currencyEmpty
                        : filteredCurrencies.slice(0, currencyListLimit).map(c => renderCurrencyRow(c, () => currencySelectPair(c)))}
                    </div>
                    {filteredCurrencies.length > currencyListLimit && (
                      <button
                        type="button"
                        onClick={() => setMobileCurrenciesOpen(true)}
                        className="btn btn-secondary w-full h-10"
                        id="currency-switcher-trigger-mobile"
                      >
                        Show all {filteredCurrencies.length} pairs
                      </button>
                    )}
                  </section>
                )}

                {currencyMobileSection === 'details' && (
                  <section className="card card-pad flex flex-col gap-4" id="currency-mobile-profile">
                    <h3 className="card-title">Pair details</h3>
                    {currencyDetails}
                    <button
                      type="button"
                      onClick={() => handleExportCSV('currency')}
                      className="btn btn-secondary w-full h-10"
                      id="currency-mobile-export-btn"
                    >
                      <PhosphorIcon name="download" size={15} />
                      Export exchange pairs
                    </button>
                  </section>
                )}
              </div>

              {/* ==================== TABLET & DESKTOP LAYOUT (>= 768px) ==================== */}
              <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-slide-up" id="currency-tab-view">

                {/* Main column: converter + trend */}
                <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
                  <section className="card card-pad" aria-label="Currency converter">
                    <div className="mb-4">
                      <h3 className="card-title">Converter</h3>
                      <p className="card-subtitle">Enter an amount and choose two currencies.</p>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-6 items-stretch">
                      <div className="flex flex-col gap-4">
                        {currencyAmountField}
                        {currencyPairFields}
                      </div>
                      <div className="rounded-xl bg-surface-2 p-5 flex flex-col justify-center">
                        {currencyResult}
                      </div>
                    </div>
                  </section>

                  <section className="card card-pad">
                    {currencyTrendHeader}
                    <CurrencyHistoryChart data={activeCurrency?.history || []} targetCurrency={activeCurrency?.target || 'EUR'} />
                  </section>
                </div>

                {/* Side column: pair list + details (side by side on tablet) */}
                <div className="lg:col-span-4 grid md:grid-cols-2 lg:grid-cols-1 gap-6 items-start lg:sticky lg:top-4">
                  <section className="card card-pad flex flex-col gap-3" aria-label="Exchange rates">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="card-title">Exchange rates</h3>
                      <StatusBadge tone="neutral" progress={null}>{filteredCurrencies.length} pairs</StatusBadge>
                    </div>
                    {currencySearchField}
                    <div className="flex flex-col -mx-2 px-0.5 max-h-[360px] overflow-y-auto scroll-fade pb-4">
                      {filteredCurrencies.length === 0
                        ? currencyEmpty
                        : filteredCurrencies.map(c => renderCurrencyRow(c, () => currencySelectPair(c)))}
                    </div>
                  </section>

                  <section className="card card-pad flex flex-col gap-4">
                    <h3 className="card-title">Pair details</h3>
                    {currencyDetails}
                    <button
                      type="button"
                      onClick={() => handleExportCSV('currency')}
                      className="btn btn-secondary w-full"
                    >
                      <PhosphorIcon name="download" size={15} />
                      Export exchange pairs
                    </button>
                  </section>
                </div>

              </div>

              {/* OVERLAY BOTTOM SHEET DRAWER (Mobile: full currency pair list) */}
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
                      className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-surface-1 border-t border-border-hairline rounded-t-[24px] z-50 flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
                      id="currency-mobile-bottom-sheet"
                    >
                      {/* Swipe Handle Indicator */}
                      <div className="w-10 h-1 bg-border-strong/40 rounded-full mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing" />

                      <div className="flex flex-col flex-1 px-4 pb-8 overflow-hidden">
                        <div className="flex items-center justify-between pb-3 border-b border-border-hairline shrink-0">
                          <div>
                            <h3 className="card-title">Exchange rates</h3>
                            <p className="card-subtitle">Select a currency pair</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMobileCurrenciesOpen(false)}
                            className="btn btn-secondary btn-icon h-10 w-10 rounded-full"
                            aria-label="Close"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="my-3 shrink-0">
                          {currencySearchField}
                        </div>

                        <div className="flex-1 overflow-y-auto -mx-2 flex flex-col">
                          {filteredCurrencies.length === 0
                            ? currencyEmpty
                            : filteredCurrencies.map(c => renderCurrencyRow(c, () => {
                              currencySelectPair(c);
                              setMobileCurrenciesOpen(false);
                            }))}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
            );
          })()}

          {/* ==================== TAB 5: AIR QUALITY & WORLD MAP ==================== */}
          {activeTab === 'aqi' && (
            <div className="flex flex-col gap-6 animate-slide-up" id="aqi-tab-view">
              {(() => {
                const activeAQI = data?.aqi?.find(a => a.city.toLowerCase() === selectedCity.toLowerCase()) || data?.aqi?.[0];
                if (!activeAQI) return (
                  <div className="card card-pad py-12 flex flex-col items-center text-center" id="aqi-empty-state">
                    <span className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted">
                      <PhosphorIcon name="wind" size={24} className="" />
                    </span>
                    <p className="card-title mt-3">Air quality data is loading</p>
                    <p className="card-subtitle max-w-xs">Readings from monitoring stations will appear here shortly.</p>
                  </div>
                );

                const details = getAQILevelDetails(activeAQI.aqi);
                const aqiLevel = aqiTone(details.status);
                const aqiAdvice = (activeAQI.healthMessage || details.healthMessage || '').replace(/^[^—]*—\s*/, '');
                const aqiCityCode = MONITORED_CITIES.find(c => c.city === activeAQI.city)?.code || 'US';
                const aqiUpdated = new Date(activeAQI.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const aqiSelectCity = (city: string) => {
                  setSelectedCity(city);
                  setSelectedCountryCode(MONITORED_CITIES.find(c => c.city === city)?.code || 'US');
                };

                // Trend calculations for 4h comparison
                const trendInfo = (() => {
                  if (!activeAQI.trend || activeAQI.trend.length < 5) {
                    return { text: 'Stable', short: 'Stable', icon: 'minus', color: 'text-text-muted', change: 0 };
                  }
                  const cur = activeAQI.aqi;
                  const past = activeAQI.trend[activeAQI.trend.length - 5]?.aqi || cur;
                  const diff = cur - past;
                  if (diff > 0) return { text: `Rising (+${diff} AQI vs. 4h ago)`, short: `Up ${diff} in 4h`, icon: 'trending-up', color: 'text-status-danger', change: diff };
                  if (diff < 0) return { text: `Improving (${Math.abs(diff)} AQI vs. 4h ago)`, short: `Down ${Math.abs(diff)} in 4h`, icon: 'trending-down', color: 'text-status-success', change: diff };
                  return { text: 'Stable (No change vs. 4h ago)', short: 'Stable in 4h', icon: 'minus', color: 'text-text-muted', change: 0 };
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

                const aqiPollutants = Object.entries(pollutantDefinitions).map(([key, def]) => {
                  const val = (activeAQI.pollutants as any)?.[key] || (activeAQI as any)[key] || 0;
                  const sev = getPollutantSeverityColorLocal(key, val);
                  const t = aqiTone(sev.label === 'USG' ? 'Unhealthy for Sensitive Groups' : sev.label);
                  return { key, def, val, sev, tone: t };
                });
                const aqiInfoPollutant = aqiPollutants.find(p => p.key === aqiPollutantInfo) || aqiPollutants[0];

                // City search with autocomplete (shared state; rendered in mobile + desktop layouts)
                const renderAqiSearch = (mobile: boolean) => (
                  <div className={`relative ${mobile ? 'w-full' : 'w-72'}`}>
                    <PhosphorIcon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search city"
                      aria-label="Search city"
                      className={`w-full bg-surface-1 border border-border-hairline focus:border-border-strong rounded-lg pl-9 pr-10 ${mobile ? 'h-11 text-[15px]' : 'h-9 text-[14px]'} focus:outline-none text-text-primary shadow-xs`}
                      value={aqiSearchQuery}
                      onFocus={() => setShowAqiSearchDropdown(true)}
                      onBlur={() => setTimeout(() => setShowAqiSearchDropdown(false), 200)}
                      onChange={(e) => {
                        setAqiSearchQuery(e.target.value);
                        setShowAqiSearchDropdown(true);
                      }}
                    />
                    {aqiSearchQuery && (
                      <button
                        onClick={() => { setAqiSearchQuery(''); setShowAqiSearchDropdown(false); }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary"
                        aria-label="Clear search"
                      >
                        <PhosphorIcon name="x" size={14} className="" />
                      </button>
                    )}

                    {showAqiSearchDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-1 border border-border-hairline rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto p-1" id={mobile ? 'aqi-search-autocomplete-dropdown-mobile' : 'aqi-search-autocomplete-dropdown'}>
                        {(() => {
                          const list = data?.aqi || [];
                          const filtered = list.filter(item =>
                            item.city.toLowerCase().includes(aqiSearchQuery.toLowerCase()) ||
                            item.country.toLowerCase().includes(aqiSearchQuery.toLowerCase())
                          );

                          if (filtered.length === 0) {
                            return (
                              <div className="p-3 text-[13px] text-text-muted text-center">
                                No monitored cities match "{aqiSearchQuery}"
                              </div>
                            );
                          }

                          return filtered.map(item => {
                            const t = aqiTone(getAQILevelDetails(item.aqi).status);
                            return (
                              <button
                                key={item.city}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setSelectedCity(item.city);
                                  setSelectedCountryCode(item.country === 'United States' ? 'US' : (MONITORED_CITIES.find(c => c.city === item.city)?.code || 'US'));
                                  setAqiSearchQuery('');
                                  setShowAqiSearchDropdown(false);
                                }}
                                className="list-row justify-between min-h-11"
                              >
                                <span className="min-w-0">
                                  <span className="block text-[14px] font-medium text-text-primary truncate">{item.city}</span>
                                  <span className="block text-[12px] text-text-muted truncate">{item.country}</span>
                                </span>
                                <StatusBadge tone={t.tone} progress={t.progress}>AQI {item.aqi}</StatusBadge>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                );

                const aqiQuickCities = ['New York', 'London', 'Tokyo', 'Delhi', 'Manila'];

                return (
                  <>
                    {/* ===== MOBILE (< 768px): hero + in-page section switcher ===== */}
                    <div className="md:hidden flex flex-col gap-3" id="aqi-tab-mobile">
                      {renderAqiSearch(true)}

                      {/* Quick-select chips */}
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none" aria-label="Quick select city">
                        {aqiQuickCities.map(city => {
                          const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                          return (
                            <button
                              key={city}
                              onClick={() => aqiSelectCity(city)}
                              className={`h-10 px-3.5 rounded-full text-[14px] font-medium shrink-0 border transition-colors ${isSelected ? 'bg-text-primary text-surface-0 border-text-primary' : 'bg-surface-1 text-text-secondary border-border-hairline'}`}
                              aria-pressed={isSelected}
                            >
                              {city}
                            </button>
                          );
                        })}
                      </div>

                      {/* Hero: AQI value + level + one-line advice */}
                      <section className="card card-pad" id="aqi-mobile-hero-card">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-[16px] font-semibold text-text-primary flex items-center gap-2 min-w-0">
                            <CountryFlag code={aqiCityCode} className="w-5 h-3.5 rounded-sm object-cover border border-border-hairline/50 shrink-0" />
                            <span className="truncate">{activeAQI.city}<span className="font-normal text-text-secondary">, {activeAQI.country}</span></span>
                          </h2>
                          <span className="text-[12px] text-text-muted shrink-0 tabular-nums">{aqiUpdated}</span>
                        </div>

                        <div className="flex items-end gap-3 mt-3">
                          <span className="stat-hero text-[48px]">{activeAQI.aqi}</span>
                          <div className="flex flex-col gap-1 pb-1 min-w-0">
                            <span className="text-[12px] text-text-muted">US AQI</span>
                            <StatusBadge tone={aqiLevel.tone} progress={aqiLevel.progress} size="md">{aqiShortLabel(details.status)}</StatusBadge>
                          </div>
                        </div>

                        <div className="mt-3">
                          <AqiScaleBar aqi={activeAQI.aqi} />
                        </div>

                        <p className="text-[14px] text-text-secondary leading-snug mt-3">{aqiAdvice}</p>

                        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border-hairline text-[13px]">
                          <span className="text-text-secondary">Main pollutant <span className="font-semibold text-text-primary">{activeAQI.mainPollutant}</span></span>
                          <span className={`flex items-center gap-1 font-medium ${trendInfo.color}`}>
                            <PhosphorIcon name={trendInfo.icon} size={15} className="" />
                            {trendInfo.short}
                          </span>
                        </div>
                      </section>

                      {/* Section switcher */}
                      <div className="segmented segmented-full [&>button]:px-1" role="group" aria-label="Air quality sections">
                        {([
                          ['overview', 'Overview'],
                          ['pollutants', 'Pollutants'],
                          ['history', 'History'],
                          ['map', 'Map'],
                        ] as const).map(([id, label]) => (
                          <button key={id} aria-pressed={aqiMobileSection === id} onClick={() => setAqiMobileSection(id)}>
                            {label}
                          </button>
                        ))}
                      </div>

                      {aqiMobileSection === 'overview' && (
                        <AqiHealthGuidance aqi={activeAQI.aqi} status={details.status} className="animate-fade-in" />
                      )}

                      {aqiMobileSection === 'pollutants' && (
                        <section className="card card-pad animate-fade-in" id="aqi-mobile-pollutants">
                          <h3 className="card-title">Pollutants</h3>
                          <p className="card-subtitle">Tap a pollutant to see what it is</p>
                          <div className="grid grid-cols-2 gap-2.5 mt-3">
                            {aqiPollutants.map(p => (
                              <button
                                key={p.key}
                                onClick={() => setAqiPollutantInfo(p.key)}
                                aria-pressed={aqiInfoPollutant.key === p.key}
                                className={`text-left rounded-xl border p-3 min-h-[76px] flex flex-col justify-between gap-1.5 transition-colors ${aqiInfoPollutant.key === p.key ? 'bg-surface-1 border-border-strong shadow-xs' : 'bg-surface-2 border-transparent'}`}
                              >
                                <span className="flex flex-wrap items-center justify-between gap-1.5">
                                  <span className="text-[13px] font-semibold text-text-secondary">{p.def.label.replace(' (Ozone)', '')}</span>
                                  <StatusBadge tone={p.tone.tone} progress={null}>{p.sev.label}</StatusBadge>
                                </span>
                                <span className="text-[17px] font-semibold text-text-primary tabular-nums leading-none">
                                  {p.val} <span className="text-[12px] font-normal text-text-muted">{p.def.unit}</span>
                                </span>
                              </button>
                            ))}
                          </div>
                          <div className="mt-3 rounded-xl bg-surface-2 p-3">
                            <p className="text-[13px] font-semibold text-text-primary">{aqiInfoPollutant.def.label} · {aqiInfoPollutant.val} {aqiInfoPollutant.def.unit}</p>
                            <p className="text-[13px] text-text-secondary leading-snug mt-0.5">{aqiInfoPollutant.def.desc}</p>
                          </div>
                        </section>
                      )}

                      {aqiMobileSection === 'history' && (
                        <div className="animate-fade-in">
                          <AQITrendChart trendData={activeAQI.trend} city={activeAQI.city} compact />
                        </div>
                      )}

                      {aqiMobileSection === 'map' && (
                        <section className="card card-pad animate-fade-in" id="aqi-mobile-map">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="card-title">World map</h3>
                              <p className="card-subtitle">Tap a station to switch city</p>
                            </div>
                            <StatusBadge tone="success" progress="complete">Live</StatusBadge>
                          </div>
                          <MapPanel
                            onSelectCity={aqiSelectCity}
                            selectedCity={selectedCity}
                            weatherData={data.weather}
                            aqiData={data.aqi}
                            tempUnit={tempUnit}
                            compact
                          />
                        </section>
                      )}
                    </div>

                    {/* ===== TABLET & DESKTOP (>= 768px) ===== */}
                    <div className="hidden md:flex flex-col gap-6" id="aqi-tab-desktop">
                      {/* City picker toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3" id="aqi-filter-panel-row">
                        {renderAqiSearch(false)}
                        <div className="segmented max-w-full overflow-x-auto scrollbar-none" aria-label="Quick select city">
                          {aqiQuickCities.map(city => (
                            <button
                              key={city}
                              onClick={() => aqiSelectCity(city)}
                              aria-pressed={selectedCity.toLowerCase() === city.toLowerCase()}
                              className="shrink-0"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Summary + pollutants */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="aqi-summary-breakdown-panel-row">
                        <section className="lg:col-span-5 card card-pad md:p-6 flex flex-col" id="aqi-primary-hero-summary-card">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="eyebrow">Air quality now</p>
                              <h2 className="text-xl font-semibold text-text-primary mt-1 flex items-center gap-2 min-w-0">
                                <CountryFlag code={aqiCityCode} className="w-5 h-3.5 rounded-sm object-cover border border-border-hairline/50 shrink-0" />
                                <span className="truncate">{activeAQI.city}<span className="font-normal text-text-secondary">, {activeAQI.country}</span></span>
                              </h2>
                            </div>
                            <span className="text-[13px] text-text-muted flex items-center gap-1 shrink-0 tabular-nums">
                              <PhosphorIcon name="clock" size={14} className="" />
                              Updated {aqiUpdated}
                            </span>
                          </div>

                          <div className="flex items-end gap-4 mt-6">
                            <span className="text-7xl font-semibold tracking-[-0.03em] text-text-primary tabular-nums leading-none">
                              {activeAQI.aqi}
                            </span>
                            <div className="flex flex-col gap-1.5 pb-1">
                              <span className="text-[13px] text-text-muted">US AQI</span>
                              <StatusBadge tone={aqiLevel.tone} progress={aqiLevel.progress} size="md">{aqiShortLabel(details.status)}</StatusBadge>
                            </div>
                          </div>

                          <div className="mt-5">
                            <AqiScaleBar aqi={activeAQI.aqi} showTicks />
                          </div>

                          <p className="text-[15px] text-text-secondary leading-relaxed mt-5">{aqiAdvice}</p>

                          <dl className="grid grid-cols-2 gap-3 mt-auto pt-5">
                            <div className="rounded-xl bg-surface-2 p-3">
                              <dt className="stat-label">Main pollutant</dt>
                              <dd className="stat-value mt-0.5">{activeAQI.mainPollutant}</dd>
                            </div>
                            <div className="rounded-xl bg-surface-2 p-3">
                              <dt className="stat-label">Last 4 hours</dt>
                              <dd className={`text-[15px] font-semibold mt-1 flex items-center gap-1 ${trendInfo.color}`}>
                                <PhosphorIcon name={trendInfo.icon} size={16} className="" />
                                {trendInfo.short.replace(' in 4h', '')}
                              </dd>
                            </div>
                          </dl>
                        </section>

                        <section className="lg:col-span-7 card card-pad md:p-6" id="aqi-pollutants-grid-panel">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                              <h3 className="card-title">Pollutants</h3>
                              <p className="card-subtitle">Hover or focus a pollutant to see what it is and how it affects health</p>
                            </div>
                            <StatusBadge tone="neutral" progress={null}>6 sensors</StatusBadge>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {aqiPollutants.map(p => (
                              <div
                                key={p.key}
                                tabIndex={0}
                                className="group relative rounded-xl bg-surface-2 border border-transparent hover:border-border-hairline focus:border-border-strong focus:outline-none p-4 flex flex-col gap-3 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[13px] font-semibold text-text-secondary flex items-center gap-1">
                                    {p.def.label}
                                    <PhosphorIcon name="info" size={13} className="text-text-muted" />
                                  </span>
                                  <StatusBadge tone={p.tone.tone} progress={p.tone.progress}>{p.sev.label}</StatusBadge>
                                </div>
                                <p className="text-[22px] font-semibold text-text-primary tabular-nums tracking-tight leading-none">
                                  {p.val} <span className="text-[13px] font-normal text-text-muted">{p.def.unit}</span>
                                </p>

                                {/* Definition tooltip (hover / keyboard focus) */}
                                <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-surface-1 border border-border-hairline p-3 rounded-xl shadow-lg z-50">
                                  <p className="text-[13px] font-semibold text-text-primary">{p.def.label} · {p.sev.label}</p>
                                  <p className="text-[13px] text-text-secondary leading-snug mt-1">{p.def.desc}</p>
                                  <p className="text-[12px] text-text-muted mt-2 pt-2 border-t border-border-hairline tabular-nums">
                                    Concentration: {p.val} {p.def.unit}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>

                      {/* History + health guidance */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="aqi-trend-explanation-row">
                        <div className="lg:col-span-8 min-w-0">
                          <AQITrendChart trendData={activeAQI.trend} city={activeAQI.city} />
                        </div>
                        <div className="lg:col-span-4">
                          <AqiHealthGuidance aqi={activeAQI.aqi} status={details.status} className="h-full" />
                        </div>
                      </div>

                      {/* World map */}
                      <section className="card card-pad md:p-6" id="global-map-full-width-wrapper">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <h3 className="card-title flex items-center gap-2">
                              Air quality world map
                              <StatusBadge tone="success" progress="complete">Live</StatusBadge>
                            </h3>
                            <p className="card-subtitle">Live readings from {data.aqi?.length ?? 0} monitored cities. Select a city to see its details.</p>
                          </div>
                        </div>
                        <MapPanel
                          onSelectCity={aqiSelectCity}
                          selectedCity={selectedCity}
                          weatherData={data.weather}
                          aqiData={data.aqi}
                          tempUnit={tempUnit}
                        />
                      </section>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ==================== TAB 6: COUNTRIES COMPARISON ==================== */}
          {activeTab === 'countries' && (() => {
            const countriesAll = data.countries || [];
            const countriesQuery = countrySearchQuery.trim().toLowerCase();
            const countriesFiltered = countriesAll.filter((c) =>
              c.name.toLowerCase().includes(countriesQuery) ||
              c.region.toLowerCase().includes(countriesQuery)
            );
            const countriesDesktopShown = countriesQuery
              ? countriesFiltered
              : countriesFiltered.slice(0, countryVisibleCount);
            const countriesMobileShown = countriesQuery || countriesMobileShowAll
              ? countriesFiltered
              : countriesFiltered.slice(0, 5);

            const countriesPick = (code: string) => {
              setSelectedCountryCode(code);
              setSelectedCity(MONITORED_CITIES.find(cityObj => cityObj.code === code)?.city || 'New York');
            };

            const countriesFmtPopulation = (n?: number) => {
              if (!n) return '—';
              return n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : `${(n / 1e6).toFixed(1)}M`;
            };
            const countriesFmtGdp = (n?: number) => {
              if (!n) return '—';
              return n >= 1e12 ? `$${(n / 1e12).toFixed(1)}T` : `$${(n / 1e9).toFixed(0)}B`;
            };

            const countriesGdpSeries = [...(activeCountry?.historicalGdp || [])].sort((a, b) => Number(a.year) - Number(b.year));
            const countriesGdpFirst = countriesGdpSeries[0];
            const countriesGdpLast = countriesGdpSeries[countriesGdpSeries.length - 1];
            const countriesGdpChange =
              countriesGdpFirst && countriesGdpLast && countriesGdpFirst.gdp > 0 && countriesGdpSeries.length > 1
                ? ((countriesGdpLast.gdp - countriesGdpFirst.gdp) / countriesGdpFirst.gdp) * 100
                : null;
            const countriesGdpRange = countriesGdpFirst && countriesGdpLast
              ? `${countriesGdpFirst.year}–${countriesGdpLast.year}`
              : 'No history yet';

            const countriesLivability = activeCountry?.livabilityIndex ?? 0;
            const countriesLivabilityTone: 'success' | 'info' | 'warning' =
              countriesLivability >= 80 ? 'success' : countriesLivability >= 60 ? 'info' : 'warning';
            const countriesLivabilityLabel =
              countriesLivability >= 80 ? 'High' : countriesLivability >= 60 ? 'Moderate' : 'Low';
            const countriesLivabilityBar =
              countriesLivabilityTone === 'success' ? 'bg-status-success' : countriesLivabilityTone === 'info' ? 'bg-status-info' : 'bg-status-warning';

            const countriesGdpBadge = countriesGdpChange !== null && countriesGdpFirst ? (
              <StatusBadge tone={countriesGdpChange >= 0 ? 'success' : 'critical'} progress={null}>
                {countriesGdpChange >= 0 ? '+' : ''}{countriesGdpChange.toFixed(1)}% since {countriesGdpFirst.year}
              </StatusBadge>
            ) : null;

            const countriesSearchField = (autoFocus?: boolean) => (
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                  <MagnifyingGlass size={16} />
                </span>
                <input
                  type="search"
                  value={countrySearchQuery}
                  onChange={(e) => setCountrySearchQuery(e.target.value)}
                  placeholder="Search country or region"
                  aria-label="Search countries"
                  autoFocus={autoFocus}
                  className="w-full h-10 pl-9 pr-10 bg-surface-1 border border-border-hairline rounded-lg text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors [&::-webkit-search-cancel-button]:hidden"
                />
                {countrySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCountrySearchQuery('')}
                    aria-label="Clear search"
                    className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-text-muted hover:text-text-primary cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            );

            const countriesRow = (c: typeof countriesAll[number], onPick: () => void) => {
              const isSelected = c.code === selectedCountryCode;
              return (
                <button
                  type="button"
                  key={c.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={onPick}
                  className="list-row min-h-12"
                >
                  <CountryFlag code={c.code} className="w-8 h-6 rounded shadow-2xs shrink-0 object-cover" />
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[14px] truncate ${isSelected ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'}`}>{c.name}</span>
                    <span className="block text-[13px] text-text-muted truncate">{c.region}</span>
                  </span>
                  {isSelected && <CheckCircle size={18} weight="fill" className="text-accent shrink-0" aria-hidden="true" />}
                </button>
              );
            };

            const countriesEmpty = (
              <div className="py-8 px-4 text-center">
                <p className="text-[14px] font-medium text-text-primary">No countries found</p>
                <p className="text-[13px] text-text-muted mt-1">Nothing matches “{countrySearchQuery}”.</p>
                <button type="button" onClick={() => setCountrySearchQuery('')} className="btn btn-secondary btn-sm mt-3">
                  Clear search
                </button>
              </div>
            );

            const countriesTags = (activeCountry?.tags || []).map((tag, idx) => (
              <React.Fragment key={idx}><StatusBadge tone="neutral" progress={null}>{tag}</StatusBadge></React.Fragment>
            ));

            return (
            <>
              {/* MOBILE VIEW (< 768px): identity card + Profile | Growth | Countries switcher */}
              <div className="md:hidden flex flex-col gap-3 animate-slide-up" id="countries-tab-mobile">
                {/* Selected country identity */}
                <div className="card card-pad flex items-center gap-3" id="countries-mobile-detail-card">
                  <CountryFlag code={activeCountry?.code || ''} className="w-11 h-8 rounded-md shadow-2xs shrink-0 object-cover" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[18px] font-semibold tracking-tight text-text-primary truncate">{activeCountry?.name}</h2>
                    <p className="text-[13px] text-text-secondary truncate">{activeCountry?.capital} · {activeCountry?.region}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileCountriesOpen(true)}
                    className="btn btn-secondary h-10 px-3 shrink-0"
                    id="sovereigns-locations-trigger-mobile"
                    aria-label="Change country"
                  >
                    <Compass size={16} />
                    <span>Change</span>
                  </button>
                </div>

                {/* In-page section switcher */}
                <div className="segmented segmented-full [&>button]:h-10" role="group" aria-label="Country sections">
                  {([
                    { value: 'profile', label: 'Profile' },
                    { value: 'growth', label: 'Growth' },
                    { value: 'list', label: 'Countries' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                     
                      aria-selected={countriesMobileSection === tab.value}
                      aria-pressed={countriesMobileSection === tab.value}
                      onClick={() => setCountriesMobileSection(tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {countriesMobileSection === 'profile' && (
                  <div className="card overflow-hidden" id="countries-mobile-profile">
                    <div className="grid grid-cols-2 gap-px bg-border-hairline" id="countries-mobile-stats-row">
                      <div className="bg-surface-1 p-4">
                        <p className="stat-label">Population</p>
                        <p className="stat-value mt-1">{countriesFmtPopulation(activeCountry?.population)}</p>
                      </div>
                      <div className="bg-surface-1 p-4">
                        <p className="stat-label">GDP (nominal)</p>
                        <p className="stat-value mt-1">{countriesFmtGdp(activeCountry?.gdp)}</p>
                      </div>
                      <div className="bg-surface-1 p-4">
                        <p className="stat-label">Languages</p>
                        <p className="text-[15px] font-semibold text-text-primary mt-1 leading-snug line-clamp-2">{activeCountry?.languages?.join(', ') || '—'}</p>
                      </div>
                      <div className="bg-surface-1 p-4">
                        <p className="stat-label">Livability</p>
                        <p className="stat-value mt-1">
                          {countriesLivability}
                          <span className="text-[13px] font-medium text-text-muted"> / 100</span>
                        </p>
                        <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden" aria-hidden="true">
                          <div className={`h-full rounded-full ${countriesLivabilityBar}`} style={{ width: `${Math.min(100, Math.max(0, countriesLivability))}%` }} />
                        </div>
                      </div>
                    </div>
                    {countriesTags.length > 0 && (
                      <div className="px-4 py-3 border-t border-border-hairline flex flex-wrap gap-1.5">
                        <StatusBadge tone={countriesLivabilityTone} progress="complete">{countriesLivabilityLabel} livability</StatusBadge>
                        {countriesTags}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setCountriesMobileSection('growth')}
                      className="w-full min-h-12 px-4 border-t border-border-hairline flex items-center justify-between gap-3 text-left hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium text-text-primary">GDP growth</span>
                        <span className="block text-[13px] text-text-muted truncate">{countriesGdpRange}</span>
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        {countriesGdpBadge}
                        <CaretRight size={16} className="text-text-muted" />
                      </span>
                    </button>
                  </div>
                )}

                {countriesMobileSection === 'growth' && (
                  <div className="card card-pad" id="countries-mobile-chart-card">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="card-title">GDP growth</h3>
                        <p className="card-subtitle">World Bank · {countriesGdpRange}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="stat-value">{countriesFmtGdp(countriesGdpLast?.gdp)}</p>
                        {countriesGdpLast && <p className="text-[12px] text-text-muted">in {countriesGdpLast.year}</p>}
                      </div>
                    </div>
                    {countriesGdpBadge && <div className="mb-2">{countriesGdpBadge}</div>}
                    <CountryGrowthChart
                      data={activeCountry?.historicalGdp || []}
                      type="gdp"
                      countryName={activeCountry?.name || 'Sovereign'}
                      flatStroke={true}
                      heightClass="h-[190px]"
                    />
                  </div>
                )}

                {countriesMobileSection === 'list' && (
                  <div className="card card-pad flex flex-col gap-3" id="countries-mobile-list">
                    <div className="flex items-baseline justify-between">
                      <h3 className="card-title">All countries</h3>
                      <span className="text-[13px] text-text-muted tabular-nums">{countriesFiltered.length} of {countriesAll.length}</span>
                    </div>
                    {countriesSearchField()}
                    <div className="flex flex-col gap-1" role="listbox" aria-label="Countries">
                      {countriesMobileShown.length > 0
                        ? countriesMobileShown.map((c) => countriesRow(c, () => {
                            countriesPick(c.code);
                            setCountriesMobileSection('profile');
                          }))
                        : countriesEmpty}
                    </div>
                    {!countriesQuery && countriesFiltered.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setCountriesMobileShowAll((v) => !v)}
                        className="btn btn-secondary h-10 w-full"
                      >
                        {countriesMobileShowAll ? <CaretUp size={15} /> : <CaretDown size={15} />}
                        <span>{countriesMobileShowAll ? 'Show fewer' : `Show all ${countriesFiltered.length}`}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* TABLET & DESKTOP VIEW (>= 768px) */}
              <div className="hidden md:grid md:grid-cols-12 gap-6 animate-slide-up" id="countries-tab-view">

                {/* Country list */}
                <aside className="md:col-span-4 lg:col-span-3 card card-pad flex flex-col gap-3 self-start">
                  <div className="flex items-baseline justify-between">
                    <h3 className="card-title">Countries</h3>
                    <span className="text-[13px] text-text-muted tabular-nums">
                      {countriesQuery ? `${countriesFiltered.length} of ${countriesAll.length}` : `${countriesAll.length} total`}
                    </span>
                  </div>

                  {countriesSearchField()}

                  <div className="flex flex-col gap-1" role="listbox" aria-label="Countries">
                    {countriesDesktopShown.length > 0
                      ? countriesDesktopShown.map((c) => countriesRow(c, () => countriesPick(c.code)))
                      : countriesEmpty}
                  </div>

                  {/* See more countries button */}
                  {!countriesQuery && countriesFiltered.length > 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (countryVisibleCount >= countriesFiltered.length) {
                          setCountryVisibleCount(6);
                        } else {
                          setCountryVisibleCount((prev) => Math.min(prev + 6, countriesFiltered.length));
                        }
                      }}
                      className="btn btn-ghost btn-sm w-full"
                    >
                      <PhosphorIcon
                        name={countryVisibleCount >= countriesFiltered.length ? 'chevron-up' : 'chevron-down'}
                        size={15}
                      />
                      <span>
                        {countryVisibleCount >= countriesFiltered.length
                          ? 'Show less'
                          : `See more countries (${countriesFiltered.length - countryVisibleCount})`}
                      </span>
                    </button>
                  )}
                </aside>

                {/* Detail column */}
                <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6 min-w-0">

                  {/* Profile + key indicators */}
                  <section className="card overflow-hidden" id="countries-profile-card">
                    <div className="p-5 lg:p-6 flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <CountryFlag code={activeCountry?.code || ''} className="w-14 h-10 rounded-md shadow-xs shrink-0 object-cover" />
                        <div className="min-w-0">
                          <h2 className="text-2xl font-semibold tracking-tight text-text-primary truncate">{activeCountry?.name}</h2>
                          <p className="text-[14px] text-text-secondary mt-0.5">
                            Capital: <span className="text-text-primary font-medium">{activeCountry?.capital}</span>
                            <span className="text-text-muted"> · </span>
                            {activeCountry?.region}
                          </p>
                        </div>
                      </div>
                      {countriesTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-end">{countriesTags}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-hairline border-t border-border-hairline">
                      <div className="bg-surface-1 p-5">
                        <p className="stat-label">Population</p>
                        <p className="stat-value text-[22px] mt-1">{countriesFmtPopulation(activeCountry?.population)}</p>
                      </div>
                      <div className="bg-surface-1 p-5">
                        <p className="stat-label">GDP (nominal)</p>
                        <p className="stat-value text-[22px] mt-1">{countriesFmtGdp(activeCountry?.gdp)}</p>
                      </div>
                      <div className="bg-surface-1 p-5">
                        <p className="stat-label">Languages</p>
                        <p className="text-[15px] font-semibold text-text-primary mt-1.5 leading-snug">{activeCountry?.languages?.join(', ') || '—'}</p>
                      </div>
                      <div className="bg-surface-1 p-5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="stat-label">Livability score</p>
                          <StatusBadge tone={countriesLivabilityTone} progress="complete">{countriesLivabilityLabel}</StatusBadge>
                        </div>
                        <p className="stat-value text-[22px] mt-1">
                          {countriesLivability}
                          <span className="text-[14px] font-medium text-text-muted"> / 100</span>
                        </p>
                        <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden" aria-hidden="true">
                          <div className={`h-full rounded-full ${countriesLivabilityBar}`} style={{ width: `${Math.min(100, Math.max(0, countriesLivability))}%` }} />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* GDP growth chart */}
                  <section className="card card-pad lg:p-6" id="countries-growth-card">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="card-title">GDP growth</h3>
                        <p className="card-subtitle">World Bank indicator · {countriesGdpRange}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {countriesGdpBadge}
                        <div className="text-right">
                          <p className="stat-value">{countriesFmtGdp(countriesGdpLast?.gdp)}</p>
                          {countriesGdpLast && <p className="text-[12px] text-text-muted">Latest ({countriesGdpLast.year})</p>}
                        </div>
                      </div>
                    </div>
                    <CountryGrowthChart
                      data={activeCountry?.historicalGdp || []}
                      type="gdp"
                      countryName={activeCountry?.name || 'Sovereign'}
                      heightClass="h-[260px]"
                    />
                  </section>

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
                      className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-surface-1 border-t border-border-hairline rounded-t-[24px] z-50 flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
                      id="countries-mobile-bottom-sheet"
                      role="dialog"
                      aria-label="Select country"
                    >
                      {/* Swipe Handle Indicator */}
                      <div className="w-10 h-1 bg-border-strong/40 rounded-full mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing" />

                      {/* Sheet Inner Content */}
                      <div className="flex flex-col flex-1 min-h-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 shrink-0">
                          <div>
                            <h3 className="card-title">Select country</h3>
                            <p className="card-subtitle">{countriesAll.length} monitored countries</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMobileCountriesOpen(false)}
                            className="btn btn-ghost btn-icon h-10 w-10 shrink-0"
                            aria-label="Close"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* Search / Filter Input */}
                        <div className="pb-3 shrink-0">
                          {countriesSearchField(true)}
                        </div>

                        {/* List (Scrollable) */}
                        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 -mx-1 px-1" role="listbox" aria-label="Countries">
                          {countriesFiltered.length > 0
                            ? countriesFiltered.map((c) => countriesRow(c, () => {
                                countriesPick(c.code);
                                setMobileCountriesOpen(false);
                                setCountriesMobileSection('profile');
                              }))
                            : countriesEmpty}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
            );
          })()}

          {/* ==================== TAB 7: REPORTS PAGE ==================== */}
          {activeTab === 'reports' && (() => {
            const reportsList = [
              { id: 'crypto', icon: 'coin-stack', label: 'Cryptocurrency Ticker Log', desc: 'Prices, 24h change, market cap and volume for top tokens.', sizeKb: 4.2, format: 'CSV' },
              { id: 'weather', icon: 'cloud-sun', label: 'Regional Weather Forecasts', desc: 'Forecast metrics for New York, London, Tokyo and Sydney.', sizeKb: 5.8, format: 'CSV' },
              { id: 'aqi', icon: 'globe', label: 'Air Quality Index Logs', desc: 'AQI with PM2.5, PM10, CO and ozone readings per city.', sizeKb: 3.1, format: 'CSV' },
              { id: 'currency', icon: 'dollar', label: 'Historical Exchange Rates Log', desc: 'Daily FX rates for tracked pairs (EUR/USD, GBP/USD, AUD/USD…).', sizeKb: 3.5, format: 'CSV' }
            ];
            const reportsAllIds = reportsList.map((r) => r.id);
            const reportsQuery = reportsSearchQuery.trim().toLowerCase();
            const reportsFiltered = reportsList.filter((r) => {
              const matchesSearch = r.label.toLowerCase().includes(reportsQuery) ||
                r.desc.toLowerCase().includes(reportsQuery);
              const isSelected = selectedLogs.includes(r.id);
              const matchesFilter = reportsFilter === 'all' ||
                (reportsFilter === 'selected' && isSelected) ||
                (reportsFilter === 'unselected' && !isSelected);
              return matchesSearch && matchesFilter;
            });
            const reportsCount = selectedLogs.length;
            const reportsAllSelected = reportsCount === reportsAllIds.length;
            const reportsSomeSelected = reportsCount > 0 && !reportsAllSelected;
            const reportsToggleAll = () => setSelectedLogs(reportsAllSelected ? [] : reportsAllIds);
            const reportsToggle = (id: string) => setSelectedLogs((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            );
            const reportsSizeKb = reportsList
              .filter((r) => selectedLogs.includes(r.id))
              .reduce((sum, r) => sum + r.sizeKb, 0);
            const reportsCtaLabel = reportsCount === 0
              ? 'Select logs to download'
              : `Download ${reportsCount} ${reportsCount === 1 ? 'log' : 'logs'} as CSV`;

            const reportsCheckbox = (state: 'on' | 'off' | 'mixed') => (
              <span
                aria-hidden="true"
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${state === 'off'
                    ? 'border-border-strong bg-surface-1 text-transparent'
                    : 'bg-accent border-accent text-on-accent'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  {state === 'mixed' ? <line x1="5" y1="12" x2="19" y2="12" /> : <polyline points="20 6 9 17 4 12" />}
                </svg>
              </span>
            );

            const reportsCtaInner = (compact: boolean) => exportingBundle ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin shrink-0" />
                <span>Preparing your file…</span>
              </>
            ) : (
              <>
                <PhosphorIcon name={bundleError ? 'error-circle' : 'download'} size={18} className="shrink-0" />
                <span className="truncate">
                  {bundleError ? (compact ? 'Try again' : "Couldn't create the file. Try again") : reportsCtaLabel}
                </span>
              </>
            );
            const reportsCtaClass = bundleError ? 'bg-status-danger text-white hover:opacity-95' : 'btn-accent';

            return (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start pb-28 lg:pb-0 animate-slide-up" id="reports-tab-view">

              {/* Step 1: pick logs */}
              <section className="lg:col-span-8 card card-pad md:p-5 flex flex-col gap-3 md:gap-4" id="reports-logs-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="card-title">Data logs</h3>
                    <p className="card-subtitle">
                      <span className="tabular-nums">{reportsCount} of {reportsAllIds.length} selected</span>
                      <span className="hidden sm:inline"> · tick the logs to include, then download</span>
                    </p>
                  </div>
                  {/* Master Checkbox to Toggle All */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={reportsAllSelected ? true : reportsSomeSelected ? 'mixed' : false}
                    onClick={reportsToggleAll}
                    className="btn btn-ghost h-10 px-3 shrink-0 text-text-primary"
                    title={reportsAllSelected ? 'Deselect all logs' : 'Select all logs'}
                  >
                    {reportsCheckbox(reportsAllSelected ? 'on' : reportsSomeSelected ? 'mixed' : 'off')}
                    <span>{reportsAllSelected ? 'Clear all' : 'Select all'}</span>
                  </button>
                </div>

                {/* Search and Filters Controls */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                      <PhosphorIcon name="search" size={16} />
                    </span>
                    <input
                      type="search"
                      placeholder="Search logs"
                      aria-label="Search logs"
                      value={reportsSearchQuery}
                      onChange={(e) => setReportsSearchQuery(e.target.value)}
                      className="w-full h-10 bg-surface-1 border border-border-hairline rounded-lg pl-9 pr-10 font-sans text-[14px] focus:outline-none focus:border-border-strong text-text-primary placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden"
                    />
                    {reportsSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setReportsSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-text-muted hover:text-text-primary cursor-pointer"
                      >
                        <PhosphorIcon name="x" size={15} />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="segmented segmented-full sm:w-auto shrink-0 [&>button]:h-9 [&>button]:whitespace-nowrap sm:[&>button]:flex-none sm:[&>button]:px-3.5" role="group" aria-label="Filter logs">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'selected', label: 'Selected' },
                      { value: 'unselected', label: 'Unselected' }
                    ].map((btn) => (
                      <button
                        key={btn.value}
                        type="button"
                        onClick={() => setReportsFilter(btn.value as any)}
                        aria-pressed={reportsFilter === btn.value}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main List */}
                {reportsFiltered.length === 0 ? (
                  <div className="py-10 px-6 border border-dashed border-border-strong/50 rounded-xl text-center flex flex-col items-center" id="reports-empty-state">
                    <div className="w-11 h-11 rounded-full bg-surface-2 flex items-center justify-center text-text-muted mb-3">
                      <PhosphorIcon name="file" size={20} />
                    </div>
                    <h4 className="text-[15px] font-semibold text-text-primary">No logs to show</h4>
                    <p className="text-[13px] text-text-secondary max-w-xs leading-relaxed mt-1 mb-4">
                      {reportsSearchQuery || reportsFilter !== 'all'
                        ? 'No logs match your search or filter.'
                        : 'No logs have been synced yet. Sync the workspace to fetch fresh data.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(reportsSearchQuery || reportsFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setReportsSearchQuery('');
                            setReportsFilter('all');
                          }}
                          className="btn btn-secondary h-10"
                        >
                          Clear filters
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLogs(['crypto', 'weather', 'aqi', 'currency']);
                          setReportsSearchQuery('');
                          setReportsFilter('all');
                          fetchDashboardData(true);
                        }}
                        className="btn btn-primary h-10"
                      >
                        Sync workspace
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2" id="reports-log-list">
                    {reportsFiltered.map((report) => {
                      const isSelected = selectedLogs.includes(report.id);
                      const isLogDownloading = exportingLogId === report.id;
                      const logError = logErrors[report.id];

                      return (
                        <li
                          key={report.id}
                          className={`flex items-center gap-1 sm:gap-3 rounded-xl border p-1.5 sm:p-2 pr-2 sm:pr-3 transition-colors ${isSelected
                              ? 'border-border-strong bg-surface-2'
                              : 'border-border-hairline bg-surface-1 hover:bg-surface-2/60'
                            }`}
                        >
                          {/* Checkbox + details (whole area toggles selection) */}
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isSelected}
                            onClick={() => reportsToggle(report.id)}
                            className="flex flex-1 min-w-0 items-start gap-3 text-left rounded-lg p-2 min-h-10 cursor-pointer"
                          >
                            <span className="mt-0.5">{reportsCheckbox(isSelected ? 'on' : 'off')}</span>
                            <span className="hidden sm:flex w-9 h-9 rounded-lg bg-surface-1 border border-border-hairline items-center justify-center text-text-secondary shrink-0">
                              <PhosphorIcon name={report.icon} size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[14px] font-semibold text-text-primary leading-snug">{report.label}</span>
                              <span className="block text-[13px] text-text-secondary mt-0.5 line-clamp-1 sm:line-clamp-none">{report.desc}</span>
                              <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-[12.5px] text-text-muted tabular-nums">{report.format} · {report.sizeKb.toFixed(1)} KB</span>
                                <StatusBadge tone="success" progress="complete" size="sm">Synced · {getLogLastUpdated(report.id)}</StatusBadge>
                              </span>
                              {logError && (
                                <span className="block text-[13px] text-status-danger mt-1" role="alert">Couldn't create this file. Try again.</span>
                              )}
                            </span>
                          </button>

                          {/* Individual download */}
                          <button
                            type="button"
                            onClick={() => handleExportCSV(report.id)}
                            disabled={isLogDownloading}
                            aria-label={`Download ${report.label} as CSV`}
                            className={`btn h-10 w-10 px-0 sm:w-auto sm:h-9 sm:px-3 shrink-0 ${logError ? 'bg-status-danger text-white hover:opacity-95' : 'btn-secondary'}`}
                          >
                            {isLogDownloading ? (
                              <>
                                <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin shrink-0" />
                                <span className="hidden sm:inline">Preparing…</span>
                              </>
                            ) : logError ? (
                              <>
                                <PhosphorIcon name="error-circle" size={16} className="shrink-0" />
                                <span className="hidden sm:inline">Try again</span>
                              </>
                            ) : (
                              <>
                                <PhosphorIcon name="download" size={16} className="shrink-0" />
                                <span className="hidden sm:inline">Download</span>
                              </>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Step 2: combined download (desktop) */}
              <aside className="hidden lg:flex lg:col-span-4 lg:sticky lg:top-6 card card-pad lg:p-5 flex-col gap-4" id="reports-summary-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="card-title">Combined download</h3>
                    <p className="card-subtitle">One CSV with every selected log. Opens in Excel or Google Sheets.</p>
                  </div>
                  <div className="group relative shrink-0">
                    <PhosphorIcon name="info" size={16} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer" />
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30" id="version-tooltip-content">
                      <div className="bg-surface-1 text-text-primary text-[12px] whitespace-nowrap rounded-md px-2.5 py-1 border border-border-hairline shadow-lg">
                        Climex journal compiled
                      </div>
                    </div>
                  </div>
                </div>

                <dl className="rounded-xl bg-surface-2 divide-y divide-border-hairline text-[14px]">
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <dt className="text-text-secondary">Logs selected</dt>
                    <dd className="font-semibold text-text-primary tabular-nums">{reportsCount} of {reportsAllIds.length}</dd>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <dt className="text-text-secondary">Estimated size</dt>
                    <dd className="font-semibold text-text-primary tabular-nums">{reportsSizeKb.toFixed(1)} KB</dd>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5">
                    <dt className="text-text-secondary">Format</dt>
                    <dd className="font-semibold text-text-primary">CSV</dd>
                  </div>
                </dl>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={() => handleExportCSV('ledger')}
                  disabled={reportsCount === 0 || exportingBundle}
                  className={`btn btn-lg w-full ${reportsCtaClass}`}
                  id="generate-ledger-cta-btn"
                >
                  {reportsCtaInner(false)}
                </button>

                {reportsCount === 0 && (
                  <p className="text-[13px] text-text-secondary -mt-1 text-center">Pick at least one log to continue.</p>
                )}
                {bundleError && !exportingBundle && (
                  <p className="text-[13px] text-status-danger -mt-1 text-center" role="alert">The file couldn't be created. Your selection is kept — try again.</p>
                )}

                <div className="pt-3 border-t border-border-hairline">
                  {ledgerCompiledTime ? (
                    <StatusBadge tone="success" progress="complete">Last combined download · {getLogLastUpdated('ledger')}</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral" progress="incomplete">No combined download yet</StatusBadge>
                  )}
                </div>
              </aside>

            </div>

            {/* Sticky action bar (mobile & tablet): keeps the primary download reachable */}
            <div
              className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border-hairline bg-surface-1/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(0_0_0/0.06)]"
              id="reports-mobile-action-bar"
            >
              <div className="max-w-3xl mx-auto flex items-center gap-3">
                <div className="min-w-0 shrink-0">
                  <p className="text-[14px] font-semibold text-text-primary tabular-nums leading-tight">{reportsCount} of {reportsAllIds.length} selected</p>
                  <p className={`text-[12.5px] leading-tight mt-0.5 ${bundleError && !exportingBundle ? 'text-status-danger' : 'text-text-muted'}`}>
                    {bundleError && !exportingBundle ? 'Download failed' : reportsCount === 0 ? 'Pick a log above' : `${reportsSizeKb.toFixed(1)} KB · CSV`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV('ledger')}
                  disabled={reportsCount === 0 || exportingBundle}
                  className={`btn btn-lg flex-1 min-w-0 ${reportsCtaClass}`}
                  id="generate-ledger-cta-btn-mobile"
                >
                  {reportsCtaInner(true)}
                </button>
              </div>
            </div>
            </>
            );
          })()}

          {/* ==================== TAB 8: SETTINGS PAGE ==================== */}
          {activeTab === 'settings' && (() => {
            const settingsFlashSaved = (key: string) => {
              setSettingsSavedKey(key);
              window.setTimeout(() => setSettingsSavedKey(cur => (cur === key ? null : cur)), 2500);
            };
            const settingsNameDirty = userNameInput.trim() !== (userName || '');
            const settingsSaveName = () => {
              const trimmed = userNameInput.trim();
              if (trimmed) {
                localStorage.setItem('climex_user_name', trimmed);
                setUserName(trimmed);
              } else {
                localStorage.removeItem('climex_user_name');
                setUserName(null);
              }
              settingsFlashSaved('name');
            };
            const settingsTabs: Array<{ id: 'profile' | 'display' | 'data'; label: string }> = [
              { id: 'profile', label: 'Profile' },
              { id: 'display', label: 'Display' },
              { id: 'data', label: 'Data & alerts' },
            ];

            return (
              <div className="animate-slide-up max-w-5xl" id="settings-tab-view">
                {/* Mobile: one section per screen via a segmented switcher */}
                <div className="md:hidden mb-4">
                  <div className="segmented segmented-full" role="group" aria-label="Settings sections">
                    {settingsTabs.map(t => (
                      <button
                        key={t.id}
                       
                        aria-selected={settingsSection === t.id}
                        aria-pressed={settingsSection === t.id}
                        aria-controls={`settings-section-${t.id}`}
                        onClick={() => setSettingsSection(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 md:mb-8 text-[13px] text-text-secondary">
                  <PhosphorIcon name="info" size={16} className="text-text-muted shrink-0" />
                  <span>Preferences save automatically and stay on this device.</span>
                </div>

                <div className="flex flex-col">
                  {/* Profile */}
                  <SettingsSection
                    id="settings-section-profile"
                    title="Profile"
                    description="How Climex addresses you. Your name appears in the dashboard greeting and is only stored in this browser."
                    activeOnMobile={settingsSection === 'profile'}
                  >
                    <form
                      className="card-pad flex flex-col gap-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        settingsSaveName();
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <label htmlFor="settings-display-name" className="text-[14px] font-medium text-text-primary">Display name</label>
                          {settingsSavedKey === 'name' && (
                            <StatusBadge tone="success" progress="complete" size="xs">Saved</StatusBadge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[13px] text-text-secondary">Leave empty to use the default greeting.</p>
                      </div>
                      <input
                        id="settings-display-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your name"
                        className="w-full sm:max-w-sm h-11 sm:h-10 bg-surface-1 border border-border-hairline hover:border-border-strong focus:border-border-strong focus:ring-4 focus:ring-accent/10 rounded-lg px-3 font-sans text-[15px] sm:text-[14px] focus:outline-none transition-all text-text-primary placeholder:text-text-muted"
                        value={userNameInput}
                        onChange={(e) => setUserNameInput(e.target.value)}
                      />
                      <p className="text-[13px] text-text-muted">
                        Preview: <span className="text-text-secondary">“{getGreeting()}, {userNameInput.trim() || userName || 'trader'}”</span>
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button type="submit" className="btn btn-primary h-11 sm:h-9" disabled={!settingsNameDirty}>
                          Save name
                        </button>
                        {userName && (
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.removeItem('climex_user_name');
                              setUserName(null);
                              setUserNameInput('');
                              settingsFlashSaved('name');
                            }}
                            className="btn btn-secondary h-11 sm:h-9"
                          >
                            Clear
                          </button>
                        )}
                        {settingsNameDirty && (
                          <span className="text-[13px] text-text-muted ml-1">Unsaved changes</span>
                        )}
                      </div>
                    </form>
                  </SettingsSection>

                  {/* Display */}
                  <SettingsSection
                    id="settings-section-display"
                    title="Display"
                    description="Theme, units and formats used across weather and market panels."
                    activeOnMobile={settingsSection === 'display'}
                  >
                    <SettingsRow label="Appearance" help="Switch between the light and dark theme.">
                      <ThemeToggle />
                    </SettingsRow>
                    <SettingsRow
                      label="Temperature units"
                      help="Used in weather panels and search results."
                      saved={settingsSavedKey === 'temp'}
                    >
                      <div className="segmented" role="group" aria-label="Temperature units">
                        {[{ value: 'C', label: 'Celsius (°C)' }, { value: 'F', label: 'Fahrenheit (°F)' }].map(o => (
                          <button
                            key={o.value}
                            type="button"
                            aria-pressed={tempUnit === o.value}
                            className="h-9 sm:h-8"
                            onClick={() => {
                              setTempUnit(o.value);
                              localStorage.setItem('climex_temp_unit', o.value);
                              settingsFlashSaved('temp');
                            }}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </SettingsRow>
                    <SettingsRow
                      label="Default currency"
                      htmlFor="settings-default-currency"
                      help="Base currency for market indexes and financial metrics."
                      saved={settingsSavedKey === 'currency'}
                    >
                      <SettingsSelect
                        id="settings-default-currency"
                        value={defaultCurrency}
                        onChange={(v) => {
                          setDefaultCurrency(v);
                          localStorage.setItem('climex_default_currency', v);
                          settingsFlashSaved('currency');
                        }}
                        options={[
                          { value: 'USD', label: 'USD — US dollar' },
                          { value: 'EUR', label: 'EUR — Euro' },
                          { value: 'PHP', label: 'PHP — Philippine peso' },
                        ]}
                      />
                    </SettingsRow>
                  </SettingsSection>

                  {/* Data & refresh */}
                  <SettingsSection
                    id="settings-section-data"
                    title="Data & alerts"
                    description={
                      <>
                        Control how often live data refreshes and which alerts you get.{' '}
                        <a
                          href="/privacy"
                          onClick={(e) => navigateToTab('privacy', '/privacy', e)}
                          className="text-text-primary font-medium underline underline-offset-2 decoration-border-strong hover:decoration-text-primary"
                        >
                          How we handle data
                        </a>
                      </>
                    }
                    activeOnMobile={settingsSection === 'data'}
                  >
                    <SettingsRow
                      label="Update frequency"
                      htmlFor="settings-update-frequency"
                      help="How often dashboard data refreshes automatically."
                      saved={settingsSavedKey === 'frequency'}
                    >
                      <SettingsSelect
                        id="settings-update-frequency"
                        value={updateFrequency}
                        onChange={(v) => {
                          setUpdateFrequency(v);
                          localStorage.setItem('climex_update_frequency', v);
                          settingsFlashSaved('frequency');
                        }}
                        options={[
                          { value: 'realtime', label: 'Real-time' },
                          { value: 'minute', label: 'Every minute' },
                          { value: '5minutes', label: 'Every 5 minutes' },
                        ]}
                      />
                    </SettingsRow>
                    <SettingsRow
                      label="Price alerts"
                      help="Get alerts for rapid market spikes and volatile moves."
                      saved={settingsSavedKey === 'alerts'}
                    >
                      <SettingsSwitch
                        id="settings-price-alerts"
                        label="Price alerts"
                        checked={priceAlerts}
                        onChange={(val) => {
                          setPriceAlerts(val);
                          localStorage.setItem('climex_price_alerts', String(val));
                          settingsFlashSaved('alerts');
                        }}
                      />
                    </SettingsRow>
                  </SettingsSection>
                </div>
              </div>
            );
          })()}

          {/* ==================== TAB 9: INTERNAL ADMIN VIEW ==================== */}
          {activeTab === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" id="admin-tab-view">

              {/* Left column info — Span 4 */}
              <div className="lg:col-span-4 border border-border-hairline rounded-2xl bg-surface-1 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-sans font-semibold text-sm text-text-primary mb-1">Climex Proxy Configuration</h3>
                  <p className="text-xs text-text-secondary mb-6">Centralized settings, caching, and credentials</p>

                  <div className="space-y-4 text-xs font-sans">
                    <div className="bg-surface-2 p-3 rounded-xl border border-border-hairline">
                      <p className="text-[13px] text-text-secondary font-medium">Proxy Host IP</p>
                      <p className="font-mono text-text-primary mt-0.5">0.0.0.0:3000 (Local Container Routing)</p>
                    </div>

                    <div className="bg-surface-2 p-3 rounded-xl border border-border-hairline">
                      <p className="text-[13px] text-text-secondary font-medium">SWR cache TTL</p>
                      <p className="text-text-primary font-medium mt-0.5">45s (Crypto) | 10m (Weather) | 1hr (Currency)</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11.5px] font-mono text-text-secondary mt-8">
                  <PhosphorIcon name="hard-drive" className="text-sm text-status-accent" />
                  <span>Memory Cache Size: 320 KB</span>
                </div>
              </div>

              {/* Right column settings toggles — Span 8 */}
              <div className="lg:col-span-8 border border-border-hairline rounded-2xl bg-surface-1 p-6 shadow-sm flex flex-col gap-6">
                <h3 className="font-sans font-semibold text-sm text-text-primary border-b border-border-hairline pb-3">Feature Toggles</h3>

                <div className="space-y-4 text-xs">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between p-3.5 bg-surface-2 rounded-2xl border border-border-hairline/40">
                    <div>
                      <p className="font-sans font-semibold text-xs text-text-primary">Background Refresh Stream</p>
                      <p className="text-[11.5px] text-text-secondary mt-0.5">Automatically query proxy nodes in SWR loop</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-status-success-bg text-status-success font-mono font-bold text-[11.5px] uppercase">
                      Active
                    </span>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between p-3.5 bg-surface-2 rounded-2xl border border-border-hairline/40">
                    <div>
                      <p className="font-sans font-semibold text-xs text-text-primary">Dynamic Offline Fallbacks</p>
                      <p className="text-[11.5px] text-text-secondary mt-0.5">Serve high-fidelity dynamic mock indexes during network timeouts</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-status-success-bg text-status-success font-mono font-bold text-[11.5px] uppercase">
                      Enabled
                    </span>
                  </div>

                  {/* Toggle 3 */}
                  <div className="flex items-center justify-between p-3.5 bg-surface-2 rounded-2xl border border-border-hairline/40">
                    <div>
                      <p className="font-sans font-semibold text-xs text-text-primary">Rate-Limit Buffer</p>
                      <p className="text-[11.5px] text-text-secondary mt-0.5">Restrict client poll drift requests within safe limits</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-status-accent-bg text-status-accent font-mono font-bold text-[11.5px] uppercase">
                      Strictest
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 10: PRIVACY POLICY VIEW ==================== */}
          {activeTab === 'privacy' && (
            <PrivacyPolicy onBack={(e) => navigateToTab('dashboard', '/', e)} />
          )}

          </>
          )}

          {/* Footer branding */}
          <footer className="border-t border-border-hairline mt-8 sm:mt-12 py-6 px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs font-sans text-text-secondary" id="climex-footer">
            <p className="text-center sm:text-left text-xs text-text-secondary">&copy; 2026 Climex. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-2.5 sm:gap-x-4 gap-y-1.5 text-xs text-center">
              <a
                href="/privacy"
                onClick={(e) => navigateToTab('privacy', '/privacy', e)}
                className="hover:text-text-primary transition-colors font-sans font-medium cursor-pointer whitespace-nowrap"
              >
                Privacy
              </a>
              <span className="text-text-muted/60 text-[11.5px] shrink-0 select-none">•</span>
              <a
                href="mailto:support@climex-analytics.com"
                className="hover:text-text-primary transition-colors flex items-center gap-1 font-sans font-medium whitespace-nowrap"
              >
                Support & Resources
              </a>
              <span className="text-text-muted/60 text-[11.5px] shrink-0 select-none">•</span>
              <span className="font-sans font-medium text-[12.5px] whitespace-nowrap text-text-muted">Climex Dashboard v1</span>
            </div>
          </footer>



        </main>
      )}
    </div>
  );
}
