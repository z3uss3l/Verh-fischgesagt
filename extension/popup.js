'use strict';

const style = document.getElementById('style');
const status = document.getElementById('status');

function setStatus(text, error = false) {
  status.textContent = text;
  status.style.color = error ? '#d97777' : '#9c95a8';
}

chrome.storage.local.get({ style: 'barock' }, cfg => { style.value = cfg.style; });
style.addEventListener('change', () => chrome.storage.local.set({ style: style.value }));

async function activeTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.id) throw new Error('Kein aktiver Tab verfügbar.');
  return tabs[0];
}

async function send(message) {
  const tab = await activeTab();
  try {
    await chrome.tabs.sendMessage(tab.id, message);
    setStatus('Ausgeführt.');
  } catch (error) {
    setStatus('Auf dieser Seite nicht verfügbar.', true);
  }
}

document.getElementById('selection').addEventListener('click', () => send({ type: 'VFG_TRANSFORM', scope: 'selection', style: style.value }));
document.getElementById('page').addEventListener('click', () => send({ type: 'VFG_TRANSFORM', scope: 'page', style: style.value }));
document.getElementById('restore').addEventListener('click', () => send({ type: 'VFG_RESTORE' }));
document.getElementById('options').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'VFG_OPEN_OPTIONS' }));
