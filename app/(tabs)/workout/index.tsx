import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { useWorkoutSessionStore } from '@/store/workoutSession.store';

export default function WorkoutScreen() {
  const router = useRouter();
  const sessionId = useWorkoutSessionStore((s) => s.sessionId);
  const startSession = useWorkoutSessionStore((s) => s.startSession);
  const exercises = useWorkoutSessionStore((s) => s.exercises);
  const hasActiveSession = sessionId !== null;

  function handleStartWorkout() {
    if (!hasActiveSession) {
      startSession(Date.now().toString(), 'Empty Workout');
    }
    router.push('/workout-log');
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <ScrollView
        className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: hasActiveSession ? 160 : 24 }}
      >
        {/* Header */}
        <Text className="text-white text-2xl font-bold mt-2 mb-4">Workout</Text>

        {/* Start Empty Workout Button */}
        <TouchableOpacity
          onPress={handleStartWorkout}
          className="bg-[#ee9033] rounded-full flex-row items-center justify-center gap-2 py-1.5 mb-5 border border-[rgba(72,72,71,0.2)]"
        >
          <MaterialIcons name="add" size={18} color="#111" />
          <Text className="text-[#111] text-base">
            {hasActiveSession ? 'Resume Workout' : 'Start Empty Workout'}
          </Text>
        </TouchableOpacity>

        {/* Routines Section */}
        <Text className="text-white text-lg font-bold mb-3">Routines</Text>

        <View className="flex-row gap-2">
          {/* New Routines Card */}
          <TouchableOpacity className="flex-1 bg-[#ee9033] rounded-lg items-center justify-center py-4 gap-2 border border-[rgba(72,72,71,0.2)]">
            <MaterialIcons name="note-add" size={24} color="#111" />
            <Text className="text-[#111] text-base font-bold text-center">New Routines</Text>
          </TouchableOpacity>

          {/* Explore Routines Card */}
          <TouchableOpacity className="flex-1 bg-[#ee9033] rounded-lg items-center justify-center py-4 gap-2 border border-[rgba(72,72,71,0.2)]">
            <MaterialIcons name="search" size={24} color="#111" />
            <Text className="text-[#111] text-base font-bold text-center">Explore Routines</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
