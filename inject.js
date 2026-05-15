(() => {
  const TAG = 'tabtidy';
  const ISO_TAG = 'tabtidy-iso';
  const domain = location.hostname.replace(/^www\./, '');
  let settings = { enabled: true, focusMode: false, siteRules: {} };

  function shouldRedirect(url) {
    const rule = settings.siteRules?.[domain];
    if (rule === 'new') return false;
    if (rule === 'same') return true;
    if (!settings.enabled) return false;
    if (!settings.focusMode) return true;
    try {
      const linkDomain = new URL(url, location.href).hostname.replace(/^www\./, '');
      const base = domain.split('.').slice(-2).join('.');
      if (linkDomain === domain) return false;
      if (linkDomain.endsWith('.' + base)) return false;
      return true;
    } catch { return true; }
  }

  const origOpen = window.open;
  window.open = function(url, target, features) {
    if (url && shouldRedirect(url)) {
      try {
        const abs = new URL(url, location.href).href;
        window.postMessage({ source: TAG, type: 'stat' }, '*');
        location.href = abs;
      } catch {
        location.href = url;
      }
      return null;
    }
    return origOpen.call(this, url, target, features);
  };

  window.addEventListener('message', e => {
    if (e.source !== window) return;
    const d = e.data;
    if (d?.source === ISO_TAG && d.type === 'settings') {
      settings = d.settings;
    }
  });

  window.postMessage({ source: TAG, type: 'request-settings' }, '*');
})();
