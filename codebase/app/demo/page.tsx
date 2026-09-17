'use client';
import { useEffect, useState } from 'react';
import type { ScriptOutput, SourceProfile, ThongTin } from '@/lib/ai';
import type { ResearchBrief } from '@/lib/types';
type Prepared = { brief: ResearchBrief; sources: SourceProfile[]; thongTin: ThongTin[]; note: string };
export default function Demo() {
  const [data, setData] = useState<Prepared>();
  const [output, setOutput] = useState<ScriptOutput>();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [citation, setCitation] = useState<string[]>([]);
  useEffect(() => { fetch('/api/demo').then(r => r.json()).then(d => { setData(d); setSelected(d.sources.filter((s: SourceProfile) => s.trangThai === 'dang-dung').map((s: SourceProfile) => s.id)); }); }, []);
  async function run() {
    if (!data) return;
    setBusy(true); setOutput(undefined); setCitation([]); setMessage('Đang gọi AI thật…');
    const start = performance.now();
    try {
      const r = await fetch('/api/generate-script', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...data.brief,sources:data.sources.filter(s => selected.includes(s.id)),thongTin:data.thongTin}) });
      const result = await r.json();
      if (result.error) throw new Error(result.error);
      setOutput(result.script);
      setMessage(`${result.modelUsed} · ${((performance.now()-start)/1000).toFixed(1)} giây · ${result.trace.id}`);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Không gọi được AI'); }
    finally { setBusy(false); }
  }
  return <main className="max-w-5xl mx-auto p-8 space-y-4">
    <h1 className="text-3xl font-bold">ScriptScout · Demo AI thật</h1>
    <p>{data?.brief.topic}</p>
    <p className="text-sm text-muted-foreground">{data?.note} Ba trang Wikipedia là nguồn thứ cấp cùng tổ chức, không phải ba xác nhận độc lập. Bản nháp cần giảng viên duyệt.</p>
    <div className="grid grid-cols-3 gap-3">{data?.sources.map(s => <label key={s.id} className="border rounded-lg p-3 text-sm">
      <input type="checkbox" checked={selected.includes(s.id)} onChange={e=>setSelected(prev=>e.target.checked?[...prev,s.id]:prev.filter(id=>id!==s.id))} /> Duyệt {s.id}
      <a className="block underline" href={s.url} target="_blank" rel="noreferrer">{s.tieuDe}</a>
      <p>Ngày đăng: {s.ngayDang || 'Không rõ'} · Truy cập: {s.ngayLayVe}</p>
      <details><summary>Hồ sơ và đoạn đã đọc</summary><p>{s.tacGia || 'Tác giả không rõ'} · {s.toChuc || 'Tổ chức không rõ'}</p><p>{s.lyDoTinCay}</p><blockquote>{s.doanTrich}</blockquote></details>
    </label>)}</div>
    <button className="bg-primary text-white rounded-lg px-8 py-3 disabled:opacity-50" disabled={busy || !selected.length} onClick={run}>{busy?'Đang chạy…':'Chạy'}</button>
    <p role="status" className="text-sm">{message}</p>
    <div className="grid grid-cols-[1.2fr_1fr] gap-5"><section className="space-y-2">{output?.cau.map(c=><button key={c.n} className="block text-left border rounded-lg p-3 w-full hover:bg-muted" onClick={()=>setCitation(c.nguon || [])}>
      <b>{c.n}.</b> {c.loi}<span className="text-primary"> {(c.nguon || []).join(', ')}</span>
    </button>)}</section>
    <aside className="border rounded-lg p-4"><h2 className="font-bold">Bằng chứng của câu</h2>{citation.flatMap(id=>data?.thongTin.find(t=>t.id===id)?.bangChung || []).map((b,i)=>{const s=data?.sources.find(s=>s.id===b.nguonId);return <div key={i} className="my-3"><a className="underline text-primary break-all" href={s?.url} target="_blank" rel="noreferrer">{s?.url}</a><blockquote className="mt-2">{b.doanTrich}</blockquote><p className="text-xs">Khớp snapshot đã đọc; cần duyệt ý nghĩa.</p></div>;})}{!citation.length && <p>Bấm câu có mã thông tin để xem URL và đoạn trích.</p>}</aside></div>
    <a href="/" className="underline">Mở luồng đầy đủ: nhập chủ đề → tìm → duyệt → viết → loại nguồn</a>
  </main>;
}
