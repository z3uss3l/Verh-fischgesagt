'use strict';

const { buildIR } = require('./semantic-ir');
const { realize } = require('./realizer');
const { STYLES } = require('./lexicon');

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

module.exports = { transmuteText, analyzeText, styles };
