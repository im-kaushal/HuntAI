import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCoverLetter, generateInterviewPlan, generateOutreach, getDashboardData, updateApplicationState } from './application.js';
import type { ApplicationState } from './types.js';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const port = Number(process.env.PORT ?? 3000);

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

    if (url.pathname === '/api/dashboard') {
      return json(response, getDashboardData());
    }

    if (url.pathname === '/api/application-state' && request.method === 'POST') {
      const body = await readJson<{ jobId: string; state: ApplicationState }>(request);
      return json(response, updateApplicationState(body.jobId, body.state));
    }

    if (url.pathname === '/api/outreach') {
      return json(response, { message: generateOutreach(requiredJobId(url), url.searchParams.get('recipient') ?? undefined) });
    }

    if (url.pathname === '/api/cover-letter') {
      return json(response, { coverLetter: generateCoverLetter(requiredJobId(url)) });
    }

    if (url.pathname === '/api/interview-plan') {
      return json(response, { plan: generateInterviewPlan(requiredJobId(url)) });
    }

    return serveStatic(url.pathname, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    json(response, { error: message }, message.includes('Unknown') || message.includes('Unsupported') ? 400 : 500);
  }
});

server.listen(port, () => {
  console.log(`HuntAI is running at http://localhost:${port}`);
});

async function readJson<T>(request: typeof import('node:http').IncomingMessage.prototype): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
}

function requiredJobId(url: URL): string {
  const jobId = url.searchParams.get('jobId');
  if (!jobId) {
    throw new Error('Missing jobId');
  }
  return jobId;
}

async function serveStatic(pathname: string, response: typeof import('node:http').ServerResponse.prototype): Promise<void> {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const safePath = normalize(requested).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = join(publicDir, safePath);
  const content = await readFile(filePath);
  response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' });
  response.end(content);
}

function json(response: typeof import('node:http').ServerResponse.prototype, payload: unknown, status = 200): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}
