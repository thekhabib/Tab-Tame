import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['background.js', 'content.js', 'inject.js', 'settings-preload.js', 'popup.js', 'options.js', 'search.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-undef': 'error',
      'no-console': 'off',
    },
  },
  {
    files: ['tests/**/*.js', 'playwright.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, chrome: 'readonly' },
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'test-results/', 'playwright-report/', '.claude/', 'store/'],
  },
];
