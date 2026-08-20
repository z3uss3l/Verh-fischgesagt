'use strict';

const PRONOUNS = {
  ich: { pos: 'PRON', person: 1, number: 'singular', case: 'nom' },
  mich: { pos: 'PRON', person: 1, number: 'singular', case: 'acc' },
  mir: { pos: 'PRON', person: 1, number: 'singular', case: 'dat' },
  mein: { pos: 'DET', person: 1, number: 'singular', case: 'nom', possessive: true },
  meine: { pos: 'DET', person: 1, number: 'singular', case: 'nom', possessive: true },
  meinen: { pos: 'DET', person: 1, number: 'singular', case: 'acc/dat', possessive: true },
  meinem: { pos: 'DET', person: 1, number: 'singular', case: 'dat', possessive: true },
  meiner: { pos: 'DET', person: 1, number: 'singular', case: 'gen/dat', possessive: true },
  meines: { pos: 'DET', person: 1, number: 'singular', case: 'gen', possessive: true },
  mich: { pos: 'PRON', person: 1, number: 'singular', case: 'acc' },
  du: { pos: 'PRON', person: 2, number: 'singular', case: 'nom', informal: true },
  dich: { pos: 'PRON', person: 2, number: 'singular', case: 'acc', informal: true },
  dir: { pos: 'PRON', person: 2, number: 'singular', case: 'dat', informal: true },
  dein: { pos: 'DET', person: 2, number: 'singular', case: 'nom/acc', possessive: true, informal: true },
  deine: { pos: 'DET', person: 2, number: 'singular', case: 'nom/acc', possessive: true, informal: true },
  deinen: { pos: 'DET', person: 2, number: 'singular', case: 'acc/dat', possessive: true, informal: true },
  deinem: { pos: 'DET', person: 2, number: 'singular', case: 'dat', possessive: true, informal: true },
  deiner: { pos: 'DET', person: 2, number: 'singular', case: 'gen/dat', possessive: true, informal: true },
  deines: { pos: 'DET', person: 2, number: 'singular', case: 'gen', possessive: true, informal: true },
  ihr: { pos: 'PRON', person: 3, number: 'plural', case: 'nom' },
  ihm: { pos: 'PRON', person: 3, number: 'singular', case: 'dat' },
  ihnen: { pos: 'PRON', person: 3, number: 'plural', case: 'dat' },
  sie: { pos: 'PRON', person: 3, number: 'singular/plural', case: 'nom/acc' },
  er: { pos: 'PRON', person: 3, number: 'singular', gender: 'masc', case: 'nom' },
  den: { pos: 'DET', case: 'acc/nom-plural' },
  dem: { pos: 'DET', case: 'dat' },
  des: { pos: 'DET', case: 'gen' },
  der: { pos: 'DET', case: 'nom-fem/gen' }
};

const PREP_CASE = {
  mit: 'dat', nach: 'dat', bei: 'dat', seit: 'dat', von: 'dat', zu: 'dat', aus: 'dat', gegenüber: 'dat',
  durch: 'acc', für: 'acc', gegen: 'acc', ohne: 'acc', um: 'acc', wider: 'acc',
  trotz: 'gen', während: 'gen', wegen: 'gen', aufgrund: 'gen', statt: 'gen', innerhalb: 'gen', außerhalb: 'gen',
  an: 'dat/acc', auf: 'dat/acc', hinter: 'dat/acc', in: 'dat/acc', neben: 'dat/acc', über: 'dat/acc', unter: 'dat/acc', vor: 'dat/acc', zwischen: 'dat/acc'
};

const COMMON_DATIVE_VERBS = new Set(['helfen', 'danken', 'gefallen', 'folgen', 'gehören', 'vertrauen', 'antworten', 'begegnen', 'fehlen', 'geben', 'schenken', 'sagen', 'schreiben', 'bringen', 'zeigen', 'erklären', 'wünschen', 'erweisen']);

function guessPos(token) {
  const w = token.normalized;
  if (token.type === 'punctuation') return 'PUNCT';
  if (PRONOUNS[w]) return PRONOUNS[w].pos;
  if (PREP_CASE[w]) return 'ADP';
  if (/^(und|oder|aber|denn|sondern|doch|jedoch|weil|dass|wenn|obwohl|damit|ob|als|während|bevor|nachdem|falls)$/u.test(w)) return 'CONJ';
  if (/^(ich|du|er|sie|es|wir|ihr|man|mir|mich|dir|dich|ihm|ihnen|uns|euch)$/u.test(w)) return 'PRON';
  if (/^(nicht|kein|keine|keinen|keinem|keiner|sehr|heute|gestern|morgen|leider|gern|gerne|schon|noch|immer|nie|niemals|bald|schnell|langsam)$/u.test(w)) return 'ADV';
  if (/^(habe|hast|hat|haben|habt|bin|bist|ist|sind|seid|war|waren|wäre|wären|werde|wirst|wird|werden|kann|kannst|können|könnt|muss|musst|müssen|soll|sollst|sollen|will|willst|wollen|wollt|möchte|möchtest|möchten)$/u.test(w)) return 'AUX';
  if (/^[A-ZÄÖÜ][\p{L}\p{M}-]*$/u.test(token.value)) return 'NOUN';
  if (/(en|ern|eln|st|t|te|test|ten|tet)$/u.test(w)) return 'X';
  return 'X';
}

function analyzeToken(token) {
  const morph = PRONOUNS[token.normalized] || {};
  return { ...token, pos: morph.pos || guessPos(token), ...morph };
}

function inferCase(tokens, index) {
  const token = tokens[index];
  if (!token) return null;
  if (token.case && !token.case.includes('/')) return token.case;
  const prev = tokens[index - 1]?.normalized;
  if (prev && PREP_CASE[prev]) {
    if (PREP_CASE[prev] !== 'dat/acc') return PREP_CASE[prev];
    const next = tokens[index + 1]?.normalized;
    // Heuristic for Wechselpräpositionen: motion/location verbs.
    const beforeWindow = tokens.slice(Math.max(0, index - 4), index).map(t => t.normalized);
    if (beforeWindow.some(w => ['gehen','stellen','legen','setzen','fahren','laufen','bewegen','bringen'].includes(w))) return 'acc';
    if (next && ['dem','der','den','einem','einer','einem'].includes(next)) return 'dat';
  }
  const window = tokens.slice(Math.max(0, index - 5), index).map(t => t.normalized);
  if (window.some(w => COMMON_DATIVE_VERBS.has(w))) return 'dat';
  if (token.normalized === 'dich') return 'acc';
  if (token.normalized === 'dir') return 'dat';
  return token.case?.split('/')[0] || null;
}

module.exports = { PRONOUNS, PREP_CASE, analyzeToken, inferCase };
