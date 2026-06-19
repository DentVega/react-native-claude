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
| `building-native-ui` | Expo | Patrones de UI nativa, navegación con Expo Router, Apple HIG, SF Symbols, animaciones y efectos visuales |
| `native-data-fetching` | Expo | Network requests, TanStack Query/SWR, estrategias de cache, manejo de errores, soporte offline |
| `expo-dev-client` | Expo | Builds de desarrollo custom para probar código nativo en device físico con EAS Build |
| `cicd-workflows` | Expo | EAS workflow YAML, pipelines de build, automatización de deployment |
| `expo-deployment` | Expo | EAS Build, App Store, Play Store, TestFlight, web hosting, flujos de submission |
| `upgrading-expo` | Expo | Upgrades paso a paso del SDK, reemplazo de paquetes deprecados, limpieza de caches |
| `eas-update-insights` | Expo | Salud de EAS Updates publicados: crash rates, install/launch counts, unique users |

> Nota: las skills de Expo `expo-tailwind-setup` (NativeWind v5, este template fija v4), `expo-api-routes` (backend en el mismo repo) y `use-dom` (libs solo-web vía DOM components) **no** están en la lista por defecto — agregalas si tu proyecto las necesita.

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

## Principios de diseño de componentes

Reglas concretas para componer UI. Son **decisiones por defecto** — si un caso justifica romperlas, levantá la duda antes de hacerlo.

### 1. Una responsabilidad por componente

- Si para describir lo que hace usás la palabra **"y"** (ej: "renderiza el formulario **y** llama al API **y** maneja errores"), partilo. Una pieza orquesta, otra renderiza.
- Límite informal: **~150 líneas**. Si pasa, dividí — no por la línea per se, sino porque cuando un archivo crece así suele haber dos responsabilidades adentro.
- Container vs presentational es la aplicación concreta de esta regla a feature/screen.

### 2. Componer, no acumular props booleanas

Anti-patrón:
```tsx
<Button primary danger small disabled loading icon="trash" iconPosition="right" />
```

Mejor:
```tsx
<Button variant="danger" size="sm" loading>
  <Trash /> Eliminar
</Button>
```

- Variantes complejas: definirlas con `cva` (class-variance-authority), no con cadenas de `&&` en `className`.
- Para combinaciones que crecen, **compound components**: `<Modal><Modal.Header/><Modal.Body/><Modal.Footer/></Modal>`.
- Si el componente acepta más de **3-4 props booleanas**, casi siempre se puede reemplazar por `children`, slots, o variantes.
- Consultá la skill `composition-patterns` (Vercel) cuando estés diseñando un componente reutilizable nuevo.

### 3. Props chicas, semánticas, sin "configuración"

- Pasá `children` y callbacks (`onSubmit`, `onPress`) antes que objetos de configuración (`{ submitLabel, submitColor, submitLoading, ... }`).
- Si un componente necesita 8+ props para funcionar, repensá si no son **dos componentes** disfrazados de uno.
- Evitá props de tipo `any` o `Record<string, unknown>` — eso esconde acoplamientos.

### 4. Primitivos compartidos vs componentes de feature

- **`src/components/ui/`** → primitivos reutilizables sin lógica de negocio: `Button`, `Input`, `Card`, `ScreenState`. Visten el sistema de diseño.
- **`src/features/X/components/`** → componentes específicos del feature: `LoginForm`, `ProductCard`. Conocen los tipos del feature.
- **Regla de promoción**: un componente sube de `features/X/components/` a `components/ui/` **solo cuando se usa en 2+ features**. Antes de eso, vive en su feature.
- **Regla inversa**: si un componente en `components/ui/` importa algo de `features/`, está mal ubicado — bajalo al feature.

### 5. Datos: una sola fuente por tipo

Ya está en "Manejo de estado" más arriba; repetido acá porque es un principio de diseño, no solo de estado:

| Tipo de dato | Dónde vive | Cómo se pasa al componente |
|---|---|---|
| Viene del servidor | TanStack Query | Hook (`useUserQuery`) en el container, props al presentational |
| UI / sesión / preferencias | Zustand | Hook (`useAuthStore`) en el container, props al presentational |
| Local a una pantalla | `useState` | Directo en el componente que lo usa |

**Los componentes presentational no leen stores ni queries.** Reciben datos por props. Esa es la regla que los hace fácilmente testeables.

### 6. Inyectar dependencias por props, no por imports — cuando importa

- Para componentes presentational: callbacks (`onSubmit`, `onPress`) en vez de importar servicios adentro. Hace el componente reusable y testeable.
- Para hooks de feature (`useLogin`): pueden importar servicios directamente — no es necesario inyectar todo. La inyección es valiosa **en el límite presentational**, no en cada función.
- No abuses de `Context` para inyectar — es para datos que **muchos descendientes** necesitan (tema, auth user), no para evitar pasar props un nivel.

### 7. Decisiones explícitas, no mágicas

- Si una pantalla tiene un comportamiento sorprendente (auto-refetch, side effect oculto, navegación implícita), **comentar el porqué** una línea — no el qué.
- Preferí código verboso y claro a abstracciones inteligentes que ahorran 3 líneas pero esconden la intención.
- Repetir 2-3 veces algo similar está bien. Abstraé al **tercer caso real**, no por anticipación.

### 8. Tamaño máximo de archivos

Límites duros que hay que verificar **antes** de cerrar un archivo. Si pasa el límite, dividir antes de seguir — no después.

| Tipo de archivo | Límite | Por qué |
|---|---|---|
| Componente presentational (`components/`, `features/X/components/`) | **150 líneas** | Si pasa, casi siempre tiene dos responsabilidades |
| Container / Screen (`features/X/screens/`) | **200 líneas** | Más orquestación, pero si supera, extraer al hook |
| Hook (`hooks/`, `features/X/hooks/`) | **80 líneas** | Hooks largos suelen ser dos hooks pegados |
| Utilidad pura (`lib/`) | **50 líneas por función pública** | Si crece, partir por dominio |
| Service (`services/`, `features/X/services/`) | **150 líneas** | Si crece, partir por recurso/endpoint |
| Store Zustand (`features/X/store.ts`) | **100 líneas** | Si pasa, probablemente conviene dividir en dos stores |
| Test file | sin límite duro, pero **>300 líneas** = revisar si testea más de una unidad |

**Cuando pasás el límite**: NO comentás `// TODO: dividir` y seguís. Dividís ahí mismo. Es más fácil partir ahora que después.

**Excepciones explícitas** (los límites NO aplican):
- Archivos generados (`api.generated.ts`, locales JSON).
- Tipos auto-generados de OpenAPI / GraphQL.

### 9. Reutilización: cuándo y dónde extraer

**Regla de tres**: extraé al **tercer** uso real, no por anticipación. Dos casos similares pueden ser coincidencia; tres es un patrón.

**Mapeo capa-de-origen → destino al extraer**:

| Si lo que se repite es… | Va a… |
|---|---|
| Función pura sin estado, usada en 2+ features | `src/lib/` |
| Hook con lógica reusable, usado en 2+ features | `src/hooks/` |
| Componente visual sin lógica de negocio, usado en 2+ features | `src/components/ui/` |
| Llamada HTTP genérica (auth, file upload) usada en 2+ features | `src/services/` |
| Constante de UI / config compartida | `src/constants/` |

**Antes de extraer, preguntate**:
1. ¿Es **realmente** la misma lógica, o solo se parece? Si los matices entre los tres usos son distintos, no es duplicación — son tres cosas similares.
2. ¿La abstracción genera **más complejidad** que las tres duplicaciones? Si el helper tiene 6 parámetros para cubrir los 3 casos, dejá las 3 duplicaciones.
3. ¿Necesita **escapar del feature**? Lógica que solo tiene sentido dentro de `features/auth/` se queda ahí aunque "se podría usar" en otro lado.

**Cuando estés escribiendo código nuevo y detectes que es similar a algo existente**:
- Si es el **segundo** caso: dejar una nota corta ("similar a X — esperar al tercero para extraer") y seguir con el código duplicado.
- Si es el **tercer** caso: hacer la extracción **en el mismo PR**. No dejar la deuda para "después".

**Qué NO hacer**:
- Crear `<GenericCard>` con 15 props para "soportar todos los casos futuros".
- Mover algo a `lib/` cuando solo lo usa un feature ("por las dudas").
- Abstraer en el **primer** uso porque "obvio que va a venir otro" — casi nunca viene, y cuando viene es distinto.
- Extraer cosas triviales: un `<View className="flex-1">` no necesita abstracción.

### Qué NO seguimos (a propósito)

- **Atomic Design** (atoms/molecules/organisms/templates/pages): la organización **por feature** que ya tenés escala mejor para apps. Sí mantenemos la idea de "primitivos compartidos" via `components/ui/`, pero sin la jerarquía de 5 niveles.
- **SOLID al pie de la letra**: pensado para OOP. Las reglas de arriba cubren lo aplicable a React (SRP, ISP, composición) sin el bagaje de los acrónimos.

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
- **`appId`**: debe coincidir con `expo.ios.bundleIdentifier` y `expo.android.package` de tu `app.json` / `app.config.*`. `/apply-template` lo intenta autocompletar; si quedó como `[PROYECTO_APP_ID]` en `.maestro/config.yaml` y los flows, reemplazalo manualmente antes de correr E2E.

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
