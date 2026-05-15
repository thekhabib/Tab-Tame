const path = require('path');
const { chromium } = require('@playwright/test');

const EXTENSION_PATH = path.resolve(__dirname, '../..');

async function launchWithExtension() {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--headless=new',
      '--no-sandbox',
    ],
  });

  // Wait for service worker to register
  let sw;
  const existing = context.serviceWorkers();
  if (existing.length > 0) {
    sw = existing[0];
  } else {
    sw = await context.waitForEvent('serviceworker');
  }

  const extensionId = new URL(sw.url()).hostname;
  return { context, extensionId };
}

async function resetSettings(sw) {
  await sw.evaluate(() => {
    return new Promise(resolve =>
      chrome.storage.local.set(
        { enabled: true, focusMode: false, duplicateBlocker: false, siteRules: {}, stats: { redirected: 0 } },
        resolve
      )
    );
  });
}

module.exports = { launchWithExtension, resetSettings };
