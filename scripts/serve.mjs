// Servidor estático de desenvolvimento, sem dependências.
// Uso: node scripts/serve.mjs [porta]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// raiz = pasta do projeto (um nível acima de scripts/), não importa de onde foi chamado
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const porta = Number(process.argv[2] || process.env.PORT || 5173);
const tipos = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
};

createServer(async (req, res) => {
  try {
    const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let arquivo = normalize(join(raiz, caminho));
    if (!arquivo.startsWith(raiz)) { res.writeHead(403).end(); return; }
    const info = await stat(arquivo).catch(() => null);
    if (info?.isDirectory()) arquivo = join(arquivo, 'index.html');
    const corpo = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': tipos[extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(corpo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado');
  }
}).listen(porta, () => console.log(`Checkpoint em http://localhost:${porta}`));
