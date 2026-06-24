# expo-config-template

> Plantilla opinionada de configuración para apps móviles con **Expo + TypeScript + NativeWind + Zustand + TanStack Query**, lista para aplicarse a cualquier proyecto con un comando de Claude Code.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Expo](https://img.shields.io/badge/Expo-managed-000020?logo=expo)

## Por qué este template

### 🤖 AI-native desde el primer commit

El `CLAUDE.md` no es documentación que el equipo lee en el onboarding y después olvida. Es un manual que el agente carga **cada vez** que abrís el proyecto: stack, capas, qué se permite, qué no, cómo nombrar, dónde poner cada cosa. La diferencia práctica es enorme: Claude pasa de "te tiro una solución genérica de React" a "te tiro una solución que respeta tu arquitectura, usa tus librerías y nombra como vos nombrás".

### 🏛️ Arquitectura forzada por tooling, no por disciplina

Las reglas de capas (`features/` aislados entre sí, `lib/` sin deps del proyecto, container vs presentational) las pone `eslint-plugin-boundaries`. No son sugerencias en un Notion que nadie abre — un PR que las rompe **no pasa el lint**. Esto importa especialmente con agentes: aunque el agente olvide la regla a media generación, el linter no la olvida. La arquitectura se mantiene sin que tengas que hacer code review de cada línea.

### 📦 Versionado y actualizable

`.template-version` registra qué versión del template aplicaste, y `/update-template` calcula el diff cuando sale una nueva. Se preservan los archivos que personalizaste (tu `CLAUDE.md`, tu `tailwind.config.js`), se crea un branch de backup antes de aplicar. Esto resuelve el problema clásico de los starters: copia única que diverge al día 2 y nunca más se sincroniza con upstream.

### 🧠 Skills externas curadas

Con tres comandos (Expo, Callstack, Vercel) instalás a Claude todo lo que necesita saber sobre performance RN, Expo Router, EAS Build, FlashList, Reanimated, composición de componentes, etc. Las skills son **user-level**: las instalás una vez por máquina y aplican a todos tus proyectos automáticamente. No tenés que enseñarle a Claude el dominio cada vez que arrancás.

### ⏱️ Comprime la decisión-fatiga del día 0

Arrancar un proyecto Expo serio normalmente son 2-3 días de "¿router file-based o nativo?, ¿Redux o Zustand?, ¿TanStack Query o SWR?, ¿NativeWind o StyleSheet?, ¿cómo armo `src/`?, ¿qué setup de tests?". Acá todo eso está pre-decidido, justificado en la tabla de "Decisiones técnicas", y forzado por el linter. La primera línea de código real no se posterga eligiendo herramientas.

### 🌎 Bilingüe con español default

i18n viene con `es.json` primero y `en.json` como fallback. El `CLAUDE.md` está en español. Los mensajes de error, los comentarios del template, las strings UI de ejemplo: todo en español. Para equipos LATAM esto se nota: no estás retrofiteando localización a un template que asumió inglés desde el header.

## Cuándo NO usarlo

- **POC de fin de semana.** El setup vale ~30 minutos de aplicación + entender las reglas. Para algo que no va a sobrevivir al lunes, es overkill.
- **Equipos con stack ortogonal.** Si vas a usar StyleSheet puro, Redux, REST con codegen propio, o cualquier combinación que rompa 4+ de las decisiones del template, forkear y modificar es viable pero ya no son 5 minutos. Vale la pena solo si vas a aplicar tu fork a varios proyectos.
- **Proyectos legacy.** Si tu app ya tiene 2 años, una arquitectura distinta, y un equipo acostumbrado a sus convenciones, retrofitear las reglas de `boundaries` cuesta más que ignorarlas. El template está pensado para arrancar desde cero o desde un `create-expo-app` reciente.

## Qué incluye

- 🏗️ **Arquitectura por capas** forzada con `eslint-plugin-boundaries` (features aislados, container/presentational, reglas de dependencia explícitas)
- 🎨 **NativeWind v4** con `cn()` helper, base lista para sistema de diseño
- 🗄️ **Zustand + TanStack Query** con `QueryClient` configurado para móvil (NetInfo, AppState, retry inteligente)
- 🌐 **i18n** (`i18next` + `expo-localization`) con español como default
- 📝 **TypeScript estricto** (`strict` + `noUncheckedIndexedAccess`)
- 📐 **Prettier + ESLint** con preset Expo + reglas custom
- 🧪 **Jest + RNTL** para unit/integration, **Maestro** para E2E
- ✅ **Husky + lint-staged + commitlint** (Conventional Commits forzado)
- 🤖 **`CLAUDE.md` completo** con convenciones, arquitectura, qué sí y qué no hacer
- ⚡ **Slash command `/feature`** para scaffold de features completos
- 🧠 **Integración con skills oficiales** de Expo, Callstack y Vercel

## Requisitos

- Un proyecto Expo (managed workflow). Idealmente recién creado con `pnpm create expo-app`.
- [Claude Code](https://docs.claude.com/en/docs/claude-code) instalado.
- Node LTS, pnpm/yarn/npm/bun.

## Instalación

### 1. Instalar los slash commands (una sola vez por máquina)

**Opción A — CLI vía npx (recomendado)**

```bash
npx @dentvega/expo-config-template install
```

Otros subcomandos útiles del CLI:

```bash
npx @dentvega/expo-config-template doctor   # chequear requisitos
npx @dentvega/expo-config-template apply    # validar proyecto + guiar /apply-template
npx @dentvega/expo-config-template update   # validar proyecto + guiar /update-template
```

**Opción B — Script bash (sin Node)**

```bash
curl -fsSL https://raw.githubusercontent.com/DentVega/react-native-claude/main/scripts/install-commands.sh | bash
```

Ambas opciones descargan `apply-template.md` y `update-template.md` a `~/.claude/commands/`.

### 2. En cualquier proyecto Expo

```bash
cd mi-app
claude
> /apply-template
```

Claude valida el proyecto, copia los archivos, mergea el `package.json`, instala dependencias y deja todo listo.

### Aplicar una versión específica

```bash
> /apply-template v1.2.0
```

## Actualizar

Cuando salga una nueva versión, dentro del proyecto:

```bash
> /update-template
```

Claude muestra el changelog, calcula el diff, respeta archivos que personalizaste (`CLAUDE.md`, `tailwind.config.js`, etc.) y crea un branch de backup antes de aplicar.

## Estructura del repo

```
expo-config-template/
├── template/         # Los archivos que se aplican al proyecto destino
├── commands/         # Slash commands de Claude Code (/apply-template, /update-template)
├── cli/              # CLI launcher publicada en npm como `@dentvega/expo-config-template`
├── scripts/          # Instalador bash de los comandos (fallback sin Node)
├── docs/             # Documentación extendida (installation, customization, design-decisions)
├── .github/          # CI (test-template.yml) e issue templates
├── CHANGELOG.md      # Cambios por versión (importante para actualizaciones)
├── CONTRIBUTING.md   # Reglas de PRs y releases
├── LICENSE           # MIT
└── README.md
```

## Decisiones técnicas

| Tema | Decisión | Por qué |
|---|---|---|
| Framework | Expo managed | EAS Build/Update, expo-router, mejor DX. CNG cubre necesidades nativas. |
| Navegación | Expo Router | File-based, type-safe, parte del ecosistema Expo. |
| Estado servidor | TanStack Query | Estándar de facto, first-class RN support, mejor que SWR para mobile. |
| Estado cliente | Zustand | Mínimo boilerplate, perfecto con TanStack Query. |
| Estilos | NativeWind v4 | Tailwind familiar, velocidad de iteración, IntelliSense. |
| Forms | React Hook Form + Zod | Zod schema como fuente de verdad, tipo inferido. |
| i18n | i18next + expo-localization | i18next traduce, expo-localization detecta — complementarios. |
| Testing | Jest + RNTL + Maestro | Cobertura unit + E2E real en device. |
| Arquitectura | Capas + features aislados | Forzado por `eslint-plugin-boundaries`, escala sin volverse spaghetti. |

Detalles completos en el `CLAUDE.md` del template.

## Cómo forkear y personalizar

1. Forkea el repo.
2. Edita `template/CLAUDE.md` con tus opiniones (o `template/` completo).
3. Reemplazá `DentVega/react-native-claude` por `tu-usuario/tu-repo` en todos los archivos que lo referencian:

   ```bash
   sed -i '' 's|DentVega/react-native-claude|tu-usuario/tu-repo|g' \
     commands/*.md scripts/*.sh README.md CHANGELOG.md docs/*.md \
     cli/README.md cli/package.json
   ```

   Y editá manualmente las dos constantes en `cli/src/lib/github.ts` (`REPO_OWNER` y `REPO_NAME`).
4. Crea un tag `v1.0.0` y publica.

A partir de ahí, tu equipo puede usar tu fork con `curl ... tu-usuario/tu-repo ... | bash`.

## Skills externas recomendadas

El template referencia (pero no incluye) skills oficiales que potencian a Claude Code para RN. Instalables una vez por máquina:

```bash
# Expo: Expo Router, EAS Build/Update/Submit, deployment, upgrades
bunx skills add expo/skills

# Callstack: performance, optimización, workflows
git clone https://github.com/callstackincubator/agent-skills.git \
  ~/.claude/skills/callstack-agent-skills

# Vercel: patrones de arquitectura y composición
git clone https://github.com/vercel-labs/agent-skills.git \
  ~/.claude/skills/vercel-agent-skills
```

`bunx skills add expo/skills` requiere [Bun](https://bun.sh). Repo: [github.com/expo/skills](https://github.com/expo/skills). El detalle de qué skill cubre qué dominio está en [`template/CLAUDE.md`](template/CLAUDE.md).

## Contribuir

PRs bienvenidos. Reglas:

- Tests del template deben pasar (`.github/workflows/test-template.yml`).
- Breaking changes: marcarlos explícitamente en `CHANGELOG.md` y bumpear major version.
- Cambios en `CLAUDE.md` del template requieren discusión previa (issue).

## Licencia

MIT. Ver `LICENSE`.
