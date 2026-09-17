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
  contentTruncated?: boolean;
  contentSegments?: Array<{ blockIndex: number; text: string }>;
  promptInjectionDetected: boolean;
  injectionContent?: string;
  injectionExampleDetected?: boolean;
}

const TIMEOUT_MS = 10000;
const MAX_CONTENT_LENGTH = 9000;

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

const EXAMPLE_CONTEXT = /example|for instance|e\.g\.|attacker|attack|malicious|injected|prompt injection|consider the prompt|could simply|something like|such as|ví dụ|kẻ tấn công|tấn công|minh họa/i;

function compact(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Keep passages near the search topic, with their original block positions. */
export function selectRelevantContent(fullText: string, blocks: string[], focus = '') {
  if (fullText.length <= MAX_CONTENT_LENGTH) {
    return { content: fullText, contentTruncated: false, contentSegments: [{ blockIndex: 0, text: fullText }] };
  }
  const terms = Array.from(new Set((focus.toLocaleLowerCase('vi').match(/[\p{L}]{4,}/gu) || [])));
  const passages = blocks.map((text, blockIndex) => ({ blockIndex, text: compact(text) }))
    .filter(block => block.text.length >= 30);
  if (!passages.length) {
    const content = fullText.slice(0, MAX_CONTENT_LENGTH);
    return { content, contentTruncated: true, contentSegments: [{ blockIndex: 0, text: content }] };
  }
  const scored = passages.map(block => ({
    ...block,
    score: terms.reduce((score, term) => score + (block.text.toLocaleLowerCase('vi').includes(term) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score || a.blockIndex - b.blockIndex);
  const chosen: Array<{ blockIndex: number; text: string }> = [];
  let used = 0;
  for (const block of scored) {
    if (used >= MAX_CONTENT_LENGTH) break;
    const remaining = MAX_CONTENT_LENGTH - used;
    if (remaining < 80) break;
    const text = block.text.length > remaining ? block.text.slice(0, remaining).replace(/\s+\S*$/, '') : block.text;
    if (text.length < 30) continue;
    chosen.push({ blockIndex: block.blockIndex, text });
    used += text.length + 2;
  }
  chosen.sort((a, b) => a.blockIndex - b.blockIndex);
  return {
    content: chosen.map(block => block.text).join('\n\n'),
    contentTruncated: true,
    contentSegments: chosen,
  };
}

/**
 * Fetch và parse một trang web.
 */
export async function scrapePage(url: string, focus = ''): Promise<ScrapedPage> {
  const fetchedAt = new Date().toISOString();
  const base: Partial<ScrapedPage> = {
    url,
    fetchedAt,
    promptInjectionDetected: false,
  };

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password || parsedUrl.hostname.endsWith('.test')) throw new Error('URL không hợp lệ hoặc tên miền mẫu .test');
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': 'ScriptScout-Hackathon/1.0 (educational research bot)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
        'Accept-Language': 'vi,en;q=0.9',
      },
      redirect: 'follow',
    });

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

    const html = (await response.text()).slice(0, 2_000_000);
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

    // Hidden instructions are active injection attempts. Remove them before
    // passing page text to AI, while retaining a short detection excerpt.
    const hiddenEls = root.querySelectorAll('[style*="display:none"], [style*="display: none"], [style*="visibility:hidden"], [style*="visibility: hidden"], [hidden]');
    const hiddenInjection = hiddenEls.map(el => compact(el.text)).find(text => INJECTION_PATTERNS.some(pattern => pattern.test(text)));
    hiddenEls.forEach(el => el.remove());

    // Remove navigation and executable content.
    root.querySelectorAll('script, style, nav, footer, header, aside, [role="navigation"], [role="banner"]')
      .forEach((el) => el.remove());

    // Reference markers are often rendered as superscripts and otherwise get
    // glued to the preceding word (for example "answers3,4"). Remove only
    // citation-looking superscripts; keep meaningful mathematical notation.
    root.querySelectorAll('sup').forEach((el) => {
      const marker = compact(el.text);
      const className = el.getAttribute('class') || '';
      if (/reference|citation/i.test(className) || /^\[?\d+(?:\s*[,–-]\s*\d+)*\]?$/.test(marker)) el.remove();
    });

    // Extract main content area or fallback to body
    const mainContent =
      root.querySelector('main, article, [role="main"], .content, .post-content, .article-body') ||
      root.querySelector('body') ||
      root;

    const fullContent = compact(mainContent.text);
    const blocks = mainContent.querySelectorAll('p, li, h1, h2, h3, blockquote, pre').map(el => el.text);
    const selected = selectRelevantContent(fullContent, blocks.length ? blocks : [fullContent], focus);
    const content = selected.content;

    // Quoted attack examples in defensive articles are data. A standalone
    // instruction in visible text remains suspicious; all page text is untrusted.
    const visibleBlocks = mainContent.querySelectorAll('p, li, pre, blockquote, code').map(el => ({ text: compact(el.text), tag: el.tagName.toLowerCase() }));
    if (!visibleBlocks.length) visibleBlocks.push({ text: fullContent, tag: 'main' });
    const suspicious = visibleBlocks.filter(block => INJECTION_PATTERNS.some(pattern => pattern.test(block.text)));
    const defenseArticle = /prompt injection|injection attack|protect.*prompt|defen.*prompt|prevent.*prompt/i.test(`${title} ${fullContent.slice(0, 500)}`);
    const isQuotedExample = (block: { text: string; tag: string }) => EXAMPLE_CONTEXT.test(block.text)
      || (defenseArticle && (['code', 'pre', 'blockquote'].includes(block.tag) || /^["“‘`]/.test(block.text)));
    const activeInstruction = suspicious.find(block => !isQuotedExample(block));
    const promptInjectionDetected = Boolean(hiddenInjection || activeInstruction);
    const injectionContent = (hiddenInjection || activeInstruction?.text)?.slice(0, 200);
    const injectionExampleDetected = suspicious.some(isQuotedExample);

    return {
      ...base,
      title,
      content,
      author: authorMeta || undefined,
      publishDate: dateMeta || undefined,
      organization: orgMeta || undefined,
      status: content.length < 80 ? 'blocked' : 'ok',
      error: content.length < 80 ? 'Trang rỗng hoặc cần JavaScript/đăng nhập; chưa đọc được' : undefined,
      contentLength: fullContent.length,
      contentTruncated: selected.contentTruncated,
      contentSegments: selected.contentSegments,
      promptInjectionDetected,
      injectionContent,
      injectionExampleDetected,
    } as ScrapedPage;

  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
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
  concurrency: number = 3,
  focus = '',
): Promise<ScrapedPage[]> {
  const results: ScrapedPage[] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(url => scrapePage(url, focus)));
    results.push(...batchResults);
  }

  return results;
}
