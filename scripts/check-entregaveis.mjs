// Confere os entregáveis: relatório .docx com Apêndice A (≥10 prompts) e slides .pptx.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const pasta = 'relatorio';
const arquivos = existsSync(pasta) ? readdirSync(pasta) : [];
const docx = arquivos.find((f) => f.endsWith('.docx'));
const pptx = arquivos.find((f) => f.endsWith('.pptx'));
const erros = [];
if (!docx) erros.push('relatório .docx não encontrado em relatorio/');
if (!pptx) erros.push('slides .pptx não encontrados em relatorio/');

const prompts = (readFileSync(`${pasta}/prompts.md`, 'utf8').match(/^## P\d+/gm) || []).length;
if (prompts < 10) erros.push(`registro de prompts tem ${prompts} (mínimo 10)`);

if (docx) {
  // lê o texto do .docx (zip) com o PowerShell/Python disponível, sem dependências
  const py = `import zipfile,re,sys;z=zipfile.ZipFile(sys.argv[1]);t=re.sub(r'<[^>]+>',' ',z.read('word/document.xml').decode('utf8'));print(t)`;
  const texto = execFileSync('python', ['-c', py, `${pasta}/${docx}`], { encoding: 'utf8', maxBuffer: 1 << 26 });
  for (const parte of ['APÊNDICE A', 'Introdução', 'Objetivos', 'Tecnologias', 'Funcionalidades', 'Conclusão', 'Referências']) if (!texto.includes(parte)) erros.push(`relatório sem "${parte}"`);
  const promptsNoDoc = (texto.match(/P\d{2} /g) || []).length;
  if (promptsNoDoc < 10) erros.push(`Apêndice A do relatório lista ${promptsNoDoc} prompts (mínimo 10)`);
}
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }
console.log(`entregáveis ok · ${docx} · ${pptx} · ${prompts} prompts registrados`);
