import '../global.css';
import '@/i18n'; // Inicializa i18next al boot

import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/services/queryClient';

// Mantiene el splash visible mientras cargan recursos críticos.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Cargar fuentes aquí. Ejemplo:
    // 'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    // 'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            {/*
              Las rutas se autoregistran desde la carpeta app/.
              Ejemplos de grupos:
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            */}
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
