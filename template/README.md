# Template de configuración — Expo + TypeScript

Set base de configs para arrancar cualquier proyecto móvil con Expo, NativeWind, Zustand, i18n, testing y **arquitectura por capas forzada por ESLint**.

## Cómo usarlo

### 1. Crear proyecto Expo

```bash
pnpm create expo-app mi-app --template blank-typescript
cd mi-app
```

### 2. Copiar archivos del template

Copia al root del proyecto:

```
CLAUDE.md
.claude/settings.json
.claude/commands/feature.md
.vscode/settings.json
.vscode/extensions.json
.husky/pre-commit
.husky/commit-msg
.maestro/config.yaml
.maestro/flows/smoke.yaml
.maestro/flows/login.yaml
app/_layout.tsx
src/lib/cn.ts
src/lib/logger.ts
src/config/env.ts
src/services/api.ts
src/services/queryClient.ts
src/i18n/index.ts
src/i18n/locales/es.json
src/i18n/locales/en.json
src/components/ui/Button.tsx
src/components/ui/ScreenState.tsx
tsconfig.json
.prettierrc
.prettierignore
eslint.config.js
babel.config.js
metro.config.js
tailwind.config.js
global.css
jest.config.js
jest.setup.ts
commitlint.config.js
.editorconfig
.env.example
.gitignore
```

Mergea los scripts/deps de `package.json` con el tuyo (no lo sobrescribas entero porque Expo ya generó uno con versiones compatibles).

### 3. Crear estructura de carpetas

```bash
mkdir -p src/{features,components/ui,hooks,services,lib,config,types,i18n/locales,constants,test}
mkdir -p assets/{images,icons,fonts}
```

### 4. Instalar dependencias

```bash
# Core stack
pnpm add expo-router expo-localization expo-secure-store expo-constants expo-linking expo-status-bar expo-font \
  react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated react-native-svg \
  nativewind tailwindcss@^3.4.0 clsx tailwind-merge class-variance-authority \
  zustand @tanstack/react-query \
  react-hook-form zod @hookform/resolvers \
  i18next react-i18next \
  @react-native-async-storage/async-storage \
  lucide-react-native

# Dev
pnpm add -D eslint eslint-config-expo eslint-config-prettier eslint-plugin-boundaries \
  prettier \
  babel-plugin-module-resolver react-native-svg-transformer \
  jest jest-expo @testing-library/react-native @testing-library/jest-native @types/jest \
  husky lint-staged \
  @commitlint/cli @commitlint/config-conventional
```

### 5. Activar Husky

```bash
pnpm exec husky init
chmod +x .husky/pre-commit .husky/commit-msg
```

### 6. Importar `global.css` en el layout raíz

En `app/_layout.tsx`:

```tsx
import '../global.css';
```

### 7. Verificar que todo corre

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm start
```

### 8. (Opcional pero recomendado) Instalar skills externas

Skills oficiales de Callstack y Vercel que potencian Claude Code para RN. Se instalan **a nivel usuario** (no por proyecto), una sola vez:

```bash
# Callstack: performance, optimización, workflows de RN
git clone https://github.com/callstackincubator/agent-skills.git \
  ~/.claude/skills/callstack-agent-skills

# Vercel: patrones de React, RN y composición de componentes
git clone https://github.com/vercel-labs/agent-skills.git \
  ~/.claude/skills/vercel-agent-skills
```

Claude Code las descubre automáticamente. El `CLAUDE.md` del template ya las menciona, así que Claude sabrá cuándo apoyarse en ellas.

Para actualizarlas más adelante: `cd ~/.claude/skills/<repo> && git pull`.

## Slash commands incluidos

### `/feature <nombre>`

Scaffoldea un feature completo siguiendo la arquitectura del proyecto. Crea `src/features/<nombre>/` con `screens/`, `components/`, `hooks/`, `services/`, `store.ts`, `queries.ts`, `schemas.ts`, `types.ts`.

```
/feature checkout
/feature user-profile
/feature payment-methods
```

El comando valida que el nombre sea kebab-case, que el feature no exista ya, y al terminar corre `typecheck` y `lint` para verificar que cumple las reglas de `boundaries`.

## E2E con Maestro

El template incluye setup base de [Maestro](https://maestro.mobile.dev/) en `.maestro/`.

### Instalar Maestro (una vez por máquina)

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

### Configurar appId

En `.maestro/config.yaml` y en los flows de ejemplo, reemplazar `com.example.app` por el `bundleIdentifier` (iOS) / `package` (Android) real del proyecto, definido en `app.json` / `app.config.ts`.

### Correr los flows

```bash
# Asegúrate de tener un simulador/emulador corriendo y la app instalada
pnpm e2e:smoke    # solo smoke test (rápido, debe pasar siempre)
pnpm e2e          # todos los flows
```

### Cuándo agregar un flow

- Cuando un feature crítico llega a producción (auth, pago, acción principal).
- Antes de un release importante: correr todos los flows en device real.
- En CI: idealmente con Maestro Cloud o un job de GitHub Actions con un emulador.

## Arquitectura forzada por ESLint

El plugin `eslint-plugin-boundaries` impone las reglas de capas definidas en `CLAUDE.md`. Si intentas:

- Importar de un feature dentro de otro feature → **error**.
- Importar de `services/` desde `components/` (UI pura) → **error**.
- Importar de `features/` desde `lib/` (debe ser pura) → **error**.

Para que funcione, **toda la estructura `src/` debe existir** (aunque sea con archivos vacíos), por eso el paso 3.

### Estructura interna de un feature

Cada feature en `src/features/[nombre]/` sigue siempre la misma estructura:

```
features/auth/
  screens/        # Containers (conectan stores, queries, navegación)
  components/     # Presentational (props + callbacks)
  hooks/
  services/       # HTTP del feature
  store.ts        # Zustand del feature
  queries.ts      # Query keys y functions de TanStack Query
  schemas.ts      # Zod schemas
  types.ts
```

## Convención de commits

`commitlint` está activado con preset Conventional Commits. Solo se aceptan commits con formato:

```
feat: descripción
feat(auth): descripción con scope
fix: ...
chore: ...
refactor: ...
test: ...
docs: ...
style: ...
perf: ...
ci: ...
build: ...
revert: ...
```

Si commiteas con otro formato, Husky lo rechaza.

## Qué ajustar por proyecto

- **`CLAUDE.md`**: reemplazar placeholders `[PROYECTO: ...]` y rellenar "Decisiones específicas del proyecto".
- **`tailwind.config.js`**: agregar colores, fuentes y tokens del sistema de diseño.
- **`jest.setup.ts`**: agregar mocks de librerías específicas del proyecto.
- **`package.json`** → `name`: nombre real del proyecto.
- **`src/config/env.ts`**: crear schema Zod con las env vars del proyecto.

## Notas

- ESLint corre con `--max-warnings=0` en lint-staged: cualquier warning bloquea el commit. Si te molesta al inicio, baja a `--max-warnings=10` temporalmente.
- El pre-commit corre `lint-staged` + `typecheck`. En proyectos grandes el typecheck puede tardar; si pasa, muévelo a un `pre-push`.
- `noUncheckedIndexedAccess` está activado en TS: acceder a `arr[0]` devuelve `T | undefined`. Es agresivo pero atrapa muchos bugs.
- Si `boundaries/element-types` te bloquea algo legítimo, la solución casi siempre es **mover código a la capa correcta**, no desactivar la regla. Si dudas, levanta la discusión.
