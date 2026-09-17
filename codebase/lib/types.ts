// Re-export types from ai.ts for convenience
export type {
  SourceProfile,
  ThongTin,
  ScriptSentence,
  ScriptOutput,
} from './ai';

export type { TraceEntry } from './trace';
export type { SearchResult, SearchResponse } from './search';
export type { ScrapedPage } from './scraper';

// Legacy types kept for backward compat with existing UI components
export type Screen = 'brief' | 'research' | 'sources' | 'script';

export type ReliabilityLevel = 'high' | 'medium' | 'low';

export type SourceType =
  | 'Bài nghiên cứu chính thức'
  | 'Nghiên cứu được bình duyệt'
  | 'Nghiên cứu học thuật'
  | 'Bài blog'
  | string;

export interface ReliabilityCriteria {
  authority: number;
  primarySource: number;
  recency: number;
  evidenceQuality: number;
  corroboration: number;
}

// Updated Source type bridging old UI and new schema
export interface Source {
  id: string;
  title: string;
  publisher: string;
  author: string;
  date: string;
  url: string;
  domain: string;
  type: SourceType;
  reliabilityScore: number;
  reliabilityLevel: ReliabilityLevel;
  reason: string;
  evidence: string;
  criteria: ReliabilityCriteria;
  approved: boolean;
  promptInjectionDetected?: boolean;
  untrustedContent?: string;
  // New fields from C3 schema
  ngayLayVe?: string;
  toChuc?: string;
  trangThai?: 'dang-dung' | 'bi-loai';
  lyDoLoai?: string;
  canhBao?: string[];
  scrapeStatus?: string;
}

export interface SceneSentence {
  id: string;
  text: string;
  sourceId: string;
  needsRegeneration?: boolean;
  regenerated?: boolean;
  alternativeText?: string;
  alternativeSourceId?: string;
  // New: link to thongTin
  nguon?: string[];
  kieu?: string;
  chuTrenManHinh?: string;
  yDoHinh?: string;
}

export interface Scene {
  number: number;
  purpose: string;
  duration: string;
  sentences: SceneSentence[];
}

export interface ResearchBrief {
  topic: string;
  learningObjective: string;
  targetAudience: string;
  videoDuration: string;
}

export interface CitationDetail {
  sourceId: string;
  claim: string;
  source: Source | undefined;
}
