'use client';

import { cn } from '@/lib/utils';
import type { ReliabilityCriteria } from '@/lib/types';
import { criteriaLabels } from '@/lib/mock-data';
import { reliabilityConfig } from './reliability-badge';
import type { ReliabilityLevel } from '@/lib/types';

interface ScoreBarProps {
  label: string;
  value: number;
  max: number;
  colorClass?: string;
}

export function ScoreBar({ label, value, max, colorClass = 'bg-primary' }: ScoreBarProps) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface CriteriaBreakdownProps {
  criteria: ReliabilityCriteria;
  total: number;
  level: ReliabilityLevel;
}

export function CriteriaBreakdown({ criteria, total, level }: CriteriaBreakdownProps) {
  const config = reliabilityConfig[level];
  return (
    <div className="space-y-3">
      {criteriaLabels.map((c) => (
        <ScoreBar
          key={c.key}
          label={c.label}
          value={criteria[c.key]}
          max={c.max}
          colorClass={config.progressColor}
        />
      ))}
      <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
        <span>Tổng</span>
        <span className="tabular-nums">{total} / 100</span>
      </div>
    </div>
  );
}
