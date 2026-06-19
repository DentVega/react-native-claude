/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // No definimos transformIgnorePatterns: heredamos el del preset jest-expo,
  // que ya cubre @react-native/*, @expo/*, react-native-* y maneja el layout
  // de pnpm (node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>). Si necesitás
  // transformar una lib extra, hacelo extendiendo el array del preset.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
};
