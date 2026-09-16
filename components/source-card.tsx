'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReliabilityBadge, reliabilityConfig } from '@/components/reliability-badge';
import type { Source } from '@/lib/types';
import {
  Check,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Link2,
  ShieldX,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';

interface SourceCardProps {
  source: Source;
  onApprove: (id: string) => void;
  onRemove: (id: string) => void;
  onViewEvidence: (source: Source) => void;
  confirmRemoveId: string | null;
  onConfirmRemove: (id: string) => void;
  onCancelRemove: () => void;
}

export function SourceCard({
  source,
  onApprove,
  onRemove,
  onViewEvidence,
  confirmRemoveId,
  onConfirmRemove,
  onCancelRemove,
}: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = reliabilityConfig[source.reliabilityLevel];
  const isExcluded = !source.approved;
  const isConfirming = confirmRemoveId === source.id;

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isExcluded
          ? 'border-border bg-muted/40 opacity-60'
          : 'hover:shadow-md',
        source.promptInjectionDetected && !isExcluded && 'border-red-200'
      )}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                isExcluded
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary'
              )}
            >
              {source.id}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight">{source.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {source.publisher} · {source.type}
              </p>
            </div>
          </div>
          <ReliabilityBadge level={source.reliabilityLevel} score={source.reliabilityScore} />
        </div>

        {/* Score bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all duration-700', config.progressColor)}
              style={{ width: `${source.reliabilityScore}%` }}
            />
          </div>
          <span className={cn('text-sm font-bold tabular-nums', config.accentText)}>
            {source.reliabilityScore}
            <span className="text-xs font-normal text-muted-foreground">/100</span>
          </span>
        </div>

        {/* Metadata */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">{source.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{source.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            <span className="truncate font-mono">{source.domain}</span>
          </div>
        </div>

        {/* Prompt injection warning */}
        {source.promptInjectionDetected && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-700">
              <ShieldX className="h-4 w-4" />
              Phát hiện tiêm nhiễm prompt
            </div>
            <div className="mt-2 rounded border border-red-200 bg-red-100/50 p-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertTriangle className="h-3 w-3" />
                Nội dung web không đáng tin — đã bỏ qua
              </div>
              <p className="mt-1 font-mono text-xs text-red-800">
                &ldquo;{source.untrustedContent}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Expandable section */}
        {expanded && !source.promptInjectionDetected && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tại sao nguồn này đáng tin cậy
              </h4>
              <p className="text-sm leading-relaxed text-foreground">{source.reason}</p>
            </div>
            {source.evidence && (
              <div className="rounded-lg border border-border p-3">
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Bằng chứng trích xuất
                </h4>
                <blockquote className="border-l-2 border-primary pl-3 text-sm leading-relaxed">
                  {source.evidence}
                </blockquote>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isConfirming ? (
          <div className="mt-4 flex items-center gap-2">
            {isExcluded ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => onApprove(source.id)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Thêm lại
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                onClick={() => onApprove(source.id)}
              >
                <Check className="h-3.5 w-3.5" />
                Đã duyệt
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                'gap-1.5',
                isExcluded
                  ? 'text-muted-foreground'
                  : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              )}
              onClick={() => onRemove(source.id)}
            >
              <X className="h-3.5 w-3.5" />
              {isExcluded ? 'Đã loại' : 'Loại'}
            </Button>
            <div className="flex-1" />
            {!source.promptInjectionDetected && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {expanded ? 'Thu gọn' : 'Chi tiết'}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-primary"
              onClick={() => onViewEvidence(source)}
            >
              <Eye className="h-3.5 w-3.5" />
              Xem bằng chứng
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 animate-fade-in">
            <span className="text-sm text-amber-700">
              Loại nguồn này? Nó sẽ không được dùng để tạo kịch bản.
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={onCancelRemove}>
                Hủy
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onConfirmRemove(source.id)}
              >
                Loại
              </Button>
            </div>
          </div>
        )}

        {/* Excluded badge */}
        {isExcluded && !isConfirming && (
          <div className="mt-3">
            <Badge variant="outline" className="border-muted-foreground/20 bg-muted text-muted-foreground">
              Đã loại khỏi bằng chứng
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
