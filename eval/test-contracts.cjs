const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => module._compile(
  ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText,
  filename,
);

const { validateResearchPayload } = require('../codebase/lib/contracts.ts');
const { usableFacts, validateSentences } = require('../codebase/lib/evidence.ts');
const { generateScript, regenerateSentence } = require('../codebase/lib/ai.ts');

const page = {
  url: 'https://example.org/source',
  title: 'Example source',
  content: 'A sufficiently long quoted passage from the fetched page for testing.',
  status: 'ok',
  fetchedAt: '2026-09-17T00:00:00.000Z',
  promptInjectionDetected: false,
};

const validResearch = {
  nguon: [{
    id: 'n01', url: page.url, trangThai: 'dang-dung',
    doanTrich: 'A sufficiently long quoted passage from the fetched page for testing.',
  }],
  thongTin: [{
    id: 't01', noiDung: 'A supported claim for testing.', loai: 'luan-diem',
    bangChung: [{ nguonId: 'n01', doanTrich: 'A sufficiently long quoted passage from the fetched page for testing.' }],
  }],
};

(async () => {
  assert.doesNotThrow(() => validateResearchPayload(validResearch, [page]));
  assert.throws(
    () => validateResearchPayload({ nguon: validResearch.nguon }, [page]),
    /thiếu mảng thongTin/,
  );
  assert.throws(
    () => validateResearchPayload({ ...validResearch, thongTin: [{ ...validResearch.thongTin[0], bangChung: [{ nguonId: 'n99', doanTrich: 'A sufficiently long quoted passage from the fetched page for testing.' }] }] }, [page]),
    /nguồn dang-dung/,
  );
  assert.throws(
    () => validateSentences([{ n: 1, loi: 'Một câu hợp lệ', chuTrenManHinh: 'Nhãn', yDoHinh: '', nguon: ['t01'] }], validResearch.thongTin, 1),
    /yDoHinh rỗng/,
  );
  assert.equal(
    usableFacts(validResearch.thongTin, [{ ...validResearch.nguon[0], trangThai: 'bi-loai' }]).length,
    0,
    'Loại nguồn phải làm mất thông tin chỉ phụ thuộc nguồn đó',
  );
  const blocked = await generateScript('Chủ đề', 'Mục tiêu', 'Người học', 'Ba phút', [{ ...validResearch.nguon[0], ngayLayVe: page.fetchedAt, loai: 'khong-xac-dinh', doTinCay: 'trung-binh', lyDoTinCay: '', promptInjectionDetected: false, scrapeStatus: 'ok' }], []);
  assert.match(blocked.error || '', /Không có thông tin có bằng chứng hợp lệ/);
  assert.equal(blocked.rawAiResponse, '');
  const blockedRegeneration = await regenerateSentence(
    { n: 1, phan: 1, loi: 'Câu cũ', chuTrenManHinh: 'Nhãn', yDoHinh: 'Hình', nguon: ['t01'] },
    ['n01'],
    [{ ...validResearch.nguon[0], trangThai: 'bi-loai' }],
    validResearch.thongTin,
  );
  assert.match(blockedRegeneration.error || '', /Không còn thông tin có bằng chứng hợp lệ/);
  assert.equal(blockedRegeneration.rawAiResponse, '');
  console.log('7/7 contract checks passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
