import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import gitfitService from '@/services/gitfit.service';
import { trackProgressChartViewed } from '@/utils/sentryAnalytics';

type WorkoutSetItem = {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
  loggedAt: string;
  exercise: {
    id: string;
    name: string;
    gifUrl: string | null;
  };
};

type GroupedExercise = {
  exerciseId: string;
  exerciseName: string;
  gifUrl: string | null;
  sets: WorkoutSetItem[];
};

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '-';
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}min`;
}

function formatVolume(volume: number | null): string {
  if (volume == null) return '-';
  return `${Math.round(volume).toLocaleString('de-DE')}kg`;
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  const datePart = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = date
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase()
    .replace(' ', '');

  return `${datePart} - ${timePart}`;
}

function groupSetsByExercise(items: WorkoutSetItem[]): GroupedExercise[] {
  const grouped = new Map<string, GroupedExercise>();
  const order: string[] = [];

  items.forEach((item) => {
    const existing = grouped.get(item.exerciseId);
    if (existing) {
      existing.sets.push(item);
      return;
    }

    grouped.set(item.exerciseId, {
      exerciseId: item.exerciseId,
      exerciseName: item.exercise.name,
      gifUrl: item.exercise.gifUrl,
      sets: [item],
    });
    order.push(item.exerciseId);
  });

  return order.map((id) => grouped.get(id)!).filter(Boolean);
}

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: gitfitService.getMyProfile,
  });

  const { data: session, isLoading } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: () => gitfitService.getWorkoutSessionById(String(sessionId)),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (!session?.id) return;
    trackProgressChartViewed({
      chartType: 'history_detail',
      sessionId: session.id,
    });
  }, [session?.id]);

  const groupedSets = groupSetsByExercise(session?.workoutSets ?? []);
  const recordsCount = (session?.workoutSets ?? []).filter((set) => set.isPr).length;
  const totalSetCount = (session?.workoutSets ?? []).length;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['left', 'right']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View
        className="bg-[#1c1c1e] flex-row items-center justify-between px-4"
        style={{
          paddingTop: insets.top + 8,
          minHeight: 61 + insets.top,
          paddingBottom: 8,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} className="w-12 h-12 items-center justify-center">
          <MaterialIcons name="arrow-back" size={30} color="#f4f4f4" />
        </TouchableOpacity>
        <Text className="text-[#f4f4f4] text-[24px] leading-[32px]">Workout Detail</Text>
        <View className="w-12 h-12" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {isLoading || !session ? (
          <Text className="text-[rgba(244,244,244,0.6)] text-base mt-4">Loading workout detail...</Text>
        ) : (
          <>
            <View className="flex-row items-center gap-2 mt-3">
              <View className="w-[44px] h-[44px] rounded-full bg-[#d9d9d9] items-center justify-center">
                <Text className="text-black text-base font-semibold">
                  {(profile?.username?.trim()?.[0] ?? 'G').toUpperCase()}
                </Text>
              </View>

              <View>
                <Text className="text-[#ee9033] text-base">{profile?.username ?? 'GitFit user'}</Text>
                <Text className="text-[#d9d9d9] text-sm">{formatDateLabel(session.startedAt)}</Text>
              </View>
            </View>

            <View className="border-b-2 border-[#1c1c1e] py-2 mt-2">
              <Text className="text-[#ee9033] text-[32px] leading-[42px] font-semibold">{session.name}</Text>

              <View className="flex-row gap-5 mt-2">
                <View>
                  <Text className="text-[rgba(244,244,244,0.5)] text-xs">Time</Text>
                  <Text className="text-[#f4f4f4] text-lg font-semibold mt-1">{formatDuration(session.durationSeconds)}</Text>
                </View>

                <View>
                  <Text className="text-[rgba(244,244,244,0.5)] text-xs">Volume</Text>
                  <Text className="text-[#f4f4f4] text-lg font-semibold mt-1">{formatVolume(session.totalVolumeKg)}</Text>
                </View>

                <View>
                  <Text className="text-[rgba(244,244,244,0.5)] text-xs">Sets</Text>
                  <Text className="text-[#f4f4f4] text-lg font-semibold mt-1">{totalSetCount}</Text>
                </View>

                <View>
                  <Text className="text-[rgba(244,244,244,0.5)] text-xs">Records</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <MaterialIcons name="workspace-premium" size={18} color="#ee9033" />
                    <Text className="text-[#f4f4f4] text-lg font-semibold">{recordsCount}</Text>
                  </View>
                </View>
              </View>
            </View>

            <Text className="text-[rgba(244,244,244,0.5)] text-base mt-3 mb-2">Workout</Text>

            <View className="gap-4">
              {groupedSets.map((exercise) => (
                <View key={exercise.exerciseId} className="gap-2">
                  <View className="flex-row items-center gap-3 px-1">
                    <View className="w-[60px] h-[60px] rounded-full bg-[#d9d9d9] overflow-hidden items-center justify-center">
                      {exercise.gifUrl ? (
                        <Image source={{ uri: exercise.gifUrl }} resizeMode="cover" className="w-[60px] h-[60px]" />
                      ) : (
                        <MaterialIcons name="fitness-center" size={24} color="#1c1c1e" />
                      )}
                    </View>

                    <Text className="text-[#e08e02] text-lg" numberOfLines={1}>
                      {exercise.exerciseName}
                    </Text>
                  </View>

                  <View className="w-full">
                    <View className="flex-row pb-1">
                      <Text className="text-[rgba(244,244,244,0.5)] text-sm text-center w-[70px]">SET</Text>
                      <Text className="text-[rgba(244,244,244,0.5)] text-sm flex-1">WEIGHT & REPS</Text>
                    </View>

                    {exercise.sets.map((set, index) => (
                      <View
                        key={set.id}
                        className={`flex-row items-center py-1 ${index % 2 === 1 ? 'bg-[#1c1c1e]' : 'bg-black'}`}
                      >
                        <Text className="text-[#f4f4f4] text-sm text-center w-[70px]">{set.setNumber}</Text>
                        <Text className="text-[#f4f4f4] text-sm flex-1">
                          {(set.weightKg ?? '-')} kg x {(set.reps ?? '-')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
