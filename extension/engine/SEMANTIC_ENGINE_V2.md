# Verhöfisch Gesagt — Semantic Grammar Engine v2

This patch keeps the original dictionary-driven character while introducing an offline semantic/grammatical pipeline.

## Pipeline

`input → tokenizer → morphology → syntax → semantic IR → style realization`

The old replacements remain available as style lexicon entries, but they are no longer the only mechanism. Pronouns and possessives are transformed using grammatical case and noun-feature heuristics. URLs, e-mail addresses and numeric values are protected.

## API additions

- `POST /analyze` — returns the semantic intermediate representation.
- `GET /transmute?...&analysis=true` — returns transformed text plus IR.
- `POST /transmute` accepts `analysis: true`.
- `/health` reports `2.0.0-semantic`.

## Offline

No network model, translation service, API key or runtime download is required. The engine uses only Node.js and the existing Express/CORS dependencies.

## Files

- `api/server.js` — API integration
- `core/tokenizer.js` — tokenization, sentence splitting and detokenization
- `core/morphology.js` — German pronoun/preposition morphology and case inference
- `core/syntax.js` — clause, speech-act and modality heuristics
- `core/semantic-ir.js` — semantic intermediate representation
- `core/lexicon.js` — preserved style vocabulary and phrase rules
- `core/realizer.js` — grammatical/style realization
- `core/transmuter.js` — public engine API
- `test/semantic-engine.test.js` — regression tests

## Install / test

No new dependency is required.

```bash
npm install
node test/semantic-engine.test.js
npm start
```

## Design principle

Do not replace the original engine wholesale. Its surprisingly effective phrase-level transformations are retained. The semantic layer decides when a lexical rule applies and supplies grammatical context where a global regex replacement would be unsafe.
