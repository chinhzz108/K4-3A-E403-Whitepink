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

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { topic, learningObjective, targetAudience, videoDuration, fixtureUrls } = body;

    if (![topic, learningObjective, targetAudience, videoDuration].every(x => typeof x === 'string' && x.trim())) {
      return NextResponse.json({ error: 'Cần làm rõ: nhập đủ chủ đề, mục tiêu, người học và thời lượng' }, { status: 400 });
    }

    if (topic.trim().length < 5 || ['AI', 'ai'].includes(topic.trim())) {
      return NextResponse.json({ error: 'Cần làm rõ chủ đề cụ thể và kết quả học tập' }, { status: 422 });
    }
    // Fixtures are explicitly isolated from live discovery.
    const fixtureMode = Array.isArray(fixtureUrls) && fixtureUrls.length > 0;
    if (fixtureMode && fixtureUrls.some((u: string) => !/^http:\/\/localhost:3000\/fixtures\/[a-z0-9-]+\.html$/.test(u))) {
      return NextResponse.json({ error: 'Chỉ cho phép fixture localhost đã đặt tên' }, { status: 400 });
    }
    // Step 1: Search web
    const queries = fixtureMode ? ['fixture-only', 'fixture-only'] : await planSearch(topic, learningObjective).catch(() => [topic, topic + ' documentation']);
    const searchQuery1 = queries[0];
    const searchQuery2 = queries[1] || topic;
    const [searchResult1, searchResult2] = fixtureMode ? [{ results: [], query: "fixture-only" }, { results: [], query: "fixture-only" }] : await Promise.all([
      searchWeb(searchQuery1, 5),
      searchWeb(searchQuery2, 5),
    ]);

    const allSearchResults = [searchResult1, searchResult2];

    // Deduplicate URLs
    const urlSet = new Set<string>();
    const uniqueUrls: string[] = [];

    // Prioritize fixture URLs if provided (for eval / local testing)
    if (Array.isArray(fixtureUrls)) {
      for (const furl of fixtureUrls) {
        if (furl && !urlSet.has(furl)) {
          urlSet.add(furl);
          uniqueUrls.push(furl);
        }
      }
    }

    for (const sr of allSearchResults) {
      for (const r of sr.results) {
        if (!urlSet.has(r.url) && !r.url.includes('.test')) {
          urlSet.add(r.url);
          uniqueUrls.push(r.url);
        }
      }
    }

    // Limit to top 8 URLs
    const urlsToScrape = uniqueUrls.slice(0, 3);

    // Step 2: Scrape pages
    const pages = await scrapePages(urlsToScrape, 3);

    // Step 3: AI evaluation
    const evaluation = await evaluateSources(pages, topic, learningObjective);

    // Step 4: Build trace
    const trace = createResearchTrace({
      input: { topic, learningObjective, targetAudience, videoDuration, fixtureMode, fixtureUrls },
      searchResults: allSearchResults,
      pagesRead: pages,
      sources: evaluation.sources,
      thongTin: evaluation.thongTin,
      aiRawResponse: evaluation.rawAiResponse,
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
