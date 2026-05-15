module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(?:-community)?|expo(?:nent)?|@expo(?:nent)?/.*|expo-router|@expo-google-fonts/.*|nativewind|react-native-css-interop|react-native-safe-area-context|react-native-reanimated|react-native-worklets|@react-navigation/.*|@supabase/supabase-js|zustand|immer))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo/src/winter(.*)$': '<rootDir>/__mocks__/expoWinterMock.js',
    '\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
    '^axios$': '<rootDir>/__mocks__/axios.ts',
    '^@sentry/react-native$': '<rootDir>/__mocks__/@sentry/react-native.ts',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/dist/'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
};