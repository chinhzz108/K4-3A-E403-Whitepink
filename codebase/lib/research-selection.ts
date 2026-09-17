import type { SearchResponse } from './search';

const TRACKING_PARAMETERS = /^(utm_|fbclid$|gclid$|ref$)/i;

function canonicalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hostname.endsWith('.test')) return null;
    url.hash = '';
    for (const name of Array.from(url.searchParams.keys())) {
      if (TRACKING_PARAMETERS.test(name)) url.searchParams.delete(name);
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

/** Interleave the independent searches before spending the page-read budget. */
export function candidateUrls(searches: SearchResponse[], limit = 8): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  const maxDepth = Math.max(0, ...searches.map(search => search.results.length));
  for (let depth = 0; depth < maxDepth && urls.length < limit; depth += 1) {
    for (const search of searches) {
      const value = search.results[depth]?.url;
      const key = value && canonicalUrl(value);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      urls.push(value);
      if (urls.length === limit) break;
    }
  }
  return urls;
}
