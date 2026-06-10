---
description: Aplica el expo-config-template a un proyecto Expo (nuevo o existente).
argument-hint: [version-tag]
---

# Aplicar expo-config-template

Aplica el template de configuración para apps Expo al proyecto actual. Funciona tanto en proyectos recién creados con `create-expo-app` como en proyectos existentes.

**Argumento opcional `$ARGUMENTS`**: tag o branch del template a usar (ej. `v1.2.0`). Si está vacío, usa la última versión publicada (tag más reciente).

---

## URL del repo

`https://github.com/DentVega/react-native-claude`

---

## Paso 1 — Validar el proyecto

Verificar **en este orden** y detenerse al primer fallo, reportando claramente al usuario:

1. Existe `package.json` en el directorio actual. Si no: "Este directorio no parece un proyecto Node — corre el comando desde la raíz de un proyecto Expo."
2. El `package.json` contiene la dependencia `expo`. Si no: "No detecto Expo en este proyecto. Este template es solo para apps Expo."
3. Verificar si ya existe un archivo `.template-version` en la raíz. Si existe, **detenerse** y avisar: "Este proyecto ya tiene el template aplicado (versión X). Para actualizar, usá `/update-template` en lugar de `/apply-template`."
4. Verificar si el árbol de git está limpio (`git status --porcelain` vacío). Si no: avisar al usuario que hay cambios sin commitear y **preguntar** si quiere proceder igual. **No** proceder sin confirmación explícita.

## Paso 2 — Detectar contexto del proyecto

Sin preguntar al usuario, detectar:

- **Gestor de paquetes**: revisar lockfiles (`pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `package-lock.json` → npm, `bun.lockb` → bun). Si no hay lockfile, default pnpm.
- **¿TypeScript ya configurado?**: existe `tsconfig.json`.
- **¿Es proyecto nuevo o existente?**: si solo existen los archivos default de `create-expo-app` (App.tsx o app/index.tsx default, sin `src/`), tratarlo como nuevo. Si tiene `src/` con código real, existente.

Reportá brevemente lo detectado al usuario antes de seguir.

## Paso 3 — Preguntar lo mínimo necesario

Hacer **una sola** ronda de preguntas con la herramienta de input interactivo, no múltiples turnos:

1. Si hay archivos del template que ya existen en el proyecto y NO son default de Expo (ej. el proyecto ya tiene un `eslint.config.js` custom): preguntar **por cada uno**: "Sobrescribir, mergear manualmente después, o saltar?"
2. Si no detectaste el gestor de paquetes con certeza: preguntar cuál usar.

No preguntes nada que ya esté decidido por el `CLAUDE.md` del template. El template es opinionado por diseño.

## Paso 4 — Clonar el template

```bash
# Resolver versión a usar
TARGET_VERSION="$ARGUMENTS"
if [ -z "$TARGET_VERSION" ]; then
  # Obtener el último tag del repo
  TARGET_VERSION=$(git ls-remote --tags --refs --sort='-version:refname' \
    https://github.com/DentVega/react-native-claude.git \
    | head -n1 | awk -F'/' '{print $NF}')
fi

# Clonar a /tmp
TEMP_DIR=$(mktemp -d)
git clone --depth 1 --branch "$TARGET_VERSION" \
  https://github.com/DentVega/react-native-claude.git \
  "$TEMP_DIR"
```

Reportar al usuario qué versión se va a aplicar.

Si el clone falla, detenerse y reportar el error.

## Paso 5 — Copiar archivos del template

Los archivos a copiar están en `$TEMP_DIR/template/`. Reglas:

- **Archivos "template-managed"** (sobrescribir sin preguntar si están en su forma default): `eslint.config.js`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `tsconfig.json`, `jest.config.js`, `jest.setup.ts`, `commitlint.config.js`, `.prettierrc`, `.prettierignore`, `.editorconfig`, `.gitignore`, `global.css`.

- **Archivos "user-owned"** (NO sobrescribir si ya existen, solo crear si faltan): `CLAUDE.md`, `.env.example`, `tailwind.config.js` (si tiene customizaciones), `app/_layout.tsx`.

  Si ya existen y son diferentes al del template, **mostrar el diff al usuario** y preguntar caso por caso.

- **Archivos nuevos** (copiar siempre, no deberían existir): todo lo que esté en `src/`, `.claude/`, `.maestro/`, `.husky/`, `.vscode/`.

- **`package.json`**: NO sobrescribir nunca. Ver paso 6.

Para cada archivo copiado, mantener permisos ejecutables donde aplique (`.husky/pre-commit`, `.husky/commit-msg`).

## Paso 5b — Configurar `appId` de Maestro

Los archivos del template `.maestro/config.yaml`, `.maestro/flows/smoke.yaml` y `.maestro/flows/login.yaml` traen `appId: "[PROYECTO_APP_ID]"` como placeholder. Intentar reemplazarlo automáticamente:

1. **Leer el `app.json` o `app.config.*`** del proyecto destino. Buscar, en este orden, el primer valor no vacío:
   - `expo.ios.bundleIdentifier`
   - `expo.android.package`
   - Si el archivo es `app.config.ts`/`app.config.js` y no se puede evaluar estáticamente (tiene lógica con env vars, etc.), **no intentes ejecutarlo** — saltar al paso 3.

2. **Si encontraste un valor válido** (formato típico `com.algo.algo`):
   - Reemplazar `"[PROYECTO_APP_ID]"` por `<valor>` (sin comillas, ya que ahora es un string YAML normal) en los tres archivos `.maestro/*.yaml` copiados al proyecto.
   - Confirmar al usuario: `Maestro appId configurado como <valor>`.

3. **Si no encontraste un valor** (proyecto recién creado sin bundleIdentifier/package todavía, o `app.config.ts` con lógica dinámica):
   - **Dejar el placeholder `[PROYECTO_APP_ID]` como está**.
   - Anotar este caso para el reporte final del paso 12 como un warning explícito: el usuario tendrá que reemplazarlo manualmente cuando defina el bundle id.

No tocar el `app.json` / `app.config.*` del proyecto — solo lectura.

## Paso 6 — Mergear `package.json`

Esto es lo más delicado. Reglas:

1. Leer el `package.json` actual del proyecto y el `package.json` del template.
2. Mergear:
   - `scripts`: agregar los del template que falten. Si hay conflicto (un script con el mismo nombre y distinto contenido), **mostrar el diff y preguntar**.
   - `dependencies` y `devDependencies`: agregar las que falten. Si una dep ya existe con otra versión, mantener la versión del proyecto y **avisar** al usuario al final.
   - `lint-staged`: agregar la sección completa del template si no existe. Si existe, no tocar (asumir que el usuario lo customizó).
   - Otras keys (`name`, `version`, `main`, `private`): no tocar.
3. Escribir el nuevo `package.json` con formato consistente (2 espacios de indentación, newline final).

## Paso 7 — Crear estructura de carpetas

Las reglas de `eslint-plugin-boundaries` necesitan que las carpetas existan. Crear si no están:

```bash
mkdir -p src/features src/components/ui src/hooks src/services src/lib src/config src/types \
  src/i18n/locales src/constants src/test \
  assets/images assets/icons assets/fonts
```

Para las que queden vacías después de copiar los archivos del template, agregar un `.gitkeep`.

## Paso 8 — Instalar dependencias

Usar el gestor detectado en el paso 2:

```bash
# pnpm (default)
pnpm install
# o yarn / npm / bun según corresponda
```

Si la instalación falla, detenerse, reportar el error, y NO continuar a los pasos siguientes.

## Paso 9 — Activar Husky

```bash
pnpm exec husky init  # o yarn/npm equivalente
chmod +x .husky/pre-commit .husky/commit-msg
```

Si el comando falla porque husky no está instalado, ya debería estarlo después del paso 8 — si igual falla, reportar y seguir (no es bloqueante).

## Paso 10 — Marcar versión instalada

Crear archivo `.template-version` en la raíz del proyecto con el siguiente contenido:

```
version: <TARGET_VERSION>
applied_at: <fecha ISO actual>
repo: https://github.com/DentVega/react-native-claude
```

Este archivo lo lee `/update-template` después. **No debe** estar en `.gitignore` — debe commitearse.

## Paso 11 — Validar

Correr en este orden, deteniéndose si alguno falla:

```bash
pnpm typecheck   # debe pasar
pnpm lint        # puede tener warnings, pero no errores
```

Si `lint` reporta errores de `boundaries/element-types` por carpetas vacías, recordá que el plugin requiere estructura — sugerir al usuario que verifique que el paso 7 corrió correctamente.

## Paso 12 — Reporte final

Mostrar al usuario un resumen claro:

```
✅ Template aplicado: v<VERSION>

Archivos creados: <N>
Archivos sobrescritos: <N>
Archivos saltados (ya existían): <N>

Próximos pasos:
  1. Personalizar CLAUDE.md: reemplazar [PROYECTO: ...] con datos reales del proyecto
  2. Copiar .env.example a .env y rellenar las variables
  3. (Solo si quedó [PROYECTO_APP_ID]) Definir bundleIdentifier/package en app.json y reemplazar el placeholder en .maestro/*.yaml
  4. (Opcional) Instalar skills externas — ver template/README.md sección 8
  5. Crear el primer feature con: /feature <nombre>

⚠️ Warnings (si los hay):
  - Dependencia X mantenida en versión Y (template recomienda Z)
  - ...
```

## Lo que NO se debe hacer

- **No** correr `git commit` automáticamente. Dejar los cambios staged o sin stagear, que el usuario revise.
- **No** correr `expo prebuild` ni tocar `ios/` `android/`.
- **No** instalar las skills de Callstack/Vercel automáticamente — son a nivel usuario, no proyecto. Solo recordar al usuario que existen.
- **No** modificar el `app.json` o `app.config.ts` del proyecto. El template asume que el usuario ya configuró nombre/appId/etc.
- **No** seguir si una validación crítica falla (paso 1 o 8). Mejor abortar limpio que dejar el proyecto a medias.
