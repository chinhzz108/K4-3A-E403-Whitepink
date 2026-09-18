const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

const source = fs.readFileSync('codebase/lib/ai.ts', 'utf8');
const start = source.indexOf('const pause =');
const end = source.indexOf('/**', source.indexOf('function parseJSONSafely', start));
const compiled = ts.transpileModule(source.slice(start, end), {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText;

function makeContext(env, fetchImpl) {
  const logs = [];
  const geminiModels = [];
  const context = vm.createContext({
    getEnv: name => env[name] || '',
    safeError: error => error instanceof Error ? error.message : String(error),
    AbortSignal,
    setTimeout: callback => { callback(); return 0; },
    recordCall: async value => logs.push(value),
    GoogleGenerativeAI: class {
      getGenerativeModel(options) {
        geminiModels.push(options.model);
        return { generateContent: async () => ({ response: { text: () => '{"ok":true}', usageMetadata: {} } }) };
      }
    },
    fetch: fetchImpl,
  });
  vm.runInContext(compiled + ';globalThis.run=callAI;', context);
  return { context, logs, geminiModels };
}

(async () => {
  {
    const calls = [];
    const { context } = makeContext(
      {
        NINE_ROUTER_API_KEY: 'test-only',
        NINE_ROUTER_BASE_URL: 'http://localhost:20128/v1',
        NINE_ROUTER_MODEL: 'test-router',
        GROQ_API_KEY: 'test-only',
        GOOGLE_API_KEY: 'test-only',
        GROQ_MODEL: 'test-groq',
        GOOGLE_MODEL: 'test-gemini',
      },
      async url => {
        calls.push(new URL(url).hostname);
        return { ok: true, json: async () => ({ id: '9router-success', model: 'routed-model', choices: [{ message: { content: '{"ok":true}' } }] }) };
      },
    );
    const result = await context.run({ prompt: 'Synthetic primary-provider test' });
    assert.equal(result.provider, '9router');
    assert.deepEqual(calls, ['localhost']);
  }

  {
    const calls = [];
    const { context, logs } = makeContext(
      {
        NINE_ROUTER_API_KEY: 'test-only',
        NINE_ROUTER_BASE_URL: 'http://localhost:20128/v1',
        NINE_ROUTER_MODEL: 'test-router',
        GROQ_API_KEY: 'test-only',
        GOOGLE_API_KEY: 'test-only',
        GROQ_MODEL: 'test-groq',
        GOOGLE_MODEL: 'test-gemini',
      },
      async url => {
        const host = new URL(url).hostname;
        calls.push(host);
        if (host === 'localhost') {
          return { ok: false, status: 503, headers: { get: () => null }, json: async () => ({ error: { message: 'Unavailable' } }) };
        }
        return { ok: true, json: async () => ({ id: 'groq-success', choices: [{ message: { content: '{"ok":true}' } }] }) };
      },
    );
    const result = await context.run({ prompt: 'Synthetic fallback test' });
    assert.equal(result.provider, 'groq');
    assert.deepEqual(calls, ['localhost', 'api.groq.com']);
    assert.equal(logs[0].status, 'failed');
    assert.equal(logs[1].fallbackFrom.length, 1);
  }

  {
    const calls = [];
    const { context, logs, geminiModels } = makeContext(
      {
        NINE_ROUTER_API_KEY: 'test-only',
        NINE_ROUTER_BASE_URL: 'http://localhost:20128/v1',
        NINE_ROUTER_MODEL: 'test-router',
        GROQ_API_KEY: 'test-only',
        GOOGLE_API_KEY: 'test-only',
        GROQ_MODEL: 'test-groq',
        GOOGLE_MODEL: 'test-gemini',
      },
      async url => {
        calls.push(new URL(url).hostname);
        return { ok: false, status: 503, headers: { get: () => null }, json: async () => ({ error: { message: 'Unavailable' } }) };
      },
    );
    const result = await context.run({ prompt: 'Synthetic final-fallback test' });
    assert.equal(result.provider, 'gemini');
    assert.deepEqual(calls, ['localhost', 'api.groq.com']);
    assert.deepEqual(geminiModels, ['test-gemini']);
    assert.equal(logs.filter(log => log.status === 'failed').length, 2);
  }

  {
    const calls = [];
    let requestCount = 0;
    const { context, logs } = makeContext(
      { GROQ_API_KEY: 'test-only', GROQ_MODEL: 'test-groq' },
      async url => {
        calls.push(new URL(url).hostname);
        requestCount += 1;
        if (requestCount === 1) return {
          ok: false,
          status: 429,
          headers: { get: name => name === 'retry-after' ? '1' : null },
          json: async () => ({ error: { message: 'Temporary rate limit' } }),
        };
        return { ok: true, json: async () => ({ id: 'groq-retry', choices: [{ message: { content: '{"ok":true}' } }] }) };
      },
    );
    const result = await context.run({ prompt: 'Synthetic bounded-retry test' });
    assert.equal(result.provider, 'groq');
    assert.deepEqual(calls, ['api.groq.com', 'api.groq.com']);
    assert.equal(logs.find(log => log.status === 'failed').retryAfterMs, 1000);
  }

  console.log('4/4 offline provider-priority, fallback-chain and bounded-retry checks passed (no live API calls)');
})().catch(error => { console.error(error); process.exitCode = 1; });
