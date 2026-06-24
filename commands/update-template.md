---
description: Actualiza el expo-config-template ya aplicado a una versión más nueva.
argument-hint: [version-tag]
---

# Actualizar expo-config-template

Actualiza el template instalado en este proyecto a una versión más nueva. Muestra el diff antes de aplicar cambios y deja control al usuario sobre archivos sensibles.

**Argumento opcional `$ARGUMENTS`**: versión target (ej. `v1.3.0`). Si está vacío, va a la última disponible.

---

## URL del repo

`https://github.com/DentVega/react-native-claude`

---

## Paso 1 — Validar precondiciones

1. Existe `.template-version` en la raíz. Si no: "Este proyecto no tiene el template aplicado. Usá `/apply-template` primero."
2. Leer la versión actual desde `.template-version` (campo `version`).
3. Verificar que el árbol de git esté limpio. Si no: **detenerse** y pedir al usuario que commitee o stashee primero. Esto es crítico para que el diff sea visible.

## Paso 2 — Resolver versión target

```bash
CURRENT_VERSION=<leído de .template-version>
TARGET_VERSION="$ARGUMENTS"
if [ -z "$TARGET_VERSION" ]; then
  TARGET_VERSION=$(git ls-remote --tags --refs --sort='-version:refname' \
    https://github.com/DentVega/react-native-claude.git \
    | head -n1 | awk -F'/' '{print $NF}')
fi
```

Si `$TARGET_VERSION == $CURRENT_VERSION`: avisar "ya estás en la última versión" y terminar.

## Paso 3 — Clonar ambas versiones para hacer diff

```bash
TEMP_DIR=$(mktemp -d)
git clone --depth 1 --branch "$CURRENT_VERSION" \
  https://github.com/DentVega/react-native-claude.git \
  "$TEMP_DIR/current"
git clone --depth 1 --branch "$TARGET_VERSION" \
  https://github.com/DentVega/react-native-claude.git \
  "$TEMP_DIR/target"
```

## Paso 4 — Leer el CHANGELOG y mostrar al usuario

Leer `$TEMP_DIR/target/CHANGELOG.md`. Extraer las entradas entre `$CURRENT_VERSION` y `$TARGET_VERSION`.

Mostrar al usuario un resumen agrupado:

```
📦 Actualización disponible: $CURRENT_VERSION → $TARGET_VERSION

⚠️ Breaking changes:
  - <lista>

✨ Nuevas features:
  - <lista>

🔧 Cambios:
  - <lista>

🐛 Fixes:
  - <lista>
```

Si hay breaking changes, **enfatizarlos** y preguntar si quiere continuar.

## Paso 5 — Calcular diff archivo por archivo

Comparar `$TEMP_DIR/current/template/` vs `$TEMP_DIR/target/template/`. Para cada archivo:

- **Nuevo en target**: marcar como "archivo nuevo a copiar".
- **Eliminado en target**: marcar como "archivo eliminado — el usuario decide si borrarlo".
- **Cambió entre versiones**: comparar también con el archivo actual del proyecto:
  - Si el archivo del proyecto == versión actual del template → seguro de actualizar (el usuario no lo tocó).
  - Si el archivo del proyecto != versión actual del template → el usuario lo modificó. **Mostrar diff y preguntar**.
  - Si el archivo del proyecto no existe → tratar como nuevo.

## Paso 6 — Clasificar por "ownership"

Aplicar las mismas reglas que `/apply-template`:

- **Template-managed** (`eslint.config.js`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `jest.config.js`, `jest.setup.ts`, `commitlint.config.js`, `.prettierrc`, `.prettierignore`, `.editorconfig`, `global.css`): actualizar automáticamente si el usuario no los modificó; preguntar si los modificó.

- **User-owned** (`CLAUDE.md`, `.env.example`, `tailwind.config.js`, `app/_layout.tsx`, `.maestro/config.yaml`): **nunca** sobrescribir. Solo mostrar el diff al usuario y sugerir que aplique manualmente lo que le interese.

- **Estructura interna del template** (`src/lib/cn.ts`, `src/services/api.ts`, `src/services/queryClient.ts`, `src/components/ui/*`, `src/i18n/index.ts`, etc.): preguntar caso por caso si el usuario los modificó, autoaplicar si no.

- **`.claude/commands/*.md`**: actualizar (son comandos auxiliares del template).

- **`package.json`**: a diferencia de `/apply-template` (donde el proyecto Expo gana en conflictos para preservar las versiones que el SDK pidió), en el **update** el orden default es el inverso: el **template gana**, así propagás los pin updates (ej. `eslint: ^9` reemplazando un `latest` que resolvió a v10 con el bug de `plugin-react`). Antes de aplicar, mostrar al usuario el diff completo de `dependencies`/`devDependencies` (Paso 7) y permitirle vetar cambios específicos.

## Paso 7 — Resumen pre-aplicación

Antes de tocar nada, mostrar:

```
📋 Plan de actualización

Auto-aplicable (X archivos):
  - eslint.config.js
  - tsconfig.json
  - ...

Necesita tu decisión (Y archivos):
  - CLAUDE.md  [user-owned, diff disponible]
  - src/services/api.ts  [modificado por vos]
  - ...

package.json:
  - Scripts nuevos: e2e:cloud
  - Deps nuevas: @sentry/react-native@^5
  - Deps actualizadas: zod@^3 → zod@^4 (BREAKING)
```

Preguntar al usuario:
1. ¿Aplicar todos los auto-aplicables? (y/n)
2. Para cada "necesita decisión": ¿aplicar, saltar, ver diff?

## Paso 8 — Aplicar cambios aprobados

En este orden:

1. Backup: crear branch git temporal `template-backup-<timestamp>` para que el usuario pueda volver atrás.
2. Aplicar cambios en archivos.
3. Actualizar `package.json` con merge.
4. Correr `pnpm install` (o el gestor del proyecto).
5. Actualizar `.template-version` al nuevo valor.

## Paso 9 — Validar

```bash
pnpm typecheck
pnpm lint
```

Si fallan, **no revertir automáticamente** — reportar al usuario y darle el comando para volver:

```
git checkout template-backup-<timestamp> -- .
```

## Paso 10 — Reporte final

```
✅ Actualizado a $TARGET_VERSION

Archivos actualizados: <N>
Archivos saltados (decisión del usuario): <N>
Backup creado en branch: template-backup-<timestamp>

⚠️ Acciones manuales sugeridas:
  - Revisar el diff propuesto de CLAUDE.md (no se aplicó por ser user-owned)
  - Verificar src/services/api.ts (tu versión fue modificada)
  - ...

💡 Para revertir: git checkout template-backup-<timestamp> -- .
```

## Lo que NO se debe hacer

- **No** sobrescribir archivos user-owned sin preguntar, nunca.
- **No** correr `git commit` automático.
- **No** borrar archivos del proyecto sin confirmación, ni siquiera si fueron eliminados en el template (puede que el usuario los esté usando).
- **No** seguir si el árbol de git está sucio.
- **No** revertir cambios automáticamente al fallar validación — dejar que el usuario decida.
