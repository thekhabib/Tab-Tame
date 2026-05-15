let allTabs = [];
let filtered = [];
let focusedIdx = 0;

async function init() {
  allTabs = await chrome.tabs.query({});
  render(allTabs);
  document.getElementById('searchInput').focus();
}

function matches(tab, query) {
  const q = query.toLowerCase();
  return (tab.title || '').toLowerCase().includes(q) ||
         (tab.url  || '').toLowerCase().includes(q);
}

function render(tabs) {
  filtered   = tabs;
  focusedIdx = 0;
  const list = document.getElementById('tabList');
  list.innerHTML = '';

  if (tabs.length === 0) {
    list.innerHTML = '<div class="no-results">No tabs found</div>';
    return;
  }

  const countEl = document.createElement('div');
  countEl.className = 'count';
  countEl.textContent = tabs.length + ' tab' + (tabs.length !== 1 ? 's' : '');
  list.appendChild(countEl);

  tabs.forEach((tab, i) => {
    const item = document.createElement('div');
    item.className = 'tab-item' + (i === 0 ? ' focused' : '');
    item.dataset.idx = i;

    const favicon = document.createElement('img');
    favicon.className = 'tab-favicon';
    if (tab.favIconUrl) {
      favicon.src = tab.favIconUrl;
      favicon.onerror = () => { favicon.style.opacity = '0'; };
    } else {
      favicon.style.opacity = '0';
    }

    const info = document.createElement('div');
    info.className = 'tab-info';

    const title = document.createElement('div');
    title.className = 'tab-title';
    title.textContent = tab.title || tab.url || 'Untitled';

    const url = document.createElement('div');
    url.className = 'tab-url';
    url.textContent = tab.url || '';

    info.append(title, url);

    const win = document.createElement('div');
    win.className = 'tab-win';
    win.textContent = 'Win ' + tab.windowId;

    item.append(favicon, info, win);
    item.addEventListener('click', () => switchToTab(tab));
    list.appendChild(item);
  });
}

function switchToTab(tab) {
  chrome.tabs.update(tab.id, { active: true });
  chrome.windows.update(tab.windowId, { focused: true });
  window.close();
}

function setFocus(idx) {
  const items = document.querySelectorAll('.tab-item');
  if (!items.length) return;
  focusedIdx = Math.max(0, Math.min(idx, items.length - 1));
  items.forEach((el, i) => el.classList.toggle('focused', i === focusedIdx));
  items[focusedIdx]?.scrollIntoView({ block: 'nearest' });
}

document.getElementById('searchInput').addEventListener('input', e => {
  const q = e.target.value.trim();
  render(q ? allTabs.filter(t => matches(t, q)) : allTabs);
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') {
    setFocus(focusedIdx + 1);
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    setFocus(focusedIdx - 1);
    e.preventDefault();
  } else if (e.key === 'Enter') {
    if (filtered[focusedIdx]) switchToTab(filtered[focusedIdx]);
  } else if (e.key === 'Escape') {
    window.close();
  }
});

init();
