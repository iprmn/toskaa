import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { buildSite } from './build-site.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4321;

const GIT_DIR = 'C:\\Users\\indra.permana\\AppData\\Local\\Programs\\Git\\cmd';
if (!process.env.PATH.includes(GIT_DIR)) {
  process.env.PATH = `${GIT_DIR};${process.env.PATH}`;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function syncExternalCopies() {
  const indexHtml = path.join(__dirname, 'index.html');
  const cmsHtml = path.join(__dirname, 'cms.html');
  const targets = [
    { src: indexHtml, dest: 'c:\\Users\\indra.permana\\Downloads\\Toskaa Studio — Unlimited Design Subscription.html' },
    { src: indexHtml, dest: 'C:\\Users\\indra.permana\\.gemini\\antigravity\\brain\\9b7180a3-6c6f-4259-b6ee-75435211f878\\toskaa-studio-light.html' },
    { src: cmsHtml, dest: 'C:\\Users\\indra.permana\\.gemini\\antigravity\\brain\\9b7180a3-6c6f-4259-b6ee-75435211f878\\toskaa-cms.html' }
  ];
  for (const t of targets) {
    try {
      if (fs.existsSync(path.dirname(t.dest))) {
        fs.copyFileSync(t.src, t.dest);
      }
    } catch (e) {}
  }
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

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
      syncExternalCopies();

      try {
        execSync('git add index.html dist/index.html public/index.html cms-data.json cms.html', { cwd: __dirname, stdio: 'pipe' });
        let committed = false;
        try {
          execSync('git commit -m "content: update via Toskaa Local CMS"', { cwd: __dirname, stdio: 'pipe' });
          committed = true;
        } catch (e) {
          // No diff to commit, still push in case ahead of origin
        }
        execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
        const hash = execSync('git rev-parse --short HEAD', { cwd: __dirname, stdio: 'pipe' }).toString().trim();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(
          JSON.stringify({
            ok: true,
            pushed: true,
            commit: hash,
            message: committed
              ? `✅ Berhasil disimpan & di-push ke GitHub (commit ${hash})! Cloudflare sedang men-deploy ke toskaa.com.`
              : `✅ Sudah sinkron dengan GitHub (commit ${hash})!`
          })
        );
      } catch (gitErr) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(
          JSON.stringify({
            ok: false,
            pushed: false,
            message: '❌ Disimpan ke lokal, namun gagal git push: ' + (gitErr.stderr ? gitErr.stderr.toString() : gitErr.message)
          })
        );
      }
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

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Server CMS lokal sudah berjalan di http://localhost:${PORT}`);
    process.exit(0);
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  TOSKAA STUDIO - LOCAL CMS ADMIN`);
  console.log(`  Buka di Browser: http://localhost:${PORT}`);
  console.log(`  Preview Website: http://localhost:${PORT}/index.html`);
  console.log(`====================================================`);
});
