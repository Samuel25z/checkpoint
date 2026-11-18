// Checagens estáticas do Checkpoint (sem dependências).
// - sintaxe de todo .js (node --check)
// - proíbe botão morto e restos de rascunho no código do site
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const raiz = process.cwd();
const soSintaxe = process.argv.includes('--syntax');
const pastas = ['js', 'css', 'index.html'];
const arquivos = [];
function andar(p) {
  const st = statSync(p);
  if (st.isDirectory()) readdirSync(p).forEach((f) => andar(join(p, f)));
  else arquivos.push(p);
}
pastas.forEach((p) => { try { andar(join(raiz, p)); } catch { /* pasta ainda não existe */ } });

const erros = [];
for (const f of arquivos.filter((a) => a.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { erros.push(`${relative(raiz, f)}: erro de sintaxe\n${e.stderr}`); }
}

if (!soSintaxe) {
  const proibidos = [
    [/href=["']#["']/, 'link sem destino (href="#")'],
    [/\balert\s*\(|\bconfirm\s*\(|\bprompt\s*\(/, 'alert/confirm/prompt nativo'],
    [/\bTODO\b|\bFIXME\b|\bXXX\b/, 'resto de rascunho (TODO/FIXME)'],
    [/lorem ipsum/i, 'texto de exemplo (lorem ipsum)'],
    [/em breve/i, 'texto "em breve" (botão morto)'],
    [/\bdebugger\b/, 'debugger esquecido']
  ];
  for (const f of arquivos.filter((a) => /\.(js|html|css)$/.test(a))) {
    const linhas = readFileSync(f, 'utf8').split('\n');
    linhas.forEach((l, i) => {
      for (const [re, msg] of proibidos) if (re.test(l)) erros.push(`${relative(raiz, f)}:${i + 1}: ${msg}`);
    });
  }
}

if (erros.length) { console.error(erros.join('\n')); console.error(`\nlint: ${erros.length} problema(s)`); process.exit(1); }
console.log(`lint: ok (${arquivos.length} arquivos)`);
