'use client';

import { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/header';
import { Stepper } from '@/components/stepper';
import { BriefScreen } from '@/components/screens/brief-screen';
import { ResearchScreen } from '@/components/screens/research-screen';
import { SourcesScreen } from '@/components/screens/sources-screen';
import { ScriptScreen } from '@/components/screens/script-screen';
import { Toaster } from '@/components/ui/sonner';
import type { Screen, Source, ResearchBrief } from '@/lib/types';
import type { SourceProfile, ThongTin, ScriptOutput } from '@/lib/ai';
import { usableFacts } from '@/lib/evidence';
import type { TraceEntry } from '@/lib/trace';
import { toast } from 'sonner';

// Convert SourceProfile (backend) to Source (UI)
function profileToSource(p: SourceProfile): Source {
  const score =
    p.doTinCay === 'cao' ? 90 : p.doTinCay === 'trung-binh' ? 70 : 30;
  return {
    id: p.id,
    title: p.tieuDe,
    publisher: p.toChuc || 'Không rõ',
    author: p.tacGia || 'Không rõ',
    date: p.ngayDang || 'Không rõ',
    url: p.url,
    domain: new URL(p.url).hostname,
    type: p.loai,
    reliabilityScore: score,
    reliabilityLevel: p.doTinCay === 'cao' ? 'high' : p.doTinCay === 'trung-binh' ? 'medium' : 'low',
    reason: p.lyDoTinCay,
    evidence: p.doanTrich,
    criteria: {
      authority: Math.round(score * 0.25),
      primarySource: Math.round(score * 0.20),
      recency: Math.round(score * 0.15),
      evidenceQuality: Math.round(score * 0.20),
      corroboration: Math.round(score * 0.20),
    },
    approved: p.trangThai === 'dang-dung',
    promptInjectionDetected: p.promptInjectionDetected,
    untrustedContent: p.injectionContent,
    ngayLayVe: p.ngayLayVe,
    toChuc: p.toChuc,
    trangThai: p.trangThai,
    lyDoLoai: p.lyDoLoai,
    canhBao: p.canhBao,
    scrapeStatus: p.scrapeStatus,
  };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('brief');
  const [brief, setBrief] = useState<ResearchBrief>({
    topic: '',
    learningObjective: '',
    targetAudience: 'Sinh viên năm 1–2',
    videoDuration: '5 phút',
  });
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceProfiles, setSourceProfiles] = useState<SourceProfile[]>([]);
  const [thongTin, setThongTin] = useState<ThongTin[]>([]);
  const [script, setScript] = useState<ScriptOutput | null>(null);
  const [traces, setTraces] = useState<TraceEntry[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [researchProgress, setResearchProgress] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const [generationBlockedReason, setGenerationBlockedReason] = useState('');

  const addTrace = (trace: TraceEntry) => {
    setTraces((prev) => [...prev, trace]);
  };

  const handleStartResearch = async (newBrief: ResearchBrief) => {
    setScript(null);
    setSources([]);
    setSourceProfiles([]);
    setThongTin([]);
    setTraces([]);
    setCanGenerate(false);
    setGenerationBlockedReason('');
    setBrief(newBrief);
    setScreen('research');
    setIsResearching(true);
    setResearchProgress('Đang tìm kiếm nguồn trên web...');

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrief),
      });

      const data = await response.json();

      if (data.trace) addTrace(data.trace);
      if (data.error && !data.sources?.length) {
        toast.error('Lỗi nghiên cứu', { description: data.error });
        setResearchProgress(`Lỗi: ${data.error}`);
        setIsDemo(data.isDemo || false);
        setIsResearching(false);
        return;
      }

      setIsDemo(data.isDemo || false);

      if (data.sources && data.sources.length > 0) {
        setSourceProfiles(data.sources);
        setThongTin(data.thongTin || []);
        setSources(data.sources.map(profileToSource));
        const ready = data.canGenerate === true;
        setCanGenerate(ready);
        setGenerationBlockedReason(ready ? '' : (data.error || 'Chưa có thông tin có bằng chứng hợp lệ.'));
        setResearchProgress(ready
          ? `Tìm thấy ${data.pagesRead || 0} trang, ${data.pagesOk || 0} đọc được, ${data.sources.length} nguồn đã đánh giá`
          : `Nguồn đã được lưu để duyệt, nhưng chưa đủ bằng chứng để tạo kịch bản: ${data.error || 'cần tìm lại nguồn'}`);
        if (ready) {
          toast.success('Nghiên cứu hoàn tất', {
            description: `${data.sources.filter((s: SourceProfile) => s.trangThai === 'dang-dung').length} nguồn được chọn`,
          });
        } else {
          toast.warning('Chưa thể tạo kịch bản', { description: data.error || 'Thiếu thông tin có bằng chứng.' });
        }
      } else {
        setResearchProgress(data.error || 'Không tìm thấy nguồn phù hợp');
      }
    } catch (err) {
      toast.error('Lỗi kết nối', {
        description: err instanceof Error ? err.message : 'Không thể gọi API',
      });
      setResearchProgress('Lỗi kết nối API');
    } finally {
      setIsResearching(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!canGenerate) {
      toast.error('Chưa thể tạo kịch bản', { description: generationBlockedReason || 'Cần thông tin có bằng chứng hợp lệ.' });
      return;
    }
    setIsGenerating(true);
    setScreen('script');

    try {
      const approvedSources = sourceProfiles.filter(
        (s) => s.trangThai === 'dang-dung'
      );
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...brief,
          sources: approvedSources,
          thongTin,
        }),
      });

      const data = await response.json();

      if (data.trace) addTrace(data.trace);
      setIsDemo(data.isDemo || false);

      if (data.script && !data.error) {
        setScript(data.script);
        toast.success('Kịch bản đã tạo', {
          description: `${data.script.cau?.length || 0} câu`,
        });
      }

      if (data.error) {
        toast.error('Lỗi tạo kịch bản', { description: data.error });
      }
    } catch (err) {
      toast.error('Lỗi kết nối');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateGenerationAvailability = useCallback((profiles: SourceProfile[]) => {
    const ready = usableFacts(thongTin, profiles).length > 0;
    setCanGenerate(ready);
    setGenerationBlockedReason(ready ? '' : 'Nguồn còn lại không hỗ trợ thông tin nào có bằng chứng hợp lệ.');
  }, [thongTin]);

  const handleApproveSource = useCallback((id: string) => {
    const profile = sourceProfiles.find(s => s.id === id);
    if (!profile || profile.scrapeStatus !== 'ok' || profile.promptInjectionDetected || !profile.doanTrich) { toast.error('Nguồn chưa có bằng chứng hợp lệ; không thể duyệt'); return; }
    const nextProfiles = sourceProfiles.map((s) => (s.id === id ? { ...s, trangThai: 'dang-dung' as const } : s));
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, approved: true, trangThai: 'dang-dung' as const } : s))
    );
    setSourceProfiles(nextProfiles);
    updateGenerationAvailability(nextProfiles);
  }, [sourceProfiles, updateGenerationAvailability]);

  const handleRemoveSource = useCallback((id: string) => {
    const nextProfiles = sourceProfiles.map((s) =>
      s.id === id ? { ...s, trangThai: 'bi-loai' as const, lyDoLoai: 'Người duyệt loại' } : s
    );
    setSources((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, approved: false, trangThai: 'bi-loai' as const } : s
      )
    );
    setSourceProfiles(nextProfiles);
    updateGenerationAvailability(nextProfiles);
  }, [sourceProfiles, updateGenerationAvailability]);

  const handleNewResearch = () => {
    setScreen('brief');
    setSources([]);
    setSourceProfiles([]);
    setThongTin([]);
    setScript(null);
    setIsDemo(false);
    setCanGenerate(false);
    setGenerationBlockedReason('');
  };

  const handleStepClick = (target: Screen) => {
    setScreen(target);
  };

  const handleExportTrace = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      brief,
      sources: sourceProfiles,
      thongTin,
      script,
      traces,
      isDemo,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scriptscout-trace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất trace JSON');
  };

  // Convert script to scenes for the existing ScriptScreen component
  const scenes = useMemo(() => script
    ? (script.phan || []).map((p) => ({
        number: p.so,
        purpose: p.ten,
        duration: '',
        sentences: (script.cau || [])
          .filter((c) => c.phan === p.so)
          .map((c) => ({
            id: `s${c.n}`,
            text: c.loi,
            sourceId: c.nguon?.[0] || '',
            nguon: c.nguon,
            kieu: c.kieu,
            chuTrenManHinh: c.chuTrenManHinh,
            yDoHinh: c.yDoHinh,
          })),
      }))
    : [], [script]);

  return (
    <div className="min-h-screen bg-background">
      <Header onNewResearch={handleNewResearch} />
      <Stepper current={screen} onStepClick={handleStepClick} />

      {/* Demo mode banner */}
      {isDemo && (
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>⚠ DEMO MODE</strong> — API key chưa được cấu hình. Chưa gọi được AI; không có kết quả tạo sẵn.
            Xem <code>.env.local</code> để thêm key.
          </div>
        </div>
      )}

      <main>
        {screen === 'brief' && (
          <BriefScreen brief={brief} onStart={handleStartResearch} />
        )}
        {screen === 'research' && (
          <ResearchScreen
            onComplete={() => setScreen('sources')}
            isLoading={isResearching}
            progress={researchProgress}
            sourcesFound={sources.length}
          />
        )}
        {screen === 'sources' && (
          <SourcesScreen
            sources={sources}
            onApprove={handleApproveSource}
            onRemove={handleRemoveSource}
            onGenerate={handleGenerateScript}
            canGenerate={canGenerate}
            generationBlockedReason={generationBlockedReason}
            conflicts={thongTin.map(t => t.moTaMauThuan || "").filter(Boolean)}
          />
        )}
        {screen === 'script' && (
          <ScriptScreen
            sources={sources}
            scenes={scenes}
            onRemoveSource={handleRemoveSource}
            onBackToSources={() => setScreen('sources')}
            script={script}
            thongTin={thongTin}
            sourceProfiles={sourceProfiles}
            brief={brief}
            isGenerating={isGenerating}
            onExportTrace={handleExportTrace}
            traces={traces}
            onRegenerated={(sentence, trace) => {
              setScript(prev => prev ? { ...prev, cau: prev.cau.map(c => c.n === sentence.n ? sentence : c) } : prev);
              if (trace) addTrace(trace);
            }}
          />
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
