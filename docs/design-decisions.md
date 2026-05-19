# Conversación de diseño: expo-config-template

> Resumen completo de la conversación inicial donde se diseñó este template, paso a paso. Sirve como contexto para retomar el trabajo en futuras sesiones de Claude (u otra IA).

## Contexto

Brian, miembro de GDG Cochabamba, quiere crear apps mobile con React Native + Expo. Antes de empezar a codear, decidió **invertir tiempo en configurar Claude Code** para que produzca código consistente con sus criterios en todos sus proyectos.

El objetivo evolucionó durante la conversación: empezó como "configurar Claude para una app" y terminó siendo "crear un template reutilizable, versionable y aplicable con un comando" que se pueda compartir con el GDG.

## Decisiones técnicas tomadas

### Stack final

| Tema | Decisión | Por qué |
|---|---|---|
| Framework | **Expo managed** | EAS Build/Update, expo-router, mejor DX. CNG cubre necesidades nativas. RN CLI solo aplica para brownfield. |
| Lenguaje | **TypeScript estricto** desde día uno | `strict: true` + `noUncheckedIndexedAccess` + `noImplicitOverride`. Atrapa muchos bugs. |
| Navegación | **Expo Router** (file-based) | Type-safe, parte del ecosistema Expo. |
| Estado servidor | **TanStack Query** | Estándar de facto. First-class RN support (`onlineManager`, `focusManager`). Mejor que SWR para mobile. RTK Query solo si ya usás Redux. |
| Estado cliente | **Zustand** | Mínimo boilerplate, perfecto con TanStack Query. Redux Toolkit es overkill para apps que arrancás solo. |
| Estilos | **NativeWind v4** | Tailwind familiar, velocidad de iteración, IntelliSense. Alternativa válida era StyleSheet nativo. |
| Forms | **React Hook Form + Zod** | Schema Zod como fuente de verdad, tipo inferido con `z.infer`. |
| i18n | **i18next + expo-localization** | Son complementarios, no alternativas: expo-localization detecta idioma, i18next traduce. Español default, fallback inglés. |
| Testing unit | **Jest + React Native Testing Library** | Estándar. |
| Testing E2E | **Maestro** | YAML declarativo, no requiere instrumentación nativa, recomendado por Expo. Mejor que Detox. |
| Iconos | **lucide-react-native** | Consistencia entre web y móvil. |
| Linter | **ESLint flat config + Prettier** | Preset Expo + `eslint-plugin-boundaries` para forzar arquitectura. |
| Commits | **Conventional Commits** | Forzado con `commitlint` + Husky `commit-msg`. |
| Hooks pre-commit | **Husky + lint-staged + typecheck** | Lint + typecheck antes de cada commit. |
| Formato Prettier | Comillas simples, semicolons, ancho 100 | Decisión de Brian. |

### Por qué se descartaron alternativas

- **SWR**: menos features para mobile, sin onlineManager equivalente.
- **RTK Query**: requiere Redux, innecesario si ya hay Zustand.
- **Detox** (E2E): más complejo que Maestro, requiere instrumentación nativa.
- **react-intl** / `@lingui`: overkill para 2 idiomas.
- **TanStack Form**: menos maduro que React Hook Form.

## Arquitectura definida

### Capas con reglas de dependencia (forzadas por `eslint-plugin-boundaries`)

```
app/         → Rutas Expo Router. Solo orquesta (max ~40 líneas por archivo).
src/
  features/  → Lógica por dominio. Features AISLADOS entre sí.
  components/→ UI pura, sin lógica de negocio.
  hooks/     → Hooks globales.
  services/  → Clientes HTTP, queryClient.
  lib/       → Utilidades puras. CERO deps del proyecto.
  config/    → Env vars validadas con Zod.
  types/     → Tipos globales.
  i18n/      → Configuración i18next.
  test/      → Helpers de testing (renderWithProviders, mocks compartidos).
```

### Reglas estrictas

- **Features no se importan entre sí**: si A necesita algo de B, eso sube a `src/` (componente, hook, service o lib).
- **`app/` solo orquesta**: las pantallas reales viven en `features/[x]/screens/`.
- **Container vs Presentational**: `screens/` conecta stores/queries, `components/` recibe props y callbacks.
- **Estado del servidor en TanStack Query, estado de cliente en Zustand**: nunca duplicar.
- **Barrel exports solo en `components/ui/`, `lib/`, y raíz de feature**.
- **Variables de entorno validadas con Zod al boot**: falla rápido si falta algo.

### Estructura interna de un feature

```
features/[nombre]/
  screens/       # Containers
  components/    # Presentational
  hooks/
  services/      # API del feature
  store.ts       # Zustand
  queries.ts     # TanStack Query keys + functions
  schemas.ts     # Zod
  types.ts
```

Se creó un slash command `/feature <nombre>` que scaffoldea esta estructura.

## Investigación: skills oficiales para RN

Se descubrió que existen skills oficiales relevantes:

- **`callstackincubator/agent-skills`**: `react-native-best-practices` (performance, FPS, TTI, FlashList, Hermes), `upgrading-react-native`, `github`/`github-actions`.
- **`vercel-labs/agent-skills`**: `react-best-practices` (40+ reglas), `vercel-react-native-skills` (16 reglas), `composition-patterns`.

**Conclusión**: son **complementarias** al `CLAUDE.md` del template, no lo reemplazan. El template define arquitectura y convenciones del proyecto; las skills aportan conocimiento de performance y patrones. Se documentaron en `CLAUDE.md` con reglas de precedencia (gana el `CLAUDE.md` si hay conflicto).

Se decidió que las skills se instalen **a nivel usuario** (`~/.claude/skills/`), no por proyecto.

## Evolución de versiones del template

- **v1**: archivos base (`CLAUDE.md`, `tsconfig.json`, ESLint, Prettier, Tailwind, Jest, Husky).
- **v2**: añadida sección de Arquitectura robusta al `CLAUDE.md` y `eslint-plugin-boundaries` configurado.
- **v3**: añadido slash command `/feature`, sección de skills externas en `CLAUDE.md`, commitlint.
- **v4**: añadidos archivos base de código (`cn.ts`, `logger.ts`, `env.ts`, `api.ts`, `queryClient.ts`, `i18n/`, `Button.tsx`, `ScreenState.tsx`, `app/_layout.tsx`), setup de Maestro, sección de Testing expandida.
- **v5 (repo)**: convertido en un repo de GitHub con slash commands `/apply-template` y `/update-template`, CI, docs, changelog.

## Estado actual del repo

### Estructura

```
expo-config-template/
├── README.md                          # Doc pública
├── CHANGELOG.md                       # v1.0.0 documentado, Keep a Changelog
├── CONTRIBUTING.md                    # Reglas de PRs y releases
├── LICENSE                            # MIT
├── .gitignore
├── .github/
│   ├── workflows/test-template.yml    # CI valida el template
│   └── ISSUE_TEMPLATE/                # bug_report + feature_request
├── commands/
│   ├── apply-template.md              # Slash command /apply-template
│   └── update-template.md             # Slash command /update-template
├── scripts/
│   └── install-commands.sh            # Instalador one-liner
├── docs/
│   ├── installation.md
│   └── customization.md
└── template/                          # Archivos del template aplicable
    ├── CLAUDE.md
    ├── README.md
    ├── .claude/{settings.json, commands/feature.md}
    ├── .husky/{pre-commit, commit-msg}
    ├── .maestro/{config.yaml, flows/{smoke,login}.yaml}
    ├── .vscode/{settings.json, extensions.json}
    ├── app/_layout.tsx
    ├── src/
    │   ├── lib/{cn.ts, cn.test.ts, logger.ts}
    │   ├── config/env.ts
    │   ├── services/{api.ts, queryClient.ts}
    │   ├── i18n/{index.ts, locales/{es,en}.json}
    │   ├── test/renderWithProviders.tsx
    │   └── components/ui/{Button.tsx, Button.test.tsx, ScreenState.tsx}
    ├── eslint.config.js
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── babel.config.js
    ├── metro.config.js
    ├── jest.config.js
    ├── jest.setup.ts
    ├── commitlint.config.js
    ├── package.json
    ├── .prettierrc, .prettierignore, .editorconfig, .env.example, .gitignore
    └── global.css
```

### Cómo funciona el flujo

**Instalación una vez por máquina**:
```bash
curl -fsSL https://raw.githubusercontent.com/REEMPLAZAR_USUARIO/expo-config-template/main/scripts/install-commands.sh | bash
```

Descarga los slash commands a `~/.claude/commands/`.

**Aplicar a un proyecto Expo**:
```bash
cd mi-app
claude
> /apply-template
```

**Actualizar a una versión nueva**:
```bash
> /update-template
```

### Lógica de los slash commands

#### `/apply-template`

1. Valida proyecto (es Expo, git limpio, no tiene `.template-version` ya).
2. Detecta gestor de paquetes desde lockfiles.
3. Pregunta lo mínimo (conflicts con archivos existentes).
4. Clona repo a `/tmp` con la versión target (último tag o `$ARGUMENTS`).
5. Copia archivos clasificándolos: **template-managed** (sobrescribir), **user-owned** (preguntar), **nuevos** (copiar).
6. Mergea `package.json` (scripts, deps, lint-staged) sin sobrescribir lo del usuario.
7. Crea estructura `src/` requerida por boundaries.
8. Instala deps.
9. Activa Husky.
10. Crea `.template-version` con metadata.
11. Corre `typecheck` + `lint` para validar.
12. Reporta resultado.

#### `/update-template`

1. Lee `.template-version` (versión actual).
2. Resuelve target (último tag o `$ARGUMENTS`).
3. Clona ambas versiones a `/tmp` para diff.
4. Muestra CHANGELOG entre versiones.
5. Para cada archivo: clasifica por ownership, calcula si el usuario lo modificó.
6. Resumen pre-aplicación (qué se aplica auto, qué necesita decisión).
7. Crea branch de backup git.
8. Aplica cambios aprobados.
9. Valida con `typecheck` + `lint`.
10. Reporta y deja comando para revertir.

## Cosas importantes que quedaron documentadas

### En el `CLAUDE.md` del template

- **Notas para Claude**: instrucciones específicas para que no se desvíe (qué preguntar, qué no hacer).
- **Forzado de Conventional Commits** via commitlint.
- **Sección de skills externas** con tabla de cuándo usar cada una y reglas de precedencia.
- **`noUncheckedIndexedAccess: true`**: arr[0] es `T | undefined`, agresivo pero atrapa bugs.

### En el repo

- **Tests CI del template**: cada PR crea proyecto Expo limpio, aplica template, valida.
- **Versionado SemVer**: MAJOR (breaking), MINOR (features retrocompatibles), PATCH (fixes).
- **Archivos user-owned** (`CLAUDE.md`, `tailwind.config.js`, `.env.example`, `app/_layout.tsx`): **nunca** se sobrescriben en update.

## Pendientes / próximos pasos (cuando retomes el trabajo)

### Inmediato

1. **Subir el repo a GitHub** (privado primero, sugerido).
2. **Reemplazar `REEMPLAZAR_USUARIO`** en todos los archivos:
   ```bash
   sed -i '' 's/REEMPLAZAR_USUARIO/tu-usuario/g' \
     commands/*.md scripts/*.sh README.md CHANGELOG.md docs/*.md
   ```
3. **Crear tag v1.0.0** y GitHub Release.
4. **Probar el flujo end-to-end** en un proyecto Expo de prueba:
   - Instalar comandos con el script.
   - Crear `pnpm create expo-app test-app`.
   - Correr `/apply-template`.
   - Validar que `pnpm lint && pnpm typecheck && pnpm test` pasen.

### Validación con uso real (sugerido 1-2 meses antes de publicar)

5. **Usar el template en 2-3 proyectos reales** propios para detectar:
   - Qué casos rompen el `apply-template` (proyectos con configs custom previas).
   - Qué pregunta Claude que debería responder solo.
   - Qué archivos del template no se usan en la práctica.
   - Qué se documentó en `CLAUDE.md` que Claude no respeta consistentemente.

### Refinamiento v1.1.0

6. **Mejoras detectadas con uso real** (anotar a medida que aparezcan).
7. **Posibles agregados sugeridos durante la conversación**:
   - `src/components/ui/` con más primitivos (Input, Card) usando `cva`.
   - Mocks de Jest más robustos para queries y stores.
   - Patrones de `testID` en componentes UI.
   - `app.config.ts` template-able con env-aware (dev/staging/prod).
   - Workflow de EAS Build documentado.

### Pendiente declarado en la conversación

8. **Crear el primer feature de prueba con `/feature auth`** para validar end-to-end que el slash command funciona y que la arquitectura escala.
9. **Decidir si el `/apply-template` debe ser más estricto o más flexible** ante ambigüedad (escrito en modo estricto por defecto).

### A más largo plazo

10. **v1.2.0**: integración con `app.config.ts`.
11. **v2.0.0**: cuando salga Expo SDK con breaking changes importantes.
12. **Considerar Renovate/Dependabot** para mantener las versiones de deps al día automáticamente.
13. **Compartir con GDG Cochabamba** después de validación interna.

## Estilo de comunicación esperado en el repo

Brian valora:

- **Respuestas directas con criterios de decisión**, no listas neutras de pros/cons.
- **Recomendaciones explícitas** con razones técnicas, no "depende".
- **Detección proactiva** de cosas que faltan o que rompen.
- **Tono profesional pero conversacional**, sin emojis excesivos ni formato sobrecargado.
- **Levantar dudas antes de avanzar** cuando una decisión es importante.

## Referencias y enlaces útiles

- [Callstack Agent Skills](https://github.com/callstackincubator/agent-skills)
- [Vercel Labs Agent Skills](https://github.com/vercel-labs/agent-skills)
- [Maestro](https://maestro.mobile.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Última actualización**: 2026-05-19
**Versión del template al cierre de la conversación**: v1.0.0
