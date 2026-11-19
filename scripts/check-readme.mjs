// Confere que o README tem o link ativo do site e as instruções pedidas.
import { readFileSync } from 'node:fs';

const readme = readFileSync('README.md', 'utf8');
const faltas = [];
const link = readme.match(/https:\/\/samuel25z\.github\.io\/checkpoint\/?/);
if (!link) faltas.push('link do GitHub Pages');
for (const secao of ['## Como rodar', '## Como publicar', '## Como criar uma aba nova']) if (!readme.includes(secao)) faltas.push(secao);
if (faltas.length) { console.error('README sem: ' + faltas.join(', ')); process.exit(1); }
const r = await fetch(link[0], { method: 'GET', cache: 'no-store' });
if (!r.ok) { console.error(`o link do README responde ${r.status}`); process.exit(1); }
console.log(`README ok · link ativo (${r.status}) · seções presentes`);
