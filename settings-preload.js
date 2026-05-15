// Runs at document_start (ISOLATED world) — pushes settings to inject.js
// before the page's own scripts execute, minimising the race window.
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(
    { enabled: true, focusMode: false, siteRules: {} },
    result => {
      window.postMessage({
        source: 'tabtame-iso',
        type: 'settings',
        settings: result
      }, '*');
    }
  );
}
