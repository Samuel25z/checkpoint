// Confere o site NO AR: a versão publicada é a mesma do index.html local e as abas carregam.
import { readFileSync } from 'node:fs';

const URL_SITE = process.env.SITE_URL || 'https://samuel25z.github.io/checkpoint/';
const versaoLocal = readFileSync('index.html', 'utf8').match(/name="checkpoint-versao" content="([^"]+)"/)?.[1];
const pagina = await fetch(URL_SITE + '?v=' + Date.now(), { cache: 'no-store' });
if (!pagina.ok) { console.error(`site respondeu ${pagina.status}`); process.exit(1); }
const html = await pagina.text();
const versaoNoAr = html.match(/name="checkpoint-versao" content="([^"]+)"/)?.[1];
if (versaoNoAr !== versaoLocal) { console.error(`versão no ar (${versaoNoAr}) ≠ local (${versaoLocal}) — o deploy ainda não terminou?`); process.exit(1); }
const { MODULOS } = await import('../js/modules/registry.js');
for (const m of MODULOS) {
  const r = await fetch(`${URL_SITE}js/modules/${m.id}/index.js`, { cache: 'no-store' });
  if (!r.ok) { console.error(`aba ${m.id}: ${r.status}`); process.exit(1); }
}
console.log(`no ar: ${URL_SITE} · versão ${versaoNoAr} · ${MODULOS.length} abas respondendo`);
