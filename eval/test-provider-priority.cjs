const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const source = fs.readFileSync('codebase/lib/ai.ts', 'utf8');
const start = source.indexOf('async function callAI(');
const end = source.indexOf('/**', source.indexOf('function parseJSONSafely', start));
const compiled = ts.transpileModule(source.slice(start, end), {compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
async function check(mode, expected, hosts) {
  const calls = [], logs = [];
  const context = vm.createContext({
    getEnv: n => ({NVIDIA_API_KEY:'test-only',GROQ_API_KEY:'test-only',GOOGLE_API_KEY:'test-only',GROQ_MODEL:'test-groq'}[n] || ''),
    safeError: e => e.message, AbortSignal,
    recordCall: async x => logs.push(x),
    GoogleGenerativeAI: class {getGenerativeModel(){return {generateContent:async()=>({response:{text:()=>'{"ok":true}',usageMetadata:{}}})}}},
    fetch: async url => { calls.push(new URL(url).hostname); const bad = mode === 'all-fallback' || (mode !== 'success' && url.includes('nvidia')); return {ok:!bad,status:503,json:async()=>({id:'offline-test',choices:[{message:{content:'{"ok":true}'}}]})}; },
  });
  vm.runInContext(compiled + ';globalThis.run=callAI;', context);
  const result = await context.run({prompt:'Synthetic offline test'});
  assert.equal(result.provider, expected); assert.deepEqual(calls, hosts);
  if(mode!=='success')assert.equal(logs[0].status,'failed');
}
(async()=>{
  await check('success','deepseek',['integrate.api.nvidia.com']);
  await check('fallback','groq',['integrate.api.nvidia.com','api.groq.com']);
  await check('all-fallback','gemini',['integrate.api.nvidia.com','api.groq.com']);
  console.log('3/3 offline provider-priority tests passed (no live API calls)');
})().catch(e=>{console.error(e);process.exitCode=1});
