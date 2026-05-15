const { defineConfig } = require('@playwright/test');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname);

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        launchOptions: {
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--headless=new',
          ],
        },
      },
    },
  ],
});
