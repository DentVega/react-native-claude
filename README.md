# expo-config-template

> Plantilla opinionada de configuración para apps móviles con **Expo + TypeScript + NativeWind + Zustand + TanStack Query**, lista para aplicarse a cualquier proyecto con un comando de Claude Code.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Expo](https://img.shields.io/badge/Expo-managed-000020?logo=expo)

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
npx expo-config-template install
```

Otros subcomandos útiles del CLI:

```bash
npx expo-config-template doctor          # chequear requisitos
npx expo-config-template apply           # validar proyecto + guiar /apply-template
npx expo-config-template update          # validar proyecto + guiar /update-template
```

**Opción B — Script bash (sin Node)**

```bash
curl -fsSL https://raw.githubusercontent.com/REEMPLAZAR_USUARIO/expo-config-template/main/scripts/install-commands.sh | bash
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
├── cli/              # CLI launcher publicada en npm como `expo-config-template`
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
3. Reemplazá `REEMPLAZAR_USUARIO` por tu usuario/org de GitHub en todos los archivos que lo referencian:

   ```bash
   sed -i '' 's/REEMPLAZAR_USUARIO/tu-usuario/g' \
     commands/*.md scripts/*.sh README.md CHANGELOG.md docs/*.md \
     cli/README.md cli/package.json cli/src/lib/github.ts
   ```
4. Crea un tag `v1.0.0` y publica.

A partir de ahí, tu equipo puede usar tu fork con `curl ... tu-usuario/expo-config-template ... | bash`.

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
