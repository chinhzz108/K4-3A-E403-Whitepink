'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SourceCard } from '@/components/source-card';
import { SourceDetailDrawer } from '@/components/source-detail-drawer';
import type { Source } from '@/lib/types';
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Search,
  RefreshCw,
  Globe,
  AlertOctagon,
  Unlink,
} from 'lucide-react';
import { toast } from 'sonner';

interface SourcesScreenProps {
  sources: Source[];
  onApprove: (id: string) => void;
  onRemove: (id: string) => void;
  onGenerate: () => void;
}

export function SourcesScreen({
  sources,
  onApprove,
  onRemove,
  onGenerate,
}: SourcesScreenProps) {
  const [drawerSource, setDrawerSource] = useState<Source | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const approvedCount = sources.filter((s) => s.approved).length;
  const highConfidenceCount = sources.filter(
    (s) => s.approved && s.reliabilityLevel === 'high'
  ).length;

  const metrics = [
    { label: 'Nguồn tìm thấy', value: '12', icon: FileText },
    { label: 'Được chọn lọc', value: '5', icon: CheckCircle2 },
    { label: 'Độ tin cậy cao', value: String(highConfidenceCount), icon: ShieldCheck },
    { label: 'Luận điểm xung đột', value: '1', icon: AlertTriangle },
  ];

  const handleApprove = (id: string) => {
    onApprove(id);
    const source = sources.find((s) => s.id === id);
    if (source) {
      toast.success(`Nguồn ${id} đã được duyệt`, {
        description: source.title,
      });
    }
  };

  const handleRemoveClick = (id: string) => {
    const source = sources.find((s) => s.id === id);
    if (source?.approved) {
      setConfirmRemoveId(id);
    } else {
      onRemove(id);
    }
  };

  const handleConfirmRemove = (id: string) => {
    onRemove(id);
    setConfirmRemoveId(null);
    const source = sources.find((s) => s.id === id);
    toast.warning(`Nguồn ${id} đã bị loại`, {
      description: source?.title,
    });
  };

  const handleViewEvidence = (source: Source) => {
    setDrawerSource(source);
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Duyệt nguồn</h1>
        <p className="mt-2 text-muted-foreground">
          Chỉ những nguồn được duyệt mới được dùng để tạo kịch bản.
        </p>
      </div>

      {/* Summary metrics */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Conflicting info card */}
      <Card className="mb-6 border-amber-200 bg-amber-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800">
              Phát hiện thông tin xung đột
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Một số nguồn sử dụng định nghĩa khác nhau về agent tự chủ.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-200 bg-background p-3">
                <p className="text-xs font-medium text-amber-700">Nguồn S1 (Anthropic)</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  &ldquo;Agents are systems where LLMs dynamically direct their own
                  processes and tool usage.&rdquo;
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-background p-3">
                <p className="text-xs font-medium text-amber-700">Nguồn S2 (ReAct)</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  &ldquo;ReAct interleaves reasoning traces and task-specific
                  actions.&rdquo;
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700">
              <AlertOctagon className="h-3.5 w-3.5" />
              Cần quyết định của con người
            </div>
          </div>
        </div>
      </Card>

      {/* Source cards */}
      <div className="space-y-4">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            onApprove={handleApprove}
            onRemove={handleRemoveClick}
            onViewEvidence={handleViewEvidence}
            confirmRemoveId={confirmRemoveId}
            onConfirmRemove={handleConfirmRemove}
            onCancelRemove={() => setConfirmRemoveId(null)}
          />
        ))}
      </div>

      {/* Error state examples */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <ErrorStateCard
          icon={Search}
          title="Không có nguồn đáng tin cậy"
          message="Không tìm thấy đủ bằng chứng đáng tin cậy."
          actions={['Tìm lại', 'Mở rộng tìm kiếm']}
        />
        <ErrorStateCard
          icon={AlertTriangle}
          title="Bằng chứng xung đột"
          message="Hai nguồn đáng tin cậy bất đồng quan điểm."
          actions={['Giữ nguồn A', 'Giữ nguồn B', 'Giữ cả hai góc nhìn']}
        />
        <ErrorStateCard
          icon={Unlink}
          title="Nguồn bị hỏng"
          message="Không thể truy cập trang này."
          badge="Đã loại khỏi bằng chứng"
        />
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 mt-8">
        <Card className="flex items-center justify-between p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {approvedCount} {approvedCount === 1 ? 'nguồn' : 'nguồn'} đã duyệt
              </p>
              <p className="text-xs text-muted-foreground">
                {approvedCount > 0
                  ? 'Sẵn sàng tạo kịch bản'
                  : 'Cần duyệt ít nhất một nguồn để tiếp tục'}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="gap-2"
            disabled={approvedCount === 0}
            onClick={onGenerate}
          >
            Tạo kịch bản
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>

      <SourceDetailDrawer
        source={drawerSource}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

function ErrorStateCard({
  icon: Icon,
  title,
  message,
  actions,
  badge,
}: {
  icon: typeof Search;
  title: string;
  message: string;
  actions?: string[];
  badge?: string;
}) {
  return (
    <Card className="border-dashed p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
          {badge && (
            <span className="mt-2 inline-block rounded-full border border-muted-foreground/20 bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {badge}
            </span>
          )}
          {actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((a) => (
                <Button key={a} size="sm" variant="outline" className="h-7 text-xs">
                  {a}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
