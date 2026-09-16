export type Screen = 'brief' | 'research' | 'sources' | 'script';

export type ReliabilityLevel = 'high' | 'medium' | 'low';

export type SourceType =
  | 'Bài nghiên cứu chính thức'
  | 'Nghiên cứu được bình duyệt'
  | 'Nghiên cứu học thuật'
  | 'Bài blog';

export interface ReliabilityCriteria {
  authority: number;
  primarySource: number;
  recency: number;
  evidenceQuality: number;
  corroboration: number;
}

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
}

export interface SceneSentence {
  id: string;
  text: string;
  sourceId: string;
  needsRegeneration?: boolean;
  regenerated?: boolean;
  alternativeText?: string;
  alternativeSourceId?: string;
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
