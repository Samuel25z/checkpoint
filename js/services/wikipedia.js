// wikipedia.js — busca capa e resumo de jogos na Wikipedia (API pública, sem chave).
// Capas de jogos são imagens não livres: só aparecem com pilicense=any.

const EN = 'https://en.wikipedia.org/w/api.php';
const PT = 'https://pt.wikipedia.org/w/api.php';

function url(base, params) {
  const u = new URL(base);
  for (const [k, v] of Object.entries({ format: 'json', origin: '*', ...params })) u.searchParams.set(k, v);
  return u.toString();
}

/** Remove o "(video game)" e afins do título. */
export function limparTitulo(t) {
  return String(t).replace(/\s*\((?:\d{4} )?video game\)\s*$/i, '').trim();
}

/** Converte a resposta da API em resultados ordenados. */
export function converterBusca(json) {
  const paginas = Object.values(json?.query?.pages || {});
  return paginas
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .filter((p) => {
      if (!p.pageid) return false;
      if (/disambiguation|soundtrack|album|community|\((?:character|film|TV series|franchise|series|company|musician)\)/i.test(p.title)) return false;
      if (/^(Music|List|Characters|Development|Gameplay|Universe|Mythology|History) of\b/i.test(p.title)) return false;
      if (/\([^)]*\)$/.test(p.title) && !/video game\)$/i.test(p.title)) return false;
      const inicio = (p.extract || '').slice(0, 260);
      if (/fictional character|is a (?:media )?franchise|is a series of|community|soundtrack/i.test(inicio)) return false;
      return /\bgame\b/i.test(inicio);
    })
    .map((p) => {
      const ano = (p.extract || '').match(/\b(19[89]\d|20[0-4]\d)\b/);
      return {
        titulo: limparTitulo(p.title),
        tituloWiki: p.title,
        capa: p.thumbnail?.source ? p.thumbnail.source.replace(/\?.*$/, '') : null,
        resumo: (p.extract || '').trim(),
        ano: ano ? Number(ano[1]) : null,
        tituloPt: p.langlinks?.[0]?.['*'] || null
      };
    });
}

export function criarWikipedia({ buscar = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }), cache = new Map() } = {}) {
  async function pesquisar(termo, limite = 6) {
    const t = String(termo || '').trim();
    if (t.length < 2) return [];
    const chave = 'b:' + t.toLowerCase();
    if (cache.has(chave)) return cache.get(chave);
    const json = await buscar(url(EN, {
      action: 'query', generator: 'search', gsrsearch: `${t} video game`, gsrlimit: limite, gsrnamespace: 0,
      prop: 'pageimages|extracts|langlinks', piprop: 'thumbnail', pithumbsize: 480, pilicense: 'any',
      exintro: 1, explaintext: 1, exsentences: 2, exlimit: limite, lllang: 'pt', lllimit: 1
    }));
    const r = converterBusca(json);
    cache.set(chave, r);
    return r;
  }

  /** Resumo em português (quando existe artigo na Wikipédia lusófona). */
  async function resumoPt(tituloPt) {
    if (!tituloPt) return null;
    const chave = 'pt:' + tituloPt;
    if (cache.has(chave)) return cache.get(chave);
    const json = await buscar(url(PT, { action: 'query', titles: tituloPt, prop: 'extracts', exintro: 1, explaintext: 1, exsentences: 3 }));
    const p = Object.values(json?.query?.pages || {})[0];
    const texto = p?.extract?.trim() || null;
    cache.set(chave, texto);
    return texto;
  }

  /** Resumo de um artigo conhecido: tenta português, senão inglês. */
  async function resumo(tituloWiki) {
    if (!tituloWiki) return null;
    const chave = 'r:' + tituloWiki;
    if (cache.has(chave)) return cache.get(chave);
    const json = await buscar(url(EN, { action: 'query', titles: tituloWiki, prop: 'extracts|langlinks', exintro: 1, explaintext: 1, exsentences: 2, lllang: 'pt', lllimit: 1, redirects: 1 }));
    const p = Object.values(json?.query?.pages || {})[0];
    const pt = p?.langlinks?.[0]?.['*'];
    const texto = (pt && await resumoPt(pt).catch(() => null)) || p?.extract?.trim() || null;
    cache.set(chave, texto);
    return texto;
  }

  return { pesquisar, resumoPt, resumo };
}

export const wikipedia = criarWikipedia();
