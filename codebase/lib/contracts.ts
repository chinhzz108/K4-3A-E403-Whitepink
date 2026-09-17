import type { ScrapedPage } from './scraper';
import type { SourceProfile, ThongTin } from './ai';

type ResearchPayload = {
  nguon: Array<Partial<SourceProfile>>;
  thongTin: Array<Partial<ThongTin>>;
};

const sourceStates = new Set(['dang-dung', 'bi-loai']);
const factTypes = new Set(['dinh-nghia', 'vi-du', 'so-lieu', 'luan-diem']);

function asRecord(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} phải là object JSON`);
  }
  return value as Record<string, unknown>;
}

function asText(value: unknown, name: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} phải là chuỗi không rỗng`);
  }
  return value.trim();
}

/**
 * Checks the model's source-evaluation response before it flows into script
 * generation. This only validates shape and source references; evidence still
 * has to match the fetched snapshot in reconcileEvidence.
 */
export function validateResearchPayload(value: unknown, pages: ScrapedPage[]): ResearchPayload {
  const payload = asRecord(value, 'Phản hồi đánh giá nguồn');
  if (!Array.isArray(payload.nguon) || payload.nguon.length === 0) {
    throw new Error('Phản hồi đánh giá nguồn thiếu mảng nguon');
  }
  if (!Array.isArray(payload.thongTin)) {
    throw new Error('Phản hồi đánh giá nguồn thiếu mảng thongTin');
  }

  const pageUrls = new Set(pages.map((page) => page.url));
  const sourceIds = new Set<string>();
  const selectedIds = new Set<string>();

  for (let index = 0; index < payload.nguon.length; index += 1) {
    const sourceValue = payload.nguon[index];
    const source = asRecord(sourceValue, `nguon[${index}]`);
    const id = asText(source.id, `nguon[${index}].id`);
    if (!/^n\d{2}$/.test(id) || sourceIds.has(id)) {
      throw new Error(`nguon[${index}].id phải là mã n duy nhất, ví dụ n01`);
    }
    sourceIds.add(id);
    const url = asText(source.url, `nguon[${index}].url`);
    if (!pageUrls.has(url)) {
      throw new Error(`nguon[${index}].url không thuộc trang đã đọc`);
    }
    if (!sourceStates.has(String(source.trangThai))) {
      throw new Error(`nguon[${index}].trangThai phải là dang-dung hoặc bi-loai`);
    }
    if (source.trangThai === 'dang-dung') {
      selectedIds.add(id);
      if (asText(source.doanTrich, `nguon[${index}].doanTrich`).length < 12) {
        throw new Error(`nguon[${index}].doanTrich quá ngắn`);
      }
    }
  }

  const factIds = new Set<string>();
  for (let index = 0; index < payload.thongTin.length; index += 1) {
    const factValue = payload.thongTin[index];
    const fact = asRecord(factValue, `thongTin[${index}]`);
    const id = asText(fact.id, `thongTin[${index}].id`);
    if (!/^t\d{2}$/.test(id) || factIds.has(id)) {
      throw new Error(`thongTin[${index}].id phải là mã t duy nhất, ví dụ t01`);
    }
    factIds.add(id);
    asText(fact.noiDung, `thongTin[${index}].noiDung`);
    if (!factTypes.has(String(fact.loai))) {
      throw new Error(`thongTin[${index}].loai không hợp lệ`);
    }
    if (!Array.isArray(fact.bangChung) || fact.bangChung.length === 0) {
      throw new Error(`thongTin[${index}].bangChung phải có ít nhất một đoạn trích`);
    }
    for (let evidenceIndex = 0; evidenceIndex < fact.bangChung.length; evidenceIndex += 1) {
      const evidenceValue = fact.bangChung[evidenceIndex];
      const evidence = asRecord(evidenceValue, `thongTin[${index}].bangChung[${evidenceIndex}]`);
      const sourceId = asText(evidence.nguonId, `thongTin[${index}].bangChung[${evidenceIndex}].nguonId`);
      if (!selectedIds.has(sourceId)) {
        throw new Error(`thongTin[${index}].bangChung[${evidenceIndex}] phải tham chiếu nguồn dang-dung`);
      }
      if (asText(evidence.doanTrich, `thongTin[${index}].bangChung[${evidenceIndex}].doanTrich`).length < 12) {
        throw new Error(`thongTin[${index}].bangChung[${evidenceIndex}].doanTrich quá ngắn`);
      }
    }
  }

  if (selectedIds.size > 0 && factIds.size === 0) {
    throw new Error('Phản hồi đánh giá nguồn có nguồn dang-dung nhưng thiếu thongTin có bằng chứng');
  }

  return payload as ResearchPayload;
}
