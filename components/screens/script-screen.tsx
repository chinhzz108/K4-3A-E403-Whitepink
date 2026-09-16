'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CitationDrawer } from '@/components/citation-drawer';
import type { Source, Scene, SceneSentence } from '@/lib/types';
import { alternativeSentences } from '@/lib/mock-data';
import {
  Clock,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Download,
  FileDown,
  AlertTriangle,
  RotateCcw,
  Target,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface ScriptScreenProps {
  sources: Source[];
  scenes: Scene[];
  onRemoveSource: (id: string) => void;
  onBackToSources: () => void;
}

export function ScriptScreen({
  sources,
  scenes,
  onRemoveSource,
  onBackToSources,
}: ScriptScreenProps) {
  const [localScenes, setLocalScenes] = useState<Scene[]>(scenes);
  const [citationOpen, setCitationOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<{
    sourceId: string;
    claim: string;
  } | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const approvedSources = sources.filter((s) => s.approved);

  // Count verified claims (sentences whose source is approved)
  const allSentences = localScenes.flatMap((sc) => sc.sentences);
  const verifiedClaims = allSentences.filter((s) => {
    const src = sources.find((so) => so.id === s.sourceId);
    return src?.approved;
  }).length;
  const totalClaims = allSentences.length;
  const needsRegenCount = allSentences.filter((s) => s.needsRegeneration).length;

  const handleRemoveSource = (id: string) => {
    onRemoveSource(id);
    // Mark sentences that depend on this source as needing regeneration
    setLocalScenes((prev) =>
      prev.map((scene) => ({
        ...scene,
        sentences: scene.sentences.map((s) =>
          s.sourceId === id && !s.regenerated
            ? { ...s, needsRegeneration: true }
            : s
        ),
      }))
    );
    toast.warning(`Đã loại nguồn ${id}`, {
      description: 'Các câu phụ thuộc vào nguồn này đã được đánh dấu cần tạo lại.',
    });
  };

  const handleRegenerate = (sentenceId: string) => {
    setRegenerating(sentenceId);
    setTimeout(() => {
      const alt = alternativeSentences[sentenceId];
      if (alt) {
        setLocalScenes((prev) =>
          prev.map((scene) => ({
            ...scene,
            sentences: scene.sentences.map((s) =>
              s.id === sentenceId
                ? {
                    ...s,
                    text: alt.text,
                    sourceId: alt.sourceId,
                    needsRegeneration: false,
                    regenerated: true,
                  }
                : s
            ),
          }))
        );
      }
      setRegenerating(null);
      toast.success('Đã tạo lại câu', {
        description: 'Đã sử dụng bằng chứng từ nguồn được duyệt khác.',
      });
    }, 1500);
  };

  const handleCitationClick = (sourceId: string, claim: string) => {
    setActiveCitation({ sourceId, claim });
    setCitationOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Kịch bản video đã tạo</h1>
        <p className="mt-2 text-muted-foreground">
          Mọi luận điểm đều được liên kết với bằng chứng hỗ trợ.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
        {/* LEFT: Main script */}
        <div className="space-y-5">
          {localScenes.map((scene) => (
            <Card key={scene.number} className="overflow-hidden">
              {/* Scene header */}
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {scene.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">Cảnh {scene.number} — {scene.purpose}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {scene.duration}
                </div>
              </div>

              {/* Scene body */}
              <div className="space-y-3 p-5">
                {scene.sentences.map((sentence) => (
                  <SentenceBlock
                    key={sentence.id}
                    sentence={sentence}
                    source={sources.find((s) => s.id === sentence.sourceId)}
                    onCitationClick={handleCitationClick}
                    onRegenerate={handleRegenerate}
                    isRegenerating={regenerating === sentence.id}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-4">
          {/* Script overview */}
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Tổng quan kịch bản</h3>
            <div className="space-y-3">
              <SidebarStat icon={Clock} label="Thời lượng" value="5 phút" />
              <SidebarStat icon={FileText} label="Cảnh" value="3" />
              <SidebarStat icon={Target} label="Luận điểm" value={String(totalClaims)} />
              <SidebarStat
                icon={CheckCircle2}
                label="Luận điểm đã xác minh"
                value={`${verifiedClaims} / ${totalClaims}`}
                valueClass="text-emerald-600"
              />
              <SidebarStat icon={ShieldCheck} label="Nguồn đã duyệt" value={String(approvedSources.length)} />
              <SidebarStat
                icon={Sparkles}
                label="Độ phủ trích dẫn"
                value={needsRegenCount > 0 ? `${Math.round(((totalClaims - needsRegenCount) / totalClaims) * 100)}%` : '100%'}
                valueClass={needsRegenCount > 0 ? 'text-amber-600' : 'text-emerald-600'}
              />
            </div>
          </Card>

          {/* Sources used */}
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold">Nguồn dùng trong kịch bản</h3>
            <div className="space-y-2">
              {sources.filter((s) => s.reliabilityLevel !== 'low' || s.approved).map((source) => {
                const isUsed = localScenes.some((sc) =>
                  sc.sentences.some((s) => s.sourceId === source.id)
                );
                return (
                  <div
                    key={source.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-2 transition-all',
                      source.approved
                        ? 'border-border bg-card'
                        : 'border-red-200 bg-red-50/50'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold',
                        source.approved ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'
                      )}>
                        {source.id}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{source.publisher}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {source.approved ? (isUsed ? 'Đang dùng' : 'Khả dụng') : 'Đã loại'}
                        </p>
                      </div>
                    </div>
                    {source.approved && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 shrink-0 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRemoveSource(source.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Loại
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full text-xs"
              onClick={onBackToSources}
            >
              Quay lại duyệt nguồn
            </Button>
          </Card>

          {/* Export */}
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold">Xuất file</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() =>
                  toast.info('Xuất file sẽ có sẵn trong phiên bản đầy đủ.')
                }
              >
                <FileDown className="h-4 w-4" />
                Xuất DOCX
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() =>
                  toast.info('Xuất file sẽ có sẵn trong phiên bản đầy đủ.')
                }
              >
                <Download className="h-4 w-4" />
                Xuất PDF
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <CitationDrawer
        open={citationOpen}
        onOpenChange={setCitationOpen}
        sourceId={activeCitation?.sourceId ?? null}
        claim={activeCitation?.claim ?? ''}
        sources={sources}
      />
    </div>
  );
}

function SidebarStat({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <span className={cn('text-sm font-semibold tabular-nums', valueClass)}>
        {value}
      </span>
    </div>
  );
}

function SentenceBlock({
  sentence,
  source,
  onCitationClick,
  onRegenerate,
  isRegenerating,
}: {
  sentence: SceneSentence;
  source: Source | undefined;
  onCitationClick: (sourceId: string, claim: string) => void;
  onRegenerate: (sentenceId: string) => void;
  isRegenerating: boolean;
}) {
  if (sentence.needsRegeneration) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 animate-fade-in">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700">
              Nguồn đã loại — cần tạo lại
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800/70 line-through">
              {sentence.text}
            </p>
            <Button
              size="sm"
              className="mt-3 gap-1.5"
              disabled={isRegenerating}
              onClick={() => onRegenerate(sentence.id)}
            >
              {isRegenerating ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  Đang tạo lại...
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Tạo lại câu này
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group rounded-lg p-3 transition-all duration-300',
        sentence.regenerated
          ? 'bg-emerald-50/40 ring-1 ring-emerald-200'
          : 'hover:bg-muted/30'
      )}
    >
      <p className="text-sm leading-relaxed text-foreground">
        {sentence.text}
        {source && source.approved && (
          <button
            onClick={() => onCitationClick(source.id, sentence.text)}
            className="ml-1.5 inline-flex items-center"
          >
            <CitationBadge sourceId={source.id} />
          </button>
        )}
      </p>
      {sentence.regenerated && (
        <p className="mt-1.5 text-xs text-emerald-600">
          Đã tạo lại từ {source?.id}
        </p>
      )}
    </div>
  );
}

function CitationBadge({ sourceId }: { sourceId: string }) {
  return (
    <span className="inline-flex items-center rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-xs font-mono font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
      [{sourceId}]
    </span>
  );
}
