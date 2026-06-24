# @dentvega/expo-config-template (CLI)

Launcher para aplicar el [expo-config-template](https://github.com/DentVega/react-native-claude) a un proyecto Expo via Claude Code.

## Uso

```bash
# Instalar slash commands (una vez por máquina)
npx @dentvega/expo-config-template install

# Dentro de un proyecto Expo
cd mi-app
npx @dentvega/expo-config-template apply           # valida y guía a /apply-template
npx @dentvega/expo-config-template update          # valida y guía a /update-template
npx @dentvega/expo-config-template doctor          # chequea requisitos

# Apuntar a una versión específica del template
npx @dentvega/expo-config-template apply v1.2.0
```

Alternativa: instalar global y usar el bin `expo-config-template` directo:

```bash
npm install -g @dentvega/expo-config-template
expo-config-template install
expo-config-template apply
```

## Por qué guía en vez de ejecutar

Los slash commands son interactivos (preguntan por conflictos, eligen estrategia de merge, etc.). Spawnear Claude Code desde la CLI no acepta input programático confiable cross-versión. Por eso la CLI valida prerequisitos y entrega instrucciones claras; el flow interactivo lo corre Claude.

## Requisitos

- Node ≥ 18
- [Claude Code](https://docs.claude.com/en/docs/claude-code) en PATH
- git

## Versionado

El CLI mantiene su propio semver, desacoplado del template. `expo-config-template apply v1.2.0` apunta a esa versión del template.

## Desarrollo

```bash
pnpm install
pnpm build       # tsup → dist/index.js (single file ESM)
pnpm typecheck
pnpm dev         # watch
```
