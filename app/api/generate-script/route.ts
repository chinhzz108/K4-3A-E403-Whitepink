/**
 * API Route: /api/generate-script
 * Nhận brief + approved sources → AI viết 5 câu kịch bản → trả kịch bản + trace
 */

import { persistTrace } from '@/lib/audit';
import { NextResponse } from 'next/server';
import { generateScript } from '@/lib/ai';
import { createScriptTrace } from '@/lib/trace';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { topic, learningObjective, targetAudience, videoDuration, sources, thongTin } = body;

    if (!topic || !sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'Thiếu chủ đề hoặc nguồn đã duyệt' },
        { status: 400 }
      );
    }

    const result = await generateScript(
      topic,
      learningObjective,
      targetAudience,
      videoDuration,
      sources,
      thongTin
    );

    const trace = createScriptTrace({
      input: { topic, learningObjective, targetAudience, videoDuration },
      sources,
      thongTin: thongTin || [],
      script: result.script,
      aiRawResponse: result.rawAiResponse,
      error: result.error,
      isDemo: result.isDemo,
      startTime,
    });

    await persistTrace(trace);
    return NextResponse.json({
      script: result.script,
      trace,
      isDemo: result.isDemo,
      modelUsed: result.modelUsed,
      error: result.error,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Lỗi server: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }
}
