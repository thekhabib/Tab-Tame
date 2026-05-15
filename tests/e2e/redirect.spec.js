const { test, expect } = require('@playwright/test');
const { launchWithExtension, resetSettings } = require('./helpers');

const DEST_URL = 'https://example.com/';
const TEST_ORIGIN = 'http://localhost';
const TEST_PAGE = `${TEST_ORIGIN}/test`;

function makeHtml(body) {
  return `<!DOCTYPE html><html><body>${body}</body></html>`;
}

const SAME_ORIGIN_LINK = `${TEST_ORIGIN}/other`;
const BLANK_LINK_HTML = makeHtml(`<a id="link" href="${DEST_URL}" target="_blank">Go</a>`);
const SAME_ORIGIN_LINK_HTML = makeHtml(`<a id="link" href="${SAME_ORIGIN_LINK}" target="_blank">Go</a>`);
const WINDOW_OPEN_HTML = makeHtml(`<button id="btn" onclick="window.open('${DEST_URL}', '_blank')">Open</button>`);

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
});

async function openTestPage(html) {
  const page = await context.newPage();
  // Intercept and serve inline HTML at a real http:// URL so content scripts run
  await page.route(`${TEST_ORIGIN}/**`, route => route.fulfill({
    contentType: 'text/html',
    body: html,
  }));
  await page.goto(TEST_PAGE, { waitUntil: 'domcontentloaded' });
  return page;
}

async function noNewPage(ctx, action) {
  let opened = null;
  const listener = p => { opened = p; };
  ctx.on('page', listener);
  await action();
  await new Promise(r => setTimeout(r, 1500));
  ctx.off('page', listener);
  return opened;
}

// ─── Same-tab redirect ────────────────────────────────────────────────────────

test('target=_blank link opens in same tab', async () => {
  const page = await openTestPage(BLANK_LINK_HTML);

  const newPage = await noNewPage(context, () => page.click('#link'));

  expect(newPage).toBeNull();
  await expect(page).toHaveURL(DEST_URL, { timeout: 5000 });
  await page.close();
});

// ─── window.open interception ─────────────────────────────────────────────────

test('window.open redirects in same tab', async () => {
  const page = await openTestPage(WINDOW_OPEN_HTML);

  const newPage = await noNewPage(context, () => page.click('#btn'));

  expect(newPage).toBeNull();
  await expect(page).toHaveURL(DEST_URL, { timeout: 5000 });
  await page.close();
});

// ─── Master toggle disables redirect ─────────────────────────────────────────

test('disabled extension allows new tab', async () => {
  await sw.evaluate(() =>
    new Promise(r => chrome.storage.local.set({ enabled: false }, r))
  );

  const page = await openTestPage(BLANK_LINK_HTML);

  let opened = null;
  const listener = p => { opened = p; };
  context.on('page', listener);
  await page.click('#link');
  await new Promise(r => setTimeout(r, 2000));
  context.off('page', listener);

  expect(opened).not.toBeNull();
  await opened?.close();
  await page.close();
});

// ─── Per-site rule 'new' bypasses redirect on current site ───────────────────

test("per-site rule 'new' allows new tab", async () => {
  // 'new' rule on the CURRENT site (localhost) = skip extension entirely
  await sw.evaluate(() =>
    new Promise(r => chrome.storage.local.set({ siteRules: { localhost: 'new' } }, r))
  );

  const page = await openTestPage(BLANK_LINK_HTML);

  let opened = null;
  const listener = p => { opened = p; };
  context.on('page', listener);
  await page.click('#link');
  await new Promise(r => setTimeout(r, 2000));
  context.off('page', listener);

  expect(opened).not.toBeNull();
  await opened?.close();
  await page.close();
});

// ─── Per-site rule 'same' forces redirect even in focus mode ─────────────────
// focus mode normally skips same-domain links; 'same' rule overrides that

test("per-site rule 'same' forces same-domain redirect in focus mode", async () => {
  await sw.evaluate(() =>
    new Promise(r =>
      chrome.storage.local.set({ focusMode: true, siteRules: { localhost: 'same' } }, r)
    )
  );

  // Same-origin link — focus mode alone would let it open in new tab
  const page = await openTestPage(SAME_ORIGIN_LINK_HTML);

  const newPage = await noNewPage(context, () => page.click('#link'));

  expect(newPage).toBeNull();
  await expect(page).toHaveURL(SAME_ORIGIN_LINK, { timeout: 5000 });
  await page.close();
});
