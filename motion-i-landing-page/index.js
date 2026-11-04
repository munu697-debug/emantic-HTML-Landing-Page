import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

// Vercel Serverless Function entrypoint
export default function handler(req, res) {
  let reqPath = decodeURI((req.url || '/').split('?')[0]);
  if (reqPath === '' || reqPath === '/') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
  
  const possiblePaths = [
    path.join(__dirname, safePath),
    path.join(process.cwd(), safePath),
    path.join(__dirname, 'motion-i-landing-page', safePath),
    path.join(process.cwd(), 'motion-i-landing-page', safePath),
  ];

  let targetFile = null;
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        targetFile = p;
        break;
      }
    } catch {
      // continue searching
    }
  }

  if (!targetFile) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>');
    return;
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const content = fs.readFileSync(targetFile);
  res.end(content);
}

// Local development server (when run with `pnpm run dev` or `node index.js`)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  const server = http.createServer(handler);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server running at:`);
    console.log(`  > Local:   http://localhost:${PORT}/`);
    console.log(`  > Network: http://127.0.0.1:${PORT}/`);
  });
}
