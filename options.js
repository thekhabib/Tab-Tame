const DEFAULTS = {
  enabled: true,
  focusMode: false,
  duplicateBlocker: false,
  tabLimit: 0,
  idleClose: 0,
  siteRules: {},
  stats: { redirected: 0 },
  parkedSessions: []
};

let settings = {};

function get(d) { return new Promise(r => chrome.storage.local.get(d, r)); }
function set(patch) {
  Object.assign(settings, patch);
  chrome.storage.local.set(patch);
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

async function load() {
  settings = await get(DEFAULTS);
  render();
}

function render() {
  document.getElementById('enabled').checked          = settings.enabled;
  document.getElementById('focusMode').checked        = settings.focusMode;
  document.getElementById('duplicateBlocker').checked = settings.duplicateBlocker;
  document.getElementById('tabLimit').value           = settings.tabLimit;
  document.getElementById('idleClose').value          = settings.idleClose;
  document.getElementById('statNum').textContent      = (settings.stats?.redirected ?? 0).toLocaleString();
  renderRules();
  renderSessions();
}

function sendMessage(msg) {
  return new Promise(r => chrome.runtime.sendMessage(msg, r));
}

function formatTimestamp(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

// Favicons rely on the URL captured at park time. We never fetch from a third party
// (would leak hostnames) — broken icons are simply hidden via onerror.

function renderSessions() {
  const list = document.getElementById('sessionsList');
  const sessions = settings.parkedSessions ?? [];
  if (sessions.length === 0) {
    list.innerHTML = '<div class="empty-list">No parked sessions yet. Use the popup’s Park button.</div>';
    return;
  }
  list.innerHTML = '';
  sessions.forEach(session => list.appendChild(renderSession(session)));
}

function renderSession(session) {
  const item = document.createElement('div');
  item.className = 'session-item';

  const head = document.createElement('div');
  head.className = 'session-head';

  const nameInput = document.createElement('input');
  nameInput.className = 'session-name';
  nameInput.value = session.name;
  nameInput.spellcheck = false;
  nameInput.addEventListener('change', async () => {
    const name = nameInput.value.trim() || session.name;
    nameInput.value = name;
    await sendMessage({ action: 'rename_session', sessionId: session.id, name });
    await load();
  });

  const actions = document.createElement('div');
  actions.className = 'session-actions';

  const restoreHereBtn = document.createElement('button');
  restoreHereBtn.className = 'btn-session';
  restoreHereBtn.textContent = 'Restore here';
  restoreHereBtn.title = 'Open all tabs in this window';
  restoreHereBtn.addEventListener('click', async () => {
    restoreHereBtn.disabled = true;
    await sendMessage({
      action: 'restore_session',
      sessionId: session.id,
      options: { newWindow: false }
    });
    await load();
    toast('Restored');
  });

  const restoreNewBtn = document.createElement('button');
  restoreNewBtn.className = 'btn-session';
  restoreNewBtn.textContent = 'New window';
  restoreNewBtn.title = 'Open all tabs in a new window';
  restoreNewBtn.addEventListener('click', async () => {
    restoreNewBtn.disabled = true;
    await sendMessage({
      action: 'restore_session',
      sessionId: session.id,
      options: { newWindow: true }
    });
    await load();
    toast('Restored');
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-session danger';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async () => {
    if (!confirm(`Delete session "${session.name}"?`)) return;
    await sendMessage({ action: 'delete_session', sessionId: session.id });
    await load();
    toast('Deleted');
  });

  actions.append(restoreHereBtn, restoreNewBtn, deleteBtn);
  head.append(nameInput, actions);

  const meta = document.createElement('div');
  meta.className = 'session-meta';
  meta.textContent = `${session.tabs.length} tab${session.tabs.length === 1 ? '' : 's'} · ${formatTimestamp(session.createdAt)}`;

  const tabsList = document.createElement('div');
  tabsList.className = 'session-tabs';
  session.tabs.forEach((tab, idx) => {
    const row = document.createElement('div');
    row.className = 'session-tab';

    const img = document.createElement('img');
    if (tab.favIconUrl) {
      img.src = tab.favIconUrl;
      img.onerror = () => { img.style.visibility = 'hidden'; };
    } else {
      img.style.visibility = 'hidden';
    }

    const link = document.createElement('a');
    link.className = 'session-tab-title';
    link.href = tab.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = tab.title || tab.url;
    link.title = tab.url;
    link.addEventListener('click', async e => {
      e.preventDefault();
      await sendMessage({ action: 'restore_tab', sessionId: session.id, tabIndex: idx });
      await load();
    });

    const remove = document.createElement('button');
    remove.className = 'session-tab-remove';
    remove.title = 'Remove from session';
    remove.textContent = '×';
    remove.addEventListener('click', async () => {
      const sessions = settings.parkedSessions.map(s => {
        if (s.id !== session.id) return s;
        return { ...s, tabs: s.tabs.filter((_, i) => i !== idx) };
      }).filter(s => s.tabs.length > 0);
      set({ parkedSessions: sessions });
      renderSessions();
    });

    row.append(img, link, remove);
    tabsList.appendChild(row);
  });

  item.append(head, meta, tabsList);
  return item;
}

function renderRules() {
  const list  = document.getElementById('rulesList');
  const rules = settings.siteRules ?? {};
  const entries = Object.entries(rules);

  if (entries.length === 0) {
    list.innerHTML = '<div class="empty-list">No site rules yet.</div>';
    return;
  }

  list.innerHTML = '';
  entries.forEach(([domain, type]) => {
    const item = document.createElement('div');
    item.className = 'rule-item';

    const domainEl = document.createElement('span');
    domainEl.className = 'rule-domain';
    domainEl.textContent = domain;

    const badge = document.createElement('span');
    badge.className = 'rule-badge ' + type;
    badge.textContent = type === 'same' ? 'Same tab' : 'New tab';

    const btn = document.createElement('button');
    btn.className = 'btn-remove';
    btn.title = 'Remove';
    btn.textContent = '×';
    btn.addEventListener('click', () => {
      const rules = { ...settings.siteRules };
      delete rules[domain];
      set({ siteRules: rules });
      renderRules();
    });

    item.append(domainEl, badge, btn);
    list.appendChild(item);
  });
}

// Toggle events
['enabled', 'focusMode', 'duplicateBlocker'].forEach(id => {
  document.getElementById(id).addEventListener('change', e => {
    set({ [id]: e.target.checked });
  });
});

document.getElementById('tabLimit').addEventListener('change', e => {
  set({ tabLimit: Math.max(0, parseInt(e.target.value) || 0) });
});

document.getElementById('idleClose').addEventListener('change', e => {
  set({ idleClose: Math.max(0, parseInt(e.target.value) || 0) });
});

// Add site rule
function addRule() {
  const input  = document.getElementById('addRuleDomain');
  const type   = document.getElementById('addRuleType').value;
  const domain = input.value.trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!domain) return;
  const rules = { ...settings.siteRules };
  if (rules[domain] === type) { toast('Already exists'); return; }
  rules[domain] = type;
  set({ siteRules: rules });
  input.value = '';
  renderRules();
  toast('Added');
}

document.getElementById('btnAddRule').addEventListener('click', addRule);
document.getElementById('addRuleDomain').addEventListener('keydown', e => {
  if (e.key === 'Enter') addRule();
});

// Shortcuts link — can't navigate to chrome:// pages, copy instead
document.getElementById('shortcutsLink').addEventListener('click', e => {
  e.preventDefault();
  navigator.clipboard.writeText('chrome://extensions/shortcuts').then(() => {
    toast('Copied — paste in address bar');
  });
});

// Reset stats
document.getElementById('btnReset').addEventListener('click', () => {
  set({ stats: { redirected: 0 } });
  document.getElementById('statNum').textContent = '0';
  toast('Stats reset');
});

// Export
document.getElementById('btnExport').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
  const a    = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'tabtame-settings.json'
  });
  a.click();
  toast('Exported');
});

// Import
document.getElementById('btnImport').addEventListener('click', () => {
  const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json' });
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new Error();
        const allowed = new Set(Object.keys(DEFAULTS));
        const sanitized = Object.fromEntries(
          Object.entries(data).filter(([k]) => allowed.has(k))
        );
        if (Object.keys(sanitized).length === 0) throw new Error();
        chrome.storage.local.set(sanitized, () => { load(); toast('Imported'); });
      } catch {
        toast('Invalid file');
      }
    };
    reader.readAsText(file);
  });
  input.click();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (Object.keys(changes).some(k => k in DEFAULTS)) load();
});

load();
