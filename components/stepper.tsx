'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { Screen } from '@/lib/types';

interface StepperProps {
  current: Screen;
  onStepClick?: (screen: Screen) => void;
}

const steps: { key: Screen; label: string }[] = [
  { key: 'brief', label: 'Yêu cầu' },
  { key: 'research', label: 'Nghiên cứu' },
  { key: 'sources', label: 'Nguồn' },
  { key: 'script', label: 'Kịch bản' },
];

const stepOrder: Screen[] = ['brief', 'research', 'sources', 'script'];

export function Stepper({ current, onStepClick }: StepperProps) {
  const currentIdx = stepOrder.indexOf(current);

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-1 py-4">
          {steps.map((step, idx) => {
            const stepIdx = stepOrder.indexOf(step.key);
            const isComplete = stepIdx < currentIdx;
            const isCurrent = step.key === current;
            const isClickable = stepIdx <= currentIdx && onStepClick;

            return (
              <div key={step.key} className="flex items-center">
                {idx > 0 && (
                  <div
                    className={cn(
                      'h-px w-8 sm:w-12 transition-colors duration-300',
                      isComplete ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
                <button
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(step.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    isCurrent && 'bg-primary text-primary-foreground shadow-sm',
                    isComplete && !isCurrent && 'text-primary',
                    !isCurrent && !isComplete && 'text-muted-foreground',
                    isClickable && !isCurrent && 'hover:bg-accent cursor-pointer',
                    !isClickable && 'cursor-default'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                      isCurrent && 'bg-primary-foreground/20 text-primary-foreground',
                      isComplete && !isCurrent && 'bg-primary/10 text-primary',
                      !isCurrent && !isComplete && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isComplete ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
