class SameTabLinkOpener {
  constructor() {
    this.settings    = null;
    this.domain      = location.hostname.replace(/^www\./, '');
    this.pendingStat = 0;
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupBridge();
    this.pushSettingsToMain();
    if (this.settings.enabled && this.isActive()) {
      this.processLinks();
      this.setupObserver();
      const iv = setInterval(() => {
        if (!chrome.runtime?.id) { clearInterval(iv); return; }
        this.flushStats();
      }, 5000);
    }
    this.setupMessageListener();
    this.setupStorageWatcher();
  }

  setupBridge() {
    window.addEventListener('message', e => {
      if (e.source !== window) return;
      const d = e.data;
      if (d?.source !== 'tabtidy') return;
      if (d.type === 'request-settings') {
        this.pushSettingsToMain();
      } else if (d.type === 'stat') {
        this.pendingStat++;
      }
    });
  }

  pushSettingsToMain() {
    if (!this.settings) return;
    window.postMessage({
      source: 'tabtidy-iso',
      type: 'settings',
      settings: {
        enabled: this.settings.enabled,
        focusMode: this.settings.focusMode,
        siteRules: this.settings.siteRules || {}
      }
    }, '*');
  }

  setupStorageWatcher() {
    if (!chrome.storage?.onChanged) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes.enabled || changes.focusMode || changes.siteRules) {
        this.loadSettings().then(() => this.pushSettingsToMain());
      }
    });
  }

  loadSettings() {
    return new Promise(resolve => {
      if (!chrome.runtime?.id) return resolve();
      try {
        chrome.storage.local.get(
          { enabled: true, focusMode: false, siteRules: {} },
          result => { this.settings = result; resolve(); }
        );
      } catch (_) { resolve(); }
    });
  }

  isActive() {
    const rule = this.settings.siteRules?.[this.domain];
    if (rule === 'new') return false;
    return this.settings.enabled;
  }

  shouldRedirect(link) {
    if (this.settings.siteRules?.[this.domain] === 'same') return true;
    if (!this.settings.focusMode) return true;
    try {
      const linkDomain = new URL(link.href).hostname.replace(/^www\./, '');
      const base = this.domain.split('.').slice(-2).join('.');
      return linkDomain !== this.domain && !linkDomain.endsWith('.' + base);
    } catch { return true; }
  }

  processLinks() {
    document.querySelectorAll('a[target="_blank"]:not([data-same-tab])').forEach(link => {
      if (!this.shouldRedirect(link)) return;
      link.setAttribute('target', '_self');
      link.setAttribute('data-same-tab', 'true');
      const rel = link.getAttribute('rel');
      if (rel) {
        const cleaned = rel.split(/\s+/)
          .filter(r => r !== 'noopener' && r !== 'noreferrer').join(' ');
        cleaned ? link.setAttribute('rel', cleaned) : link.removeAttribute('rel');
      }
      this.pendingStat++;
    });
  }

  flushStats() {
    if (this.pendingStat === 0 || !chrome.runtime?.id) return;
    try {
      chrome.runtime.sendMessage({ action: 'stat_redirected', count: this.pendingStat });
    } catch (_) {}
    this.pendingStat = 0;
  }

  setupObserver() {
    let timer;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (this.isActive()) this.processLinks();
      }, 150);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
      if (req.action === 'settings_updated') this.loadSettings();
      sendResponse({ ok: true });
    });
  }
}

function boot() {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  try { new SameTabLinkOpener(); } catch (_) {}
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', boot)
  : boot();
