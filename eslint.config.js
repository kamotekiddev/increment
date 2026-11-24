// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // expo-iap is a native module: only the store adapter may import it, so Jest never loads it.
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['src/pro/expoIapAdapter.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'expo-iap', message: 'Only src/pro/expoIapAdapter.ts imports expo-iap.' }],
        },
      ],
    },
  },
]);
