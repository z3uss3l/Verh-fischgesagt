'use strict';

const express = require('express');
const cors = require('cors');
const { transmuteText, analyzeText, styles } = require('../core/transmuter');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/transmute', (req, res) => {
  const { text, style = 'barock', analysis } = req.query;
  if (!text) return res.status(400).json({ success: false, error: 'Missing required parameter: text' });
  const result = transmuteText(String(text), style, { analysis: analysis === 'true' || analysis === '1' });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/transmute', (req, res) => {
  const { text, style = 'barock', analysis = false } = req.body || {};
  if (!text) return res.status(400).json({ success: false, error: 'Missing required field: text' });
  const result = transmuteText(String(text), style, { analysis: Boolean(analysis) });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/analyze', (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ success: false, error: 'Missing required field: text' });
  try { return res.json({ success: true, analysis: analyzeText(String(text)) }); }
  catch (err) { return res.status(400).json({ success: false, error: err.message }); }
});

app.get('/styles', (_req, res) => res.json({ success: true, styles: styles() }));
app.get('/health', (_req, res) => res.json({ success: true, message: 'Verhoefisch API is running', version: '2.0.0-semantic' }));

app.get('/', (_req, res) => res.json({
  name: 'Verhoefisch API',
  description: 'Offline semantic and grammatical German style transformation',
  version: '2.0.0-semantic',
  engine: { architecture: 'tokenization → morphology → syntax → semantic IR → style realization', offline: true },
  endpoints: {
    transmute_get: 'GET /transmute?text=...&style=barock&analysis=true',
    transmute_post: 'POST /transmute { text, style, analysis }',
    analyze_post: 'POST /analyze { text }',
    styles: 'GET /styles',
    health: 'GET /health'
  }
}));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});
app.use((_req, res) => res.status(404).json({ success: false, error: 'Endpoint not found' }));

const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`Verhoefisch API running on port ${PORT}`));

module.exports = app;
