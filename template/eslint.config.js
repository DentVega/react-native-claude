// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const boundariesPlugin = require('eslint-plugin-boundaries');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

// Soportamos dos layouts de expo-router:
// - `app/` en la raíz (default de `pnpm create expo-app`)
// - `src/app/` (común en proyectos que mantienen TODO bajo src/)
// Boundaries acepta arrays de patrones, así matchea ambos.
const APP_PATTERNS = ['app/**/*', 'src/app/**/*'];
const APP_FILES = ['app/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'];

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'ios/*', 'android/*', 'coverage/*'],
    plugins: {
      boundaries: boundariesPlugin,
      // No re-registramos 'import', 'react' ni 'react-hooks': los aporta eslint-config-expo
      // y registrarlos de nuevo crashea con "Cannot redefine plugin".
      '@typescript-eslint': tsPlugin,
    },
    settings: {
      'boundaries/include': ['app/**/*', 'src/**/*'],
      // En boundaries v6 el `mode` por defecto pasó a 'folder'. Para patterns que
      // apuntan a archivos hay que declarar `mode: 'file'` explícitamente; si no,
      // ningún archivo matchea y todo dispara `boundaries/no-unknown-files`.
      'boundaries/elements': [
        { type: 'app', pattern: APP_PATTERNS, mode: 'file' },
        { type: 'feature', pattern: 'src/features/*', mode: 'folder', capture: ['featureName'] },
        { type: 'components', pattern: 'src/components/**/*', mode: 'file' },
        { type: 'hooks', pattern: 'src/hooks/**/*', mode: 'file' },
        { type: 'services', pattern: 'src/services/**/*', mode: 'file' },
        { type: 'lib', pattern: 'src/lib/**/*', mode: 'file' },
        { type: 'config', pattern: 'src/config/**/*', mode: 'file' },
        { type: 'types', pattern: 'src/types/**/*', mode: 'file' },
        { type: 'i18n', pattern: 'src/i18n/**/*', mode: 'file' },
        { type: 'test', pattern: 'src/test/**/*', mode: 'file' },
        { type: 'constants', pattern: 'src/constants/**/*', mode: 'file' },
        { type: 'theme', pattern: 'src/theme/**/*', mode: 'file' },
        { type: 'styles', pattern: 'src/**/*.css', mode: 'file' },
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
            // app/ orquesta — importa de cualquier lado.
            {
              from: 'app',
              allow: [
                'app',
                'feature',
                'components',
                'hooks',
                'services',
                'lib',
                'config',
                'types',
                'i18n',
                'constants',
                'theme',
                'styles',
              ],
            },
            // Un feature NUNCA importa de otro feature. Sí del mismo feature o de capas compartidas.
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
                'theme',
                'styles',
                ['feature', { featureName: '${from.featureName}' }],
              ],
            },
            // components/ — UI. Puede usar otros componentes, servicios para tipos de error,
            // hooks, lib, types, i18n, constants, theme, styles.
            {
              from: 'components',
              allow: [
                'components',
                'lib',
                'hooks',
                'services',
                'types',
                'i18n',
                'constants',
                'theme',
                'styles',
              ],
            },
            // hooks/ globales — pueden usar otros hooks y casi todo lo de bajo nivel.
            {
              from: 'hooks',
              allow: ['hooks', 'lib', 'services', 'types', 'config', 'constants', 'theme'],
            },
            // services/ — pueden componerse entre sí (queryClient → api, etc.).
            {
              from: 'services',
              allow: ['services', 'lib', 'config', 'types'],
            },
            // lib/ — puede importar de sí misma y de types. Cero más.
            {
              from: 'lib',
              allow: ['lib', 'types'],
            },
            // config/
            {
              from: 'config',
              allow: ['config', 'lib', 'types'],
            },
            // i18n config — i18n → locales/, lib, config, types.
            {
              from: 'i18n',
              allow: ['i18n', 'lib', 'config', 'types'],
            },
            // types/ — no importa nada del proyecto.
            {
              from: 'types',
              allow: [],
            },
            // constants/
            {
              from: 'constants',
              allow: ['constants', 'types', 'theme'],
            },
            // theme/ — tokens de marca.
            {
              from: 'theme',
              allow: ['theme', 'types'],
            },
            // styles/ — archivos CSS, no importan código TS.
            {
              from: 'styles',
              allow: [],
            },
            // test/ helpers — pueden usar de donde sea.
            {
              from: 'test',
              allow: [
                'test',
                'feature',
                'components',
                'hooks',
                'services',
                'lib',
                'config',
                'types',
                'i18n',
                'constants',
                'theme',
                'styles',
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
      // `consistent-type-imports` requiere typed-linting (parserOptions.project / projectService)
      // y crashea en archivos `.js` si no está configurado. Lo dejamos fuera del template base
      // para que `eslint .` arranque limpio. Si querés activarlo, agregalo con un override
      // que aplique solo a `**/*.{ts,tsx}` Y configurá `parserOptions.projectService: true`.

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
  // Rutas de expo-router: requieren default exports.
  {
    files: APP_FILES,
    rules: {
      'import/no-default-export': 'off',
    },
  },
  // Configs de raíz (Node, CommonJS, `require`, sin tipos de proyecto).
  {
    files: [
      '*.config.{js,ts,mjs,cjs}',
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.js',
      'commitlint.config.js',
      'eslint.config.js',
      'jest.config.js',
    ],
    rules: {
      'import/no-default-export': 'off',
      'no-undef': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'boundaries/element-types': 'off',
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
    },
  },
  // Setup y scripts Node — corren fuera del bundle de la app.
  {
    files: ['jest.setup.ts', 'scripts/**/*.{js,ts}'],
    rules: {
      'no-undef': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'boundaries/element-types': 'off',
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
    },
  },
  // Tests.
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
]);
