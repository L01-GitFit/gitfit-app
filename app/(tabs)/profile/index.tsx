import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import gitfitService from '@/services/gitfit.service';
import { useAuthStore } from '@/store/authStore';
import { clearSentryUser } from '@/utils/sentryUser';

const defaultAvatar = require('@/assets/default-avatar.png');

export default function ProfileScreen() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: gitfitService.getMyProfile,
  });

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? '');
    setGender(profile.gender ?? '');
    setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '');
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '');
    setWeightKg(profile.weightKg != null ? String(profile.weightKg) : '');
  }, [profile]);

  function parseOptionalNumber(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  const updateProfileMutation = useMutation({
    mutationFn: gitfitService.updateMyProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await gitfitService.logout(refreshToken);
      }
    },
  });

  async function handleSaveProfile() {
    const parsedHeightCm = parseOptionalNumber(heightCm);
    if (heightCm.trim() && parsedHeightCm === undefined) {
      Alert.alert('Validation error', 'Height must be a valid number.');
      return;
    }

    const parsedWeightKg = parseOptionalNumber(weightKg);
    if (weightKg.trim() && parsedWeightKg === undefined) {
      Alert.alert('Validation error', 'Weight must be a valid number.');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim() || undefined,
        gender: gender.trim().toUpperCase() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        heightCm: parsedHeightCm,
        weightKg: parsedWeightKg,
      });
      Alert.alert('Success', 'Profile updated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile.';
      Alert.alert('Update failed', message);
    }
  }

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync();
          } finally {
            clearSentryUser();
            clearAuth();
            router.replace('/(auth)/onboarding');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-4">
          <Text className="text-white text-2xl font-bold mt-2 mb-4">Profile</Text>
        </View>

        {/* Avatar */}
        <View className="items-center py-2 gap-2 mt-4">
          <View className="w-16 h-16 rounded-full overflow-hidden">
            <Image
              source={profile?.avatarUrl ? { uri: profile.avatarUrl } : defaultAvatar}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <TouchableOpacity>
            <Text className="text-[#ee9033] text-xs">Change profile photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form fields */}
        <View className="px-4 py-2 gap-12 mt-4">
          {/* Public profile data */}
          <View className="gap-6">
            <Text className="text-[rgba(244,244,244,0.5)] text-xs">Public profile data</Text>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e] gap-4">
              <Text className="text-[#f4f4f4] text-xs">Name</Text>
              <TextInput
                testID="profile-name-input"
                value={fullName}
                onChangeText={setFullName}
                editable={!isLoading}
                placeholder="Your full name"
                placeholderTextColor="rgba(244,244,244,0.35)"
                className="text-[rgba(244,244,244,0.7)] text-xs flex-1 text-right"
              />
            </View>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e]">
              <Text className="text-[#f4f4f4] text-xs">Bio</Text>
              <Text className="text-[rgba(244,244,244,0.5)] text-xs">{profile?.username ?? 'Describe yourself'}</Text>
            </View>
          </View>

          {/* Private data */}
          <View className="gap-4">
            <Text className="text-[rgba(244,244,244,0.5)] text-xs">Private data</Text>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e] gap-4">
              <Text className="text-[#f4f4f4] text-xs">Sex</Text>
              <TextInput
                testID="profile-gender-input"
                value={gender}
                onChangeText={setGender}
                editable={!isLoading}
                placeholder="MALE/FEMALE/OTHER"
                placeholderTextColor="rgba(244,244,244,0.35)"
                autoCapitalize="characters"
                className="text-[#ee9033] text-xs flex-1 text-right"
              />
            </View>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e] gap-4">
              <Text className="text-[#f4f4f4] text-xs">Birthday</Text>
              <TextInput
                testID="profile-dob-input"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                editable={!isLoading}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(244,244,244,0.35)"
                className="text-[#ee9033] text-xs flex-1 text-right"
              />
            </View>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e] gap-4">
              <Text className="text-[#f4f4f4] text-xs">Height (cm)</Text>
              <TextInput
                testID="profile-height-input"
                value={heightCm}
                onChangeText={setHeightCm}
                editable={!isLoading}
                placeholder="e.g. 170"
                placeholderTextColor="rgba(244,244,244,0.35)"
                keyboardType="decimal-pad"
                className="text-[#ee9033] text-xs flex-1 text-right"
              />
            </View>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e] gap-4">
              <Text className="text-[#f4f4f4] text-xs">Weight (kg)</Text>
              <TextInput
                testID="profile-weight-input"
                value={weightKg}
                onChangeText={setWeightKg}
                editable={!isLoading}
                placeholder="e.g. 65"
                placeholderTextColor="rgba(244,244,244,0.35)"
                keyboardType="decimal-pad"
                className="text-[#ee9033] text-xs flex-1 text-right"
              />
            </View>
          </View>
        </View>

        <View className="px-4 mt-4">
          <TouchableOpacity
            testID="profile-save-button"
            onPress={() => {
              void handleSaveProfile();
            }}
            disabled={isLoading || updateProfileMutation.isPending}
            className="items-center justify-center h-11 rounded-lg bg-[#ee9033]"
          >
            {isLoading || updateProfileMutation.isPending ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text className="text-[#111] text-sm font-semibold">Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View className="px-4 mt-8 mb-4">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
            className="items-center justify-center h-11 rounded-lg border border-red-500"
          >
            <Text className="text-red-500 text-sm font-semibold">
              {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
