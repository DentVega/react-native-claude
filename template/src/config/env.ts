import { z } from 'zod';

/**
 * Schema de variables de entorno.
 *
 * Reglas:
 * - Toda var accesible desde cliente DEBE empezar con `EXPO_PUBLIC_`.
 * - Si falta una variable requerida, la primera lectura falla con un mensaje claro
 *   (no se hace `throw` en import-time para no romper el arranque del template).
 * - Agregar nuevas vars aquí Y en `.env.example`.
 */
const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url('EXPO_PUBLIC_API_URL debe ser una URL válida'),

  // Opcionales — descomentar y ajustar según el proyecto
  // EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
  // EXPO_PUBLIC_POSTHOG_KEY: z.string().optional(),
  // EXPO_PUBLIC_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

function load(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Variables de entorno inválidas:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Variables de entorno inválidas — revisar .env');
  }
  cached = parsed.data;
  return cached;
}

/**
 * Proxy perezoso: la validación corre la primera vez que alguien lee `env.X`,
 * no al importar el módulo. Eso evita crashear el boot del template recién
 * aplicado (cuando todavía no existe `.env`).
 */
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return load()[prop as keyof Env];
  },
});
