# API Fix Plan — ScriptScout

> **Mục tiêu:** Sửa LLM provider chain để eval chạy ổn định, không bị timeout/429/deprecated.  
> **Ràng buộc:** Chỉ sửa file được liệt kê. Không thay đổi logic đánh giá nguồn, viết kịch bản, eval runner, hoặc golden set.  
> **Ngày tạo:** 2026-09-17  
> **Dự kiến tác động:** Từ 4/27 lên ~9-11/27 (loại bỏ lỗi timeout/429/deprecated model)

---

## Tổng quan thay đổi

| # | File | Thay đổi |
|---|---|---|
| 1 | `codebase/lib/ai.ts` | Đảo thứ tự: Groq ① → Gemini ② → bỏ NVIDIA DeepSeek |
| 2 | `codebase/lib/ai.ts` | Đổi Groq model list sang model ổn định hơn |
| 3 | `codebase/lib/ai.ts` | Tăng max_tokens Groq lên 4096, timeout lên 55s |
| 4 | `codebase/.env` | Comment dòng NVIDIA_API_KEY |
| 5 | `codebase/.env.local` | Comment dòng NVIDIA_API_KEY |
| 6 | `eval/run-cp3.mjs` | Thêm delay 4 giây giữa mỗi case để tránh 429 |

---

## CHI TIẾT TỪNG THAY ĐỔI

### 1. File `codebase/lib/ai.ts` — Đảo thứ tự provider trong hàm `callAI`

**Vị trí:** Hàm `callAI` (dòng 167–286)

**Hiện tại:** DeepSeek (NVIDIA) → Groq → Gemini  
**Sau sửa:** Groq → Gemini (bỏ hẳn DeepSeek)

**Lý do:**
- NVIDIA DeepSeek đã deprecated, 42/43 lần timeout >35s — vô dụng
- Groq nhanh nhất (LPU), 30 RPM, đã gánh 100% workload thực tế ở lượt chạy trước
- Gemini free tier chỉ 10-15 RPM, hay throttle — chỉ nên làm fallback

**Cách sửa:**

Thay toàn bộ body của hàm `callAI` (dòng 167–286) bằng code sau. Giữ nguyên signature và return type.

```typescript
async function callAI(options: AICallOptions): Promise<AICallResult> {
  const groqKey = getEnv('GROQ_API_KEY');
  const geminiKey = getEnv('GOOGLE_API_KEY');

  const errors: string[] = [];
  const auditContext = options.traceContext ? {
    runId: options.traceContext.runId,
    caseId: options.traceContext.caseId,
    phase: options.traceContext.phase,
  } : {};

  // 1. Groq — primary (nhanh nhất, 30 RPM)
  if (groqKey) {
    const models = getEnv('GROQ_MODEL')
      ? [getEnv('GROQ_MODEL')]
      : ['llama-3.3-70b-versatile', 'llama-4-scout-17b-16e-instruct'];
    for (const model of models) {
      const startedAt = Date.now();
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
              { role: 'user', content: options.prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: options.temperature ?? 0.2,
            max_tokens: 4096,
          }),
          signal: AbortSignal.timeout(55000),
        });

        if (res.ok) {
          const data = await res.json();
          const durationMs = Date.now() - startedAt;
          await recordCall({
            ...auditContext, provider: 'groq', model, requestId: data.id,
            usage: data.usage, durationMs,
            fallbackFrom: errors.length ? [...errors] : undefined,
            calledAt: new Date().toISOString(),
            input: options.prompt, output: data.choices?.[0]?.message?.content,
          });
          const content = data.choices?.[0]?.message?.content || '';
          if (content) {
            return { text: content, provider: 'groq', model, requestId: data.id, durationMs };
          }
        } else {
          await res.json().catch(() => ({}));
          const reason = `Groq ${model} (${res.status}): request rejected`;
          errors.push(reason);
          await recordCall({
            ...auditContext, provider: 'groq', model, status: 'failed',
            durationMs: Date.now() - startedAt,
            calledAt: new Date().toISOString(), error: reason,
          });
        }
      } catch {
        const reason = `Groq ${model} exception: network/service error`;
        errors.push(reason);
        await recordCall({
          ...auditContext, provider: 'groq', model, status: 'failed',
          durationMs: Date.now() - startedAt,
          calledAt: new Date().toISOString(), error: reason,
        });
      }
    }
  }

  // 2. Google Gemini — fallback
  if (geminiKey) {
    const startedAt = Date.now();
    try {
      const ai = new GoogleGenerativeAI(geminiKey);
      const modelName = getEnv('GOOGLE_MODEL') || 'gemini-3.6-flash';
      const model = ai.getGenerativeModel(
        { model: modelName, generationConfig: { responseMimeType: 'application/json' } },
        { timeout: 55000 },
      );
      const fullPrompt = options.systemPrompt
        ? `${options.systemPrompt}\n\n${options.prompt}`
        : options.prompt;
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();
      const durationMs = Date.now() - startedAt;
      await recordCall({
        ...auditContext, provider: 'gemini', model: modelName, durationMs,
        fallbackFrom: errors.length ? [...errors] : undefined,
        calledAt: new Date().toISOString(),
        usage: result.response.usageMetadata,
        input: options.prompt, output: text,
      });
      if (text) {
        return { text, provider: 'gemini', model: modelName, durationMs };
      }
    } catch (err: any) {
      const reason = `Gemini exception: ${err.message || String(err)}`;
      errors.push(reason);
      await recordCall({
        ...auditContext, provider: 'gemini',
        model: getEnv('GOOGLE_MODEL') || 'gemini-3.6-flash',
        status: 'failed', durationMs: Date.now() - startedAt,
        calledAt: new Date().toISOString(), error: reason,
      });
    }
  }

  if (errors.length > 0) {
    throw new Error(`Tất cả AI providers đều gặp lỗi: ${errors.join(' | ')}`);
  }

  throw new Error('Chưa cấu hình API Key (GROQ_API_KEY hoặc GOOGLE_API_KEY)');
}
```

---

### 2. Các sửa nhỏ khác trong `codebase/lib/ai.ts`

**a) Type `AICallResult['provider']` (dòng 158):**

Đổi từ:
```typescript
  provider: 'deepseek' | 'groq' | 'gemini';
```
thành:
```typescript
  provider: 'groq' | 'gemini';
```

**b) Type `AIAttempt['provider']` (dòng 102):**

Đổi từ:
```typescript
  provider?: 'deepseek' | 'groq' | 'gemini';
```
thành:
```typescript
  provider?: 'groq' | 'gemini';
```

**c) Hàm `hasAIConfigured()` (dòng 133–135):**

Đổi từ:
```typescript
export function hasAIConfigured(): boolean {
  return Boolean(getEnv('NVIDIA_API_KEY') || getEnv('GROQ_API_KEY') || getEnv('GOOGLE_API_KEY'));
}
```
thành:
```typescript
export function hasAIConfigured(): boolean {
  return Boolean(getEnv('GROQ_API_KEY') || getEnv('GOOGLE_API_KEY'));
}
```

**d) Hàm `safeError()` (dòng 139) — bỏ `NVIDIA_API_KEY`:**

Đổi từ:
```typescript
  for (const name of ['NVIDIA_API_KEY', 'GROQ_API_KEY', 'GOOGLE_API_KEY', 'SERPER_API_KEY']) {
```
thành:
```typescript
  for (const name of ['GROQ_API_KEY', 'GOOGLE_API_KEY', 'SERPER_API_KEY']) {
```

**e) Error message trong `evaluateSources` (dòng 391) và `generateScript` (dòng 633):**

Tìm tất cả chỗ có:
```
'Chưa cấu hình API Key (NVIDIA_API_KEY, GROQ_API_KEY hoặc GOOGLE_API_KEY)'
```
đổi thành:
```
'Chưa cấu hình API Key (GROQ_API_KEY hoặc GOOGLE_API_KEY)'
```

**f) Comment đầu file (dòng 3):**

Đổi:
```
* Ưu tiên DeepSeek qua NVIDIA, sau đó Groq và Google Gemini.
```
thành:
```
* Ưu tiên Groq, dự phòng Google Gemini.
```

**g) Comment trên hàm callAI (dòng 164–166):**

Đổi:
```
* Ưu tiên DeepSeek qua NVIDIA, dự phòng Groq rồi Google Gemini
```
thành:
```
* Ưu tiên Groq, dự phòng Google Gemini
```

---

### 3. File `codebase/.env` — Comment NVIDIA key

**Dòng 5:** Đổi từ:
```
NVIDIA_API_KEY=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
```
thành:
```
# NVIDIA_API_KEY đã deprecated — không dùng nữa
# NVIDIA_API_KEY=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
```

---

### 4. File `codebase/.env.local` — Comment NVIDIA key

**Dòng 13-14:** Đổi từ:
```
NVIDIA_API_KEY=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
```
thành:
```
# NVIDIA_API_KEY đã deprecated — không dùng nữa
# NVIDIA_API_KEY=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
```

---

### 5. File `eval/run-cp3.mjs` — Thêm delay giữa các case

**Lý do:** Chạy 27 case liên tục = burst ~162 LLM calls → Groq 429. Thêm delay 4s giữa mỗi case.

**Vị trí:** Trong vòng `for` chính, thêm dòng sau **ngay sau dòng 71** (`console.log(c.id, automatedStatus, ...)`), trước closing brace `}` của for loop:

```javascript
  await new Promise(r => setTimeout(r, 4000)); // pacing: tránh 429 khi burst
```

---

### 6. File `codebase/.env.local.example` — Cập nhật template

Thay toàn bộ nội dung thành:

```
# ScriptScout API Keys — KHÔNG commit file này

# Groq API Key (primary — bắt buộc)
GROQ_API_KEY=

# Google Gemini API (fallback)
GOOGLE_API_KEY=

# Serper.dev Web Search API (tùy chọn, nếu không có hệ thống tự fallback DuckDuckGo Search)
SERPER_API_KEY=
```

---

## CHECKLIST KIỂM TRA SAU KHI SỬA

Chạy lần lượt:

```bash
# 1. TypeScript compile — không lỗi
npm run typecheck

# 2. Contract tests — 7/7 pass
npm run test:contracts

# 3. Invariant tests — 11/11 pass
npm run test:invariants

# 4. Dev server chạy được
npm run dev
# Mở http://localhost:3000, nhập chủ đề bất kỳ, xác nhận AI trả kết quả

# 5. Chạy 1 case eval thử
node eval/run-cp3.mjs N01
# Xác nhận: không có "NVIDIA" hay "deepseek" trong output
# modelUsed phải bắt đầu bằng "groq:" hoặc "gemini:"

# 6. Chạy full eval (mất ~12-15 phút do delay 4s/case)
node eval/run-cp3.mjs
# So sánh kết quả với baseline 4/27
```

---

## KHÔNG ĐƯỢC THAY ĐỔI

- `eval/golden_set.json` — bộ test case
- `eval/run-cp3.mjs` — logic chấm (chỉ thêm delay, không sửa tiêu chí)
- `codebase/lib/search.ts` — logic tìm kiếm (Serper đang ổn)
- `codebase/lib/scraper.ts` — logic scrape
- `codebase/lib/contracts.ts` — validation schema
- `codebase/lib/evidence.ts` — đối chiếu bằng chứng
- `codebase/app/api/research/route.ts` — API route
- `codebase/app/api/generate-script/route.ts` — API route

---

## TÓM TẮT GROQ MODELS ĐƯỢC CHỌN

| Model | Lý do chọn |
|---|---|
| `llama-3.3-70b-versatile` | Model lớn nhất miễn phí trên Groq, JSON tốt, 1000 RPD |
| `llama-4-scout-17b-16e-instruct` | Fallback khi 70b bị rate limit, nhẹ hơn, vẫn đủ chất lượng |

Models cũ bị bỏ:
- `openai/gpt-oss-120b` — hay bị 429
- `qwen/qwen3.8-27b` — chất lượng JSON trung bình  
- `openai/gpt-oss-20b` — hay bị 400/429
