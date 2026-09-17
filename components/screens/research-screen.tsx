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
  AlertCircle,
} from 'lucide-react';

interface ResearchScreenProps {
  onComplete: () => void;
  isLoading?: boolean;
  progress?: string;
  sourcesFound?: number;
}

const researchSteps = [
  'Đang hiểu mục tiêu học tập',
  'Đang tạo câu hỏi nghiên cứu',
  'Đang tìm kiếm nguồn trên web',
  'Đang đọc nội dung trang',
  'Đang đánh giá độ tin cậy nguồn',
  'Đang trích xuất bằng chứng',
];

export function ResearchScreen({
  onComplete,
  isLoading = false,
  progress = '',
  sourcesFound = 0,
}: ResearchScreenProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Animate steps based on loading state
  useEffect(() => {
    if (!isLoading) {
      // All done — mark all complete
      if (sourcesFound > 0) {
        setCompletedSteps([0, 1, 2, 3, 4, 5]);
        setActiveStep(6);
      }
      return;
    }

    // Animate through steps while loading
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < researchSteps.length - 1) {
          setCompletedSteps((c) => [...c, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading, sourcesFound]);

  const isError = !isLoading && sourcesFound === 0 && progress.includes('Lỗi');
  const isDone = !isLoading && sourcesFound > 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Đang nghiên cứu chủ đề</h1>
        <p className="mt-2 text-muted-foreground">
          ScriptScout đang tìm kiếm và đánh giá nguồn tài liệu thật trên web.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Left: Agent Activity Timeline */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {isLoading && (
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
            Các bước dự kiến (minh họa, không phải log trực tiếp)
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

        {/* Right: Live Progress */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Search className="h-4 w-4" />
            Tiến trình
          </h2>
          <div className="space-y-3">
            {/* Progress message */}
            {progress && (
              <Card
                className={cn(
                  'p-4',
                  isError
                    ? 'border-red-200 bg-red-50'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-primary/20 bg-primary/5'
                )}
              >
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : isError ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isError ? 'text-red-700' : isDone ? 'text-emerald-700' : ''
                    )}
                  >
                    {progress}
                  </span>
                </div>
              </Card>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <Card className="flex items-center gap-3 p-4 animate-pulse">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <FileSearch className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Đang xử lý yêu cầu; kết quả dịch vụ sẽ được ghi trong trace.</p>
                  <p className="text-xs text-muted-foreground">
                    Quá trình có thể mất 15–30 giây
                  </p>
                </div>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </Card>
            )}

            {/* Result summary */}
            {isDone && (
              <div className="space-y-3 animate-fade-in">
                <Card className="border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">
                        {sourcesFound} nguồn đã đánh giá
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600">
                      Lời gọi AI thật
                    </span>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* CTA */}
          {isDone && (
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
