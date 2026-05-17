const { test, expect } = require('@playwright/test');
const { launchWithExtension, resetSettings } = require('./helpers');

let context, sw;

test.beforeAll(async () => {
  ({ context } = await launchWithExtension());
  const sws = context.serviceWorkers();
  sw = sws[0] ?? await context.waitForEvent('serviceworker');
});

test.afterAll(async () => {
  await context.close();
});

test.beforeEach(async () => {
  await resetSettings(sw);
  await sw.evaluate(() => new Promise(r => chrome.storage.local.set({ parkedSessions: [] }, r)));
});

async function openExtraPages(n) {
  const pages = [];
  for (let i = 0; i < n; i++) {
    const p = await context.newPage();
    await p.goto(`https://example.com/?p=${i}`, { waitUntil: 'domcontentloaded' });
    pages.push(p);
  }
  return pages;
}

async function getSessions() {
  return sw.evaluate(() =>
    new Promise(r => chrome.storage.local.get({ parkedSessions: [] }, ({ parkedSessions }) => r(parkedSessions)))
  );
}

async function callHandler(name, ...args) {
  return sw.evaluate(({ name, args }) => globalThis.__tabtame[name](...args), { name, args });
}

test('park_tabs saves non-active non-pinned tabs and closes them', async () => {
  await openExtraPages(3);
  const before = await context.pages();
  expect(before.length).toBeGreaterThanOrEqual(4);

  const res = await callHandler('parkTabs');
  expect(res.ok).toBe(true);
  expect(res.count).toBeGreaterThanOrEqual(2);

  const sessions = await getSessions();
  expect(sessions.length).toBe(1);
  expect(sessions[0].tabs.length).toBe(res.count);
  expect(sessions[0].name).toMatch(/\d{4}-\d{2}-\d{2}/);

  // After park, fewer pages remain (active tab kept)
  await new Promise(r => setTimeout(r, 500));
  const remaining = context.pages().filter(p => !p.isClosed());
  expect(remaining.length).toBeLessThan(before.length);
});

test('park_tabs returns empty when only active/pinned tabs exist', async () => {
  const res = await callHandler('parkTabs');
  expect(res.ok).toBe(false);
  expect(res.reason).toBe('empty');

  const sessions = await getSessions();
  expect(sessions.length).toBe(0);
});

test('restore_session opens tabs and removes session', async () => {
  // Seed a session directly
  await sw.evaluate(() => new Promise(r => chrome.storage.local.set({
    parkedSessions: [{
      id: 'test_session',
      name: 'Test',
      createdAt: new Date().toISOString(),
      tabs: [
        { url: 'https://example.com/a', title: 'A', favIconUrl: '' },
        { url: 'https://example.com/b', title: 'B', favIconUrl: '' }
      ]
    }]
  }, r)));

  const res = await callHandler('restoreSession', 'test_session');
  expect(res.ok).toBe(true);
  expect(res.count).toBe(2);

  const sessions = await getSessions();
  expect(sessions.length).toBe(0);
});

test('restore_tab opens single tab and drops it from session', async () => {
  await sw.evaluate(() => new Promise(r => chrome.storage.local.set({
    parkedSessions: [{
      id: 'test_session',
      name: 'Test',
      createdAt: new Date().toISOString(),
      tabs: [
        { url: 'https://example.com/a', title: 'A', favIconUrl: '' },
        { url: 'https://example.com/b', title: 'B', favIconUrl: '' }
      ]
    }]
  }, r)));

  const res = await callHandler('restoreTab', 'test_session', 0);
  expect(res.ok).toBe(true);

  const sessions = await getSessions();
  expect(sessions.length).toBe(1);
  expect(sessions[0].tabs.length).toBe(1);
  expect(sessions[0].tabs[0].url).toBe('https://example.com/b');
});

test('delete_session removes session', async () => {
  await sw.evaluate(() => new Promise(r => chrome.storage.local.set({
    parkedSessions: [{ id: 's1', name: 'X', createdAt: new Date().toISOString(), tabs: [{ url: 'https://example.com/', title: 'X', favIconUrl: '' }] }]
  }, r)));

  const res = await callHandler('deleteSession', 's1');
  expect(res.ok).toBe(true);
  expect((await getSessions()).length).toBe(0);
});

test('rename_session updates name', async () => {
  await sw.evaluate(() => new Promise(r => chrome.storage.local.set({
    parkedSessions: [{ id: 's1', name: 'Old', createdAt: new Date().toISOString(), tabs: [{ url: 'https://example.com/', title: 'X', favIconUrl: '' }] }]
  }, r)));

  const res = await callHandler('renameSession', 's1', 'Renamed');
  expect(res.ok).toBe(true);
  const sessions = await getSessions();
  expect(sessions[0].name).toBe('Renamed');
});
