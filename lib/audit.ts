import { mkdir, writeFile, appendFile } from 'fs/promises';
import path from 'path';

const dir = path.join(process.cwd(), 'eval', 'traces');
// Explicit model inputs/outputs and response metadata, never headers/credentials.
function serialize(value: unknown) {
  let text = JSON.stringify(value, null, 2);
  for (const name of ['GROQ_API_KEY', 'GOOGLE_API_KEY', 'SERPER_API_KEY']) {
    const key = process.env[name];
    if (key) text = text.split(key).join('[REDACTED]');
  }
  return text;
}
export async function recordCall(metadata: Record<string, unknown>) {
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, 'ai-calls.jsonl'), JSON.stringify(JSON.parse(serialize(metadata))) + '\n');
}
export async function persistTrace(trace: { id: string }) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, trace.id + '.json'), serialize(trace));
}
