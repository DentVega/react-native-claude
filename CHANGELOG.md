# Changelog

Todos los cambios notables de este template se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Tipos de cambios**:
- `Added` — funcionalidad nueva
- `Changed` — cambios en funcionalidad existente
- `Deprecated` — funcionalidad que se va a quitar
- `Removed` — funcionalidad removida
- `Fixed` — bug fixes
- `Security` — fixes de seguridad
- `Breaking` — ⚠️ cambios que requieren acción manual del usuario

## [Unreleased]

---

## [1.1.2] - 2026-05-25

Patch release: el CI `test-template` queda verde de punta a punta (install + typecheck + lint + jest) sobre un proyecto Expo SDK 56 / React 19 / pnpm v11 limpio, y se agregan dos reglas de diseño cuantificadas para que el agente no produzca archivos gigantes ni código duplicado sin querer.

### Added
- Secciones **"Por qué este template"** (6 beneficios) y **"Cuándo NO usarlo"** en el `README.md` raíz, para que un lector nuevo entienda el valor del template (y dónde NO encaja) antes de la lista técnica de features.
- Secciones **8. Tamaño máximo de archivos** y **9. Reutilización: cuándo y dónde extraer** en `template/CLAUDE.md` (dentro de "Principios de diseño de componentes"). Cuantifican límites por tipo de archivo (componentes 150, hooks 80, lib 50/función, etc.) y codifican la regla de tres con un mapeo capa→destino para que Claude considere mover código a `lib/`, `hooks/`, `components/ui/`, `services/` o `constants/` cuando corresponde — sin extraer prematuro.
- `template/pnpm-workspace.yaml` con `allowBuilds: { unrs-resolver: true }` para destrabar el postinstall script de `unrs-resolver` que pnpm v10+ bloquea por defecto (`ERR_PNPM_IGNORED_BUILDS`).
- `template/nativewind-env.d.ts` con `/// <reference types="nativewind/types" />` + `declare module '*.css' {}`. Sin este archivo, TS rompe en cada `className` de View/Text/Pressable y en el side-effect import de `global.css`.
- `react-native-worklets` como dep (peer obligatorio de `react-native-reanimated@4`, sin la cual `@react-native/jest-preset` falla al cargar).
- `@react-native/jest-preset` como devDep (peer obligatorio de `jest-expo` ahora que se movió a paquete separado).
- `@types/node` y `@typescript-eslint/eslint-plugin` como devDeps explícitas (antes eran transitivos frágiles).
- `react-test-renderer: "*"` como devDep (peer de RNTL que pnpm no auto-alineaba).
- `commands/apply-template.md` (Paso 6): documenta que `pnpm-workspace.yaml` se copia tal cual y, en proyectos monorepo, se mergea la lista `allowBuilds`.

### Changed
- `template/package.json`: pin de versiones para compatibilidad con SDK 56 / React 19:
  - `eslint: ^9` (v10 crashea `eslint-plugin-react@7.37`).
  - `jest: ^29` + `@types/jest: ^29` (v30 incompat con `jest-expo@56`).
  - `@babel/core: ^7` (v8 incompat con la mayoría de los plugins existentes).
  - `@testing-library/react-native: ^13` (v14 tenía un bug de binding de `screen` en combinación con jest-expo).
- `template/jest.config.js`: removida la sobreescritura de `transformIgnorePatterns`. Ahora se hereda del preset `jest-expo`, que ya cubre `@react-native/*`, `@expo/*` y el layout `.pnpm/<pkg>@<ver>/node_modules/`.
- `.github/workflows/test-template.yml`: flipeado el orden del merge de `dependencies`/`devDependencies` — ahora el proyecto Expo destino gana en caso de conflicto (sus versiones están alineadas con el SDK). Coincide con la regla documentada en `apply-template.md` Paso 6.

### Fixed
- CI `Test Template` queda 100% verde sobre proyecto Expo limpio. Cadena de fixes resueltos en esta release: postinstall scripts de `unrs-resolver`, key `pnpm` deprecada en `package.json`, comando `bash` interpretando backticks de un comentario inline, regex de pnpm-workspace.yaml v11 (`allowBuilds`), `@types/node` faltante, types de NativeWind no augmentados, módulos `*.css` no declarados, ESLint v10 + plugin-react crash, jest-expo peer obligatorio, jest 30 incompat con jest-expo 56, regex de `transformIgnorePatterns` sin contemplar pnpm, `@babel/core` v8 incompat, RNTL v14 screen-binding bug, mismatched `react-test-renderer` por orden de merge incorrecto.

---

## [1.1.1] - 2026-05-25

### Added
- Sección **"Principios de diseño de componentes"** en `template/CLAUDE.md` con reglas concretas: una responsabilidad por componente, composición sobre props booleanas, props chicas, promoción de primitivos a `components/ui/`, fuente única por tipo de dato, inyección por props en el borde presentational. Incluye bloque explícito de qué no seguimos (Atomic Design completo, SOLID al pie de la letra).
- Soporte del layout `src/app/` además de `app/` raíz en `eslint.config.js` (boundaries acepta ambos) y en `apply-template` (detecta `APP_DIR`).
- `tsconfig.json#paths` ahora expone `@/assets/*` apuntando a `./assets/*`, y `babel.config.js` agrega el alias equivalente.
- Script `lint:strict` (con `--max-warnings=0`) en `template/package.json`. El `lint` por defecto queda permisivo para no forzar zero-warnings al adoptar el template en proyectos existentes.
- `apply-template` Paso 9b: crea `.env` desde `.env.example` automáticamente si no existe.

### Changed
- `template/tsconfig.json`: removido `baseUrl` (deprecado en TS 6); `paths` pasados a forma relativa; agregado `types: ["jest", "node"]` para que tests y `jest.setup.ts` resuelvan globals.
- `template/jest.config.js`: corregido el typo `setupFilesAfterEach` → `setupFilesAfterEnv` (sin esto, `jest.setup.ts` nunca corría y los mocks no aplicaban).
- `template/src/config/env.ts`: validación **perezosa** (Proxy). Ya no se hace `throw` en import-time, así el template recién aplicado no crashea al boot si todavía no existe `.env`.
- `template/eslint.config.js`: registro explícito del plugin `@typescript-eslint`; elementos de `boundaries` con `mode: 'file'` (boundaries v6 cambió el default a `folder`); agregados los tipos `theme` y `styles`; permitidos imports intra-capa (`lib→lib`, `services→services`, etc.); `components` puede importar de `services` (para `ApiError` en `ScreenState`); overrides para `jest.setup.ts`, `scripts/**`, y configs raíz; soporte de `app/**/*` y `src/app/**/*` en simultáneo.
- `template/eslint.config.js`: removida `@typescript-eslint/consistent-type-imports` del bloque global (requiere typed-linting y crasheaba al lintar archivos `.js`). Documentado cómo reactivarla con un override TS-only si se quiere.
- `template/.husky/pre-commit`: detecta el package manager por lockfile (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, default `npm`) en vez de hardcodear `pnpm`.
- `template/.claude/settings.json`: agregadas variantes `npm`, `yarn` y `bun` de los permisos que antes solo cubrían `pnpm`.
- `template/.claude/commands/feature.md`: paso final no asume `pnpm`.
- `commands/apply-template.md`: detecta `APP_DIR` (`app/` vs `src/app/`); `README.md` clasificado como user-owned; PM-agnostic (`$PKG` en vez de `pnpm` hardcodeado); rewrite explícito de `.husky/pre-commit` después de `husky init` (que lo sobrescribe con `npm test`); warning destacado si quedó `[PROYECTO_APP_ID]` en `.maestro/*.yaml`.

### Removed
- `@testing-library/jest-native` de `template/package.json#devDependencies` y la línea `import '@testing-library/jest-native/extend-expect'` de `template/jest.setup.ts`. La dep estaba deprecada y rompía `npm install` con `ERESOLVE` en React 19. RNTL v12.4+ ya trae los matchers (`toBeOnTheScreen`, `toHaveStyle`, etc.) integrados.

---

## [1.1.0] - 2026-05-25

### Added
- **CLI launcher `expo-config-template`** (`cli/`) — paquete npm con subcomandos `install`, `apply`, `update`, `doctor`. Reemplaza el `curl | bash` como vía recomendada de instalación; el script bash se mantiene como fallback.
- Tests de ejemplo en el template: `src/lib/cn.test.ts` y `src/components/ui/Button.test.tsx`.
- Helper `src/test/renderWithProviders.tsx` (QueryClient + i18n).
- Documento `docs/design-decisions.md` con el contexto completo del diseño del template.
- Referencia a las 7 skills oficiales de Expo (`building-native-ui`, `native-data-fetching`, `expo-dev-client`, `cicd-workflows`, `expo-deployment`, `upgrading-expo`, `eas-update-insights`) en `template/CLAUDE.md` y comando de instalación `bunx skills add expo/skills` en los READMEs.

### Changed
- `jest.setup.ts` del template ahora incluye mocks de `react-native-reanimated`, `AsyncStorage`, `NetInfo` y `expo-secure-store`. Removido el mock obsoleto de `NativeAnimatedHelper`.
- `.maestro/config.yaml` y los flows usan placeholder `[PROYECTO_APP_ID]` en vez de `com.example.app` hardcodeado.
- `/apply-template` ahora autocompleta el `appId` de Maestro leyendo `app.json` / `app.config.*` (Paso 5b).
- `CLAUDE.md` del template documenta la regla del `appId` de Maestro.

---

## [1.0.0] - 2026-05-19

Primera versión pública. Base completa para apps Expo con TypeScript, NativeWind, Zustand, TanStack Query, i18n y testing.

### Added

**Configuración core**
- `tsconfig.json` con `strict: true` + `noUncheckedIndexedAccess` + alias `@/*`
- `eslint.config.js` (flat config) con preset Expo + Prettier + `eslint-plugin-boundaries`
- `eslint-plugin-boundaries` configurado para forzar reglas de capas (features aislados, container/presentational)
- `.prettierrc` con comillas simples, semicolons, ancho 100
- `babel.config.js` con NativeWind y alias `@/*`
- `metro.config.js` con NativeWind
- `tailwind.config.js` con preset NativeWind v4
- `commitlint.config.js` con Conventional Commits

**Arquitectura forzada**
- Capas: `app/`, `features/`, `components/`, `hooks/`, `services/`, `lib/`, `config/`, `types/`, `i18n/`, `constants/`, `test/`
- Reglas: features aislados, `lib/` sin deps del proyecto, container/presentational por feature
- Estructura interna de feature: `screens/`, `components/`, `hooks/`, `services/`, `store.ts`, `queries.ts`, `schemas.ts`, `types.ts`

**Stack**
- NativeWind v4 + `cn()` helper (`clsx` + `tailwind-merge`)
- Zustand para estado cliente
- TanStack Query con `QueryClient` configurado para móvil:
  - `onlineManager` con `@react-native-community/netinfo`
  - `focusManager` con `AppState`
  - Retry inteligente (no reintenta 4xx)
- React Hook Form + Zod para formularios
- `i18next` + `expo-localization` con español default y fallback a inglés

**Archivos base**
- `src/lib/cn.ts` — helper de Tailwind
- `src/lib/logger.ts` — wrapper sobre console, silencia info/debug en prod
- `src/config/env.ts` — validación Zod de env vars, falla rápido
- `src/services/api.ts` — cliente HTTP con `ApiError`, header de auth
- `src/services/queryClient.ts` — QueryClient configurado para mobile
- `src/i18n/index.ts` + locales `es.json` + `en.json`
- `src/components/ui/Button.tsx` — botón primitivo de ejemplo
- `src/components/ui/ScreenState.tsx` — componente unificado loading/error/empty para queries
- `app/_layout.tsx` — layout raíz con QueryClientProvider, SafeArea, i18n, splash hasta fuentes

**Testing**
- Jest + jest-expo + React Native Testing Library
- `jest.config.js` con `moduleNameMapper` para alias `@/*`
- Maestro para E2E con flows de ejemplo (`smoke.yaml`, `login.yaml`)
- Scripts `pnpm e2e` y `pnpm e2e:smoke`

**Workflow**
- Husky + lint-staged: pre-commit corre lint + typecheck
- Husky commit-msg: commitlint con Conventional Commits
- `.editorconfig` para consistencia entre editores
- `.gitignore` para Expo managed

**Claude Code**
- `CLAUDE.md` completo con stack, arquitectura, convenciones, qué sí/no hacer
- `.claude/settings.json` con permisos de comandos preconfigurados
- `.claude/commands/feature.md` — slash command `/feature <nombre>` para scaffold de features
- Sección de skills externas (Callstack, Vercel) documentada

**VSCode**
- `.vscode/settings.json` con format on save, ESLint, IntelliSense de Tailwind para `cn()`, `clsx()`, `cva()`
- `.vscode/extensions.json` con extensiones recomendadas

**Infraestructura del template**
- `commands/apply-template.md` — slash command para aplicar el template a un proyecto
- `commands/update-template.md` — slash command para actualizar el template
- `scripts/install-commands.sh` — instalador de los comandos en `~/.claude/commands/`

[Unreleased]: https://github.com/DentVega/react-native-claude/compare/v1.1.2...HEAD
[1.1.2]: https://github.com/DentVega/react-native-claude/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/DentVega/react-native-claude/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/DentVega/react-native-claude/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/DentVega/react-native-claude/releases/tag/v1.0.0
