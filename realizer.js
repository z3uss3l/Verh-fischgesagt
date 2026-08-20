'use strict';

const { detokenize } = require('./tokenizer');
const { STYLES } = require('./lexicon');

const ADDRESS = {
  barock: {
    nom: 'Ihr', acc: 'Euch', dat: 'Euch', gen: 'Euer',
    possessive: { mascNom: 'Euer', neutNom: 'Euer', femNom: 'Eure', pluralNom: 'Eure', mascAcc: 'Euren', neutAcc: 'Euer', femAcc: 'Eure', pluralAcc: 'Eure', mascDat: 'Eurem', neutDat: 'Eurem', femDat: 'Eurer', pluralDat: 'Euren', gen: 'Eures' }
  },
  kanzlei: {
    nom: 'Sie', acc: 'Sie', dat: 'Ihnen', gen: 'Ihrer',
    possessive: { mascNom: 'Ihr', neutNom: 'Ihr', femNom: 'Ihre', pluralNom: 'Ihre', mascAcc: 'Ihren', neutAcc: 'Ihr', femAcc: 'Ihre', pluralAcc: 'Ihre', mascDat: 'Ihrem', neutDat: 'Ihrem', femDat: 'Ihrer', pluralDat: 'Ihren', gen: 'Ihres' }
  },
  poetisch: {
    nom: 'Ihr', acc: 'Euch', dat: 'Euch', gen: 'Euer',
    possessive: { mascNom: 'Euer', neutNom: 'Euer', femNom: 'Eure', pluralNom: 'Eure', mascAcc: 'Euren', neutAcc: 'Euer', femAcc: 'Eure', pluralAcc: 'Eure', mascDat: 'Eurem', neutDat: 'Eurem', femDat: 'Eurer', pluralDat: 'Euren', gen: 'Eures' }
  }
};

const ARTICLE_HINTS = {
  der: 'masc', den: 'masc', dem: 'masc', des: 'masc',
  die: 'fem', einer: 'fem', eine: 'fem', einer: 'fem',
  das: 'neut', einem: 'neut', eines: 'neut',
  denPlural: 'plural'
};

function transformSentence(sentence, style) {
  const values = sentence.tokens.map(t => t.value);
  const raw = detokenize(sentence.tokens);

  for (const [pattern, replacement] of STYLES[style].phrases) {
    if (pattern.test(raw)) return replacement;
  }

  const out = sentence.tokens.map((token, index) => {
    const lower = token.normalized;
    if (token.protected || token.type === 'punctuation') return { ...token };

    // Second-person address: inflect by the syntactically inferred case.
    if (lower === 'du' || lower === 'dich' || lower === 'dir') {
      const c = lower === 'du' ? 'nom' : lower === 'dich' ? 'acc' : 'dat';
      return { ...token, value: ADDRESS[style][c] };
    }

    if (token.possessive && token.person === 2) {
      return { ...token, value: inflectPossessive(token, sentence.tokens, index, style) };
    }

    const replacement = STYLES[style].words.get(lower);
    if (replacement) return { ...token, value: replacement };
    return { ...token };
  });

  // Preserve the existing project's broad formalization behaviour for a few
  // constructions not covered by morphology, but only as a final fallback.
  return detokenize(out)
    .replace(/\bEueres\b/gu, 'Eures')
    .replace(/\s+([,.!?;:])/gu, '$1');
}

const COMMON_FEMININE = new Set(['idee','frage','zeit','sonne','nacht','arbeit','liebe','sache','kundgabe','angelegenheit','erkenntnis','bitte','hilfe','freude','zeit']);
const COMMON_NEUTER = new Set(['kind','haus','buch','geld','begehren','befinden','tagewerk','problem']);

function inferNounFeatures(tokens, index) {
  const next = tokens[index + 1];
  const prev = tokens[index - 1];
  const article = prev?.normalized;
  let gender = ARTICLE_HINTS[article] || null;
  let number = 'singular';

  // Possessive determiners are themselves immediately followed by the noun,
  // so the noun supplies the gender when no article is present.
  if (!gender && next) {
    if (COMMON_FEMININE.has(next.normalized)) gender = 'fem';
    else if (COMMON_NEUTER.has(next.normalized)) gender = 'neut';
    else if (/(?:ung|heit|keit|schaft|tion|tät|ik|ion|e)$/iu.test(next.normalized)) gender = 'fem';
    else if (/(?:chen|lein|ment|um)$/iu.test(next.normalized)) gender = 'neut';
  }

  if (article === 'die' || article === 'den') number = 'plural';
  if (!gender) gender = 'masc';
  return { gender: gender === 'plural' ? 'masc' : gender, number };
}

function inflectPossessive(token, tokens, index, style) {
  const features = inferNounFeatures(tokens, index);
  const lower = token.normalized;
  const c = token.inferredCase || (lower.includes('em') ? 'dat' : lower.includes('er') ? 'dat' : lower.includes('es') ? 'gen' : lower.includes('en') ? 'acc' : 'nom');
  const p = ADDRESS[style].possessive;
  const key = `${features.gender}${c.charAt(0).toUpperCase()}${c.slice(1)}`;
  if (features.number === 'plural') {
    if (c === 'dat') return p.pluralDat;
    if (c === 'acc') return p.pluralAcc;
    return p.pluralNom;
  }
  if (key === 'mascNom') return p.mascNom;
  if (key === 'neutNom') return p.neutNom;
  if (key === 'femNom') return p.femNom;
  if (key === 'mascAcc') return p.mascAcc;
  if (key === 'neutAcc') return p.neutAcc;
  if (key === 'femAcc') return p.femAcc;
  if (key === 'mascDat') return p.mascDat;
  if (key === 'neutDat') return p.neutDat;
  if (key === 'femDat') return p.femDat;
  return p.gen;
}

function realize(ir, style) {
  if (!STYLES[style]) throw new Error(`Invalid style: ${style}`);
  const body = ir.sentences.map(sentence => transformSentence(sentence, style)).join(' ').trim();
  return STYLES[style].prefix + body + STYLES[style].suffix;
}

module.exports = { realize, transformSentence };
