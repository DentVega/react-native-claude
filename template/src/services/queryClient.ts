import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState, type AppStateStatus, Platform } from 'react-native';

import { ApiError } from './api';

/**
 * QueryClient con configuración recomendada para móvil.
 *
 * Diferencias vs web:
 * - `onlineManager`: pausa queries cuando no hay red, usando NetInfo.
 * - `focusManager`: refetch al volver al foreground del app (no al focusear tab).
 * - No reintentar errores 4xx (client errors); sí reintentar 5xx y network errors.
 */

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

function onAppStateChange(status: AppStateStatus) {
  // En web, focusManager se maneja con el foco de la ventana.
  // En móvil, usamos el AppState.
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

AppState.addEventListener('change', onAppStateChange);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min — ajustar por query si hace falta
      gcTime: 1000 * 60 * 5, // 5 min en cache después de unmount
      retry: (failureCount, error) => {
        // No reintentar errores 4xx (cliente). Sí 5xx y network errors.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // En móvil usamos focusManager (foreground)
    },
    mutations: {
      retry: false, // Mutations no se reintentan automáticamente
    },
  },
});
