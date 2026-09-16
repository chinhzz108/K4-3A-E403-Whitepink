'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Loader2,
  Search,
  FileSearch,
  ArrowRight,
} from 'lucide-react';
import { researchSteps, searchQueries } from '@/lib/mock-data';

interface ResearchScreenProps {
  onComplete: () => void;
}

export function ResearchScreen({ onComplete }: ResearchScreenProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [visibleSearches, setVisibleSearches] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    researchSteps.forEach((_, idx) => {
      const startTimer = setTimeout(() => {
        setActiveStep(idx);
      }, idx * 700);
      stepTimers.push(startTimer);

      const completeTimer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, idx]);
      }, idx * 700 + 500);
      stepTimers.push(completeTimer);
    });

    const searchTimers: ReturnType<typeof setTimeout>[] = [];
    searchQueries.forEach((_, idx) => {
      const t = setTimeout(() => {
        setVisibleSearches(idx + 1);
      }, 800 + idx * 600);
      searchTimers.push(t);
    });

    const resultsTimer = setTimeout(() => setShowResults(true), 3500);
    const ctaTimer = setTimeout(() => setShowCta(true), 4200);

    return () => {
      stepTimers.forEach(clearTimeout);
      searchTimers.forEach(clearTimeout);
      clearTimeout(resultsTimer);
      clearTimeout(ctaTimer);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Đang nghiên cứu chủ đề</h1>
        <p className="mt-2 text-muted-foreground">
          ScriptScout đang xây dựng hồ sơ nguồn trước khi viết kịch bản.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Left: Agent Activity Timeline */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
            Hoạt động Agent
          </h2>
          <Card className="p-6">
            <div className="space-y-1">
              {researchSteps.map((step, idx) => {
                const isComplete = completedSteps.includes(idx);
                const isActive = activeStep === idx && !isComplete;
                const isPending = idx > activeStep;

                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                          isComplete && 'border-primary bg-primary text-primary-foreground',
                          isActive && 'border-primary bg-primary/10',
                          isPending && 'border-border bg-background'
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isActive ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      {idx < researchSteps.length - 1 && (
                        <div
                          className={cn(
                            'w-0.5 grow transition-colors duration-500',
                            isComplete ? 'bg-primary' : 'bg-border'
                          )}
                          style={{ minHeight: '20px' }}
                        />
                      )}
                    </div>
                    <div className="pb-4 pt-1">
                      <p
                        className={cn(
                          'text-sm transition-colors duration-300',
                          isComplete && 'font-medium text-foreground',
                          isActive && 'font-medium text-primary',
                          isPending && 'text-muted-foreground'
                        )}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Live Search Cards */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Search className="h-4 w-4" />
            Tìm kiếm trực tiếp
          </h2>
          <div className="space-y-3">
            {searchQueries.map((query, idx) => (
              <div
                key={query}
                className={cn(
                  'transition-all duration-500',
                  idx < visibleSearches
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none h-0'
                )}
              >
                <Card className="flex items-center gap-3 p-4 animate-fade-in">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <FileSearch className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{query}</p>
                    <p className="text-xs text-muted-foreground">
                      Đang tìm kiếm trên web...
                    </p>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </Card>
              </div>
            ))}

            {/* Results summary */}
            {showResults && (
              <div className="space-y-3 animate-fade-in">
                <Card className="border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Tìm thấy 12 kết quả</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      qua 4 truy vấn
                    </span>
                  </div>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">
                        5 nguồn chất lượng cao được chọn lọc
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600">
                      sau khi sàng lọc độ tin cậy
                    </span>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* CTA */}
          {showCta && (
            <div className="mt-6 animate-fade-in">
              <Button size="lg" className="w-full gap-2" onClick={onComplete}>
                Duyệt nguồn
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
