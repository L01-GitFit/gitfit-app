import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import gitfitService, {
  type WorkoutSessionDetail,
  type WorkoutSessionSummary,
} from '@/services/gitfit.service';

type SessionExercisePreview = {
  exerciseId: string;
  name: string;
  gifUrl: string | null;
  setCount: number;
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

function formatRelativeDate(value: string): string {
  const target = new Date(value).getTime();
  const now = Date.now();
  const diffMs = target - now;

  const minutes = Math.round(diffMs / (1000 * 60));
  if (Math.abs(minutes) < 60) {
    return `${Math.abs(minutes)} min${Math.abs(minutes) === 1 ? '' : 's'} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return `${Math.abs(hours)} hour${Math.abs(hours) === 1 ? '' : 's'} ago`;
  }

  const days = Math.round(hours / 24);
  return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
}

function getExercisePreview(session: WorkoutSessionDetail): SessionExercisePreview[] {
  const grouped = new Map<string, SessionExercisePreview>();

  session.workoutSets.forEach((set) => {
    const existing = grouped.get(set.exerciseId);
    if (existing) {
      existing.setCount += 1;
      return;
    }

    grouped.set(set.exerciseId, {
      exerciseId: set.exerciseId,
      name: set.exercise.name,
      gifUrl: set.exercise.gifUrl,
      setCount: 1,
    });
  });

  return [...grouped.values()];
}

function countRecords(session: WorkoutSessionDetail): number {
  return session.workoutSets.filter((set) => set.isPr).length;
}

function HomeWorkoutCard({
  session,
  detail,
  onPress,
}: {
  session: WorkoutSessionSummary;
  detail?: WorkoutSessionDetail;
  onPress: () => void;
}) {
  const exercises = detail ? getExercisePreview(detail) : [];
  const previewExercises = exercises.slice(0, 3);
  const remaining = Math.max(0, exercises.length - previewExercises.length);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="border-b-2 border-[#1c1c1e] py-2"
    >
      <Text className="text-[#ee9033] text-[32px] leading-[42px] font-semibold">{session.name}</Text>

      <View className="flex-row gap-6 mt-1 mb-4">
        <View>
          <Text className="text-[rgba(244,244,244,0.5)] text-xs">Time</Text>
          <Text className="text-[#f4f4f4] text-lg font-semibold mt-1">{formatDuration(session.durationSeconds)}</Text>
        </View>

        <View>
          <Text className="text-[rgba(244,244,244,0.5)] text-xs">Volume</Text>
          <Text className="text-[#f4f4f4] text-lg font-semibold mt-1">{formatVolume(session.totalVolumeKg)}</Text>
        </View>

        <View>
          <Text className="text-[rgba(244,244,244,0.5)] text-xs">Records</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <MaterialIcons name="workspace-premium" size={18} color="#ee9033" />
            <Text className="text-[#f4f4f4] text-lg font-semibold">{detail ? countRecords(detail) : 0}</Text>
          </View>
        </View>
      </View>

      <View className="gap-4 pb-2">
        {previewExercises.map((exercise) => (
          <View key={exercise.exerciseId} className="flex-row items-center gap-3">
            <View className="w-[60px] h-[60px] rounded-full bg-[#d9d9d9] overflow-hidden items-center justify-center">
              {exercise.gifUrl ? (
                <Image source={{ uri: exercise.gifUrl }} resizeMode="cover" className="w-[60px] h-[60px]" />
              ) : (
                <MaterialIcons name="fitness-center" size={24} color="#1c1c1e" />
              )}
            </View>

            <Text className="text-[#f4f4f4] text-sm flex-1" numberOfLines={1}>
              {exercise.setCount} sets {exercise.name}
            </Text>
          </View>
        ))}
      </View>

      {remaining > 0 ? (
        <Text className="text-[rgba(244,244,244,0.5)] text-sm text-center mt-1 mb-1">
          See {remaining} more exercises
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: gitfitService.getMyProfile,
  });

  const { data: completedSessions, isLoading } = useQuery({
    queryKey: ['sessions', 'completed', 'home'],
    queryFn: () =>
      gitfitService.getWorkoutSessions({
        status: 'COMPLETED',
        page: 1,
        limit: 10,
      }),
  });

  const sessions = completedSessions?.data ?? [];

  const { data: detailsById = {} } = useQuery({
    queryKey: ['home-session-details', sessions.map((session) => session.id).join('|')],
    enabled: sessions.length > 0,
    queryFn: async () => {
      const details = await Promise.all(
        sessions.map((session) => gitfitService.getWorkoutSessionById(session.id)),
      );

      return details.reduce<Record<string, WorkoutSessionDetail>>((acc, detail) => {
        acc[detail.id] = detail;
        return acc;
      }, {});
    },
  });

  const latestSessionDate = sessions.length > 0 ? sessions[0].startedAt : null;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="text-white text-2xl font-bold mt-2 mb-4">Home</Text>

        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-[50px] h-[50px] rounded-full bg-[#d9d9d9] items-center justify-center">
            <Text className="text-black text-lg font-semibold">
              {(profile?.username?.trim()?.[0] ?? 'G').toUpperCase()}
            </Text>
          </View>

          <View>
            <Text className="text-[#ee9033] text-base">{profile?.username ?? 'GitFit user'}</Text>
            <Text className="text-[#d9d9d9] text-sm">
              {latestSessionDate ? formatRelativeDate(latestSessionDate) : 'No workout yet'}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <Text className="text-[rgba(244,244,244,0.6)] text-base mt-6">Loading workout history...</Text>
        ) : null}

        {!isLoading && sessions.length === 0 ? (
          <View className="items-center justify-center py-14">
            <Text className="text-[rgba(244,244,244,0.6)] text-base">No workout history yet.</Text>
          </View>
        ) : null}

        <View className="mt-2 gap-1">
          {sessions.map((session) => (
            <HomeWorkoutCard
              key={session.id}
              session={session}
              detail={detailsById[session.id]}
              onPress={() => router.push({ pathname: '/workout-detail', params: { sessionId: session.id } })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
