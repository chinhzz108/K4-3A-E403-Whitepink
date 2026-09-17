/**
 * API Route: /api/regenerate-sentence
 * Viết lại một câu kịch bản khi nguồn bị loại
 */

import { persistTrace } from '@/lib/audit';
import { NextResponse } from 'next/server';
import { regenerateSentence } from '@/lib/ai';
import { createRegenerateTrace } from '@/lib/trace';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { sentence, removedSourceIds, remainingSources, remainingThongTin } = body;

    if (!sentence) {
      return NextResponse.json({ error: 'Thiếu câu cần viết lại' }, { status: 400 });
    }

    const result = await regenerateSentence(
      sentence,
      removedSourceIds || [],
      remainingSources || [],
      remainingThongTin || []
    );

    const trace = createRegenerateTrace({
      input: { sentence, removedSourceIds, remainingSources, remainingThongTin },
      sentence: result.sentence,
      aiRawResponse: result.rawAiResponse,
      aiAttempts: result.attempts,
      error: result.error,
      isDemo: result.isDemo,
      startTime,
    });

    await persistTrace(trace);
    return NextResponse.json({
      sentence: result.sentence,
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
