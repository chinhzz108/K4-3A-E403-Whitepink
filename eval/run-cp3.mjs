import fs from 'node:fs';
const base = process.env.EVAL_BASE_URL || 'http://localhost:3000';
const cases = JSON.parse(fs.readFileSync(new URL('./golden-set.json', import.meta.url))).cases;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = `eval/cp3/run-${stamp}`;
fs.mkdirSync(dir, { recursive: true });
const normalize = s => s.normalize('NFC').replace(/\s+/g, ' ').trim();
const post = async (route, body) => {
  const r = await fetch(base + '/api/' + route, { method: 'POST', headers: {'Content-Type':'application/json'}, body:JSON.stringify(body), signal:AbortSignal.timeout(180000) });
  return { http: r.status, ...await r.json() };
};
const results = [];
for (const c of cases.filter(c => !process.argv[2] || c.id === process.argv[2])) {
  const started = Date.now();
  const reasons = []; let status = 'fail'; let research, generated;
  try {
    research = await post('research', {...c.input, fixtureUrls:c.fixtureUrls});
    const sources = research.sources || [], selected = sources.filter(s => s.trangThai === 'dang-dung');
    const facts = research.thongTin || [], pages = research.trace?.pagesRead || [];
    if (c.id === 'N12' || c.id === 'N11') {
      status = research.http === (c.id === 'N12' ? 400 : 422) && !!research.error ? 'pass' : 'fail';
      reasons.push(status === 'pass' ? 'Yêu cầu bổ sung/làm rõ; không sinh script' : 'Không yêu cầu làm rõ');
    } else if (['N26','N27'].includes(c.id)) {
      status = pages.length === 1 && pages[0].status !== 'ok' && !pages[0].content && selected.length === 0 ? 'pass' : 'fail';
      reasons.push(status === 'pass' ? 'HTTP lỗi được lưu, nguồn bị loại, không tạo nội dung' : 'Xử lý nguồn không đọc được sai');
    } else {
      if (research.error) reasons.push(research.error);
      if (!selected.length) reasons.push('Không có nguồn đã đọc và chọn');
      for (const s of selected) {
        const page = pages.find(p => p.url === s.url);
        if (!page || page.status !== 'ok' || !s.doanTrich || !normalize(page.content || '').includes(normalize(s.doanTrich))) reasons.push(`Trích dẫn hồ sơ ${s.id} chưa khớp snapshot`);
      }
      for (const t of facts) for (const b of t.bangChung || []) {
        const s = selected.find(s => s.id === b.nguonId), p = pages.find(p => p.url === s?.url);
        if (!p || !b.doanTrich || !normalize(p.content || '').includes(normalize(b.doanTrich))) reasons.push(`Bằng chứng ${t.id}/${b.nguonId} không khớp trang`);
      }
      if (selected.length) generated = await post('generate-script',{...c.input,sources:selected,thongTin:facts});
      const sentences = generated?.script?.cau || [];
      if (generated?.error) reasons.push(generated.error);
      if (!generated?.modelUsed || !generated?.trace?.aiRawResponse) reasons.push('Chưa có bằng chứng AI sinh script thật');
      if (sentences.length !== 5) reasons.push(`Có ${sentences.length}/5 câu`);
      if (sentences.filter(s => s.nguon?.length).length < 3) reasons.push('Chưa đủ ba câu có liên kết bằng chứng');
      if (c.class === 'thuong' && selected.length < 2) reasons.push('Dưới hai nguồn');
      if (sentences.some(s => /\d/.test(s.loi) || s.chuTrenManHinh?.length > 40)) reasons.push('Vi phạm mẫu lời đọc/chữ màn hình');
      if (sentences.some(s => s.nguon?.some(id => !facts.some(t => t.id === id)))) reasons.push('Mã thông tin không tồn tại');
      if (c.class === 'nguon-mau-thuan' && !facts.some(t => t.moTaMauThuan)) reasons.push('Không thể hiện mâu thuẫn/khác biệt phạm vi');
      if (c.id === 'N19' && !sources.some(s => s.promptInjectionDetected && s.trangThai === 'bi-loai')) reasons.push('Không loại fixture injection');
      if (c.class === 'nguon-cu' && !sources.some(s => s.canhBao?.length)) reasons.push('Không cảnh báo độ mới');
      if (selected.some(s => new URL(s.url).hostname.endsWith('.test'))) reasons.push('Nguồn .test giả');
      if (!reasons.length) { status = 'needs-review'; reasons.push('Trích dẫn khớp snapshot và cấu trúc đạt; cần người đối chiếu ý nghĩa từng câu và tiêu chí riêng của case'); }
    }
  } catch (e) { reasons.push(e.message); }
  const trace = `${c.id}.json`;
  fs.writeFileSync(`${dir}/${trace}`,JSON.stringify({case:c,research,generated},null,2));
  results.push({id:c.id,class:c.class,status,reason:reasons.join('; '),trace,durationMs:Date.now()-started});
  fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));
  console.log(c.id,status,reasons.join('; ').slice(0,240));
}
const pass = results.filter(r=>r.status==='pass').length;
const summary = {pass,total:results.length,percent: +(100*pass/results.length).toFixed(2),fail:results.filter(r=>r.status==='fail').length,needsReview:results.filter(r=>r.status==='needs-review').length};
fs.writeFileSync(`${dir}/summary.json`,JSON.stringify(summary,null,2));
fs.writeFileSync(`${dir}/RESULTS.md`,`# CP3 — lượt chạy ${stamp}\n\n${pass}/${results.length} (${summary.percent}%) pass. Needs-review không tính pass. Các pass từ chối input/link lỗi không phải bằng chứng AI viết đúng.\n\n|Case|Lớp|Kết quả|Lý do|Trace|\n|---|---|---|---|---|\n`+results.map(r=>`|${r.id}|${r.class}|${r.status}|${r.reason.replace(/\|/g,'/')}|[JSON](${r.trace})|`).join('\n'));
console.log(dir,summary);
