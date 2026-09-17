import type { SourceProfile, ThongTin, ScriptSentence } from './ai';
import type { ScrapedPage } from './scraper';

export const normalize = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim();
export function quoteMatches(quote: string, content: string) {
  return typeof quote === 'string' && normalize(quote).length >= 12 && normalize(content).includes(normalize(quote));
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
export function validateSentences(cau: ScriptSentence[], facts: ThongTin[], count: number) {
  if (!Array.isArray(cau) || cau.length !== count) throw new Error('AI không trả đúng số câu');
  for (const c of cau) {
    if (!c.loi || /\d/.test(c.loi) || !c.yDoHinh || !c.chuTrenManHinh || c.chuTrenManHinh.length > 40 ||
      (c.kieu && !['ke','giang','nhe','hoi','nhan'].includes(c.kieu)) ||
      !Array.isArray(c.nguon) || c.nguon.some(id => !facts.some(t => t.id === id))) {
      throw new Error(`Câu ${c.n}: mẫu không hợp lệ (lời có số=${/\d/.test(c.loi || '')}, chữ màn hình=${c.chuTrenManHinh?.length}, mã=${JSON.stringify(c.nguon)})`);
    }
  }
  if (count === 5 && cau.some((c, i) => c.n !== i + 1)) throw new Error('Số câu không tăng liên tiếp');
  return cau;
}
