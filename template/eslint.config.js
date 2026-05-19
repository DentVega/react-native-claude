// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const boundariesPlugin = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'ios/*', 'android/*', 'coverage/*'],
    plugins: {
      boundaries: boundariesPlugin,
    },
    settings: {
      'boundaries/include': ['app/**/*', 'src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'app/**/*' },
        { type: 'feature', pattern: 'src/features/*', mode: 'folder', capture: ['featureName'] },
        { type: 'components', pattern: 'src/components/**/*' },
        { type: 'hooks', pattern: 'src/hooks/**/*' },
        { type: 'services', pattern: 'src/services/**/*' },
        { type: 'lib', pattern: 'src/lib/**/*' },
        { type: 'config', pattern: 'src/config/**/*' },
        { type: 'types', pattern: 'src/types/**/*' },
        { type: 'i18n', pattern: 'src/i18n/**/*' },
        { type: 'test', pattern: 'src/test/**/*' },
        { type: 'constants', pattern: 'src/constants/**/*' },
      ],
    },
    rules: {
      // === Reglas de boundaries (arquitectura) ===
      'boundaries/no-unknown': 'error',
      'boundaries/no-unknown-files': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // app/ puede importar de cualquier lado (orquesta)
            {
              from: 'app',
              allow: [
                'feature',
                'components',
                'hooks',
                'services',
                'lib',
                'config',
                'types',
                'i18n',
                'constants',
              ],
            },
            // Un feature NUNCA importa de otro feature.
            // Solo del mismo feature o de capas compartidas.
            {
              from: 'feature',
              allow: [
                'components',
                'hooks',
                'services',
                'lib',
                'config',
                'types',
                'i18n',
                'constants',
                ['feature', { featureName: '${from.featureName}' }],
              ],
            },
            // components/ es UI pura
            {
              from: 'components',
              allow: ['lib', 'hooks', 'types', 'i18n', 'constants'],
            },
            // hooks/ globales
            {
              from: 'hooks',
              allow: ['lib', 'services', 'types', 'config'],
            },
            // services/ solo de lib, config, types
            {
              from: 'services',
              allow: ['lib', 'config', 'types'],
            },
            // lib/ es pura
            {
              from: 'lib',
              allow: ['types'],
            },
            // config/
            {
              from: 'config',
              allow: ['lib', 'types'],
            },
            // i18n config
            {
              from: 'i18n',
              allow: ['lib', 'config', 'types'],
            },
            // types/ no importa nada
            {
              from: 'types',
              allow: [],
            },
            // constants/
            {
              from: 'constants',
              allow: ['types'],
            },
            // test/ puede importar de donde sea
            {
              from: 'test',
              allow: [
                'feature',
                'components',
                'hooks',
                'services',
                'lib',
                'config',
                'types',
                'i18n',
                'constants',
              ],
            },
          ],
        },
      ],

      // === TypeScript ===
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // === React / RN ===
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/self-closing-comp': 'warn',
      'react-hooks/exhaustive-deps': 'error',

      // === Imports ===
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-default-export': 'warn',
      'import/no-cycle': ['error', { maxDepth: 5 }],

      // === Generales ===
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}', 'babel.config.js', 'metro.config.js'],
    rules: {
      'import/no-default-export': 'off',
      'no-undef': 'off',
      'boundaries/element-types': 'off',
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
]);
