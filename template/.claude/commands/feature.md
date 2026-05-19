---
description: Scaffold un nuevo feature module siguiendo la arquitectura del proyecto (capas, container/presentational, Zustand, TanStack Query, Zod).
argument-hint: <nombre-del-feature>
---

# Scaffold de feature: $ARGUMENTS

Genera la estructura completa para un nuevo feature en `src/features/$ARGUMENTS/` siguiendo **exactamente** la arquitectura definida en `CLAUDE.md`.

## Validaciones previas

Antes de crear archivos:

1. Verificar que el nombre del feature sea **kebab-case** (ej. `auth`, `user-profile`, `payment-methods`). Si tiene espacios, mayúsculas o caracteres raros, convertir y avisar al usuario.
2. Verificar que `src/features/$ARGUMENTS/` no exista ya. Si existe, **detenerse** y preguntar si se quiere sobrescribir o usar otro nombre.
3. Si el nombre coincide con un feature existente, no asumir nada — preguntar.

## Estructura a crear

```
src/features/$ARGUMENTS/
├── screens/
│   └── .gitkeep          # Las pantallas reales se agregan después
├── components/
│   └── .gitkeep          # Componentes presentational del feature
├── hooks/
│   └── .gitkeep          # Hooks del feature (lógica de negocio)
├── services/
│   └── $ARGUMENTSApi.ts  # Cliente HTTP del feature
├── store.ts              # Store Zustand del feature
├── queries.ts            # Query keys y query functions de TanStack Query
├── schemas.ts            # Schemas Zod
└── types.ts              # Tipos del feature
```

## Contenido de cada archivo

### `store.ts`

Store Zustand mínimo del feature. Si el feature no necesita estado cliente (solo data de servidor), generar el archivo igual con un comentario indicándolo.

```ts
import { create } from 'zustand';

type [FeatureName]State = {
  // Estado del feature (UI, sesión, preferencias)
  // Ejemplo: isExpanded: boolean;
};

type [FeatureName]Actions = {
  // Acciones del store
  // Ejemplo: setExpanded: (value: boolean) => void;
};

type [FeatureName]Store = [FeatureName]State & [FeatureName]Actions;

export const use[FeatureName]Store = create<[FeatureName]Store>((set) => ({
  // Estado inicial y acciones
}));
```

Convertir `[FeatureName]` a PascalCase del argumento (ej. `user-profile` → `UserProfile`).

### `queries.ts`

Query keys centralizadas + query functions. Importa del service del feature.

```ts
import { queryOptions } from '@tanstack/react-query';

import { [featureName]Api } from './services/[featureName]Api';

export const [featureName]Keys = {
  all: ['[featureName]'] as const,
  lists: () => [...[featureName]Keys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...[featureName]Keys.lists(), filters] as const,
  details: () => [...[featureName]Keys.all, 'detail'] as const,
  detail: (id: string) => [...[featureName]Keys.details(), id] as const,
};

// Ejemplo de queryOptions reutilizable:
// export const [featureName]DetailOptions = (id: string) =>
//   queryOptions({
//     queryKey: [featureName]Keys.detail(id),
//     queryFn: () => [featureName]Api.getById(id),
//   });
```

Convertir `[featureName]` a camelCase (ej. `user-profile` → `userProfile`).

### `schemas.ts`

Schemas Zod del feature.

```ts
import { z } from 'zod';

// Schemas vacíos — agregar según las entidades del feature
// Ejemplo:
// export const [featureName]Schema = z.object({
//   id: z.string(),
//   name: z.string().min(1),
// });
//
// export type [FeatureName] = z.infer<typeof [featureName]Schema>;

export {};
```

### `types.ts`

Tipos del feature que NO se infieren de Zod (eventos, callbacks, tipos derivados, etc.).

```ts
// Tipos del feature [featureName]
// Para tipos de entidades, preferir z.infer<typeof schema> en schemas.ts

export {};
```

### `services/[featureName]Api.ts`

Cliente HTTP del feature. Debe importar el cliente HTTP global de `@/services/api`.

```ts
import { apiClient } from '@/services/api';

import type { [FeatureName] } from '../schemas';

export const [featureName]Api = {
  // Ejemplo de métodos típicos:
  // getById: (id: string): Promise<[FeatureName]> =>
  //   apiClient.get(`/[featureName]/${id}`),
  //
  // list: (params: { page: number }): Promise<[FeatureName][]> =>
  //   apiClient.get('/[featureName]', { params }),
  //
  // create: (data: Omit<[FeatureName], 'id'>): Promise<[FeatureName]> =>
  //   apiClient.post('/[featureName]', data),
};
```

Si `@/services/api` no existe todavía, **avisar al usuario** que debe crearlo y dejar un TODO en el archivo.

### `.gitkeep` en carpetas vacías

Crear archivos `.gitkeep` vacíos en `screens/`, `components/` y `hooks/` para que git las trackee.

## Después del scaffold

Al terminar:

1. Correr `pnpm typecheck` para verificar que todo compila.
2. Correr `pnpm lint` para verificar que cumple las reglas de boundaries.
3. Reportar al usuario:
   - Qué archivos se crearon.
   - Recordatorios:
     - Agregar las strings del feature a `src/i18n/locales/es.json` y `en.json` (jerarquía `[featureName].*`).
     - Si el feature tiene pantallas, crear el archivo de ruta en `app/` que importe `[FeatureName]Screen` desde `screens/`.
     - Si el feature consume API, verificar que las env vars relevantes estén en `src/config/env.ts`.

## Lo que NO se debe hacer

- No crear pantallas (`*Screen.tsx`) hasta que el usuario las pida — la estructura queda lista pero las pantallas se agregan según necesidad.
- No agregar barrel `index.ts` automáticamente — solo si el usuario lo pide explícitamente.
- No importar de otros features. Si el usuario menciona dependencias entre features, **detenerse y preguntar** si esa dependencia debe subirse a `src/`.
- No instalar librerías nuevas durante el scaffold.
