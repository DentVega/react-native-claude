# Guía de instalación

## Requisitos previos

- **Node.js**: versión LTS actual.
- **Gestor de paquetes**: pnpm (recomendado), yarn, npm o bun.
- **Claude Code**: instalado y autenticado.
- **Un proyecto Expo**: managed workflow. Si es nuevo: `pnpm create expo-app mi-app --template blank-typescript`.

## Instalación rápida

### Paso 1 — Instalar los slash commands (una vez por máquina)

```bash
curl -fsSL https://raw.githubusercontent.com/DentVega/react-native-claude/main/scripts/install-commands.sh | bash
```

Esto crea:
- `~/.claude/commands/apply-template.md`
- `~/.claude/commands/update-template.md`

Si ya tenías comandos con esos nombres, se guarda un backup con timestamp.

### Paso 2 — Aplicar al proyecto

```bash
cd mi-proyecto-expo
claude
```

Dentro de Claude Code:

```
/apply-template
```

O para fijar una versión específica:

```
/apply-template v1.0.0
```

Claude va a:

1. Validar que el proyecto sea Expo y esté en buen estado (git limpio, etc.).
2. Detectar tu gestor de paquetes.
3. Preguntar lo mínimo necesario sobre archivos que ya existan.
4. Clonar el template, copiar archivos, mergear `package.json`.
5. Crear la estructura de carpetas requerida por `eslint-plugin-boundaries`.
6. Instalar dependencias.
7. Activar Husky.
8. Crear `.template-version`.
9. Correr `typecheck` y `lint` para validar.
10. Reportar resultado y próximos pasos.

### Paso 3 — Personalizar

Después de aplicar, hay que:

1. **Rellenar placeholders en `CLAUDE.md`**: reemplazar `[PROYECTO: ...]` con datos del proyecto.
2. **Copiar `.env.example` a `.env`** y rellenar variables.
3. **Actualizar `appId` en `.maestro/`** con el `bundleIdentifier`/`package` real.
4. (Opcional) **Instalar skills externas** de Callstack/Vercel — ver `template/README.md` sección 8.

## Instalación manual (sin slash command)

Si preferís no usar el slash command:

```bash
# Clonar
git clone --depth 1 https://github.com/DentVega/react-native-claude.git /tmp/template

# Copiar archivos
cp -r /tmp/template/template/. mi-proyecto/

# Crear estructura
cd mi-proyecto
mkdir -p src/{features,components/ui,hooks,services,lib,config,types,i18n/locales,constants,test} \
  assets/{images,icons,fonts}

# Mergear package.json (manual con tu editor preferido)
# ...

# Instalar deps
pnpm install

# Activar Husky
pnpm exec husky init
chmod +x .husky/pre-commit .husky/commit-msg

# Crear .template-version
echo "version: v1.0.0
applied_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
repo: https://github.com/DentVega/react-native-claude" > .template-version
```

## Forks privados

Si estás usando un fork privado del template (recomendado para empresas/grupos):

1. Forkeá el repo.
2. Reemplazá `DentVega/react-native-claude` por `tu-org/tu-repo` en todos los archivos que lo referencian (`commands/*.md`, `scripts/install-commands.sh`, `README.md`, `CHANGELOG.md`, `docs/*.md`, `cli/README.md`, `cli/package.json`) y actualizá las constantes `REPO_OWNER` / `REPO_NAME` en `cli/src/lib/github.ts`.
3. Usá tu fork directamente o sobreescribí en runtime con la env var:

```bash
EXPO_TEMPLATE_REPO=https://github.com/tu-org/tu-repo \
  curl -fsSL https://raw.githubusercontent.com/tu-org/tu-repo/main/scripts/install-commands.sh | bash
```

4. Para repos privados, los miembros necesitan acceso. El clone usa el git config del usuario (SSH o HTTPS con credenciales).

## Troubleshooting

### "Este proyecto ya tiene el template aplicado"

Existe un `.template-version` en la raíz. Usá `/update-template` en su lugar, o borrá el archivo si querés reaplicarlo desde cero (perdés metadata de versión).

### "No detecto Expo en este proyecto"

El `package.json` no tiene `expo` en `dependencies`. Si es intencional (proyecto RN CLI), este template no aplica.

### Husky no se activa

```bash
pnpm exec husky init
chmod +x .husky/pre-commit .husky/commit-msg
```

Si seguís sin verlo trabajar, verificá que `.git/hooks/` apunte a `.husky/`.

### `pnpm typecheck` falla después de aplicar

El error más común es por carpetas requeridas por boundaries que no existen. Verificá que el paso 5 del `/apply-template` creó toda la estructura (`src/features/`, `src/lib/`, etc.).

### El template aplica pero falta una librería que uso

El template es opinionado, no exhaustivo. Después de aplicar, instalá lo que necesites con normalidad. El `CLAUDE.md` dice cuándo Claude debe pedir permiso antes de instalar nuevas deps.
