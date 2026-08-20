'use strict';

const style = document.getElementById('defaultStyle');
const file = document.getElementById('file');
const status = document.getElementById('status');
const vft = document.getElementById('vft');

function setStatus(text) { status.textContent = text; }

chrome.storage.local.get({ style: 'barock', memory: window.VFGFormats.emptyMemory() }, cfg => {
  style.value = cfg.style;
  vft.value = window.VFGFormats.exportVFT(cfg.memory, { targetLanguage: `de-HOF-${cfg.style.toUpperCase()}` });
});

style.addEventListener('change', () => chrome.storage.local.set({ style: style.value }, () => setStatus('Standardprofil gespeichert.')));

document.getElementById('import').addEventListener('click', async () => {
  const selected = file.files?.[0];
  if (!selected) return setStatus('Bitte zuerst eine Datei wählen.');
  try {
    const text = await selected.text();
    const ext = selected.name.split('.').pop().toLowerCase();
    const imported = window.VFGFormats.parse(text, ext);
    chrome.storage.local.get({ memory: window.VFGFormats.emptyMemory() }, cfg => {
      const merged = window.VFGFormats.merge(cfg.memory, imported);
      chrome.storage.local.set({ memory: merged }, () => {
        vft.value = window.VFGFormats.exportVFT(merged);
        setStatus(`Import erfolgreich: ${Object.keys(merged.segments).length} Segmente, ${Object.keys(merged.terms).length} Termini.`);
      });
    });
  } catch (error) {
    setStatus(`Importfehler: ${error.message}`);
  }
});

document.getElementById('loadVft').addEventListener('click', () => {
  try {
    const memory = window.VFGFormats.parseVFT(vft.value);
    chrome.storage.local.set({ memory }, () => setStatus(`VFT geladen: ${Object.keys(memory.segments).length} Segmente, ${Object.keys(memory.terms).length} Termini.`));
  } catch (error) { setStatus(`VFT-Fehler: ${error.message}`); }
});

document.getElementById('export').addEventListener('click', () => {
  chrome.storage.local.get({ memory: window.VFGFormats.emptyMemory() }, cfg => {
    const blob = new Blob([window.VFGFormats.exportVFT(cfg.memory)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verh-fisch-translation-memory.vft.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('VFT exportiert.');
  });
});

document.getElementById('clear').addEventListener('click', () => {
  if (!confirm('Lokalen Translation Memory wirklich löschen?')) return;
  chrome.storage.local.set({ memory: window.VFGFormats.emptyMemory() }, () => {
    vft.value = window.VFGFormats.exportVFT(window.VFGFormats.emptyMemory());
    setStatus('Lokaler Translation Memory gelöscht.');
  });
});
