const DEFAULTS = { enabled: true, focusMode: false, duplicateBlocker: false, siteRules: {}, stats: { redirected: 0 } };

let settings = {};
let currentDomain = '';

async function load() {
  settings = await get(DEFAULTS);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    currentDomain = new URL(tab.url).hostname.replace(/^www\./, '');
  } catch {
    currentDomain = '';
  }

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

  const overlay = settings.enabled ? '' : 'disabled-overlay';
  ['siteSection', 'focusRow', 'dupeRow'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = el.className.replace(' disabled-overlay', '') + (overlay ? ' ' + overlay : '');
  });
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

load();
