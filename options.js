const DEFAULTS = {
  enabled: true,
  focusMode: false,
  duplicateBlocker: false,
  tabLimit: 0,
  idleClose: 0,
  siteRules: {},
  stats: { redirected: 0 }
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

load();
