import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, TouchableOpacity } from 'react-native';

const mockReplace = jest.fn();
const mockClearAuth = jest.fn();
const mockClearSentryUser = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockUpdateProfileMutation = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
const mockLogoutMutation = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
const mockProfileData = {
  fullName: 'Taylor Swift',
  gender: 'FEMALE',
  dateOfBirth: '2004-01-01T00:00:00.000Z',
  heightCm: 170,
  weightKg: 60,
  username: 'tay',
  avatarUrl: null,
};
let mockMutationIndex = 0;

jest.mock('@/services/gitfit.service', () => ({
  __esModule: true,
  default: {
    getMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector: any) => selector({ clearAuth: mockClearAuth, refreshToken: 'refresh-token-1' }),
}));

jest.mock('@/utils/sentryUser', () => ({
  clearSentryUser: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn((options: { queryKey: unknown[] }) => {
    if (options.queryKey[0] === 'profile') {
      return {
        data: mockProfileData,
        isLoading: false,
      };
    }

    return { data: undefined, isLoading: false };
  }),
  useMutation: jest.fn(() => {
    mockMutationIndex += 1;
    return mockMutationIndex % 2 === 1 ? mockUpdateProfileMutation : mockLogoutMutation;
  }),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

import ProfileScreen from '@/app/(tabs)/profile';

beforeEach(() => {
  mockReplace.mockClear();
  mockClearAuth.mockClear();
  mockInvalidateQueries.mockClear();
  mockUpdateProfileMutation.mutateAsync.mockClear();
  mockLogoutMutation.mutateAsync.mockClear();
  mockMutationIndex = 0;
});

describe('Profile screen', () => {
  it('renders profile fields from query data', async () => {
    const { getByText, getByDisplayValue } = render(<ProfileScreen />);

    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('tay')).toBeTruthy();
    expect(getByDisplayValue('Taylor Swift')).toBeTruthy();
    expect(getByDisplayValue('FEMALE')).toBeTruthy();
    expect(getByDisplayValue('2004-01-01')).toBeTruthy();
    expect(getByDisplayValue('170')).toBeTruthy();
    expect(getByDisplayValue('60')).toBeTruthy();
  });

  it('keeps the save action pressable', () => {
    const { getByDisplayValue, UNSAFE_getAllByType } = render(<ProfileScreen />);
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    const saveButton = buttons.find((button: any) => button.props.children?.props?.children === 'Save Profile');

    fireEvent.changeText(getByDisplayValue('Taylor Swift'), 'Taylor M. Swift');
    fireEvent.changeText(getByDisplayValue('FEMALE'), 'other');
    fireEvent.changeText(getByDisplayValue('2004-01-01'), '2004-02-02');
    expect(() => fireEvent.press(saveButton ?? buttons[1])).not.toThrow();
  });

  it('submits height and weight as numbers when saving profile', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { getByDisplayValue, getByTestId } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByDisplayValue('Taylor Swift')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('profile-name-input'), 'Taylor M. Swift');
    fireEvent.changeText(getByTestId('profile-gender-input'), 'other');
    fireEvent.changeText(getByTestId('profile-dob-input'), '2004-02-02');
    fireEvent.changeText(getByTestId('profile-height-input'), '172.5');
    fireEvent.changeText(getByTestId('profile-weight-input'), '61.2');
    fireEvent.press(getByTestId('profile-save-button'));

    await waitFor(() => {
      expect(mockUpdateProfileMutation.mutateAsync).toHaveBeenCalledWith({
        fullName: 'Taylor M. Swift',
        gender: 'OTHER',
        dateOfBirth: '2004-02-02',
        heightCm: 172.5,
        weightKg: 61.2,
      });
    });

    alertSpy.mockRestore();
  });

  it('shows validation error and does not submit when height is invalid', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.changeText(getByTestId('profile-height-input'), 'abc');
    fireEvent.press(getByTestId('profile-save-button'));

    expect(mockUpdateProfileMutation.mutateAsync).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Validation error', 'Height must be a valid number.');

    alertSpy.mockRestore();
  });

  it('confirms logout and clears auth', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const destructiveButton = (buttons as any[]).find((button) => button.style === 'destructive');
      destructiveButton?.onPress?.();
    });

    const { UNSAFE_getAllByType } = render(<ProfileScreen />);
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    const logoutButton = buttons.find((button: any) => button.props.children?.props?.children === 'Log out');
    fireEvent.press(logoutButton ?? buttons[2]);

    await waitFor(() => {
      expect(mockLogoutMutation.mutateAsync).toHaveBeenCalledTimes(1);
      expect(mockClearAuth).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/onboarding');
    });

    alertSpy.mockRestore();
  });
});
