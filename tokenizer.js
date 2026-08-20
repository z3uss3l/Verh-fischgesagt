'use strict';

/**
 * Lightweight German tokenizer. It deliberately keeps punctuation as tokens
 * and protects URLs, e-mail addresses, numbers and quoted spans from style
 * transformations.
 */

const PROTECTED_RE = /(?:https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\d+(?:[.,]\d+)?(?:\s?[%€$])?)/giu;

function tokenize(text) {
  const protectedValues = [];
  const protectedText = text.replace(PROTECTED_RE, match => {
    const id = `¤P${protectedValues.length}¤`;
    protectedValues.push(match);
    return id;
  });

  const raw = protectedText.match(/¤P\d+¤|[\p{L}\p{M}\p{N}_]+(?:[-'][\p{L}\p{M}\p{N}_]+)*|…|[.!?,;:!?()\[\]{}"„“‚‘»«—–-]/gu) || [];
  return raw.map(value => ({
    value,
    normalized: value.toLocaleLowerCase('de-DE'),
    type: /^[.!?,;:!?()\[\]{}"„“‚‘»«—–-]$/.test(value) ? 'punctuation' : 'word',
    protected: /^¤P\d+¤$/.test(value)
  })).map(token => {
    if (token.protected) {
      const index = Number(token.value.slice(2, -1));
      token.value = protectedValues[index];
      token.normalized = token.value.toLocaleLowerCase('de-DE');
    }
    return token;
  });
}

function splitSentences(tokens) {
  const sentences = [];
  let current = [];
  for (const token of tokens) {
    current.push(token);
    if (token.type === 'punctuation' && /[.!?]/.test(token.value)) {
      sentences.push(current);
      current = [];
    }
  }
  if (current.length) sentences.push(current);
  return sentences;
}

function detokenize(tokens) {
  let out = '';
  for (const token of tokens) {
    const v = token.value;
    if (!out) { out = v; continue; }
    if (/^[,.;:!?\)\]\}]/u.test(v)) out += v;
    else if (/^[\]\}]/u.test(v)) out += v;
    else if (/^["„“‚‘»«]/u.test(v)) out += v;
    else if (/^[—–-]/u.test(v)) out += ` ${v}`;
    else if (out.endsWith('„') || out.endsWith('“') || out.endsWith('‚') || out.endsWith('‘') || out.endsWith('»') || out.endsWith('(') || out.endsWith('[') || out.endsWith('{')) out += v;
    else out += ` ${v}`;
  }
  return out.replace(/\s+([,.;:!?])/g, '$1').replace(/([([{])\s+/g, '$1').trim();
}

module.exports = { tokenize, splitSentences, detokenize };
