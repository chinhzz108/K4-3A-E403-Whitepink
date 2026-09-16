'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReliabilityBadge, reliabilityConfig } from '@/components/reliability-badge';
import { CriteriaBreakdown } from '@/components/score-bar';
import type { Source } from '@/lib/types';
import { getCriteriaTotal } from '@/lib/mock-data';
import { ExternalLink, FileText, Calendar, User, Building2, Link2, AlertTriangle, ShieldX } from 'lucide-react';

interface SourceDetailDrawerProps {
  source: Source | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SourceDetailDrawer({ source, open, onOpenChange }: SourceDetailDrawerProps) {
  if (!source) return null;
  const total = getCriteriaTotal(source.criteria);
  const config = reliabilityConfig[source.reliabilityLevel];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto scrollbar-thin sm:max-w-lg"
      >
        <SheetHeader className="mb-2">
          <div className="flex items-start justify-between gap-3 pr-8">
            <Badge variant="outline" className="mb-1 font-mono text-xs">
              {source.id}
            </Badge>
            <ReliabilityBadge level={source.reliabilityLevel} score={source.reliabilityScore} />
          </div>
          <SheetTitle className="text-xl leading-tight">{source.title}</SheetTitle>
          <SheetDescription className="text-sm">
            {source.type}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Nhà xuất bản:</span>
              <span className="font-medium">{source.publisher}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tác giả:</span>
              <span className="font-medium">{source.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Xuất bản:</span>
              <span className="font-medium">{source.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tên miền:</span>
              <span className="font-mono text-xs">{source.domain}</span>
            </div>
          </div>

          {/* Prompt injection warning */}
          {source.promptInjectionDetected && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                <ShieldX className="h-4 w-4" />
                Phát hiện tiêm nhiễm prompt
              </div>
              <div className="rounded-lg border border-red-200 bg-red-100/50 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Nội dung web không đáng tin — đã bỏ qua
                </div>
                <p className="font-mono text-sm text-red-800">
                  &ldquo;{source.untrustedContent}&rdquo;
                </p>
              </div>
              <p className="mt-2 text-xs text-red-600">
                Nội dung web được xử lý như dữ liệu, không phải lệnh. Đoạn text này không được thực thi.
              </p>
            </div>
          )}

          {/* Reliability score */}
          <div className="rounded-xl border border-border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Điểm tin cậy</h3>
              <span className={`text-2xl font-bold tabular-nums ${config.accentText}`}>
                {source.reliabilityScore}
                <span className="text-sm font-normal text-muted-foreground">/100</span>
              </span>
            </div>
            <CriteriaBreakdown
              criteria={source.criteria}
              total={total}
              level={source.reliabilityLevel}
            />
          </div>

          {/* Reason */}
          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-2 text-sm font-semibold">Tại sao nguồn này được coi là đáng tin cậy</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {source.reason}
            </p>
          </div>

          {/* Supporting evidence */}
          {source.evidence && (
            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Bằng chứng hỗ trợ
              </h3>
              <blockquote className="rounded-lg border-l-2 border-primary bg-accent/50 p-3 text-sm leading-relaxed text-foreground">
                {source.evidence}
              </blockquote>
              <div className="mt-4">
                <h4 className="mb-2 text-xs font-medium text-muted-foreground">Được dùng bởi</h4>
                <div className="flex flex-wrap gap-2">
                  {getUsedBySentences(source.id).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Open original source */}
          <Button variant="outline" className="w-full gap-2" onClick={() => {}}>
            <ExternalLink className="h-4 w-4" />
            Mở nguồn gốc
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getUsedBySentences(sourceId: string): string[] {
  const usageMap: Record<string, string[]> = {
    S1: ['Câu #1', 'Câu #3'],
    S2: ['Câu #2', 'Câu #4'],
    S3: ['Câu #5'],
    S4: [],
  };
  return usageMap[sourceId] ?? [];
}
