const DEFAULTS = {
  enabled: true,
  focusMode: false,
  tabLimit: 0,
  duplicateBlocker: false,
  idleClose: 0,
  siteRules: {},
  stats: { redirected: 0 }
};

function getSettings() {
  return new Promise(resolve => chrome.storage.local.get(DEFAULTS, resolve));
}

// Tab activity — in-memory cache + debounced storage sync for MV3 persistence
const tabLastActive = {};
let syncTimer;

function touchTab(tabId) {
  tabLastActive[tabId] = Date.now();
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    chrome.storage.local.set({ tabActivity: { ...tabLastActive } });
  }, 2000);
}

// Restore persisted activity on service worker restart
chrome.storage.local.get({ tabActivity: {} }, ({ tabActivity }) => {
  Object.assign(tabLastActive, tabActivity);
});

chrome.tabs.onActivated.addListener(({ tabId }) => touchTab(tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') touchTab(tabId);
});
chrome.tabs.onRemoved.addListener(tabId => {
  delete tabLastActive[tabId];
  chrome.storage.local.get({ tabActivity: {} }, ({ tabActivity }) => {
    delete tabActivity[tabId];
    chrome.storage.local.set({ tabActivity });
  });
});

// Idle close alarm (persistent across service worker restarts)
chrome.alarms.get('idleCheck', alarm => {
  if (!alarm) chrome.alarms.create('idleCheck', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'idleCheck') return;
  const { enabled, idleClose } = await getSettings();
  if (!enabled || idleClose === 0) return;
  const cutoff = idleClose * 60 * 1000;
  const now = Date.now();
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.active || tab.pinned) continue;
    const last = tabLastActive[tab.id];
    if (last && now - last > cutoff) chrome.tabs.remove(tab.id);
  }
});

// Tab limiter
chrome.tabs.onCreated.addListener(async tab => {
  const { enabled, tabLimit } = await getSettings();
  if (!enabled || tabLimit === 0) return;
  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (tabs.length > tabLimit) chrome.tabs.remove(tab.id);
});

// Duplicate tab blocker
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (!changeInfo.url) return;
  const { enabled, duplicateBlocker } = await getSettings();
  if (!enabled || !duplicateBlocker) return;
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const dupes = tabs.filter(t => t.id !== tabId && t.url === changeInfo.url);
  if (dupes.length > 0) {
    chrome.tabs.update(dupes[0].id, { active: true });
    chrome.tabs.remove(tabId);
  }
});

// Commands
chrome.commands.onCommand.addListener(async command => {
  if (command === 'toggle-extension') {
    const { enabled } = await getSettings();
    chrome.storage.local.set({ enabled: !enabled });
    return;
  }

  if (command === 'search-tabs') {
    chrome.windows.create({
      url: chrome.runtime.getURL('search.html'),
      type: 'popup',
      width: 640,
      height: 500,
      focused: true
    });
    return;
  }

  const m = command.match(/^switch-tab-(\d)$/);
  if (m) {
    const idx = parseInt(m[1]) - 1;
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (tabs[idx]) chrome.tabs.update(tabs[idx].id, { active: true });
  }
});

// Stats from content scripts
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'stat_redirected') {
    chrome.storage.local.get({ stats: { redirected: 0 } }, ({ stats }) => {
      chrome.storage.local.set({ stats: { redirected: stats.redirected + msg.count } });
    });
  }
  sendResponse({ ok: true });
});
