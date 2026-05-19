import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

/**
 * Configuración i18n.
 *
 * Flujo:
 * 1. `expo-localization` detecta el idioma del dispositivo.
 * 2. `i18next` lo aplica si está soportado, si no usa el fallback (es).
 * 3. `useTranslation()` en componentes para acceder a `t()`.
 */

const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function getInitialLanguage(): SupportedLanguage {
  const deviceLanguage = getLocales()[0]?.languageCode ?? 'es';
  return SUPPORTED_LANGUAGES.includes(deviceLanguage as SupportedLanguage)
    ? (deviceLanguage as SupportedLanguage)
    : 'es';
}

void i18n.use(initReactI18next).init({
  lng: getInitialLanguage(),
  fallbackLng: 'es',
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false, // React ya escapa por nosotros
  },
  returnNull: false,
});

export { i18n };
