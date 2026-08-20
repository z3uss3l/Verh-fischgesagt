'use strict';

(() => {
  const ROOT_ATTR = 'data-vfg-transformed';
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
    'CODE', 'PRE', 'KBD', 'SAMP', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO', 'IFRAME'
  ]);

  let busy = false;
  let lastOperation = null;

  function settings() {
    return new Promise(resolve => {
      chrome.storage.local.get({
        engine: 'semantic',
        style: 'barock',
        memory: { segments: {}, terms: {} }
      }, resolve);
    });
  }

  function transformText(text, style, memory) {
    const exact = window.VFGFormats?.lookupTranslationMemory(memory, text, style);
    if (exact) return exact;
    const prepared = window.VFGFormats?.applyTerminology(memory, text) || text;
    const result = window.SemanticEngineV2.transmuteText(prepared, style, { analysis: false });
    if (!result.success) throw new Error(result.error);
    return result.transmuted;
  }

  function isSkippable(node) {
    if (!node?.parentElement) return true;
    if (node.parentElement.closest(`[${ROOT_ATTR}]`)) return true;
    if (SKIP_TAGS.has(node.parentElement.tagName)) return true;
    if (!node.nodeValue || !node.nodeValue.trim()) return true;
    return false;
  }

  function transformSelection(style, memory) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      throw new Error('Bitte markiert zuerst einen Text.');
    }

    const range = selection.getRangeAt(0);
    const source = selection.toString();
    if (!source.trim()) throw new Error('Die Auswahl enthält keinen Text.');

    const output = transformText(source, style, memory);
    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement('span');
    wrapper.setAttribute(ROOT_ATTR, '1');
    wrapper.dataset.vfgOriginal = source;
    wrapper.dataset.vfgStyle = style;
    wrapper.title = 'Verh-fischgesagt: Original über Kontextmenü wiederherstellen';
    wrapper.textContent = output;
    fragment.appendChild(wrapper);
    range.deleteContents();
    range.insertNode(fragment);
    selection.removeAllRanges();

    return { source, output, count: 1 };
  }

  function transformPage(style, memory) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (!isSkippable(node)) nodes.push(node);
    }

    let count = 0;
    const changed = [];
    for (const textNode of nodes) {
      const source = textNode.nodeValue;
      if (!source || !source.trim()) continue;
      const output = transformText(source, style, memory);
      if (output === source) continue;
      const parent = textNode.parentElement;
      const wrapper = document.createElement('span');
      wrapper.setAttribute(ROOT_ATTR, '1');
      wrapper.dataset.vfgOriginal = source;
      wrapper.dataset.vfgStyle = style;
      wrapper.title = 'Verh-fischgesagt: Original über Erweiterungsmenü wiederherstellbar';
      wrapper.textContent = output;
      parent.replaceChild(wrapper, textNode);
      changed.push({ source, output });
      count++;
    }

    return { source: `${count} Textknoten`, output: `${count} transformiert`, count, changed };
  }

  function restorePage() {
    const nodes = document.querySelectorAll(`[${ROOT_ATTR}]`);
    let count = 0;
    nodes.forEach(wrapper => {
      const original = wrapper.dataset.vfgOriginal;
      if (original == null) return;
      wrapper.replaceWith(document.createTextNode(original));
      count++;
    });
    return count;
  }

  function notify(message, error = false) {
    const old = document.getElementById('vfg-toast');
    old?.remove();
    const toast = document.createElement('div');
    toast.id = 'vfg-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      zIndex: '2147483647',
      right: '16px',
      bottom: '16px',
      maxWidth: 'min(420px, calc(100vw - 32px))',
      padding: '10px 14px',
      borderRadius: '8px',
      background: error ? '#6b2020' : '#211d25',
      color: '#fff',
      border: '1px solid #d4af37',
      font: '13px/1.4 system-ui, sans-serif',
      boxShadow: '0 8px 30px rgba(0,0,0,.35)'
    });
    document.documentElement.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  chrome.runtime.onMessage.addListener(async message => {
    if (message?.type === 'VFG_RESTORE') {
      const count = restorePage();
      notify(`${count} Transformationen wiederhergestellt.`);
      return;
    }
    if (message?.type !== 'VFG_TRANSFORM' || busy) return;
    busy = true;
    try {
      const cfg = await settings();
      const style = message.style || cfg.style || 'barock';
      let result;
      if (message.scope === 'selection') {
        result = transformSelection(style, cfg.memory);
        notify(`Auswahl mit „${style}“ transformiert.`);
      } else {
        result = transformPage(style, cfg.memory);
        notify(`${result.count} Textknoten mit „${style}“ transformiert.`);
      }
      lastOperation = result;
    } catch (error) {
      notify(error.message || String(error), true);
    } finally {
      busy = false;
    }
  });

  // Lightweight keyboard shortcut: Alt+Shift+V transforms the current selection.
  document.addEventListener('keydown', async event => {
    if (!(event.altKey && event.shiftKey && event.code === 'KeyV')) return;
    if (busy) return;
    const selection = window.getSelection()?.toString()?.trim();
    if (!selection) return;
    event.preventDefault();
    const cfg = await settings();
    try {
      transformSelection(cfg.style || 'barock', cfg.memory);
      notify('Auswahl transformiert.');
    } catch (error) {
      notify(error.message || String(error), true);
    }
  });
})();
