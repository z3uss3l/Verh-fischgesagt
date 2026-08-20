'use strict';

const assert = require('node:assert/strict');
const { transmuteText, analyzeText } = require('../core/transmuter');

const cases = [
  ['Hallo, wie geht es dir?', 'barock'],
  ['Danke dir.', 'barock'],
  ['Ich habe eine Frage.', 'kanzlei'],
  ['Deine Idee gefällt mir.', 'barock'],
  ['Ich gehe mit dir zum Markt.', 'barock'],
  ['Heute habe ich keine Zeit.', 'barock']
];

for (const [input, style] of cases) {
  const result = transmuteText(input, style);
  assert.equal(result.success, true, input);
  assert.ok(result.transmuted.length > input.length, input);
}

const analysis = analyzeText('Ich gehe mit dir zum Markt.');
assert.equal(analysis.sentences.length, 1);
assert.equal(analysis.sentences[0].semantics.addressee, 'second_person_singular_informal');
const dir = analysis.sentences[0].tokens.find(t => t.normalized === 'dir');
assert.equal(dir.inferredCase, 'dat');

const possessive = transmuteText('Ich sehe deine Idee.', 'barock');
assert.match(possessive.transmuted, /Eure Idee/u);

console.log('semantic-engine tests: OK');
