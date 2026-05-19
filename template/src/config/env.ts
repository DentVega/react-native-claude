import { z } from 'zod';

/**
 * Schema de variables de entorno.
 *
 * Reglas:
 * - Toda var accesible desde cliente DEBE empezar con `EXPO_PUBLIC_`.
 * - Si falta una variable requerida, la app falla al arrancar (no en runtime aleatorio).
 * - Agregar nuevas vars aquí Y en `.env.example`.
 */
const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url('EXPO_PUBLIC_API_URL debe ser una URL válida'),

  // Opcionales — descomentar y ajustar según el proyecto
  // EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
  // EXPO_PUBLIC_POSTHOG_KEY: z.string().optional(),
  // EXPO_PUBLIC_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Variables de entorno inválidas — revisar .env');
}

export const env = parsed.data;
