import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockNavigationRef = { current: null };

let mockSegments: string[] = ['(auth)'];
let mockFontsLoaded = true;
let mockAuthState = {
  accessToken: null as string | null,
  _hasHydrated: true,
};

jest.mock('expo-router', () => {
  const { View, Text } = require('react-native');

  const StackComponent = ({ children }: { children: React.ReactNode }) => (
    <View testID="root-stack">{children}</View>
  );

  (StackComponent as any).Screen = ({ name }: { name: string }) => <Text>{`screen:${name}`}</Text>;

  return {
    Stack: StackComponent,
    useNavigationContainerRef: () => mockNavigationRef,
    useRouter: () => ({ replace: mockReplace }),
    useSegments: () => mockSegments,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-font', () => ({
  useFonts: () => [mockFontsLoaded],
}));

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}));

jest.mock('@expo-google-fonts/lexend', () => ({
  Lexend_100Thin: 'Lexend_100Thin',
  Lexend_200ExtraLight: 'Lexend_200ExtraLight',
  Lexend_300Light: 'Lexend_300Light',
  Lexend_400Regular: 'Lexend_400Regular',
  Lexend_500Medium: 'Lexend_500Medium',
  Lexend_600SemiBold: 'Lexend_600SemiBold',
  Lexend_700Bold: 'Lexend_700Bold',
  Lexend_800ExtraBold: 'Lexend_800ExtraBold',
  Lexend_900Black: 'Lexend_900Black',
}));

jest.mock('@tanstack/react-query', () => {
  const { View } = require('react-native');
  return {
    QueryClient: jest.fn(() => ({ _type: 'query-client' })),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('@/store/authStore', () => ({
  useAuthStore: () => mockAuthState,
}));

jest.mock('@/hooks/useGoogleLogin', () => ({
  configureGoogleSignIn: jest.fn(),
}));

import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { configureGoogleSignIn } from '@/hooks/useGoogleLogin';
import RootLayout from '@/app/_layout';

beforeEach(() => {
  mockReplace.mockClear();

  mockSegments = ['(auth)'];
  mockFontsLoaded = true;
  mockAuthState = {
    accessToken: null,
    _hasHydrated: true,
  };

  jest.mocked(SplashScreen.hideAsync).mockClear();
  jest.mocked(Sentry.registerNavigationContainer).mockClear();
});

describe('Root layout (app/_layout.tsx)', () => {
  it('runs bootstrap side effects at module load', () => {
    expect(configureGoogleSignIn).toHaveBeenCalledTimes(1);
    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalledTimes(1);
    expect(Sentry.init).toHaveBeenCalledTimes(1);
  });

  it('returns null while fonts are still loading', () => {
    mockFontsLoaded = false;

    const { queryByTestId } = render(<RootLayout />);

    expect(queryByTestId('root-stack')).toBeNull();
  });

  it('returns null while auth store has not hydrated yet', () => {
    mockAuthState = {
      accessToken: null,
      _hasHydrated: false,
    };

    const { queryByTestId } = render(<RootLayout />);

    expect(queryByTestId('root-stack')).toBeNull();
  });

  it('redirects authenticated users away from auth screens', async () => {
    mockAuthState = {
      accessToken: 'token-1',
      _hasHydrated: true,
    };
    mockSegments = ['(auth)'];

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/home');
    });
  });

  it('redirects unauthenticated users away from tabs', async () => {
    mockAuthState = {
      accessToken: null,
      _hasHydrated: true,
    };
    mockSegments = ['(tabs)'];

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/onboarding');
    });
  });

  it('renders stack screens and registers navigation container when ready', async () => {
    mockAuthState = {
      accessToken: null,
      _hasHydrated: true,
    };
    mockSegments = ['(auth)'];

    const { getByText } = render(<RootLayout />);

    expect(getByText('screen:(auth)')).toBeTruthy();
    expect(getByText('screen:(tabs)')).toBeTruthy();
    expect(getByText('screen:modal')).toBeTruthy();

    await waitFor(() => {
      expect(Sentry.registerNavigationContainer).toHaveBeenCalledWith(mockNavigationRef);
      expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
    });
  });
});
