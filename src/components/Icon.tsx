/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * App-wide icon set in a Polaris-like style: outline icons with a constant 1.5px rounded stroke,
 * drawn with lucide-react. Exported under the names the app already uses, so call sites only
 * change their import. `weight` is accepted for compatibility: "bold" draws a 2px stroke,
 * "thin"/"light" 1.25px, and "fill" gives the filled variant where one exists.
 */

import React from 'react';
import {
  RotateCcw,
  ArrowRight as LArrowRight,
  ArrowLeftRight,
  Landmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cat as LCat,
  CircleCheck,
  Clock as LClock,
  Cloud as LCloud,
  CloudLightning as LCloudLightning,
  CloudRain as LCloudRain,
  CloudSnow as LCloudSnow,
  CloudSun as LCloudSun,
  Coins as LCoins,
  Compass as LCompass,
  Bell as LBell,
  Bitcoin,
  CircleDollarSign,
  Database as LDatabase,
  Download as LDownload,
  Mail,
  FileText as LFileText,
  Settings,
  Globe as LGlobe,
  LayoutGrid,
  HeartPulse,
  House as LHouse,
  Info as LInfo,
  Menu,
  Search,
  Minus as LMinus,
  Moon as LMoon,
  Pencil as LPencil,
  User,
  Plus as LPlus,
  Sun as LSun,
  Thermometer as LThermometer,
  TrendingDown,
  TrendingUp,
  CircleAlert,
  Wind as LWind,
  X as LX,
  type LucideIcon,
} from 'lucide-react';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'stroke'> {
  size?: number | string;
  weight?: IconWeight;
  color?: string;
}

const strokeFor = (weight: IconWeight) => (weight === 'bold' ? 2 : weight === 'thin' || weight === 'light' ? 1.25 : 1.5);

function polaris(Base: LucideIcon, displayName: string) {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(({ size = '1em', weight = 'regular', ...rest }, ref) => {
    const stroke = strokeFor(weight as IconWeight);
    // Keep the stroke a constant pixel width at numeric sizes; for em sizes assume ~16px.
    const numeric = typeof size === 'number';
    return (
      <Base
        ref={ref}
        size={size}
        strokeWidth={numeric ? stroke : (stroke * 24) / 16}
        absoluteStrokeWidth={numeric}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={rest['aria-label'] ? undefined : true}
        focusable={false}
        {...(rest as any)}
      />
    );
  });
  Icon.displayName = displayName;
  return Icon;
}

// Filled check circle (Polaris "CheckCircle" filled): solid disc with a knocked-out tick
const CheckCircleFilled = React.forwardRef<SVGSVGElement, IconProps>(({ size = '1em', weight: _w, ...rest }, ref) => (
  <svg ref={ref} viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden={rest['aria-label'] ? undefined : true} focusable={false} {...rest}>
    <circle cx="10" cy="10" r="8.25" fill="currentColor" />
    <path d="m6.75 10.25 2.25 2.25 4.25-4.5" stroke="var(--surface, #fff)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
));
CheckCircleFilled.displayName = 'CheckCircleFilled';

const CheckCircleOutline = polaris(CircleCheck, 'CheckCircle');
export const CheckCircle = React.forwardRef<SVGSVGElement, IconProps>((props, ref) =>
  props.weight === 'fill' ? <CheckCircleFilled ref={ref} {...props} /> : <CheckCircleOutline ref={ref} {...props} />
);
CheckCircle.displayName = 'CheckCircle';

export const ArrowCounterClockwise = polaris(RotateCcw, 'ArrowCounterClockwise');
export const ArrowRight = polaris(LArrowRight, 'ArrowRight');
export const ArrowsLeftRight = polaris(ArrowLeftRight, 'ArrowsLeftRight');
export const Bank = polaris(Landmark, 'Bank');
export const Bell = polaris(LBell, 'Bell');
export const CaretDown = polaris(ChevronDown, 'CaretDown');
export const CaretLeft = polaris(ChevronLeft, 'CaretLeft');
export const CaretRight = polaris(ChevronRight, 'CaretRight');
export const CaretUp = polaris(ChevronUp, 'CaretUp');
export const Cat = polaris(LCat, 'Cat');
export const Clock = polaris(LClock, 'Clock');
export const Cloud = polaris(LCloud, 'Cloud');
export const CloudLightning = polaris(LCloudLightning, 'CloudLightning');
export const CloudRain = polaris(LCloudRain, 'CloudRain');
export const CloudSnow = polaris(LCloudSnow, 'CloudSnow');
export const CloudSun = polaris(LCloudSun, 'CloudSun');
export const Coins = polaris(LCoins, 'Coins');
export const Compass = polaris(LCompass, 'Compass');
export const CurrencyBtc = polaris(Bitcoin, 'CurrencyBtc');
export const CurrencyDollar = polaris(CircleDollarSign, 'CurrencyDollar');
export const Database = polaris(LDatabase, 'Database');
export const Download = polaris(LDownload, 'Download');
export const EnvelopeSimple = polaris(Mail, 'EnvelopeSimple');
export const FileText = polaris(LFileText, 'FileText');
export const Gear = polaris(Settings, 'Gear');
export const Globe = polaris(LGlobe, 'Globe');
export const GridFour = polaris(LayoutGrid, 'GridFour');
export const Heartbeat = polaris(HeartPulse, 'Heartbeat');
export const House = polaris(LHouse, 'House');
export const Info = polaris(LInfo, 'Info');
export const List = polaris(Menu, 'List');
export const MagnifyingGlass = polaris(Search, 'MagnifyingGlass');
export const Minus = polaris(LMinus, 'Minus');
export const Moon = polaris(LMoon, 'Moon');
export const Pencil = polaris(LPencil, 'Pencil');
export const Person = polaris(User, 'Person');
export const Plus = polaris(LPlus, 'Plus');
export const Sun = polaris(LSun, 'Sun');
export const Thermometer = polaris(LThermometer, 'Thermometer');
export const TrendDown = polaris(TrendingDown, 'TrendDown');
export const TrendUp = polaris(TrendingUp, 'TrendUp');
export const WarningCircle = polaris(CircleAlert, 'WarningCircle');
export const Wind = polaris(LWind, 'Wind');
export const X = polaris(LX, 'X');
