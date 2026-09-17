/**
 * lib/search.ts — Module tìm kiếm web (Serper API + DuckDuckGo + Wikipedia + Google News RSS)
 * Đảm bảo luôn tìm được nguồn thật cho mọi chủ đề giáo dục mà không phụ thuộc vào một dịch vụ duy nhất.
 */

import { parse } from 'node-html-parser';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  error?: string;
  engine?: string;
}

/**
 * Tìm kiếm web qua DuckDuckGo HTML
 */
async function searchDuckDuckGo(query: string, numResults: number = 10): Promise<SearchResult[]> {
  try {
    const res = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const root = parse(html);
    const elements = root.querySelectorAll('.result__body');
    const results: SearchResult[] = [];

    for (const el of elements) {
      if (results.length >= numResults) break;
      const titleEl = el.querySelector('.result__title a');
      const snippetEl = el.querySelector('.result__snippet');
      let url = titleEl?.getAttribute('href') || '';

      if (url.includes('uddg=')) {
        const match = url.match(/uddg=([^&]+)/);
        if (match) url = decodeURIComponent(match[1]);
      }

      if (
        !url ||
        url.includes('duckduckgo.com') ||
        url.includes('bing.com/aclick') ||
        url.includes('ad_domain') ||
        url.includes('.test') ||
        !url.startsWith('http')
      ) {
        continue;
      }

      results.push({
        title: titleEl?.text?.trim() || '',
        url,
        snippet: snippetEl?.text?.trim() || '',
        position: results.length + 1,
      });
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Tìm kiếm qua Wikipedia OpenSearch API (miễn phí, vĩnh viễn, không giới hạn tốc độ)
 */
async function searchWikipedia(query: string, numResults: number = 5): Promise<SearchResult[]> {
  try {
    const cleanQuery = query
      .replace(/\s+(bài giảng|hướng dẫn|tài liệu|cơ bản|nâng cao|nhập môn)\b/gi, '')
      .trim();

    const url = `https://vi.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=${numResults}&namespace=0&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];

    const data = await res.json();
    const titles: string[] = data[1] || [];
    const snippets: string[] = data[2] || [];
    const urls: string[] = data[3] || [];

    const results: SearchResult[] = [];
    for (let i = 0; i < urls.length; i++) {
      if (urls[i] && urls[i].startsWith('http') && !urls[i].includes('.test')) {
        results.push({
          title: titles[i] || 'Wikipedia tiếng Việt',
          url: urls[i],
          snippet: snippets[i] || `Nội dung bách khoa toàn thư mở Wikipedia về ${titles[i]}`,
          position: i + 1,
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Tìm kiếm qua Google News RSS (nguồn báo chí & tin tức chính thống tiếng Việt)
 */
async function searchGoogleNews(query: string, numResults: number = 5): Promise<SearchResult[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=vi&gl=VN&ceid=VN:vi`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];

    const xml = await res.text();
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
    const results: SearchResult[] = [];

    for (const item of items) {
      if (results.length >= numResults) break;
      const titleMatch = item[1].match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = item[1].match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = item[1].match(/<description>([\s\S]*?)<\/description>/);

      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';
      const link = linkMatch ? linkMatch[1].trim() : '';
      const snippet = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      if (link && link.startsWith('http') && !link.includes('.test')) {
        results.push({
          title: title || 'Tin tức báo chí',
          url: link,
          snippet: snippet.substring(0, 200),
          position: results.length + 1,
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Tìm kiếm web đa nguồn: Serper -> DuckDuckGo -> Wikipedia -> Google News
 */
export async function searchWeb(
  query: string,
  numResults: number = 10
): Promise<SearchResponse> {
  const apiKey = process.env.SERPER_API_KEY;

  // 1. Serper API
  if (apiKey) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: numResults,
          gl: 'vn',
          hl: 'vi',
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const organic = data.organic || [];

        const results: SearchResult[] = organic.map(
          (item: any, idx: number) => ({
            title: item.title || '',
            url: item.link || '',
            snippet: item.snippet || '',
            position: idx + 1,
          })
        );

        if (results.length > 0) {
          return { results, query, engine: 'serper' };
        }
      }
    } catch {
      // Fallback
    }
  }

  // API search fallback: discovered URLs, not fixed topic answers.
  try {
    const endpoint = 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=3&srsearch=' + encodeURIComponent(query);
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      const results: SearchResult[] = (data.query?.search || []).map((item: any, i: number) => ({
        title: item.title, url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(item.title.replace(/ /g, '_')),
        snippet: parse(item.snippet || '').text, position: i + 1,
      }));
      if (results.length) return { results, query, engine: 'wikipedia-en-search (secondary sources; not independent corroboration)' };
    }
  } catch { /* continue to other live providers */ }

  // 2. DuckDuckGo HTML
  const ddgResults = await searchDuckDuckGo(query, numResults);
  if (ddgResults.length >= 2) {
    return { results: ddgResults, query, engine: 'duckduckgo' };
  }

  // 3. Wikipedia OpenSearch API
  const wikiResults = await searchWikipedia(query, numResults);
  const combined = [...ddgResults, ...wikiResults];

  if (combined.length >= 2) {
    return { results: combined.slice(0, numResults), query, engine: 'duckduckgo+wikipedia' };
  }

  // 4. Google News RSS
  const newsResults = await searchGoogleNews(query, numResults);
  const allResults = [...combined, ...newsResults];

  if (allResults.length > 0) {
    return { results: allResults.slice(0, numResults), query, engine: 'multi-engine' };
  }

  return {
    results: [],
    query,
    error: 'Không tìm thấy kết quả từ các công cụ tìm kiếm web.',
  };
}

/**
 * Tìm kiếm nhiều truy vấn song song.
 */
export async function searchMultiple(
  queries: string[],
  numResultsEach: number = 5
): Promise<SearchResponse[]> {
  return Promise.all(queries.map((q) => searchWeb(q, numResultsEach)));
}
