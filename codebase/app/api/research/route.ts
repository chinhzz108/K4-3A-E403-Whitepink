/**
 * API Route: /api/research
 * Nhận brief → tìm web → scrape → đánh giá nguồn AI → trả hồ sơ nguồn + trace
 */

import { persistTrace } from '@/lib/audit';
import { NextResponse } from 'next/server';
import { searchWeb } from '@/lib/search';
import { scrapePages } from '@/lib/scraper';
import { evaluateSources, planSearch } from '@/lib/ai';
import { createResearchTrace } from '@/lib/trace';
import { candidateUrls } from '@/lib/research-selection';
import { publicationBoundary } from '@/lib/authority';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { topic, learningObjective, targetAudience, videoDuration, fixtureUrls, evalRunId, evalCaseId } = body;
    const traceContext = typeof evalCaseId === 'string'
      ? { runId: typeof evalRunId === 'string' ? evalRunId : undefined, caseId: evalCaseId, phase: 'search-plan' }
      : undefined;

    if (![topic, learningObjective, targetAudience, videoDuration].every(x => typeof x === 'string' && x.trim())) {
      return NextResponse.json({ error: 'Cần làm rõ: nhập đủ chủ đề, mục tiêu, người học và thời lượng' }, { status: 400 });
    }

    if (topic.trim().length < 5 || ['AI', 'ai'].includes(topic.trim())) {
      return NextResponse.json({ error: 'Cần làm rõ chủ đề cụ thể và kết quả học tập' }, { status: 422 });
    }
    const boundary = publicationBoundary(topic, learningObjective);
    if (boundary) {
      return NextResponse.json({ error: boundary, decision: 'draft-only', isDemo: false }, { status: 422 });
    }
    // Fixtures are explicitly isolated from live discovery.
    const fixtureMode = Array.isArray(fixtureUrls) && fixtureUrls.length > 0;
    if (fixtureMode && fixtureUrls.some((u: string) => !/^http:\/\/localhost:3000\/fixtures\/[a-z0-9-]+\.html$/.test(u))) {
      return NextResponse.json({ error: 'Chỉ cho phép fixture localhost đã đặt tên' }, { status: 400 });
    }
    // Step 1: Search web
    const queries = fixtureMode ? ['fixture-only', 'fixture-only'] : await planSearch(topic, learningObjective, traceContext).catch(() => [topic, topic + ' documentation']);
    const searchQuery1 = queries[0];
    const searchQuery2 = queries[1] || topic;
    const [searchResult1, searchResult2] = fixtureMode ? [{ results: [], query: "fixture-only" }, { results: [], query: "fixture-only" }] : await Promise.all([
      searchWeb(searchQuery1, 5),
      searchWeb(searchQuery2, 5),
    ]);

    const allSearchResults = [searchResult1, searchResult2];

    const candidates = fixtureMode ? fixtureUrls as string[] : candidateUrls(allSearchResults, 8);
    const focus = `${topic} ${learningObjective} ${searchQuery1} ${searchQuery2}`;
    const pages = await scrapePages(candidates.slice(0, 3), 3, focus);
    let nextCandidate = pages.length;
    const supplementReasons: string[] = [];
    const usablePageCount = () => pages.filter(page => page.status === 'ok' && !page.promptInjectionDetected).length;
    while (!fixtureMode && usablePageCount() < 3 && nextCandidate < candidates.length) {
      supplementReasons.push('Dưới ba trang đọc được và không có lệnh can thiệp');
      const batch = candidates.slice(nextCandidate, nextCandidate + 3);
      nextCandidate += batch.length;
      pages.push(...await scrapePages(batch, 3, focus));
    }

    // A second source assessment is allowed only if the first one selected
    // fewer than two sources and unused URL candidates remain.
    let evaluation = await evaluateSources(pages, topic, learningObjective,
      traceContext ? { ...traceContext, phase: 'source-evaluation' } : undefined,
      fixtureMode);
    const firstAttempts = evaluation.attempts || [];
    const selectedCount = () => evaluation.sources.filter(source => source.trangThai === 'dang-dung').length;
    if (!fixtureMode && selectedCount() < 2 && nextCandidate < candidates.length) {
      supplementReasons.push('Bước đánh giá chọn dưới hai nguồn; đọc thêm ứng viên');
      const batch = candidates.slice(nextCandidate, 8);
      nextCandidate += batch.length;
      pages.push(...await scrapePages(batch, 3, focus));
      const retry = await evaluateSources(pages, topic, learningObjective,
        traceContext ? { ...traceContext, phase: 'source-evaluation:more-pages' } : undefined,
        fixtureMode);
      if (retry.sources.filter(source => source.trangThai === 'dang-dung').length >= selectedCount()) evaluation = retry;
      evaluation.attempts = [...firstAttempts, ...(retry.attempts || [])];
    }

    // Step 4: Build trace
    const trace = createResearchTrace({
      input: { topic, learningObjective, targetAudience, videoDuration, fixtureMode, fixtureUrls, evalRunId, evalCaseId },
      searchResults: allSearchResults,
      pagesRead: pages,
      sources: evaluation.sources,
      thongTin: evaluation.thongTin,
      aiRawResponse: evaluation.rawAiResponse,
      aiAttempts: evaluation.attempts,
      selection: { candidates, pagesRead: pages.map(page => page.url), supplementReasons },
      error: evaluation.error,
      isDemo: evaluation.isDemo,
      startTime,
    });

    await persistTrace(trace);
    return NextResponse.json({
      sources: evaluation.sources,
      thongTin: evaluation.thongTin,
      searchQueries: [searchQuery1, searchQuery2],
      pagesRead: pages.length,
      pagesOk: pages.filter((p) => p.status === 'ok').length,
      trace,
      isDemo: evaluation.isDemo,
      modelUsed: evaluation.modelUsed,
      canGenerate: evaluation.canGenerate,
      error: evaluation.error,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Lỗi server: ${err instanceof Error ? err.message : String(err)}`,
        trace: {
          id: `trace-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          phase: 'research',
          error: String(err),
          isDemo: false,
          durationMs: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}
