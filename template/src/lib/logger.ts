/**
 * Logger del proyecto. Usar en lugar de `console.log`.
 *
 * - En dev: imprime todo
 * - En producción: solo `warn` y `error` (los `info`/`debug` se silencian)
 *
 * En el futuro se puede enchufar a Sentry o PostHog.
 *
 * Este archivo es el ÚNICO lugar donde se permiten llamadas directas a
 * `console.*` — el resto del código debe importar este `logger`.
 */
/* eslint-disable no-console */

const isDev = __DEV__;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (error: unknown, context?: Record<string, unknown>) => {
    console.error('[ERROR]', error, context);
    // TODO: enchufar a Sentry cuando se configure
  },
};
