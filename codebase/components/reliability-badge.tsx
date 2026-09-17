'use client';

import { cn } from '@/lib/utils';
import type { ReliabilityLevel } from '@/lib/types';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface ReliabilityBadgeProps {
  level: ReliabilityLevel;
  score: number;
  className?: string;
}

const levelConfig = {
  high: {
    label: 'Độ tin cậy cao',
    icon: ShieldCheck,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  bar: 'bg-emerald-500',
  text: 'text-emerald-600',
  ring: 'ring-emerald-200',
  hoverBg: 'hover:bg-emerald-50',
  glow: 'shadow-emerald-100',
  softBg: 'bg-emerald-50/60',
  border: 'border-emerald-200',
  solidText: 'text-emerald-700',
  solidBorder: 'border-emerald-300',
  solidBg: 'bg-emerald-100',
    chipBg: 'bg-emerald-100',
    chipText: 'text-emerald-700',
    chipBorder: 'border-emerald-200',
  iconColor: 'text-emerald-600',
  progressColor: 'bg-emerald-500',
    softProgressBg: 'bg-emerald-100',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    softBgHover: 'hover:bg-emerald-50',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-emerald-600',
    ringColor: 'ring-emerald-200',
    shadowColor: 'shadow-emerald-100/50',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    badgeHoverBg: 'hover:bg-emerald-100',
    badgeIconColor: 'text-emerald-600',
  },
  medium: {
    label: 'Độ tin cậy trung bình',
    icon: ShieldAlert,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    text: 'text-amber-600',
    ring: 'ring-amber-200',
    hoverBg: 'hover:bg-amber-50',
    glow: 'shadow-amber-100',
    softBg: 'bg-amber-50/60',
    border: 'border-amber-200',
    solidText: 'text-amber-700',
    solidBorder: 'border-amber-300',
    solidBg: 'bg-amber-100',
    chipBg: 'bg-amber-100',
    chipText: 'text-amber-700',
    chipBorder: 'border-amber-200',
    iconColor: 'text-amber-600',
    progressColor: 'bg-amber-500',
    softProgressBg: 'bg-amber-100',
    accentText: 'text-amber-700',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    softBgHover: 'hover:bg-amber-50',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-600',
    ringColor: 'ring-amber-200',
    shadowColor: 'shadow-amber-100/50',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    badgeHoverBg: 'hover:bg-amber-100',
    badgeIconColor: 'text-amber-600',
  },
  low: {
    label: 'Độ tin cậy thấp',
    icon: ShieldX,
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    text: 'text-red-600',
    ring: 'ring-red-200',
    hoverBg: 'hover:bg-red-50',
    glow: 'shadow-red-100',
    softBg: 'bg-red-50/60',
    border: 'border-red-200',
    solidText: 'text-red-700',
    solidBorder: 'border-red-300',
    solidBg: 'bg-red-100',
    chipBg: 'bg-red-100',
    chipText: 'text-red-700',
    chipBorder: 'border-red-200',
    iconColor: 'text-red-600',
    progressColor: 'bg-red-500',
    softProgressBg: 'bg-red-100',
    accentText: 'text-red-700',
    accentBg: 'bg-red-50',
    accentBorder: 'border-red-200',
    softBgHover: 'hover:bg-red-50',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-red-600',
    ringColor: 'ring-red-200',
    shadowColor: 'shadow-red-100/50',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200',
    badgeHoverBg: 'hover:bg-red-100',
    badgeIconColor: 'text-red-600',
  },
} as const;

export const reliabilityConfig = levelConfig;

export function ReliabilityBadge({ level, score, className }: ReliabilityBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        config.badgeBg,
        config.badgeText,
        config.badgeBorder,
        className
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.badgeIconColor)} />
      {config.label}
    </span>
  );
}

export function ReliabilityDot({ level, className }: { level: ReliabilityLevel; className?: string }) {
  const config = levelConfig[level];
  return <span className={cn('inline-block h-2 w-2 rounded-full', config.dot, className)} />;
}
