'use strict';

const { tokenize, splitSentences } = require('./tokenizer');
const { analyzeSentence } = require('./syntax');

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

module.exports = { buildIR };
