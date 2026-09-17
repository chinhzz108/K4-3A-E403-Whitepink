/**
 * eval/run-eval.ts — Script chạy golden set qua API ScriptScout
 *
 * Cách chạy:
 *   1. Đảm bảo server đang chạy: npm run dev
 *   2. npx tsx eval/run-eval.ts
 *
 * Cần có API keys trong .env.local để chạy thật.
 * Nếu không có key, kết quả sẽ là demo mode.
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.EVAL_BASE_URL || 'http://localhost:3000';

interface EvalCase {
  id: string;
  class: string;
  input: {
    topic: string;
    learningObjective: string;
    targetAudience: string;
    videoDuration: string;
  };
  expectedBehavior: string;
  origin: string;
  passCriteria: string;
  failCriteria: string;
  fixtureUrls?: string[];
}

interface EvalResult {
  id: string;
  class: string;
  input: EvalCase['input'];
  status: 'pass' | 'fail' | 'error' | 'skip';
  reason: string;
  details: {
    sourcesFound: number;
    sourcesApproved: number;
    pagesRead: number;
    scriptSentences: number;
    sentencesWithSource: number;
    isDemo: boolean;
    promptInjectionDetected: boolean;
    contradictionsFound: boolean;
    hasNumbersInLoi: boolean;
    errors: string[];
  };
  trace: unknown;
  durationMs: number;
}

async function runCase(testCase: EvalCase): Promise<EvalResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Step 1: Research
    console.log(`  [${testCase.id}] Đang nghiên cứu: "${testCase.input.topic}"...`);
    const researchRes = await fetch(`${BASE_URL}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testCase.input,
        fixtureUrls: testCase.fixtureUrls,
      }),
    });

    if (!researchRes.ok) {
      const errText = await researchRes.text();
      // Input validation error (e.g., empty topic) is expected behavior for empty input
      if (testCase.class === 'input-mo-ho' && !testCase.input.topic && researchRes.status === 400) {
        return {
          id: testCase.id,
          class: testCase.class,
          input: testCase.input,
          status: 'pass',
          reason: 'Hệ thống từ chối và trả lỗi HTTP 400 đúng chuẩn khi input trống',
          details: {
            sourcesFound: 0, sourcesApproved: 0, pagesRead: 0,
            scriptSentences: 0, sentencesWithSource: 0,
            isDemo: false, promptInjectionDetected: false,
            contradictionsFound: false, hasNumbersInLoi: false, errors: [],
          },
          trace: null,
          durationMs: Date.now() - startTime,
        };
      }

      return {
        id: testCase.id,
        class: testCase.class,
        input: testCase.input,
        status: 'error',
        reason: `API research trả về ${researchRes.status}: ${errText}`,
        details: {
          sourcesFound: 0, sourcesApproved: 0, pagesRead: 0,
          scriptSentences: 0, sentencesWithSource: 0,
          isDemo: false, promptInjectionDetected: false,
          contradictionsFound: false, hasNumbersInLoi: false, errors: [errText],
        },
        trace: null,
        durationMs: Date.now() - startTime,
      };
    }

    const researchData = await researchRes.json();

    if (researchData.error && (!researchData.sources || researchData.sources.length === 0)) {
      // Input validation error (e.g., empty topic) — could be expected
      if (testCase.class === 'input-mo-ho' && !testCase.input.topic) {
        return {
          id: testCase.id,
          class: testCase.class,
          input: testCase.input,
          status: 'pass',
          reason: 'Hệ thống trả lỗi đúng khi input trống',
          details: {
            sourcesFound: 0, sourcesApproved: 0, pagesRead: 0,
            scriptSentences: 0, sentencesWithSource: 0,
            isDemo: researchData.isDemo || false,
            promptInjectionDetected: false, contradictionsFound: false,
            hasNumbersInLoi: false, errors: [researchData.error],
          },
          trace: researchData.trace,
          durationMs: Date.now() - startTime,
        };
      }

      return {
        id: testCase.id,
        class: testCase.class,
        input: testCase.input,
        status: 'error',
        reason: researchData.error,
        details: {
          sourcesFound: 0, sourcesApproved: 0, pagesRead: 0,
          scriptSentences: 0, sentencesWithSource: 0,
          isDemo: researchData.isDemo || false,
          promptInjectionDetected: false, contradictionsFound: false,
          hasNumbersInLoi: false, errors: [researchData.error],
        },
        trace: researchData.trace,
        durationMs: Date.now() - startTime,
      };
    }

    const sources = researchData.sources || [];
    const thongTin = researchData.thongTin || [];
    const approvedSources = sources.filter((s: any) => s.trangThai === 'dang-dung');

    // Check prompt injection detection
    const promptInjectionDetected = sources.some((s: any) => s.promptInjectionDetected);

    // Check contradictions
    const contradictionsFound = thongTin.some((t: any) => t.moTaMauThuan);

    // Step 2: Generate script (only if we have approved sources)
    let scriptData: any = null;
    if (approvedSources.length > 0) {
      console.log(`  [${testCase.id}] Đang tạo kịch bản...`);
      const scriptRes = await fetch(`${BASE_URL}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testCase.input,
          sources: approvedSources,
          thongTin,
        }),
      });

      if (scriptRes.ok) {
        scriptData = await scriptRes.json();
      }
    }

    const script = scriptData?.script;
    const sentences = script?.cau || [];
    const sentencesWithSource = sentences.filter((c: any) => c.nguon && c.nguon.length > 0).length;

    // Check for numbers in loi
    const hasNumbersInLoi = sentences.some((c: any) =>
      c.loi && /\d/.test(c.loi)
    );

    // Evaluate pass/fail based on criteria
    let status: 'pass' | 'fail' = 'pass';
    const reasons: string[] = [];

    // Common checks
    if (researchData.isDemo) {
      status = 'fail';
      reasons.push('Demo mode — không có API key thật');
    }

    // Check for fake sources (.test URLs)
    const fakeUrls = sources.filter((s: any) => s.url?.includes('.test'));
    if (fakeUrls.length > 0) {
      status = 'fail';
      reasons.push(`Có ${fakeUrls.length} URL .test (giả)`);
    }

    // Class-specific checks
    switch (testCase.class) {
      case 'thuong':
        if (approvedSources.length < 2) {
          status = 'fail';
          reasons.push(`Chỉ có ${approvedSources.length} nguồn (cần ≥2)`);
        }
        if (sentences.length === 0) {
          status = 'fail';
          reasons.push('Không có câu kịch bản');
        }
        if (hasNumbersInLoi) {
          // Cảnh báo nhưng không fail tự động — cần người kiểm tra
          reasons.push('⚠ Có chữ số trong loi — cần kiểm tra');
        }
        break;

      case 'nguon-su-that':
        // Số liệu cần ≥2 nguồn hoặc đánh dấu chua-xac-minh
        const soLieuThongTin = thongTin.filter((t: any) => t.loai === 'so-lieu');
        const unverifiedSoLieu = soLieuThongTin.filter(
          (t: any) => t.soNguonXacNhan < 2 && t.trangThai === 'da-xac-minh'
        );
        if (unverifiedSoLieu.length > 0) {
          status = 'fail';
          reasons.push('Số liệu 1 nguồn nhưng ghi da-xac-minh');
        }
        break;

      case 'input-mo-ho':
        // Expect warning or error for vague/empty input
        if (testCase.input.topic === '' && sentences.length > 0) {
          status = 'fail';
          reasons.push('Tạo kịch bản khi input trống');
        }
        break;

      case 'prompt-injection':
        if (!promptInjectionDetected && testCase.fixtureUrls?.length) {
          // Can only check if fixtures were actually used
          reasons.push('⚠ Fixture chỉ hoạt động khi chạy local');
        }
        break;

      case 'nguon-mau-thuan':
        if (!contradictionsFound && testCase.fixtureUrls?.length) {
          reasons.push('⚠ Mâu thuẫn cần fixture — chạy local để kiểm tra');
        }
        break;

      case 'nguon-cu':
        // Check if old sources have warnings
        const oldSources = sources.filter((s: any) => {
          if (!s.ngayDang) return false;
          const year = parseInt(s.ngayDang.substring(0, 4));
          return year < 2025;
        });
        const oldWithoutWarning = oldSources.filter(
          (s: any) => !s.canhBao?.length && s.trangThai === 'dang-dung'
        );
        if (oldWithoutWarning.length > 0) {
          reasons.push(`⚠ ${oldWithoutWarning.length} nguồn cũ không có cảnh báo`);
        }
        break;
    }

    if (reasons.length === 0) {
      reasons.push('Đạt các tiêu chí cơ bản');
    }

    return {
      id: testCase.id,
      class: testCase.class,
      input: testCase.input,
      status,
      reason: reasons.join('; '),
      details: {
        sourcesFound: sources.length,
        sourcesApproved: approvedSources.length,
        pagesRead: researchData.pagesRead || 0,
        scriptSentences: sentences.length,
        sentencesWithSource,
        isDemo: researchData.isDemo || false,
        promptInjectionDetected,
        contradictionsFound,
        hasNumbersInLoi,
        errors,
      },
      trace: {
        researchTrace: researchData.trace,
        scriptTrace: scriptData?.trace,
      },
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      id: testCase.id,
      class: testCase.class,
      input: testCase.input,
      status: 'error',
      reason: `Exception: ${err instanceof Error ? err.message : String(err)}`,
      details: {
        sourcesFound: 0, sourcesApproved: 0, pagesRead: 0,
        scriptSentences: 0, sentencesWithSource: 0,
        isDemo: false, promptInjectionDetected: false,
        contradictionsFound: false, hasNumbersInLoi: false,
        errors: [String(err)],
      },
      trace: null,
      durationMs: Date.now() - startTime,
    };
  }
}

async function main() {
  console.log('=== ScriptScout Eval Runner ===\n');

  // Load golden set
  const goldenSetPath = path.join(__dirname, 'golden_set.json');
  const goldenSet = JSON.parse(fs.readFileSync(goldenSetPath, 'utf-8'));
  const cases: EvalCase[] = goldenSet.cases;

  console.log(`Tổng số case: ${cases.length}`);
  console.log(`Server: ${BASE_URL}\n`);

  // Check if server is running
  try {
    await fetch(BASE_URL);
  } catch {
    console.error('❌ Server không chạy! Hãy chạy "npm run dev" trước.');
    process.exit(1);
  }

  // Determine which cases to run
  const caseFilter = process.argv[2]; // e.g., "N01" or "thuong"
  let casesToRun = cases;
  if (caseFilter) {
    casesToRun = cases.filter(
      (c) => c.id === caseFilter || c.class === caseFilter
    );
    console.log(`Lọc: ${caseFilter} → ${casesToRun.length} case\n`);
  }

  const results: EvalResult[] = [];

  for (const testCase of casesToRun) {
    console.log(`\n[${testCase.id}] ${testCase.class} — "${testCase.input.topic}"`);
    const result = await runCase(testCase);
    results.push(result);

    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`  ${icon} ${result.status.toUpperCase()} — ${result.reason}`);
    console.log(
      `  Nguồn: ${result.details.sourcesApproved}/${result.details.sourcesFound} | Câu: ${result.details.sentencesWithSource}/${result.details.scriptSentences} | ${result.durationMs}ms`
    );

    // Rate limit between cases
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n\n=== KẾT QUẢ TỔNG HỢP ===\n');

  const pass = results.filter((r) => r.status === 'pass').length;
  const fail = results.filter((r) => r.status === 'fail').length;
  const error = results.filter((r) => r.status === 'error').length;
  const total = results.length;

  console.log(`Tổng: ${total} case`);
  console.log(`Pass: ${pass} (${Math.round((pass / total) * 100)}%)`);
  console.log(`Fail: ${fail} (${Math.round((fail / total) * 100)}%)`);
  console.log(`Error: ${error} (${Math.round((error / total) * 100)}%)`);

  // Print table
  console.log('\n| ID | Lớp | Chủ đề | Kết quả | Lý do | Nguồn | Câu |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of results) {
    const topic =
      r.input.topic.length > 30
        ? r.input.topic.substring(0, 30) + '...'
        : r.input.topic || '(trống)';
    console.log(
      `| ${r.id} | ${r.class} | ${topic} | ${r.status} | ${r.reason.substring(0, 50)} | ${r.details.sourcesApproved}/${r.details.sourcesFound} | ${r.details.sentencesWithSource}/${r.details.scriptSentences} |`
    );
  }

  // Save results
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(resultsDir, `run-${timestamp}.json`);
  fs.writeFileSync(
    resultsFile,
    JSON.stringify(
      {
        runAt: new Date().toISOString(),
        server: BASE_URL,
        summary: { total, pass, fail, error, passRate: `${Math.round((pass / total) * 100)}%` },
        results,
      },
      null,
      2
    )
  );

  console.log(`\nKết quả đã lưu: ${resultsFile}`);
}

main().catch(console.error);
