import '@testing-library/jest-native/extend-expect';

// Silenciar warnings de animaciones nativas en tests
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock de expo-router (ajustar según necesidad)
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock de expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'es', languageTag: 'es-BO' }],
}));
