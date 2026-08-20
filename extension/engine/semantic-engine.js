window.SemanticEngineV2 = (() => {
// tokenizer.js
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

// morphology.js
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

// syntax.js
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

// lexicon.js
const STYLES = {
  barock: {
    name: 'Höfisches Barock',
    prefix: 'Seid gegrüßt, edler Herr / werte Dame!\n\nEs gereicht Uns zur außerordentlichen Ergötzlichkeit, Euch kundzutun:\n',
    suffix: '\n\nIn tiefster Ergebenheit verbleibend,',
    phrases: [
      [/^hallo$/iu, 'Seyed gegrüßet'],
      [/^hi$/iu, 'Seyed gegrüßet'],
      [/^guten tag$/iu, 'Seyed gegrüßet'],
      [/^wie geht es dir\??$/iu, 'wie stehet es um Euer wohlgeschätztes Befinden?'],
      [/^wie gehts dir\??$/iu, 'wie stehet es um Euer wohlgeschätztes Befinden?'],
      [/^ich habe eine frage\.?$/iu, 'ein dringlich Begehren drängt an Unser Ohr'],
      [/^danke\.?$/iu, 'Wir erweisen Euch Unseren verbindlichsten Dank'],
      [/^ja\.?$/iu, 'Wohlan, so sei es'],
      [/^nein\.?$/iu, 'Behüte uns Gott vor solchem Tuen'],
      [/^tschüss\.?$/iu, 'Gott befehle Euch in seine gnädige Obhut'],
      [/^ciao\.?$/iu, 'Gott befehle Euch in seine gnädige Obhut'],
      [/^auf wiedersehen\.?$/iu, 'Gott befehle Euch in seine gnädige Obhut']
    ],
    words: new Map([
      ['geld', 'Güter und Dukaten'], ['arbeiten', 'dem schaffenden Tagewerk nachgehen'], ['arbeite', 'dem schaffenden Tagewerk nachgehen'],
      ['heute', 'am heutigen Tage'], ['schnell', 'ohne Verzug und mit größter Eile'], ['problem', 'Mißhelligkeit']
    ])
  },
  kanzlei: {
    name: 'Kaiserlicher Kanzleistil',
    prefix: 'Kund und zu wissen sei hiermit jedermann:\n\nIn Sachen der nachfolgenden Angelegenheit wird ordnungsgemäß vermerkt:\n',
    suffix: '\n\nSignatum und siegelbewährt unter kaiserlicher Verordnung.',
    phrases: [
      [/^hallo$/iu, 'Zu wissen sei'], [/^guten tag$/iu, 'Zu wissen sei'],
      [/^ich habe eine frage\.?$/iu, 'hiermit wird eine Anfrage vorgetragen'],
      [/^danke\.?$/iu, 'in getreuer Anerkenntnis'],
      [/^nein\.?$/iu, 'dies wird hiermit verneint']
    ],
    words: new Map([
      ['frage', 'Anfrage'], ['geld', 'Münzbestand'], ['schnell', 'unverzüglich'], ['problem', 'unvorhergesehene Hemmnis']
    ])
  },
  poetisch: {
    name: 'Romantisch-Poetisch',
    prefix: 'Wie ein Hauch von Gold verströmt diese Kunde:\n\n',
    suffix: '\n\nSo verweht der Ruf durch den Garten der Zeit.',
    phrases: [
      [/^hallo$/iu, 'Sei uns willkommen wie der Lenz'],
      [/^danke\.?$/iu, 'Mein Herz neigt sich in Dankbarkeit']
    ],
    words: new Map([
      ['nacht', 'samtene Schattenstunde'], ['sonne', 'das goldene Tagesgestirn']
    ])
  }
};

// semantic-ir.js
function buildIR(input) {
  const tokens = tokenize(input);
  const sentenceTokens = splitSentences(tokens);
  return {
    type: 'document',
    source: input,
    sentences: sentenceTokens.map((sentence, index) => {
      const analysis = analyzeSentence(sentence);
      return {
        id: index,
        text: sentence.map(t => t.value).join(' '),
        ...analysis,
        semantics: extractSemantics(analysis)
      };
    })
  };
}

function extractSemantics(sentence) {
  const values = sentence.tokens.map(t => t.normalized);
  const hasAddressee = sentence.tokens.some(t => t.informal && t.person === 2);
  const hasPossessive = sentence.tokens.some(t => t.pos === 'DET' && t.possessive && t.person === 2);
  return {
    addressee: hasAddressee ? 'second_person_singular_informal' : null,
    possessiveAddress: hasPossessive,
    greeting: sentence.speechAct === 'greeting',
    gratitude: sentence.speechAct === 'gratitude',
    farewell: sentence.speechAct === 'farewell',
    request: sentence.speechAct === 'request',
    question: sentence.speechAct === 'question',
    keyTerms: values.filter(v => v.length > 3 && !['eine','einer','einem','einen','dass','aber','oder','auch','nicht'].includes(v)).slice(0, 20)
  };
}

// realizer.js
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

// transmuter.js
function transmuteText(input, style = 'barock', options = {}) {
  if (!STYLES[style]) {
    return { success: false, error: `Invalid style. Available styles: ${Object.keys(STYLES).join(', ')}` };
  }
  if (typeof input !== 'string' || !input.trim()) {
    return { success: false, error: 'Input text cannot be empty' };
  }

  const ir = buildIR(input);
  const transmuted = realize(ir, style);
  const result = { success: true, original: input, transmuted, style };
  if (options.analysis) result.analysis = ir;
  return result;
}

function analyzeText(input) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('Input text cannot be empty');
  return buildIR(input);
}

function styles() {
  return Object.entries(STYLES).map(([id, config]) => ({ id, name: config.name, prefix: config.prefix.slice(0, 100) + '...' }));
}
  return { transmuteText, analyzeText, styles };
})();

