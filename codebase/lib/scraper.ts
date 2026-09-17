/**
 * lib/scraper.ts — Module fetch và parse nội dung trang web
 * Trích xuất text content, xử lý lỗi, timeout, trang không đọc được.
 */

import { parse as parseHTML } from 'node-html-parser';

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;       // text content đã trích xuất
  author?: string;       // tác giả nếu tìm được
  publishDate?: string;  // ngày đăng nếu tìm được
  organization?: string; // tổ chức nếu tìm được
  fetchedAt: string;     // ngày truy cập ISO
  status: 'ok' | 'error' | 'blocked' | 'not-found' | 'timeout';
  error?: string;
  contentLength: number;
  promptInjectionDetected: boolean;
  injectionContent?: string;
}

const TIMEOUT_MS = 10000;
const MAX_CONTENT_LENGTH = 2800;

// Patterns phát hiện prompt injection
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+above/i,
  /disregard\s+(all\s+)?prior/i,
  /you\s+are\s+now/i,
  /system\s*:\s*you\s+must/i,
  /override\s+instructions/i,
  /forget\s+(everything|all)/i,
  /new\s+instructions?\s*:/i,
];

/**
 * Fetch và parse một trang web.
 */
export async function scrapePage(url: string): Promise<ScrapedPage> {
  const fetchedAt = new Date().toISOString();
  const base: Partial<ScrapedPage> = {
    url,
    fetchedAt,
    promptInjectionDetected: false,
  };

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password || parsedUrl.hostname.endsWith('.test')) throw new Error('URL không hợp lệ hoặc tên miền mẫu .test');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ScriptScout-Hackathon/1.0 (educational research bot)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
        'Accept-Language': 'vi,en;q=0.9',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          ...base,
          title: '',
          content: '',
          status: 'not-found',
          error: `HTTP 404 — Trang không tồn tại`,
          contentLength: 0,
          promptInjectionDetected: false,
        } as ScrapedPage;
      }
      if (response.status === 403 || response.status === 401) {
        return {
          ...base,
          title: '',
          content: '',
          status: 'blocked',
          error: `HTTP ${response.status} — Trang yêu cầu đăng nhập hoặc bị chặn truy cập`,
          contentLength: 0,
          promptInjectionDetected: false,
        } as ScrapedPage;
      }
      return {
        ...base,
        title: '',
        content: '',
        status: 'error',
        error: `HTTP ${response.status} ${response.statusText}`,
        contentLength: 0,
        promptInjectionDetected: false,
      } as ScrapedPage;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return {
        ...base,
        title: '',
        content: '',
        status: 'error',
        error: `Content-Type không phải HTML: ${contentType}`,
        contentLength: 0,
        promptInjectionDetected: false,
      } as ScrapedPage;
    }

    const html = await response.text();
    const root = parseHTML(html);

    // Extract title
    const titleEl = root.querySelector('title');
    const title = titleEl?.text?.trim() || '';

    // Extract author from meta tags
    const authorMeta =
      root.querySelector('meta[name="author"]')?.getAttribute('content') ||
      root.querySelector('meta[property="article:author"]')?.getAttribute('content') ||
      '';

    // Extract publish date from meta tags
    const dateMeta =
      root.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
      root.querySelector('meta[name="date"]')?.getAttribute('content') ||
      root.querySelector('meta[name="DC.date"]')?.getAttribute('content') ||
      root.querySelector('time')?.getAttribute('datetime') ||
      '';

    // Extract organization
    const orgMeta =
      root.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
      '';

    // Remove script, style, nav, footer, header elements
    root.querySelectorAll('script, style, nav, footer, header, aside, [role="navigation"], [role="banner"]')
      .forEach((el) => el.remove());

    // Extract main content area or fallback to body
    const mainContent =
      root.querySelector('main, article, [role="main"], .content, .post-content, .article-body') ||
      root.querySelector('body') ||
      root;

    // Get text content
    let content = mainContent.text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Truncate to MAX_CONTENT_LENGTH
    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.substring(0, MAX_CONTENT_LENGTH) + '…[đã cắt bớt]';
    }

    // Check for prompt injection in ALL content (including hidden elements)
    const fullHtml = html.toLowerCase();
    let promptInjectionDetected = false;
    let injectionContent: string | undefined;

    for (const pattern of INJECTION_PATTERNS) {
      const match = html.match(pattern);
      if (match) {
        promptInjectionDetected = true;
        // Get surrounding context
        const idx = html.indexOf(match[0]);
        injectionContent = html.substring(Math.max(0, idx - 50), Math.min(html.length, idx + match[0].length + 50));
        break;
      }
    }

    // Also check hidden elements specifically
    const hiddenEls = root.querySelectorAll('[style*="display:none"], [style*="display: none"], [style*="visibility:hidden"], [hidden], .hidden, .sr-only');
    for (const el of hiddenEls) {
      const hiddenText = el.text;
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(hiddenText)) {
          promptInjectionDetected = true;
          injectionContent = hiddenText.substring(0, 200);
          break;
        }
      }
      if (promptInjectionDetected) break;
    }

    return {
      ...base,
      title,
      content,
      author: authorMeta || undefined,
      publishDate: dateMeta || undefined,
      organization: orgMeta || undefined,
      status: content.length < 80 ? 'blocked' : 'ok',
      error: content.length < 80 ? 'Trang rỗng hoặc cần JavaScript/đăng nhập; chưa đọc được' : undefined,
      contentLength: content.length,
      promptInjectionDetected,
      injectionContent,
    } as ScrapedPage;

  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        ...base,
        title: '',
        content: '',
        status: 'timeout',
        error: `Timeout sau ${TIMEOUT_MS / 1000} giây`,
        contentLength: 0,
        promptInjectionDetected: false,
      } as ScrapedPage;
    }

    return {
      ...base,
      title: '',
      content: '',
      status: 'error',
      error: `Lỗi: ${err instanceof Error ? err.message : String(err)}`,
      contentLength: 0,
      promptInjectionDetected: false,
    } as ScrapedPage;
  }
}

/**
 * Scrape nhiều trang song song (giới hạn concurrency).
 */
export async function scrapePages(
  urls: string[],
  concurrency: number = 3
): Promise<ScrapedPage[]> {
  const results: ScrapedPage[] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(scrapePage));
    results.push(...batchResults);
  }

  return results;
}
