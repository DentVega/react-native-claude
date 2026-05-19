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

### Added
- _(agregar aquí cambios pendientes de release)_

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

[Unreleased]: https://github.com/REEMPLAZAR_USUARIO/expo-config-template/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/REEMPLAZAR_USUARIO/expo-config-template/releases/tag/v1.0.0
