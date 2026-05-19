# Customización

El template es **opinionado** pero no rígido. Esta guía explica qué partes son seguras de modificar después de aplicar, y cuáles conviene mantener.

## Qué podés cambiar libremente

### `CLAUDE.md`

Es el archivo más personalizable. Después de aplicar:

- Rellená la sección "Sobre este proyecto" y "Decisiones específicas del proyecto".
- Si una librería del stack no aplica para este proyecto, removela de la tabla y de "Qué SÍ/NO hacer".
- Agregá secciones específicas del dominio (ej. si es un marketplace, documentar reglas del carrito).

El `/update-template` **nunca** sobrescribe `CLAUDE.md` — solo muestra el diff.

### `tailwind.config.js`

Es **tuyo** para definir el sistema de diseño:

```js
theme: {
  extend: {
    colors: {
      primary: { 50: '...', 500: '...', 900: '...' },
      // ...
    },
    fontFamily: {
      sans: ['Inter', 'system-ui'],
    },
  },
}
```

User-owned: el update no lo toca.

### `src/i18n/locales/*.json`

Agregá todas las claves que tu app necesite. El template trae solo `common` y `errors` de base.

### `src/components/ui/`

`Button.tsx` y `ScreenState.tsx` son **puntos de partida**. Reemplazalos por componentes propios cuando definas tu design system. Conviene usar `class-variance-authority` (ya instalado) para variantes:

```ts
import { cva } from 'class-variance-authority';

const buttonVariants = cva('rounded-lg px-4 py-2', {
  variants: {
    intent: {
      primary: 'bg-primary-600 text-white',
      secondary: 'bg-neutral-200 text-neutral-900',
      ghost: 'bg-transparent text-primary-600',
    },
    size: {
      sm: 'min-h-[36px] text-sm',
      md: 'min-h-[44px] text-base',
      lg: 'min-h-[52px] text-lg',
    },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});
```

## Qué conviene mantener

### `eslint.config.js`

Las reglas de `boundaries` son el corazón de la arquitectura. Si bajás las reglas, perdés la garantía de aislamiento entre features.

**Lo que sí podés ajustar**: thresholds menores (ej. `import/no-cycle` `maxDepth`), o desactivar reglas estilísticas específicas que no te gusten.

**Lo que no recomiendo**: desactivar `boundaries/element-types` o `boundaries/no-unknown`.

### `tsconfig.json`

`strict: true` y `noUncheckedIndexedAccess: true` son la base de la seguridad de tipos. Si una de las dos te molesta, **resistí la tentación** los primeros 2-3 meses — los bugs que atrapan valen el dolor inicial.

### Estructura de carpetas

`features/[x]/screens/` + `components/` + `hooks/` + `services/` + `store.ts` + `queries.ts` + `schemas.ts` + `types.ts` está pensado para escalar. Si en un feature chico te parece overkill: dejá vacíos los archivos que no usás, **no cambies la estructura**.

## Cómo agregar un nuevo stack/herramienta

### Ejemplo: agregar Sentry

1. Instalar: `pnpm add @sentry/react-native`.
2. Agregarlo al `CLAUDE.md` en la tabla de "Librerías estándar".
3. Crear `src/services/sentry.ts` con la inicialización.
4. Llamar el init en `app/_layout.tsx`.
5. Agregar `EXPO_PUBLIC_SENTRY_DSN` al schema Zod de `src/config/env.ts` y a `.env.example`.
6. Conectar el logger: en `src/lib/logger.ts`, en el método `error`, llamar a `Sentry.captureException`.

Notá cómo el `CLAUDE.md` queda como **fuente de verdad** de "qué usa este proyecto" — esto es lo que hace que Claude genere código consistente.

## Cómo desviarse de la arquitectura

A veces hay razones legítimas. Reglas para hacerlo bien:

1. **Documentar la excepción en `CLAUDE.md`** en una sección "Excepciones de arquitectura". Sin esto, Claude va a "corregir" tu excepción cada vez.
2. **Usar `eslint-disable` con comentario explicando por qué**, en la línea afectada, no a nivel archivo.
3. **Evaluar si la excepción debería ser nueva regla**: si pasa 3 veces, ya no es excepción — es una decisión de arquitectura que falta documentar.

## Cómo forkear el template para tu equipo

Cuando tu equipo tiene su propio sabor:

1. Forkeá el repo.
2. Cambiá lo que quieras en `template/`.
3. Editá `commands/*.md` y `scripts/install-commands.sh` con la URL de tu fork.
4. Documentá las diferencias con upstream en un `FORK_NOTES.md`.
5. Mantené el changelog riguroso.
6. **Opcional pero útil**: configurá Renovate/Dependabot para que las deps del template se actualicen automáticamente, y vos solo revisás PRs.

Si querés mantener sync con upstream:

```bash
# Una sola vez:
git remote add upstream https://github.com/REEMPLAZAR_USUARIO/expo-config-template.git

# Cada tanto:
git fetch upstream
git merge upstream/main  # o cherry-pick los commits que te interesen
```
