'use strict';

const { analyzeToken, inferCase } = require('./morphology');

function analyzeSentence(tokens) {
  const analyzed = tokens.map(analyzeToken);
  analyzed.forEach((token, i) => { token.inferredCase = inferCase(analyzed, i); });

  const finiteVerb = analyzed.findIndex(t => t.pos === 'AUX' || /^(sage|sagst|sagt|geht|gehen|hast|habe|hat|machen|machst|macht|kommt|kommst|komme)$/iu.test(t.normalized));
  const subject = analyzed.findIndex(t => t.pos === 'PRON' && ['nom', 'nom/acc'].includes(t.case));

  return {
    tokens: analyzed,
    finiteVerbIndex: finiteVerb,
    subjectIndex: subject,
    clauseType: detectClauseType(analyzed),
    speechAct: detectSpeechAct(analyzed),
    modality: detectModality(analyzed),
    negated: analyzed.some(t => ['nicht','kein','keine','keinen','keinem','keiner'].includes(t.normalized))
  };
}

function detectClauseType(tokens) {
  const values = tokens.map(t => t.normalized);
  if (values.includes('?')) return 'question';
  if (/^(bitte|sag|sagt|geben|gib|nimm|komm|kommen|lass|lassen|hör|hoer|schau|schauen)$/u.test(values[0] || '')) return 'imperative';
  if (values.includes('!')) return 'exclamation';
  return 'statement';
}

function detectSpeechAct(tokens) {
  const text = tokens.map(t => t.normalized).join(' ');
  if (/\b(danke|vielen dank|ich danke)\b/u.test(text)) return 'gratitude';
  if (/\b(hallo|hi|guten tag|moin|grüß|gruss)\b/u.test(text)) return 'greeting';
  if (/\b(tschüss|tschues|ciao|auf wiedersehen|bis bald)\b/u.test(text)) return 'farewell';
  if (tokens.some(t => t.normalized === 'bitte')) return 'request';
  if (tokens.some(t => ['frage','fragen','wie','warum','weshalb','wieso','wann','wo','wer','was'].includes(t.normalized))) return 'question';
  return 'statement';
}

function detectModality(tokens) {
  const values = tokens.map(t => t.normalized);
  if (values.some(v => ['müssen','musst','muss'].includes(v))) return 'obligation';
  if (values.some(v => ['können','kannst','kann','könnt'].includes(v))) return 'ability';
  if (values.some(v => ['wollen','willst','will','wollt'].includes(v))) return 'volition';
  if (values.some(v => ['sollen','sollst','soll'].includes(v))) return 'recommendation';
  if (values.some(v => ['möchte','möchtest','möchten'].includes(v))) return 'polite_desire';
  return null;
}

module.exports = { analyzeSentence };
