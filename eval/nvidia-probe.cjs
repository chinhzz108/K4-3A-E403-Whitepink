// One-shot local handoff: key stays in RAM and is sent only to the official API.
const http = require('node:http');
const fs = require('node:fs');
const endpoint = 'https://integrate.api.nvidia.com/v1';
const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/probe') { res.writeHead(404).end(); return; }
  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 2048) { res.writeHead(413).end(); return; } }
  let key;
  try { key = JSON.parse(body).key; } catch { res.writeHead(400).end(); return; }
  if (typeof key !== 'string' || !key.startsWith('nvapi-')) { res.writeHead(400).end(); return; }
  server.close();
  const report = { timestamp: new Date().toISOString(), endpoint, model: 'deepseek-ai/deepseek-v4-flash-0731' };
  const started = Date.now();
  try {
    const modelsRes = await fetch(endpoint + '/models', {signal:AbortSignal.timeout(20000)});
    const catalog = await modelsRes.json();
    report.modelsHttp = modelsRes.status;
    report.availableDeepseek = (catalog.data || []).filter(m => /deepseek/i.test(m.id)).map(m => m.id);
    const selected = report.availableDeepseek.find(id => id === report.model) || report.availableDeepseek.find(id => /flash/.test(id)) || report.availableDeepseek[0];
    if (selected) report.model = selected;
    const response = await fetch(endpoint + '/chat/completions', {
      method:'POST', headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({model:report.model,messages:[{role:'user',content:'Return only JSON: {"ok":true,"message":"Xin chào ScriptScout"}'}],max_tokens:1024,temperature:0}),
      signal:AbortSignal.timeout(55000),
    });
    const result = await response.json();
    report.http = response.status;
    report.response = result;
  } catch (error) { report.error = 'Network/parse failure: '+error.name; }
  report.durationMs = Date.now()-started;
  const safe = JSON.stringify(report,null,2).split(key).join('[REDACTED]');
  key = undefined; body = '';
  fs.mkdirSync('eval/nvidia-deepseek',{recursive:true});
  fs.writeFileSync('eval/nvidia-deepseek/connection.json',safe);
  res.writeHead(200,{'Content-Type':'application/json'}).end(safe);
  console.log(safe);
});
server.listen(43128,'127.0.0.1',()=>console.log('One-shot probe ready on loopback; no key written to disk.'));
setTimeout(()=>server.close(),120000).unref();
