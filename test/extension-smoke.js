'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const manifest = JSON.parse(fs.readFileSync('extension/manifest.json', 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.background.service_worker, 'background.js');
assert.ok(manifest.content_scripts[0].js.includes('engine/semantic-engine.js'));
assert.ok(manifest.content_scripts[0].js.includes('content.js'));
assert.ok(!JSON.stringify(manifest).includes('http://'));

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('extension/engine/semantic-engine.js', 'utf8'), context);
const engine = context.window.SemanticEngineV2;
assert.ok(engine);
const result = engine.transmuteText('Deine Idee gefällt mir.', 'barock', { analysis: true });
assert.equal(result.success, true);
assert.match(result.transmuted, /Eure Idee/u);
assert.equal(result.analysis.sentences.length, 1);

console.log('extension smoke tests: OK');
