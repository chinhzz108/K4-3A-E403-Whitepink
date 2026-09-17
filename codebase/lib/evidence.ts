import type { SourceProfile, ThongTin, ScriptSentence } from './ai';
import type { ScrapedPage } from './scraper';

export const normalize = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim();
const normalizeQuoteText = (s: string) => normalize(s)
  .toLocaleLowerCase('vi')
  .replace(/[“”„‟‘’‚‛'"`´]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();
export function quoteMatches(quote: string, content: string) {
  if (typeof quote !== 'string') return false;
  const normalizedQuote = normalizeQuoteText(quote);
  return normalizedQuote.length >= 12 && normalizeQuoteText(content).includes(normalizedQuote);
}
export function reconcileEvidence(sources: SourceProfile[], facts: ThongTin[], pages: ScrapedPage[]) {
  const checked = sources.filter(s => pages.some(p => p.url === s.url)).map(s => {
    const p = pages.find(p => p.url === s.url)!;
    const quote = quoteMatches(s.doanTrich, p.content) ? s.doanTrich : facts.flatMap(t => t.bangChung || []).find(b => b.nguonId === s.id && quoteMatches(b.doanTrich, p.content))?.doanTrich || '';
    const valid = p.status === 'ok' && !p.promptInjectionDetected && quoteMatches(quote, p.content);
    const stale = p.publishDate && Date.now() - Date.parse(p.publishDate) > 365 * 86400000;
    return { ...s, tieuDe: p.title || p.url, tacGia: p.author, toChuc: p.organization,
      ngayDang: p.publishDate, ngayLayVe: p.fetchedAt, scrapeStatus: p.status,
      doanTrich: valid ? quote : '',
      trangThai: valid ? s.trangThai : 'bi-loai',
      lyDoLoai: valid ? s.lyDoLoai : 'Không đọc được, có lệnh can thiệp hoặc trích dẫn không khớp trang đã đọc',
      canhBao: [...(s.canhBao || []), ...(!p.publishDate ? ['Không tìm thấy ngày đăng'] : []), ...(stale ? ['Nguồn hơn một năm tuổi; cần kiểm tra phiên bản mới'] : [])],
    } as SourceProfile;
  });
  const verified = facts.map(t => {
    const evidence = (t.bangChung || []).filter(b => {
      const s = checked.find(s => s.id === b.nguonId && s.trangThai === 'dang-dung');
      const p = pages.find(p => p.url === s?.url);
      return p && quoteMatches(b.doanTrich, p.content);
    });
    const organizations = new Set(evidence.map(b => {
      const s = checked.find(s => s.id === b.nguonId)!;
      return s.toChuc || new URL(s.url).hostname;
    }));
    return { ...t, bangChung: evidence, soNguonXacNhan: organizations.size,
      // Exact matching does not establish independent corroboration or semantic entailment.
      trangThai: 'chua-xac-minh' as const };
  }).filter(t => t.bangChung.length);
  return { sources: checked, facts: verified };
}
export function usableFacts(facts: ThongTin[], sources: SourceProfile[]) {
  const ids = new Set(sources.filter(s => s.trangThai === 'dang-dung').map(s => s.id));
  // Drop the entire claim if any supporting source was removed.
  return (facts || []).filter(t => t.bangChung?.length && t.bangChung.every(b => ids.has(b.nguonId)));
}
export function isNonFactualScaffold(loi: string): boolean {
  const text = (loi || '').trim();
  if (/^(xin chào|chào|chào mừng|hôm nay,?\s*chúng ta|hãy cùng|hãy tưởng tượng|cùng tìm hiểu|mời bạn|xin mời|hy vọng|cảm ơn|hẹn gặp|chúng ta (?:sẽ|hãy)|trong .{0,60}chúng ta sẽ)/i.test(text)) return true;
  if (/^(?:vì vậy,?\s*)?(?:ngay sau đây,?\s*)?(?:chúng ta (?:sẽ|hãy)|hãy cùng|cùng tìm hiểu)(?:\s|$)/i.test(text)) return true;
  return /\?$/.test(text) && /^(vậy|bạn|liệu|làm thế nào|tại sao|vì sao|khi nào|điều gì|chuyện gì|đâu là|có bao giờ|đã bao giờ|các (?:anh chị|bạn|em).{0,35}(?:có biết|có bao giờ|đã từng)|anh chị)/i.test(text);
}
export function validateSentences(cau: ScriptSentence[], facts: ThongTin[], count: number) {
  if (!Array.isArray(cau) || cau.length !== count) throw new Error('AI không trả đúng số câu');
  for (const c of cau) {
    const problems: string[] = [];
    if (!c.loi) problems.push('loi rỗng');
    if (/\d/.test(c.loi || '')) problems.push('loi có chữ số');
    if (!c.yDoHinh?.trim()) problems.push('yDoHinh rỗng');
    if (!c.chuTrenManHinh?.trim()) problems.push('chuTrenManHinh rỗng');
    if ((c.chuTrenManHinh || '').length > 40) problems.push('chuTrenManHinh quá 40 ký tự');
    if (c.kieu && !['ke','giang','nhe','hoi','nhan'].includes(c.kieu)) problems.push('kieu không hợp lệ');
    if (!Array.isArray(c.nguon)) problems.push('nguon không phải mảng');
    else if (c.nguon.some(id => !facts.some(t => t.id === id))) problems.push(`nguon không phải mã thongTin: ${JSON.stringify(c.nguon)}`);
    if (count === 5 && Array.isArray(c.nguon) && c.nguon.length === 0 && !isNonFactualScaffold(c.loi)) {
      problems.push('nguon rỗng ở câu không phải lời chào, câu hỏi mở hoặc lời kết thuần túy');
    }
    if (problems.length) throw new Error(`Câu ${c.n}: mẫu không hợp lệ (${problems.join('; ')})`);
  }
  if (count === 5 && cau.some((c, i) => c.n !== i + 1)) throw new Error('Số câu không tăng liên tiếp');
  if (count === 5 && cau.filter(c => c.nguon?.length).length < 3) throw new Error('Cần ít nhất ba câu có mã thongTin và bằng chứng');
  return cau;
}
