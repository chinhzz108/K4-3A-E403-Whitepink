'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ReliabilityBadge } from '@/components/reliability-badge';
import type { Source } from '@/lib/types';
import { CheckCircle2, FileText, Building2, Calendar, ExternalLink } from 'lucide-react';

interface CitationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: string | null;
  claim: string;
  sources: Source[];
}

export function CitationDrawer({
  open,
  onOpenChange,
  sourceId,
  claim,
  sources,
}: CitationDrawerProps) {
  const source = sources.find((s) => s.id === sourceId) ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto scrollbar-thin sm:max-w-md"
      >
        <SheetHeader className="mb-2">
          <SheetDescription className="text-xs font-mono uppercase tracking-wide">
            Trích dẫn {sourceId}
          </SheetDescription>
          <SheetTitle className="text-xl leading-tight">Xác minh bằng chứng</SheetTitle>
        </SheetHeader>

        {source && (
          <div className="mt-4 space-y-5">
            {/* Verification status */}
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Đã xác minh</p>
                <p className="text-xs text-emerald-600">
                  Luận điểm này được hỗ trợ bởi bằng chứng đã xác minh từ nguồn.
                </p>
              </div>
            </div>

            {/* Claim */}
            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Luận điểm
              </h3>
              <p className="text-sm leading-relaxed">{claim}</p>
            </div>

            {/* Source info */}
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold">Nguồn</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium leading-tight">{source.title}</p>
                    <p className="text-xs text-muted-foreground">{source.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{source.publisher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{source.date}</span>
                </div>
              </div>
              <div className="pt-1">
                <ReliabilityBadge level={source.reliabilityLevel} score={source.reliabilityScore} />
              </div>
            </div>

            {/* Exact evidence */}
            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">Bằng chứng hỗ trợ chính xác</h3>
              <blockquote className="rounded-lg border-l-2 border-primary bg-accent/50 p-3 text-sm leading-relaxed">
                {source.evidence}
              </blockquote>
            </div>

            {/* Reliability score */}
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <span className="text-sm font-medium">Điểm tin cậy</span>
              <span className="text-lg font-bold tabular-nums text-primary">
                {source.reliabilityScore}
                <span className="text-sm font-normal text-muted-foreground">/100</span>
              </span>
            </div>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              Mở nguồn gốc
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
