'use strict';

const STYLES = [
  { id: 'barock', title: 'Höfisches Barock' },
  { id: 'kanzlei', title: 'Kaiserlicher Kanzleistil' },
  { id: 'poetisch', title: 'Romantisch-Poetisch' }
];

const MENU_ROOT = 'vfg-root';

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ROOT,
      title: 'Verh-fischgesagt',
      contexts: ['selection', 'page']
    });

    for (const style of STYLES) {
      chrome.contextMenus.create({
        id: `selection:${style.id}`,
        parentId: MENU_ROOT,
        title: `Auswahl → ${style.title}`,
        contexts: ['selection']
      });
      chrome.contextMenus.create({
        id: `page:${style.id}`,
        parentId: MENU_ROOT,
        title: `Ganze Seite → ${style.title}`,
        contexts: ['page']
      });
    }
  });
}

chrome.runtime.onInstalled.addListener(createMenus);
chrome.runtime.onStartup.addListener(createMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id || !info.menuItemId || info.menuItemId === MENU_ROOT) return;
  const [scope, style] = String(info.menuItemId).split(':');
  if (!['selection', 'page'].includes(scope)) return;

  chrome.tabs.sendMessage(tab.id, {
    type: 'VFG_TRANSFORM',
    scope,
    style,
    selectionText: info.selectionText || ''
  }).catch(() => {
    // Restricted browser pages cannot receive content-script messages.
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'VFG_OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
  }
  return true;
});
