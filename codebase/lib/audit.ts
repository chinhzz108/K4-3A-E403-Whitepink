import { mkdir, writeFile, appendFile } from 'fs/promises';
import path from 'path';

const dir = path.resolve(process.cwd(), '..', 'eval', 'traces');
// Serverless functions cannot persist files beside the deployed application.
// The API responses already include the trace for the current request.
function canWriteLocalTraces() {
  return !(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL
  );
}
// Explicit model inputs/outputs and response metadata, never headers/credentials.
function serialize(value: unknown) {
  let text = JSON.stringify(value, null, 2);
  for (const name of ['NVIDIA_API_KEY', 'GROQ_API_KEY', 'GOOGLE_API_KEY', 'SERPER_API_KEY']) {
    const key = process.env[name];
    if (key) text = text.split(key).join('[REDACTED]');
  }
  return text;
}
export async function recordCall(metadata: Record<string, unknown>) {
  if (!canWriteLocalTraces()) return;
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, 'ai-calls.jsonl'), JSON.stringify(JSON.parse(serialize(metadata))) + '\n');
}
export async function persistTrace(trace: { id: string }) {
  if (!canWriteLocalTraces()) return;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, trace.id + '.json'), serialize(trace));
}
