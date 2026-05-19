# CLAUDE.md

> Plantilla base para apps móviles con Expo. Ajusta las secciones marcadas con `[PROYECTO]` al inicio de cada nuevo proyecto.

## Sobre este proyecto

- **Nombre**: `[PROYECTO: nombre]`
- **Descripción**: `[PROYECTO: una línea sobre qué hace la app]`
- **Plataformas**: iOS y Android

## Stack técnico

- **Framework**: Expo (SDK más reciente estable) con React Native
- **Lenguaje**: TypeScript con `strict: true`
- **Gestor de paquetes**: pnpm (preferido) — si el proyecto ya usa otro, respétalo
- **Node**: versión LTS actual (verificar con `node -v`)

### Librerías estándar

| Área | Librería | Notas |
|---|---|---|
| Navegación | Expo Router (file-based) | Rutas en `app/`, layouts con `_layout.tsx` |
| Estado cliente | Zustand | Solo para UI, sesión, preferencias |
| Estado servidor | TanStack Query | Para todo lo que venga de API |
| Estilos | NativeWind v4 | Tailwind classes, evitar `style={}` inline |
| Formularios | React Hook Form + Zod | Validación con schemas Zod |
| HTTP | fetch nativo o axios | Wrapper en `src/services/api.ts` |
| Almacenamiento | `expo-secure-store` (tokens) / `@react-native-async-storage/async-storage` (resto) | Nunca guardar tokens en AsyncStorage |
| i18n | `i18next` + `react-i18next` + `expo-localization` | Idiomas: `es` (default) y `en` |
| Testing | Jest + React Native Testing Library | Tests junto al archivo: `Componente.test.tsx` |
| Iconos | `lucide-react-native` | Consistencia entre web y móvil |

---

## Skills externas instaladas

Las siguientes Agent Skills están instaladas a nivel usuario (`~/.claude/skills/`) y disponibles automáticamente. Claude debe consultarlas cuando la tarea entre en su dominio.

| Skill | Origen | Cuándo usar |
|---|---|---|
| `react-native-best-practices` | Callstack | Optimización de FPS, TTI, listas (FlashList), animaciones (Reanimated), memory leaks, bundle size, Hermes, Turbo Modules |
| `vercel-react-native-skills` | Vercel | Patrones de arquitectura RN, optimizaciones específicas de móvil, configuración por plataforma |
| `react-best-practices` | Vercel | Waterfalls de requests, re-renders, optimización de React puro, patrones de data fetching |
| `composition-patterns` | Vercel | Diseño de componentes UI reusables, compound components, evitar boolean prop hell |
| `github` / `github-actions` | Callstack | Workflows de PR, CI/CD para apps RN |

**Reglas de precedencia**:
- Cuando una skill recomienda algo que **contradice** este `CLAUDE.md`, gana este `CLAUDE.md` (refleja decisiones del proyecto).
- Cuando una skill **complementa** este `CLAUDE.md` (ej. una optimización de FPS), seguila.
- Si la recomendación de una skill rompe una regla de `eslint-plugin-boundaries`, **no** la apliques — levantá la duda con el usuario.

---

## Slash commands disponibles

| Comando | Qué hace |
|---|---|
| `/feature <nombre>` | Scaffold de un feature nuevo siguiendo la arquitectura (capas, container/presentational, Zustand, queries, schemas) |

---

## Arquitectura

### Capas del proyecto

El código está organizado en capas con **reglas estrictas de dependencia**. Estas reglas las fuerza `eslint-plugin-boundaries` — no son sugerencias.

```
app/         → Rutas de Expo Router. Solo orquesta, no lógica.
src/
  features/  → Lógica por dominio (auth, profile, payments...).
  components/→ Componentes reutilizables, sin lógica de negocio.
  hooks/     → Hooks globales (no atados a un feature).
  services/  → Clientes HTTP, instancias compartidas (queryClient, i18n...).
  lib/       → Utilidades puras. Cero dependencias del proyecto.
  config/    → Variables de entorno validadas, constantes.
  types/     → Tipos globales y de API.
  i18n/      → Configuración i18next y locales.
  test/      → Helpers de testing.
```

### Reglas de dependencia (forzadas por ESLint)

| Capa | Puede importar de |
|---|---|
| `app/` | Cualquier capa (orquesta) |
| `features/A` | `components`, `hooks`, `services`, `lib`, `config`, `types`, `i18n` |
| `features/A` | ❌ **NUNCA** de `features/B` |
| `components/` | `lib`, `hooks` (solo genéricos), `types` |
| `hooks/` | `lib`, `services`, `types` |
| `services/` | `lib`, `config`, `types` |
| `lib/` | Solo de sí misma. Cero deps del proyecto. |
| `config/` | `lib`, `types` |

**Si un feature necesita algo de otro feature**: súbelo a `src/` (a `components/`, `hooks/`, `services/` o `lib/` según corresponda). Los features son aislados por diseño.

### Estructura interna de un feature

```
features/auth/
  screens/
    LoginScreen.tsx         # Container: conecta hooks, state, side effects
    RegisterScreen.tsx
  components/
    LoginForm.tsx           # Presentational: recibe props y callbacks
    SocialButtons.tsx
  hooks/
    useLogin.ts
    useAuthSession.ts
  services/
    authApi.ts              # Llamadas HTTP del feature
  store.ts                  # Store Zustand del feature
  queries.ts                # Query keys y query functions de TanStack Query
  schemas.ts                # Schemas Zod del feature
  types.ts                  # Tipos del feature
  index.ts                  # (Opcional) re-exports públicos
```

**Container vs Presentational**:
- `screens/` → conecta con stores, queries, navegación. Tiene lógica.
- `components/` → recibe props y callbacks. No conoce stores ni queries. **Tests fáciles**.

### Rol de `app/` (rutas)

Los archivos en `app/` son **solo orquestación**. No deben tener lógica de negocio.

```tsx
// app/(auth)/login.tsx — máximo ~40 líneas
import { LoginScreen } from '@/features/auth/screens/LoginScreen';

export default function LoginRoute() {
  return <LoginScreen />;
}
```

Si un archivo de ruta supera 40 líneas, mueve lógica al feature.

### Convenciones de Expo Router

- **Grupos**: paréntesis. `(auth)`, `(tabs)`, `(modals)`.
- **Params dinámicos**: `[id].tsx`, `[...slug].tsx`.
- **Layouts**: siempre `_layout.tsx`.
- **Default export** solo en archivos de ruta (Expo Router lo requiere).
- **Pantallas reales**: viven en `features/[x]/screens/XScreen.tsx`.

### Imports y barrel exports

- **Imports directos por defecto**: `import { LoginForm } from '@/features/auth/components/LoginForm'`.
- **Barrel exports (`index.ts`)** permitidos solo en:
  - `components/ui/` → `import { Button, Input } from '@/components/ui'`
  - `lib/` → utilidades muy usadas
  - Raíz de un feature (`features/auth/index.ts`) si expone una API pública limitada
- **Nunca**: barrel exports anidados o que crucen capas.

### Manejo de estado: regla clave

- **¿Viene del servidor?** → TanStack Query. Nunca lo dupliques en Zustand.
- **¿Es estado de UI / sesión / preferencias?** → Zustand.
- **¿Es estado local de una pantalla?** → `useState` / `useReducer`.

Anti-patrón típico: tener `user` en una query Y en un store Zustand. Elige uno.

### Manejo de estados de carga y error

Toda pantalla que dependa de datos remotos usa el componente unificado `<ScreenState>` (en `src/components/ui/ScreenState.tsx`) que maneja loading/error/empty:

```tsx
<ScreenState query={userQuery}>
  {(data) => <UserProfile user={data} />}
</ScreenState>
```

**Reglas**:
- Error boundaries: uno en la raíz (`app/_layout.tsx`) y opcionalmente uno por grupo de rutas críticas.
- Loading: skeletons > spinners. Nunca pantallas en blanco.
- Empty states: siempre con CTA o mensaje accionable, nunca "No hay datos" pelado.

### Variables de entorno

- Prefijo obligatorio `EXPO_PUBLIC_` para todo lo accesible desde cliente.
- **Validadas con Zod** en `src/config/env.ts`. Si falta una env crítica, la app falla al arrancar (no en runtime aleatorio).
- `.env.example` siempre commiteado y actualizado cuando se agrega una nueva variable.
- `.env`, `.env.local`, `.env.production` **nunca** se commitean.

```ts
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

### Tipos del backend

`[PROYECTO: elegir uno]`:
- **OpenAPI** → generar con `openapi-typescript`, salida a `src/types/api.generated.ts`.
- **GraphQL** → `graphql-codegen`.
- **Manual** → `src/types/api.ts`, con disclaimer de que debe mantenerse sincronizado.

**Nunca** escribir tipos a mano que dupliquen tipos generados.

### Assets

- **Imágenes**: `assets/images/`, formato `.webp` por defecto (mejor compresión), naming `kebab-case`.
- **SVGs**: como componentes con `react-native-svg-transformer`. Importar como `import Logo from '@/assets/icons/logo.svg'`.
- **Fuentes**: cargadas con `expo-font` en `app/_layout.tsx`, splash visible hasta que estén listas.
- **Iconos UI**: usar `lucide-react-native`, no importar SVGs sueltos para iconos del sistema.

### Convención de commits

Conventional Commits forzado por `commitlint`:

```
feat: nueva funcionalidad
fix: corrección de bug
chore: tareas de mantenimiento (deps, configs)
refactor: cambio interno sin cambio funcional
test: agregar o modificar tests
docs: documentación
style: formato (lint, prettier)
perf: mejora de rendimiento
```

Scope opcional: `feat(auth): agregar login con Google`.

---

## Convenciones de código

### Nombres
- Componentes: `PascalCase` (archivo y export). `UserCard.tsx` exporta `UserCard`.
- Hooks: `camelCase` con prefijo `use`. `useAuthSession.ts`.
- Utilidades, servicios: `camelCase`. `formatCurrency.ts`.
- Schemas Zod: `camelCase` con sufijo `Schema`. `loginSchema`.
- Tipos inferidos de Zod: `PascalCase`, sin sufijo. `type Login = z.infer<typeof loginSchema>`.
- Constantes: `UPPER_SNAKE_CASE` dentro del archivo.
- Tipos e interfaces: `PascalCase`, sin prefijo `I`.
- Stores Zustand: `useXStore`. `useAuthStore`.
- Query keys: tuplas. `['user', id]`, `['posts', { page, filter }]`.

### TypeScript
- `strict: true` siempre. Prohibido `any` — usar `unknown` y narrow.
- `noUncheckedIndexedAccess: true`: `arr[0]` es `T | undefined`, manejarlo.
- Preferir `type` sobre `interface` salvo para extender clases o merging.
- Props tipadas como `type Props = { ... }` y `function Componente({ ... }: Props)`.
- Tipos inferidos siempre que sea posible — no anotar lo obvio.

### Imports
Orden (lo fuerza ESLint):
1. React/RN
2. Librerías externas
3. Internos del proyecto (`@/...`)
4. Relativos
5. Tipos

Alias `@/*` → `src/*` configurado en `tsconfig.json` y `babel.config.js`.

### Componentes
- Exports nombrados, no `default` (excepto rutas de Expo Router).
- Un componente por archivo.
- Si pasa de ~150 líneas, dividir.
- Props desestructuradas en la firma.
- Sin lógica de fetching en componentes presentational.

### Estilos (NativeWind)
- Clases Tailwind en `className`.
- Estilos condicionales: helper `cn()` en `src/lib/cn.ts` (combina `clsx` + `tailwind-merge`).
- Variantes complejas: `cva` (class-variance-authority).
- Evitar `StyleSheet.create` salvo casos donde NativeWind no llegue (ej. animaciones con valores compartidos).
- Sistema de diseño en `tailwind.config.js` → `theme.extend`.

---

## i18n

- Idioma por defecto: **español**. Fallback: inglés.
- Todo texto visible al usuario debe pasar por `t()`. Sin strings hardcodeadas en JSX.
- Claves jerárquicas: `auth.login.title`, `errors.network.timeout`.
- Detectar idioma del dispositivo con `expo-localization` al inicio.
- Al agregar una nueva clave, agregarla en **ambos** locales (`es.json` y `en.json`) en el mismo cambio.

---

## Testing

### Dos niveles, propósitos distintos

| Nivel | Herramienta | Cubre | NO cubre |
|---|---|---|---|
| Unit / Integration | Jest + React Native Testing Library | Componentes presentational, hooks custom, stores Zustand, utilidades, validaciones Zod, lógica de containers | Navegación real, gestos, performance, animaciones nativas |
| E2E | Maestro | Flujos completos, smoke tests pre-release, permisos, deep links, comportamiento en device real | Edge cases de lógica interna |

### Jest + RNTL — Reglas

- Cobertura mínima esperada: **componentes con lógica, hooks custom, utilidades puras, lógica de stores**.
- No testear: estilos, librerías de terceros, mocks triviales, componentes presentational triviales.
- Patrón AAA (Arrange, Act, Assert).
- Archivo de test junto al código: `Button.tsx` + `Button.test.tsx`.
- Mock de navegación y stores con helpers en `src/test/`.
- **Containers**: mockear queries/stores. **Presentational**: solo props.
- Para hooks que usan TanStack Query, envolver con `QueryClientProvider` en un helper de `src/test/renderWithProviders.tsx`.

### Maestro — Reglas

- Flows en `.maestro/flows/<nombre>.yaml`.
- **1 flow por feature crítico**: auth, pago, acción principal. No es necesario cubrir todo.
- Selectores: preferir `id:` (testID) sobre `text:`. Los textos cambian con i18n.
- Agregar `testID` en componentes que vayan a tocarse en E2E. Naming: `<feature>-<elemento>` (ej. `login-submit`, `home-cta`).
- Correr E2E **antes de cada release** (manual o en CI con Maestro Cloud / EAS Build).
- `pnpm e2e:smoke` se corre rápido y debería pasar siempre — si falla, hay algo grave.

### Comandos

```bash
pnpm test           # Jest
pnpm test:watch     # Jest watch
pnpm test:coverage  # Jest con cobertura
pnpm e2e            # Maestro: todos los flows
pnpm e2e:smoke      # Maestro: solo smoke test
```

---

## Accesibilidad

- Todo elemento interactivo debe tener `accessibilityLabel` y `accessibilityRole`.
- Probar con VoiceOver (iOS) y TalkBack (Android) antes de cerrar features importantes.
- Contraste mínimo AA. Tamaño táctil mínimo 44x44.
- Labels en formularios siempre asociados al input.

---

## Comandos

```bash
pnpm start              # Expo dev server
pnpm ios                # Correr en simulador iOS
pnpm android            # Correr en emulador Android
pnpm lint               # ESLint (incluye reglas de boundaries)
pnpm typecheck          # tsc --noEmit
pnpm test               # Jest
pnpm test:watch         # Jest watch mode
```

---

## Qué SÍ hacer

- Antes de cerrar una tarea: correr `pnpm lint && pnpm typecheck && pnpm test`.
- Preguntar antes de instalar una librería nueva. Justificar por qué no se puede con lo ya existente.
- Si una pantalla nueva necesita strings, agregarlos a `es.json` Y `en.json` en el mismo cambio.
- Si modificas un store o un query key, buscar todos los usos antes de cambiar la firma.
- Para features nuevos, seguir la estructura de `features/[nombre]/`.
- Si un feature necesita lógica de otro feature: subir esa lógica a `src/` (componente, hook, service, o lib).
- Si agregas una variable de entorno: actualizar `.env.example` Y el schema Zod en `src/config/env.ts`.

## Qué NO hacer

- No usar `any`. Si no sabes el tipo, `unknown` + narrowing.
- No tocar `ios/` ni `android/` directamente — esto es Expo managed. Si hace falta nativo, usar config plugins o `expo prebuild` previa discusión.
- No commitear `.env`. Solo `.env.example`.
- No hardcodear URLs ni keys — usar `src/config/env.ts`.
- No usar `default export` en componentes (excepto archivos de ruta de Expo Router).
- No mezclar lógica de navegación con lógica de negocio en las pantallas — extraer a hooks.
- No instalar librerías sin chequear que sean compatibles con Expo (revisar el directorio de Expo).
- No usar `console.log` en código que se commitea — usar el logger del proyecto.
- **No importar entre features**. Si lo necesitas, subir a `src/`.
- **No poner lógica de negocio en `app/`**. Solo orquestación.
- No duplicar estado del servidor en Zustand. Una sola fuente de verdad.
- No usar barrel exports anidados o que crucen capas — solo donde está permitido (`components/ui/`, `lib/`, raíz de feature).

---

## Decisiones específicas del proyecto

> Esta sección se llena por proyecto. Borrar lo que no aplique.

- **Backend**: `[PROYECTO: REST, GraphQL, Firebase, Supabase, propio, etc.]`
- **Generación de tipos del backend**: `[PROYECTO: openapi-typescript / graphql-codegen / manual]`
- **Autenticación**: `[PROYECTO: si aplica, qué proveedor y flujo]`
- **Analytics / Crash reporting**: `[PROYECTO: PostHog, Sentry, etc.]`
- **Deep linking**: `[PROYECTO: esquema y rutas]`
- **Push notifications**: `[PROYECTO: si aplica]`
- **Build / Deploy**: EAS Build + EAS Submit. Perfiles en `eas.json`.

---

## Notas para Claude

- Si una decisión técnica importante no está cubierta acá, pregunta antes de elegir.
- Si encuentras inconsistencias entre este archivo y el código existente, señálalas — el código puede estar desactualizado o el archivo puede necesitar ajuste.
- Cuando generes código, asume el stack y la arquitectura de arriba salvo que la sección "Decisiones específicas del proyecto" diga lo contrario.
- Si una regla de arquitectura (capas, imports entre features, container/presentational) te obliga a duplicar mucho código, **levanta la duda** antes de duplicar — probablemente algo debe subir a `src/`.
- Cuando crees un feature nuevo, sigue exactamente la estructura interna definida (`screens/`, `components/`, `hooks/`, `services/`, `store.ts`, `queries.ts`, `schemas.ts`, `types.ts`).
