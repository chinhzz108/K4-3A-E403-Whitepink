/**
 * lib/trace.ts — Module lưu trace cho kiểm tra lại
 * Ghi đầy đủ: input, nguồn đã đọc, nguồn được chọn, output, liên kết câu → đoạn trích.
 */

import type { AIAttempt, SourceProfile, ThongTin, ScriptOutput, ScriptSentence } from './ai';
import type { SearchResponse } from './search';
import type { ScrapedPage } from './scraper';

export interface TraceEntry {
  id: string;
  timestamp: string;
  phase: 'research' | 'generate-script' | 'regenerate-sentence';
  input: Record<string, unknown>;
  searchResults?: SearchResponse[];
  pagesRead?: Array<{
    url: string;
    status: string;
    contentLength: number;
    promptInjection: boolean;
    content: string;
    fetchedAt: string;
    title: string;
    contentTruncated?: boolean;
    contentSegments?: Array<{ blockIndex: number; text: string }>;
    injectionExampleDetected?: boolean;
  }>;
  selection?: { candidates: string[]; pagesRead: string[]; supplementReasons: string[] };
  sourcesEvaluated?: SourceProfile[];
  sourcesSelected?: string[];      // IDs of selected sources
  sourcesRejected?: string[];      // IDs of rejected sources
  thongTin?: ThongTin[];
  scriptOutput?: ScriptOutput;
  sentenceOutput?: ScriptSentence;
  sentenceSourceMap?: Array<{
    sentenceN: number;
    loi: string;
    nguon: string[];
    doanTrichLienQuan: string[];
  }>;
  aiRawResponse?: string;
  aiAttempts?: AIAttempt[];
  error?: string;
  isDemo: boolean;
  durationMs: number;
}

/**
 * Tạo trace entry cho phase research.
 */
export function createResearchTrace(params: {
  input: Record<string, unknown>;
  searchResults: SearchResponse[];
  pagesRead: ScrapedPage[];
  sources: SourceProfile[];
  thongTin: ThongTin[];
  aiRawResponse: string;
  aiAttempts?: AIAttempt[];
  selection?: TraceEntry['selection'];
  error?: string;
  isDemo: boolean;
  startTime: number;
}): TraceEntry {
  const now = Date.now();

  return {
    id: `trace-research-${now}`,
    timestamp: new Date().toISOString(),
    phase: 'research',
    input: params.input,
    searchResults: params.searchResults,
    selection: params.selection,
    pagesRead: params.pagesRead.map((p) => ({
      url: p.url,
      content: p.content,
      fetchedAt: p.fetchedAt,
      title: p.title,
      status: p.status,
      contentLength: p.contentLength,
      promptInjection: p.promptInjectionDetected,
      contentTruncated: p.contentTruncated,
      contentSegments: p.contentSegments,
      injectionExampleDetected: p.injectionExampleDetected,
    })),
    sourcesEvaluated: params.sources,
    sourcesSelected: params.sources
      .filter((s) => s.trangThai === 'dang-dung')
      .map((s) => s.id),
    sourcesRejected: params.sources
      .filter((s) => s.trangThai === 'bi-loai')
      .map((s) => s.id),
    thongTin: params.thongTin,
    aiRawResponse: params.aiRawResponse,
    aiAttempts: params.aiAttempts,
    error: params.error,
    isDemo: params.isDemo,
    durationMs: now - params.startTime,
  };
}

/**
 * Tạo trace entry cho phase generate-script.
 */
export function createScriptTrace(params: {
  input: Record<string, unknown>;
  sources: SourceProfile[];
  thongTin: ThongTin[];
  script: ScriptOutput;
  aiRawResponse: string;
  aiAttempts?: AIAttempt[];
  error?: string;
  isDemo: boolean;
  startTime: number;
}): TraceEntry {
  const now = Date.now();

  // Build sentence-source map
  const sentenceSourceMap = (params.script.cau || []).map((cau) => ({
    sentenceN: cau.n,
    loi: cau.loi,
    nguon: cau.nguon || [],
    doanTrichLienQuan: (cau.nguon || [])
      .map((nguonId) => {
        const info = params.thongTin.find((t) => t.id === nguonId);
        if (info) {
          return info.bangChung.map((b) => `[${b.nguonId}] ${b.doanTrich}`).join('; ');
        }
        return '';
      })
      .filter(Boolean),
  }));

  return {
    id: `trace-script-${now}`,
    timestamp: new Date().toISOString(),
    phase: 'generate-script',
    input: params.input,
    sourcesEvaluated: params.sources,
    sourcesSelected: params.sources
      .filter((s) => s.trangThai === 'dang-dung')
      .map((s) => s.id),
    thongTin: params.thongTin,
    scriptOutput: params.script,
    sentenceSourceMap,
    aiRawResponse: params.aiRawResponse,
    aiAttempts: params.aiAttempts,
    error: params.error,
    isDemo: params.isDemo,
    durationMs: now - params.startTime,
  };
}

/**
 * Tạo trace entry cho phase regenerate-sentence.
 */
export function createRegenerateTrace(params: {
  input: Record<string, unknown>;
  sentence: ScriptSentence;
  aiRawResponse: string;
  aiAttempts?: AIAttempt[];
  error?: string;
  isDemo: boolean;
  startTime: number;
}): TraceEntry {
  const now = Date.now();

  return {
    id: `trace-regen-${now}`,
    timestamp: new Date().toISOString(),
    phase: 'regenerate-sentence',
    input: params.input,
    sentenceOutput: params.sentence,
    aiRawResponse: params.aiRawResponse,
    aiAttempts: params.aiAttempts,
    error: params.error,
    isDemo: params.isDemo,
    durationMs: now - params.startTime,
  };
}
