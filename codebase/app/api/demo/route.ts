import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
export async function GET() {
  const data = JSON.parse(await readFile(path.resolve(process.cwd(), '../eval/cp3/run-2026-09-16T19-30-29-684Z/N01.json'), 'utf8'));
  return NextResponse.json({ brief: data.case.input, sources: data.research.sources,
    thongTin: data.research.thongTin, researchTrace: data.research.trace,
    note: 'Nguồn thật đã tìm và đọc trước; bấm Chạy sẽ gọi AI mới, không phát lại kịch bản.' });
}
