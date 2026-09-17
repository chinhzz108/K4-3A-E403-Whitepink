'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CitationDrawer } from '@/components/citation-drawer';
import type { Source, Scene, SceneSentence, ResearchBrief } from '@/lib/types';
import type { SourceProfile, ThongTin, ScriptOutput } from '@/lib/ai';
import type { TraceEntry } from '@/lib/trace';
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
  Loader2,
  ExternalLink,
  FileJson,
} from 'lucide-react';
import { toast } from 'sonner';

interface ScriptScreenProps {
  sources: Source[];
  scenes: Scene[];
  onRemoveSource: (id: string) => void;
  onBackToSources: () => void;
  // New props for real AI
  script?: ScriptOutput | null;
  thongTin?: ThongTin[];
  sourceProfiles?: SourceProfile[];
  brief?: ResearchBrief;
  isGenerating?: boolean;
  onExportTrace?: () => void;
  traces?: TraceEntry[];
  onRegenerated?: (sentence: ScriptOutput['cau'][number], trace?: TraceEntry) => void;
}

export function ScriptScreen({
  sources,
  scenes,
  onRemoveSource,
  onBackToSources,
  script,
  thongTin = [],
  sourceProfiles = [],
  brief,
  isGenerating = false,
  onExportTrace,
  traces = [],
  onRegenerated,
}: ScriptScreenProps) {
  const [localScenes, setLocalScenes] = useState<Scene[]>(scenes);
  useEffect(() => {
    setLocalScenes(scenes.map(scene => ({ ...scene, sentences: scene.sentences.map(sentence => ({ ...sentence,
      needsRegeneration: (sentence.nguon || []).some(id => thongTin.find(t => t.id === id)?.bangChung.some(b => !sources.find(s => s.id === b.nguonId)?.approved))
    })) })));
  }, [scenes, sources, thongTin]);
  const [citationOpen, setCitationOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<{
    sourceId: string;
    claim: string;
  } | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [citationDetail, setCitationDetail] = useState<{
    thongTinId: string;
    nguon: SourceProfile | undefined;
    bangChung: { doanTrich: string; viTri: string; nguonId: string }[];
  } | null>(null);

  const approvedSources = sources.filter((s) => s.approved);
  const allSentences = localScenes.flatMap((sc) => sc.sentences);
  const totalClaims = allSentences.length;
  const verifiedClaims = allSentences.filter((s) => {
    return (s.nguon || []).length > 0 && (s.nguon || []).every(id => thongTin.find(t => t.id === id)?.bangChung.every(b => sources.find(src => src.id === b.nguonId)?.approved));
  }).length;
  const needsRegenCount = allSentences.filter((s) => s.needsRegeneration).length;

  const handleRemoveSource = (id: string) => {
    onRemoveSource(id);
    setLocalScenes((prev) =>
      prev.map((scene) => ({
        ...scene,
        sentences: scene.sentences.map((s) => {
          // Mark sentences whose nguon references a thongTin that uses this source
          const hasDepOnSource =
            s.sourceId === id ||
            (s.nguon || []).some((nguonId) => {
              const info = thongTin.find((t) => t.id === nguonId);
              return info?.bangChung.some((b) => b.nguonId === id);
            });
          return hasDepOnSource
            ? { ...s, needsRegeneration: true }
            : s;
        }),
      }))
    );
    toast.warning(`Đã loại nguồn ${id}`, {
      description:
        'Các câu phụ thuộc vào nguồn này đã được đánh dấu cần tạo lại.',
    });
  };

  const handleRegenerate = async (sentenceId: string) => {
    const sentence = allSentences.find((s) => s.id === sentenceId);
    if (!sentence) return;

    setRegenerating(sentenceId);

    try {
      const response = await fetch('/api/regenerate-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: {
            n: parseInt(sentenceId.replace('s', '')),
            phan: 1,
            loi: sentence.text,
            chuTrenManHinh: sentence.chuTrenManHinh || '',
            yDoHinh: sentence.yDoHinh || '',
            nguon: sentence.nguon || [],
          },
          removedSourceIds: sources
            .filter((s) => !s.approved)
            .map((s) => s.id),
          remainingSources: sourceProfiles.filter(
            (s) => s.trangThai === 'dang-dung'
          ),
          remainingThongTin: thongTin,
        }),
      });

      const data = await response.json();

      if (data.error || !response.ok) throw new Error(data.error || "Không viết lại được");
      if (data.sentence) {
        onRegenerated?.(data.sentence, data.trace);
        setLocalScenes((prev) =>
          prev.map((scene) => ({
            ...scene,
            sentences: scene.sentences.map((s) =>
              s.id === sentenceId
                ? {
                    ...s,
                    text: data.sentence.loi,
                    sourceId: data.sentence.nguon?.[0] || '',
                    nguon: data.sentence.nguon,
                    kieu: data.sentence.kieu,
                    chuTrenManHinh: data.sentence.chuTrenManHinh,
                    yDoHinh: data.sentence.yDoHinh,
                    needsRegeneration: false,
                    regenerated: true,
                  }
                : s
            ),
          }))
        );
        toast.success('Đã tạo lại câu bằng AI');
      }
    } catch (err) {
      toast.error('Lỗi tạo lại câu', { description: err instanceof Error ? err.message : '' });
    } finally {
      setRegenerating(null);
    }
  };

  const handleCitationClick = (
    sourceId: string,
    claim: string,
    nguonIds?: string[]
  ) => {
    // If we have thongTin references, show detailed citation
    if (nguonIds && nguonIds.length > 0 && thongTin.length > 0) {
      const info = thongTin.find((t) => nguonIds.includes(t.id));
      if (info) {
        const relatedSource = sourceProfiles.find((s) =>
          info.bangChung.some((b) => b.nguonId === s.id)
        );
        setCitationDetail({
          thongTinId: info.id,
          nguon: relatedSource,
          bangChung: info.bangChung.map((b) => ({
            nguonId: b.nguonId,
            doanTrich: b.doanTrich,
            viTri: b.viTri,
          })),
        });
      }
    }

    setActiveCitation({ sourceId, claim });
    setCitationOpen(true);
  };

  const handleExportScript = () => {
    if (!script) return;
    const blob = new Blob([JSON.stringify(script, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kich-ban-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất kịch bản JSON');
  };

  const handleExportHoSo = () => {
    const hoSo = {
      schema: 'hackathon-ho-so-nguon/1',
      chuDe: brief?.topic || '',
      ngayChay: new Date().toISOString(),
      nguon: sourceProfiles,
      thongTin,
    };
    const blob = new Blob([JSON.stringify(hoSo, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ho-so-nguon-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất hồ sơ nguồn JSON');
  };

  if (isGenerating) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Đang viết kịch bản bằng AI...</h2>
          <p className="text-muted-foreground">
            AI đang viết 5 câu mở đầu theo mẫu kịch bản. Quá trình mất 10–20 giây.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Kịch bản video đã tạo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Bản nháp AI — đoạn trích đã đối chiếu chuỗi; ý nghĩa và độ đúng cần giảng viên duyệt. Bấm vào [mã nguồn] để xem đoạn trích.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
        {/* LEFT: Main script */}
        <div className="space-y-5">
          {localScenes.map((scene) => (
            <Card key={scene.number} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {scene.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {scene.purpose}
                    </h3>
                  </div>
                </div>
                {scene.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {scene.duration}
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5">
                {scene.sentences.map((sentence) => (
                  <SentenceBlock
                    key={sentence.id}
                    sentence={sentence}
                    source={sources.find((s) => s.id === sentence.sourceId)}
                    thongTin={thongTin}
                    sourceProfiles={sourceProfiles}
                    onCitationClick={handleCitationClick}
                    onRegenerate={handleRegenerate}
                    isRegenerating={regenerating === sentence.id}
                  />
                ))}
              </div>
            </Card>
          ))}

          {localScenes.length === 0 && !isGenerating && (
            <Card className="p-8 text-center text-muted-foreground">
              <p>Chưa có kịch bản. Hãy duyệt nguồn và bấm &ldquo;Tạo kịch bản&rdquo;.</p>
            </Card>
          )}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-4">
          {/* Script overview */}
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Tổng quan kịch bản</h3>
            <div className="space-y-3">
              <SidebarStat
                icon={Clock}
                label="Thời lượng"
                value={brief?.videoDuration || '—'}
              />
              <SidebarStat
                icon={FileText}
                label="Phần"
                value={String(localScenes.length)}
              />
              <SidebarStat
                icon={Target}
                label="Câu"
                value={String(totalClaims)}
              />
              <SidebarStat
                icon={CheckCircle2}
                label="Có nguồn"
                value={`${verifiedClaims} / ${totalClaims}`}
                valueClass="text-emerald-600"
              />
              <SidebarStat
                icon={ShieldCheck}
                label="Nguồn đã duyệt"
                value={String(approvedSources.length)}
              />
              {needsRegenCount > 0 && (
                <SidebarStat
                  icon={AlertTriangle}
                  label="Cần tạo lại"
                  value={String(needsRegenCount)}
                  valueClass="text-amber-600"
                />
              )}
            </div>
          </Card>

          {/* Sources used */}
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold">
              Nguồn dùng trong kịch bản
            </h3>
            <div className="space-y-2">
              {sources.map((source) => {
                const isUsed = localScenes.some((sc) =>
                  sc.sentences.some(
                    (s) =>
                      s.sourceId === source.id ||
                      (s.nguon || []).some((nId) => {
                        const info = thongTin.find((t) => t.id === nId);
                        return info?.bangChung.some(
                          (b) => b.nguonId === source.id
                        );
                      })
                  )
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
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold',
                          source.approved
                            ? 'bg-primary/10 text-primary'
                            : 'bg-red-100 text-red-600'
                        )}
                      >
                        {source.id}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {source.title || source.publisher}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {source.approved
                            ? isUsed
                              ? 'Đang dùng'
                              : 'Khả dụng'
                            : 'Đã loại'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-xs text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
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
                onClick={handleExportScript}
                disabled={!script}
              >
                <FileDown className="h-4 w-4" />
                Xuất kịch bản JSON
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleExportHoSo}
                disabled={sourceProfiles.length === 0}
              >
                <Download className="h-4 w-4" />
                Xuất hồ sơ nguồn JSON
              </Button>
              {onExportTrace && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={onExportTrace}
                >
                  <FileJson className="h-4 w-4" />
                  Xuất Trace JSON
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Citation detail drawer */}
      {citationDetail && citationOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => { setCitationOpen(false); setCitationDetail(null); }}>
          <div
            className="fixed right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Chi tiết trích dẫn</h2>
            {citationDetail.nguon && (
              <div className="mb-4 rounded-lg border p-4">
                <p className="text-sm font-semibold">{citationDetail.nguon.tieuDe}</p>
                <a
                  href={citationDetail.nguon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {citationDetail.nguon.url}
                </a>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tác giả: {citationDetail.nguon.tacGia || 'Không rõ'} ·
                  Ngày: {citationDetail.nguon.ngayDang || 'Không rõ'} ·
                  Truy cập: {citationDetail.nguon.ngayLayVe}
                </p>
              </div>
            )}
            <h3 className="text-sm font-semibold mb-2">Đoạn trích bằng chứng</h3>
            {citationDetail.bangChung.map((bc, i) => (
              <div key={i} className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <a className="text-xs text-primary underline" href={sourceProfiles.find(s => s.id === bc.nguonId)?.url} target="_blank" rel="noreferrer">{bc.nguonId}: {sourceProfiles.find(s => s.id === bc.nguonId)?.url}</a>
                <p className="text-sm italic">&ldquo;{bc.doanTrich}&rdquo;</p>
                <p className="mt-1 text-xs text-muted-foreground">Vị trí: {bc.viTri}</p>
              </div>
            ))}
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => { setCitationOpen(false); setCitationDetail(null); }}
            >
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* Legacy citation drawer fallback */}
      {!citationDetail && (
        <CitationDrawer
          open={citationOpen}
          onOpenChange={setCitationOpen}
          sourceId={activeCitation?.sourceId ?? null}
          claim={activeCitation?.claim ?? ''}
          sources={sources}
        />
      )}
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
  thongTin,
  sourceProfiles,
  onCitationClick,
  onRegenerate,
  isRegenerating,
}: {
  sentence: SceneSentence;
  source: Source | undefined;
  thongTin: ThongTin[];
  sourceProfiles: SourceProfile[];
  onCitationClick: (sourceId: string, claim: string, nguonIds?: string[]) => void;
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
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang tạo lại bằng AI...
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
      {/* Kiểu đọc badge */}
      {sentence.kieu && (
        <span className="mb-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {sentence.kieu}
        </span>
      )}

      <p className="text-sm leading-relaxed text-foreground">
        {sentence.text}
        {sentence.nguon && sentence.nguon.length > 0 && (
          <>
            {sentence.nguon.map((nId) => (
              <button
                key={nId}
                onClick={() =>
                  onCitationClick(
                    sentence.sourceId || nId,
                    sentence.text,
                    [nId]
                  )
                }
                className="ml-1.5 inline-flex items-center"
              >
                <CitationBadge sourceId={nId} />
              </button>
            ))}
          </>
        )}
        {!sentence.nguon?.length && source && source.approved && (
          <button
            onClick={() =>
              onCitationClick(source.id, sentence.text, sentence.nguon)
            }
            className="ml-1.5 inline-flex items-center"
          >
            <CitationBadge sourceId={source.id} />
          </button>
        )}
      </p>

      {/* Trên màn hình */}
      {sentence.chuTrenManHinh && (
        <p className="mt-1 text-xs text-muted-foreground">
          📺 <span className="font-medium">{sentence.chuTrenManHinh}</span>
        </p>
      )}

      {/* Ý đồ hình */}
      {sentence.yDoHinh && (
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          🎨 {sentence.yDoHinh}
        </p>
      )}

      {sentence.regenerated && (
        <p className="mt-1.5 text-xs text-emerald-600">
          ✅ Đã tạo lại bằng AI
        </p>
      )}
    </div>
  );
}

function CitationBadge({ sourceId }: { sourceId: string }) {
  return (
    <span className="inline-flex items-center rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-xs font-mono font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer">
      [{sourceId}]
    </span>
  );
}
