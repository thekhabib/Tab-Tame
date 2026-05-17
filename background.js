const DEFAULTS = {
  enabled: true,
  focusMode: false,
  tabLimit: 0,
  duplicateBlocker: false,
  idleClose: 0,
  siteRules: {},
  stats: { redirected: 0 },
  parkedSessions: []
};

const MAX_PARKED_SESSIONS = 100;
const RESTRICTED_URL_RE = /^(chrome|chrome-extension|devtools|edge|about|view-source|file):/i;

function getSettings() {
  return new Promise(resolve => chrome.storage.local.get(DEFAULTS, resolve));
}

function isRestorable(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url) && !RESTRICTED_URL_RE.test(url);
}

function getParkedSessions() {
  return new Promise(r => chrome.storage.local.get({ parkedSessions: [] }, ({ parkedSessions }) => r(parkedSessions)));
}

function setParkedSessions(sessions) {
  return new Promise(r => chrome.storage.local.set({ parkedSessions: sessions }, r));
}

function formatSessionName(date, count) {
  const pad = n => String(n).padStart(2, '0');
  const d = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const t = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${d} ${t} (${count} tab${count === 1 ? '' : 's'})`;
}

async function parkTabs({ includeActive = false } = {}) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const parkable = tabs.filter(t =>
    !t.pinned && (includeActive || !t.active) && isRestorable(t.url)
  );
  const baseExcluded = tabs.filter(t => t.pinned || (!includeActive && t.active)).length;
  const skippedCount = tabs.length - baseExcluded - parkable.length;
  if (parkable.length === 0) {
    return { ok: false, reason: 'empty', skipped: skippedCount };
  }
  const now = new Date();
  const session = {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: formatSessionName(now, parkable.length),
    createdAt: now.toISOString(),
    tabs: parkable.map(t => ({
      url: t.url,
      title: t.title || t.url,
      favIconUrl: t.favIconUrl || ''
    }))
  };
  const sessions = await getParkedSessions();
  sessions.unshift(session);
  if (sessions.length > MAX_PARKED_SESSIONS) sessions.length = MAX_PARKED_SESSIONS;
  await setParkedSessions(sessions);

  // Opening a blank newtab BEFORE removing parked tabs guarantees the window
  // never goes empty (which would close it).
  if (includeActive) {
    const remaining = tabs.filter(t => !parkable.includes(t));
    if (remaining.length === 0) {
      await chrome.tabs.create({ active: true });
    }
  }

  await chrome.tabs.remove(parkable.map(t => t.id));
  return { ok: true, sessionId: session.id, count: parkable.length, skipped: skippedCount };
}

async function restoreSession(sessionId, { removeAfter = true, newWindow = true } = {}) {
  const sessions = await getParkedSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return { ok: false, reason: 'not_found' };
  const urls = session.tabs.map(t => t.url).filter(isRestorable);
  if (urls.length === 0) return { ok: false, reason: 'no_urls' };
  if (newWindow) {
    await chrome.windows.create({ url: urls, focused: true });
  } else {
    for (const url of urls) await chrome.tabs.create({ url, active: false });
  }
  if (removeAfter) {
    await setParkedSessions(sessions.filter(s => s.id !== sessionId));
  }
  return { ok: true, count: urls.length };
}

async function restoreTab(sessionId, tabIndex) {
  const sessions = await getParkedSessions();
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return { ok: false, reason: 'not_found' };
  const session = sessions[idx];
  const tab = session.tabs[tabIndex];
  if (!tab || !isRestorable(tab.url)) return { ok: false, reason: 'invalid_tab' };
  await chrome.tabs.create({ url: tab.url, active: false });
  session.tabs.splice(tabIndex, 1);
  if (session.tabs.length === 0) {
    sessions.splice(idx, 1);
  }
  await setParkedSessions(sessions);
  return { ok: true };
}

async function deleteSession(sessionId) {
  const sessions = await getParkedSessions();
  await setParkedSessions(sessions.filter(s => s.id !== sessionId));
  return { ok: true };
}

async function renameSession(sessionId, name) {
  const sessions = await getParkedSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return { ok: false, reason: 'not_found' };
  session.name = String(name || '').slice(0, 120);
  await setParkedSessions(sessions);
  return { ok: true };
}

// Test hook — service-worker globals aren't reachable from content/web pages,
// so this is harmless in prod and lets Playwright invoke handlers directly.
globalThis.__tabtame = { parkTabs, restoreSession, restoreTab, deleteSession, renameSession };

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

// On browser launch, reset all timestamps to now so stale persisted values
// from a previous session don't cause an immediate idle-close sweep.
chrome.runtime.onStartup.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  const now = Date.now();
  for (const k of Object.keys(tabLastActive)) delete tabLastActive[k];
  for (const t of tabs) tabLastActive[t.id] = now;
  chrome.storage.local.set({ tabActivity: { ...tabLastActive } });
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
    if (last === undefined) { tabLastActive[tab.id] = now; continue; }
    if (now - last > cutoff) chrome.tabs.remove(tab.id);
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

// Message router
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'stat_redirected') {
    chrome.storage.local.get({ stats: { redirected: 0 } }, ({ stats }) => {
      chrome.storage.local.set({ stats: { redirected: stats.redirected + msg.count } });
    });
    sendResponse({ ok: true });
    return false;
  }

  if (msg.action === 'park_tabs') {
    parkTabs(msg.options).then(sendResponse);
    return true;
  }

  if (msg.action === 'restore_session') {
    restoreSession(msg.sessionId, msg.options).then(sendResponse);
    return true;
  }

  if (msg.action === 'restore_tab') {
    restoreTab(msg.sessionId, msg.tabIndex).then(sendResponse);
    return true;
  }

  if (msg.action === 'delete_session') {
    deleteSession(msg.sessionId).then(sendResponse);
    return true;
  }

  if (msg.action === 'rename_session') {
    renameSession(msg.sessionId, msg.name).then(sendResponse);
    return true;
  }

  sendResponse({ ok: true });
  return false;
});
