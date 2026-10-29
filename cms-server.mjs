import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { buildSite } from './build-site.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4321;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/api/cms') {
      const json = fs.readFileSync(path.join(__dirname, 'cms-data.json'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(json);
    }

    if (req.method === 'POST' && (url.pathname === '/api/cms' || url.pathname === '/api/publish')) {
      const raw = await readBody(req);
      const parsed = JSON.parse(raw);
      fs.writeFileSync(path.join(__dirname, 'cms-data.json'), JSON.stringify(parsed, null, 2), 'utf8');
      buildSite();

      if (url.pathname === '/api/publish') {
        try {
          execSync('git add index.html dist/index.html public/index.html cms-data.json cms.html', { cwd: __dirname, stdio: 'pipe' });
          try {
            execSync('git commit -m "content: update via Toskaa Local CMS"', { cwd: __dirname, stdio: 'pipe' });
          } catch (e) {
            // No diff to commit
          }
          execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ ok: true, message: 'Berhasil disimpan & di-push ke GitHub! Cloudflare sedang men-deploy update Anda.' }));
        } catch (gitErr) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ ok: true, message: 'Disimpan ke lokal, namun gagal git push: ' + gitErr.message }));
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: true, message: 'Perubahan berhasil disimpan ke index.html!' }));
    }

    if (url.pathname === '/' || url.pathname === '/cms' || url.pathname === '/cms.html') {
      const html = fs.readFileSync(path.join(__dirname, 'cms.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    if (url.pathname === '/index.html' || url.pathname === '/preview') {
      const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  TOSKAA STUDIO - LOCAL CMS ADMIN`);
  console.log(`  Buka di Browser: http://localhost:${PORT}`);
  console.log(`  Preview Website: http://localhost:${PORT}/index.html`);
  console.log(`====================================================`);
});
