'use strict';

// Local interoperability layer for VFT, TMX, TBX and XLIFF.
// Uses only browser-native JSON/XML APIs; no network access.
window.VFGFormats = (() => {
  function normalize(s) { return String(s ?? '').replace(/\s+/gu, ' ').trim(); }
  function emptyMemory() { return { segments: {}, terms: {} }; }

  function addSegment(memory, source, target, sourceLang = 'de-DE', targetLang = 'de-HOF-BAROCK') {
    source = normalize(source); target = normalize(target);
    if (!source || !target) return;
    const key = `${sourceLang}|${targetLang}|${source.toLocaleLowerCase('de-DE')}`;
    memory.segments[key] = { source, target, sourceLang, targetLang };
  }

  function addTerm(memory, source, target) {
    source = normalize(source); target = normalize(target);
    if (!source || !target) return;
    memory.terms[source.toLocaleLowerCase('de-DE')] = { source, target };
  }

  function lookupTranslationMemory(memory, source, style = 'barock') {
    if (!memory?.segments) return null;
    const normalized = normalize(source).toLocaleLowerCase('de-DE');
    const candidates = [
      `de-DE|de-HOF-${String(style).toUpperCase()}|${normalized}`,
      `de|de-HOF-${String(style).toUpperCase()}|${normalized}`,
      `de-DE|de-HOF-BAROCK|${normalized}`,
      `de|de-HOF|${normalized}`
    ];
    for (const key of candidates) {
      const hit = memory.segments[key];
      if (hit) return typeof hit === 'string' ? hit : hit.target;
    }
    return null;
  }

  function applyTerminology(memory, text) {
    if (!memory?.terms) return text;
    let result = text;
    const terms = Object.values(memory.terms).filter(Boolean).sort((a, b) => b.source.length - a.source.length);
    for (const term of terms) {
      const escaped = term.source.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
      result = result.replace(new RegExp(`\\b${escaped}\\b`, 'giu'), term.target);
    }
    return result;
  }

  function parseVFT(text) {
    const data = JSON.parse(text);
    if (!data || data.format !== 'VFT' || data.version !== 1) throw new Error('Ungültiges VFT-Dokument.');
    const memory = emptyMemory();
    for (const item of data.translationMemory || []) addSegment(memory, item.source, item.target, item.sourceLang, item.targetLang);
    for (const item of data.terminology || []) addTerm(memory, item.source, item.target);
    return memory;
  }

  function parseTMX(text) {
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    if (xml.querySelector('parsererror')) throw new Error('Ungültiges TMX-XML.');
    const memory = emptyMemory();
    [...xml.getElementsByTagNameNS('*', 'tu')].forEach(tu => {
      const tuv = [...tu.children].filter(n => n.localName === 'tuv');
      if (tuv.length < 2) return;
      const getLang = n => n.getAttribute('xml:lang') || n.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang') || 'de-DE';
      const first = tuv[0], second = tuv[1];
      addSegment(memory, first.textContent, second.textContent, getLang(first), getLang(second));
    });
    return memory;
  }

  function parseTBX(text) {
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    if (xml.querySelector('parsererror')) throw new Error('Ungültiges TBX-XML.');
    const memory = emptyMemory();
    [...xml.getElementsByTagNameNS('*', 'termEntry')].forEach(entry => {
      const terms = [...entry.getElementsByTagNameNS('*', 'term')].map(term => normalize(term.textContent));
      if (terms.length >= 2) addTerm(memory, terms[0], terms[1]);
    });
    return memory;
  }

  function parseXLIFF(text) {
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    if (xml.querySelector('parsererror')) throw new Error('Ungültiges XLIFF-XML.');
    const memory = emptyMemory();
    [...xml.getElementsByTagNameNS('*', 'trans-unit')].forEach(unit => {
      const source = unit.getElementsByTagNameNS('*', 'source')[0]?.textContent;
      const target = unit.getElementsByTagNameNS('*', 'target')[0]?.textContent;
      if (source && target) addSegment(memory, source, target);
    });
    return memory;
  }

  function parse(text, type) {
    switch (String(type).toLowerCase()) {
      case 'vft': case 'json': return parseVFT(text);
      case 'tmx': return parseTMX(text);
      case 'tbx': return parseTBX(text);
      case 'xlf': case 'xliff': return parseXLIFF(text);
      default: throw new Error(`Nicht unterstütztes Format: ${type}`);
    }
  }

  function merge(a, b) {
    const out = emptyMemory();
    Object.assign(out.segments, a?.segments || {}, b?.segments || {});
    Object.assign(out.terms, a?.terms || {}, b?.terms || {});
    return out;
  }

  function toVFT(memory, meta = {}) {
    return {
      format: 'VFT', version: 1,
      sourceLanguage: meta.sourceLanguage || 'de-DE',
      targetLanguage: meta.targetLanguage || 'de-HOF-BAROCK',
      translationMemory: Object.values(memory?.segments || {}).map(item => typeof item === 'string'
        ? ({ sourceLang: 'de-DE', targetLang: 'de-HOF-BAROCK', source: '', target: item })
        : item),
      terminology: Object.values(memory?.terms || {}).map(item => typeof item === 'string'
        ? ({ source: '', target: item })
        : item)
    };
  }

  function exportVFT(memory, meta) { return JSON.stringify(toVFT(memory, meta), null, 2); }

  return { emptyMemory, lookupTranslationMemory, applyTerminology, parse, parseVFT, parseTMX, parseTBX, parseXLIFF, merge, toVFT, exportVFT };
})();
