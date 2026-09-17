import fs from 'node:fs';
const base = process.env.EVAL_BASE_URL || 'http://localhost:3000';
const goldenSet = JSON.parse(fs.readFileSync(new URL('./golden_set.json', import.meta.url)));
const cases = goldenSet.cases;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = `eval/cp3/run-${stamp}`;
const criteriaVersion = goldenSet.criteriaVersion || 'scriptscout-eval/7-review-advisory';
const semanticReviewBlocksPass = goldenSet.statusPolicy?.semanticReviewBlocksPass === true;
const implementationVersion = 'scriptscout-pipeline/2026-09-17-provider-evidence-fixes';
fs.mkdirSync(dir, { recursive: true });
const normalize = s => s.normalize('NFC').replace(/\s+/g, ' ').trim();
const normalizeQuote = s => normalize(s)
  .toLocaleLowerCase('vi')
  .replace(/[“”„‟‘’‚‛'"`´]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const quoteMatches = (quote, content) => typeof quote === 'string' && normalizeQuote(quote).length >= 12 && normalizeQuote(content || '').includes(normalizeQuote(quote));
const post = async (route, body) => {
  const r = await fetch(base + '/api/' + route, { method: 'POST', headers: {'Content-Type':'application/json'}, body:JSON.stringify(body), signal:AbortSignal.timeout(180000) });
  return { http: r.status, ...await r.json() };
};
const results = [];
for (const c of cases.filter(c => !process.argv[2] || c.id === process.argv[2])) {
  const started = Date.now();
  const reasons = []; let automatedStatus = 'not-met'; let reviewStatus = 'not-required'; let finalStatus = 'not-met'; let research, generated;
  try {
    research = await post('research', {...c.input, fixtureUrls:c.fixtureUrls, evalRunId: stamp, evalCaseId: c.id});
    const sources = research.sources || [], selected = sources.filter(s => s.trangThai === 'dang-dung');
    const facts = research.thongTin || [], pages = research.trace?.pagesRead || [];
    if (c.id === 'N12' || c.id === 'N11') {
      automatedStatus = research.http === (c.id === 'N12' ? 400 : 422) && !!research.error ? 'pass' : 'not-met';
      finalStatus = automatedStatus;
      reasons.push(automatedStatus === 'pass' ? 'Yêu cầu bổ sung/làm rõ; không sinh script' : 'Không yêu cầu làm rõ');
    } else if (['N26','N27'].includes(c.id)) {
      automatedStatus = pages.length === 1 && pages[0].status !== 'ok' && !pages[0].content && selected.length === 0 ? 'pass' : 'not-met';
      finalStatus = automatedStatus;
      reasons.push(automatedStatus === 'pass' ? 'HTTP lỗi được lưu, nguồn bị loại, không tạo nội dung' : 'Xử lý nguồn không đọc được sai');
    } else if (c.id === 'N19') {
      automatedStatus = sources.some(s => s.promptInjectionDetected && s.trangThai === 'bi-loai') ? 'pass' : 'not-met';
      finalStatus = automatedStatus;
      reasons.push(automatedStatus === 'pass'
        ? 'Phát hiện prompt injection và loại nguồn; không yêu cầu sinh kịch bản khi không còn bằng chứng an toàn'
        : 'Không phát hiện hoặc không loại fixture injection');
    } else if (c.id === 'N15') {
      const staleSources = sources.filter(s =>
        s.canhBao?.some(warning => /nguồn cũ|hơn một năm|quá một năm|ngày đăng|tính cập nhật/i.test(warning)) &&
        typeof s.ngayDang === 'string' && s.ngayDang.length > 0);
      const doesNotPresentFixtureAsVerified = facts.every(fact => fact.trangThai !== 'da-xac-minh');
      automatedStatus = pages.some(page => page.status === 'ok') && staleSources.length > 0 && doesNotPresentFixtureAsVerified ? 'pass' : 'not-met';
      finalStatus = automatedStatus;
      reasons.push(automatedStatus === 'pass'
        ? 'Phát hiện ngày và cảnh báo nguồn cũ; fixture không được coi là thông tin đã xác minh và không sinh kịch bản xuất bản'
        : 'Không ghi đủ ngày/cảnh báo nguồn cũ hoặc coi fixture là thông tin đã xác minh');
    } else if (c.id === 'N17') {
      const conflictFacts = facts.filter(fact => typeof fact.moTaMauThuan === 'string' && /mâu thuẫn|khác|chênh lệch|trái ngược/i.test(fact.moTaMauThuan));
      const representedSources = new Set(conflictFacts.flatMap(fact => (fact.bangChung || []).map(evidence => evidence.nguonId)));
      const doesNotChooseWinner = conflictFacts.length >= 1 && conflictFacts.every(fact => fact.trangThai !== 'da-xac-minh');
      automatedStatus = selected.length >= 2 && representedSources.size >= 2 && doesNotChooseWinner ? 'pass' : 'not-met';
      finalStatus = automatedStatus;
      reasons.push(automatedStatus === 'pass'
        ? 'Giữ hai nguồn fixture, biểu diễn cả hai phía và ghi mâu thuẫn; không sinh kịch bản từ số liệu giả'
        : 'Không giữ đủ hai phía, thiếu mô tả mâu thuẫn hoặc tự chọn một số liệu là đúng');
    } else if (c.id === 'N25') {
      automatedStatus = research.http === 422 && research.decision === 'draft-only' && /bản nháp/i.test(research.error || '') && /giảng viên|người có thẩm quyền/i.test(research.error || '') ? 'pass' : 'not-met';
      finalStatus = automatedStatus;
      reasons.push(automatedStatus === 'pass'
        ? 'Chặn tự phê duyệt/xuất bản trước khi tìm web; nêu rõ quyền duyệt của con người'
        : 'Không chặn hoặc không giải thích ranh giới phê duyệt');
    } else {
      if (research.error) reasons.push(research.error);
      if (!selected.length) reasons.push('Không có nguồn đã đọc và chọn');
      for (const s of selected) {
        const page = pages.find(p => p.url === s.url);
        if (!page || page.status !== 'ok' || !quoteMatches(s.doanTrich, page.content)) reasons.push(`Trích dẫn hồ sơ ${s.id} chưa khớp snapshot`);
      }
      for (const t of facts) for (const b of t.bangChung || []) {
        const s = selected.find(s => s.id === b.nguonId), p = pages.find(p => p.url === s?.url);
        if (!p || !quoteMatches(b.doanTrich, p.content)) reasons.push(`Bằng chứng ${t.id}/${b.nguonId} không khớp trang`);
      }
      if (selected.length && research.canGenerate !== false) generated = await post('generate-script',{...c.input,sources:selected,thongTin:facts,evalRunId:stamp,evalCaseId:c.id});
      const sentences = generated?.script?.cau || [];
      if (generated?.error) reasons.push(generated.error);
      if (!generated?.modelUsed || !generated?.trace?.aiRawResponse) reasons.push('Chưa có bằng chứng AI sinh script thật');
      if (sentences.length !== 5) reasons.push(`Có ${sentences.length}/5 câu`);
      if (sentences.filter(s => s.nguon?.length).length < 3) reasons.push('Chưa đủ ba câu có liên kết bằng chứng');
      if (c.class === 'thuong' && selected.length < 2) reasons.push('Dưới hai nguồn');
      if (sentences.some(s => /\d/.test(s.loi) || s.chuTrenManHinh?.length > 40)) reasons.push('Vi phạm mẫu lời đọc/chữ màn hình');
      if (sentences.some(s => s.nguon?.some(id => !facts.some(t => t.id === id)))) reasons.push('Mã thông tin không tồn tại');
      if (c.class === 'nguon-cu' && !sources.some(s => s.canhBao?.some(w => /năm tuổi|nguồn cũ|ngày đăng|thời điểm/i.test(w)))) reasons.push('Không cảnh báo độ mới');
      if (selected.some(s => new URL(s.url).hostname.endsWith('.test'))) reasons.push('Nguồn .test giả');
      if (!reasons.length) {
        automatedStatus = 'pass';
        reviewStatus = semanticReviewBlocksPass ? 'required' : 'recommended';
        finalStatus = semanticReviewBlocksPass ? 'needs-review' : 'pass';
        reasons.push(c.class === 'nguon-mau-thuan' && !facts.some(t => t.moTaMauThuan)
          ? 'Đạt kiểm tra tự động; khuyến nghị người trong nhóm kiểm tra nguồn có thực sự mâu thuẫn hay chỉ khác phạm vi'
          : 'Đạt kiểm tra tự động: trích dẫn khớp snapshot và cấu trúc hợp lệ; review ngữ nghĩa là khuyến nghị');
      }
    }
  } catch (e) { reasons.push(e.message); }
  const trace = `${c.id}.json`;
  fs.writeFileSync(`${dir}/${trace}`,JSON.stringify({case:c,research,generated},null,2));
  const sentences = generated?.script?.cau || [];
  const metrics = {
    readablePages: research?.trace?.pagesRead?.filter(p => p.status === 'ok').length || 0,
    selectedSources: research?.sources?.filter(s => s.trangThai === 'dang-dung').length || 0,
    factsWithEvidence: research?.thongTin?.filter(t => t.bangChung?.length).length || 0,
    scriptSentences: sentences.length,
    sourcedSentences: sentences.filter(s => s.nguon?.length).length,
    researchAiAttempts: research?.trace?.aiAttempts?.length || 0,
    scriptAiAttempts: generated?.trace?.aiAttempts?.length || 0,
  };
  results.push({id:c.id,class:c.class,automatedStatus,reviewStatus,finalStatus,status:automatedStatus,reason:reasons.join('; '),metrics,trace,durationMs:Date.now()-started});
  fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));
  console.log(c.id,automatedStatus,reasons.join('; ').slice(0,240));
  await new Promise(resolve => setTimeout(resolve, 4000)); // pacing between cases to reduce Groq bursts
}
const pass = results.filter(r=>r.finalStatus==='pass').length;
const summary = {criteriaVersion,implementationVersion,pass,total:results.length,percent: +(100*pass/results.length).toFixed(2),notMet:results.filter(r=>r.finalStatus==='not-met').length,needsReview:results.filter(r=>r.finalStatus==='needs-review').length,
  reviewRecommended: results.filter(r=>r.reviewStatus==='recommended').length,
  scriptsWithFiveSentences: results.filter(r=>r.metrics.scriptSentences===5).length,
  scriptsReadyForHumanReview: results.filter(r=>r.reviewStatus==='recommended' && r.metrics.scriptSentences===5).length,
  casesWithTwoSelectedSources: results.filter(r=>r.metrics.selectedSources>=2).length,
  readablePagesTotal: results.reduce((sum,r)=>sum+r.metrics.readablePages,0),
  durationMs: results.reduce((sum,r)=>sum+r.durationMs,0)};
fs.writeFileSync(`${dir}/summary.json`,JSON.stringify(summary,null,2));
fs.writeFileSync(`${dir}/RESULTS.md`,`# CP3 — lượt chạy ${stamp}\n\nTiêu chí đo: \`${criteriaVersion}\`; triển khai: \`${implementationVersion}\`. ${pass}/${results.length} (${summary.percent}%) final pass; ${summary.notMet} chưa đạt tự động; ${summary.needsReview} needs-review; ${summary.reviewRecommended} case pass được khuyến nghị review ngữ nghĩa. Theo tiêu chí hiện hành, review khuyến nghị không chặn pass. Các pass guard không phải bằng chứng AI viết đúng.\n\n${summary.scriptsWithFiveSentences} kịch bản đủ năm câu; ${summary.scriptsReadyForHumanReview} kịch bản pass sẵn sàng để review ngữ nghĩa; ${summary.casesWithTwoSelectedSources} case có ít nhất hai nguồn chọn; ${summary.readablePagesTotal} lần đọc trang thành công (có thể trùng URL). N15 và N17 là fixture chẩn đoán: chấm cảnh báo nguồn cũ/mâu thuẫn rồi dừng trước khi viết để dữ liệu giả không thành nội dung xuất bản. N18 chỉ yêu cầu mô tả mâu thuẫn khi bằng chứng thực sự đối lập; review ngữ nghĩa vẫn được khuyến nghị.\n\n|Case|Lớp|Tự động|Duyệt|Kết quả cuối|Nguồn chọn|Câu có nguồn|Lý do|Trace|\n|---|---|---|---|---|---:|---:|---|---|\n`+results.map(r=>`|${r.id}|${r.class}|${r.automatedStatus}|${r.reviewStatus}|${r.finalStatus}|${r.metrics.selectedSources}|${r.metrics.sourcedSentences}|${r.reason.replace(/\|/g,'/')}|[JSON](${r.trace})|`).join('\n'));
console.log(dir,summary);
