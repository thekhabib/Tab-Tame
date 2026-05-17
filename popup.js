const DEFAULTS = { enabled: true, focusMode: false, duplicateBlocker: false, siteRules: {}, stats: { redirected: 0 }, parkedSessions: [] };
const RESTRICTED_URL_RE = /^(chrome|chrome-extension|devtools|edge|about|view-source|file):/i;

let settings = {};
let currentDomain = '';
let parkableCount = 0;
let activeIsParkable = false;

async function load() {
  settings = await get(DEFAULTS);

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const activeTab = tabs.find(t => t.active);
  try {
    currentDomain = new URL(activeTab.url).hostname.replace(/^www\./, '');
  } catch {
    currentDomain = '';
  }
  const restorable = t => /^https?:\/\//i.test(t.url || '') && !RESTRICTED_URL_RE.test(t.url || '');
  parkableCount = tabs.filter(t => !t.active && !t.pinned && restorable(t)).length;
  activeIsParkable = !!(activeTab && !activeTab.pinned && restorable(activeTab));

  render();
}

function get(defaults) {
  return new Promise(r => chrome.storage.local.get(defaults, r));
}

function save(patch) {
  Object.assign(settings, patch);
  chrome.storage.local.set(patch);
  notifyContentScripts();
}

function notifyContentScripts() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id || !tab.url?.startsWith('http')) return;
    chrome.tabs.sendMessage(tab.id, { action: 'settings_updated' }, () => {
      void chrome.runtime.lastError;
    });
  });
}

function render() {
  document.getElementById('masterToggle').checked = settings.enabled;

  const siteSection = document.getElementById('siteSection');
  if (currentDomain) {
    document.getElementById('siteDomain').textContent = currentDomain;
    const rule = settings.siteRules?.[currentDomain] ?? 'default';
    document.getElementById('siteRule').value = rule;
  } else {
    siteSection.style.display = 'none';
  }

  document.getElementById('focusToggle').checked = settings.focusMode;
  document.getElementById('dupeToggle').checked  = settings.duplicateBlocker;
  document.getElementById('statNum').textContent = (settings.stats?.redirected ?? 0).toLocaleString();

  renderParkRow();
  renderSessions();

  const overlay = settings.enabled ? '' : 'disabled-overlay';
  ['siteSection', 'focusRow', 'dupeRow', 'parkRow', 'sessionsBox'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = el.className.replace(' disabled-overlay', '') + (overlay ? ' ' + overlay : '');
  });
}

function sendMessage(msg) {
  return new Promise(resolve => chrome.runtime.sendMessage(msg, resolve));
}

function renderParkRow() {
  const btn = document.getElementById('btnPark');
  const meta = document.getElementById('parkMeta');
  const clearBtn = document.getElementById('btnParkAll');
  const totalIfActive = parkableCount + (activeIsParkable ? 1 : 0);

  if (parkableCount === 0 && !activeIsParkable) {
    meta.textContent = 'Nothing to save in this window';
    btn.disabled = true;
    clearBtn.hidden = true;
    return;
  }

  btn.disabled = parkableCount === 0;
  meta.textContent = parkableCount === 0
    ? 'No other tabs to save'
    : `Close ${parkableCount} other tab${parkableCount === 1 ? '' : 's'} and save them for later`;

  if (activeIsParkable && totalIfActive > parkableCount) {
    clearBtn.hidden = false;
    clearBtn.textContent = `Save all ${totalIfActive} and clear →`;
  } else {
    clearBtn.hidden = true;
  }
}

function relativeTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (sameDay) return `Today ${hh}:${mm}`;
  if (isYesterday) return `Yesterday ${hh}:${mm}`;
  return d.toLocaleDateString();
}

function renderSessions() {
  const box = document.getElementById('sessionsBox');
  const sessions = settings.parkedSessions ?? [];
  box.innerHTML = '';

  if (sessions.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'sessions-empty';
    empty.textContent = 'No saved sessions yet.';
    box.appendChild(empty);
    return;
  }

  sessions.slice(0, 3).forEach(session => {
    const row = document.createElement('div');
    row.className = 'session-row';

    const info = document.createElement('div');
    info.className = 'session-info';

    const title = document.createElement('div');
    title.className = 'session-title';
    title.textContent = session.name;
    title.title = session.name;

    const sub = document.createElement('div');
    sub.className = 'session-sub';
    sub.textContent = `${relativeTime(session.createdAt)} · ${session.tabs.length} tab${session.tabs.length === 1 ? '' : 's'}`;

    info.append(title, sub);

    const btn = document.createElement('button');
    btn.className = 'btn-restore';
    btn.title = 'Restore session in this window';
    btn.textContent = '↻';
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await sendMessage({
        action: 'restore_session',
        sessionId: session.id,
        options: { newWindow: false }
      });
      window.close();
    });

    row.append(info, btn);
    box.appendChild(row);
  });

  const link = document.createElement('a');
  link.className = 'sessions-link';
  link.textContent = sessions.length > 3
    ? `View all ${sessions.length} saved sessions →`
    : 'View all saved sessions →';
  link.addEventListener('click', e => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  box.appendChild(link);
}

// Events
document.getElementById('masterToggle').addEventListener('change', e => {
  save({ enabled: e.target.checked });
  render();
});

document.getElementById('focusToggle').addEventListener('change', e => {
  save({ focusMode: e.target.checked });
});

document.getElementById('dupeToggle').addEventListener('change', e => {
  save({ duplicateBlocker: e.target.checked });
});

document.getElementById('siteRule').addEventListener('change', e => {
  if (!currentDomain) return;
  const rules = { ...settings.siteRules };
  if (e.target.value === 'default') {
    delete rules[currentDomain];
  } else {
    rules[currentDomain] = e.target.value;
  }
  save({ siteRules: rules });
});

document.getElementById('btnOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

async function doPark(options) {
  const btn = document.getElementById('btnPark');
  const clearBtn = document.getElementById('btnParkAll');
  const meta = document.getElementById('parkMeta');
  btn.disabled = true;
  clearBtn.disabled = true;
  const res = await sendMessage({ action: 'park_tabs', options });
  if (res?.ok) {
    meta.textContent = `Saved ${res.count} tab${res.count === 1 ? '' : 's'}`;
    setTimeout(() => window.close(), 600);
  } else {
    meta.textContent = res?.reason === 'empty' ? 'Nothing to save' : 'Save failed';
    btn.disabled = false;
    clearBtn.disabled = false;
  }
}

document.getElementById('btnPark').addEventListener('click', () => doPark({}));
document.getElementById('btnParkAll').addEventListener('click', () => doPark({ includeActive: true }));

load();
