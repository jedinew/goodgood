import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = process.env.PUBLIC_DIR || '/app/public';
const DATA_DIR = process.env.DATA_DIR || '/data';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;
  
  // Normalize path to prevent traversal
  pathname = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');

  let filePath;
  let isData = false;

  if (pathname.startsWith('/data/')) {
    isData = true;
    const relPath = pathname.substring(6); // remove '/data/'
    filePath = path.join(DATA_DIR, relPath);
  } else {
    if (pathname === '/') pathname = '/index.html';
    filePath = path.join(PUBLIC_DIR, pathname);
  }

  // Prevent traversal out of intended dirs
  if (isData && !filePath.startsWith(DATA_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  // For public dir, we might want to check too, but since we mount only safe stuff... 
  // actually path.join handles relative paths safely if base is absolute, 
  // but if base is relative we need resolve.
  // Docker paths are absolute (/app/public, /data).

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('Not Found');
      } else {
        res.statusCode = 500;
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        // No cache for data, 1 hour for static assets?
        // Instructions say "sets no-cache headers for /data"
        'Cache-Control': isData ? 'no-store, no-cache, must-revalidate, proxy-revalidate' : 'public, max-age=3600'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving public from ${PUBLIC_DIR}`);
  console.log(`Serving data from ${DATA_DIR}`);
});
