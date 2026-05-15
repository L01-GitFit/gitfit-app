import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import gitfitService from '@/services/gitfit.service';
import { useRoutineStore } from '@/store/routine.store';
import { useWorkoutSessionStore } from '@/store/workoutSession.store';
import { trackWorkoutSessionStarted } from '@/utils/sentryAnalytics';

export default function WorkoutScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionId = useWorkoutSessionStore((s) => s.sessionId);
  const startSession = useWorkoutSessionStore((s) => s.startSession);
  const startSessionFromRoutine = useWorkoutSessionStore((s) => s.startSessionFromRoutine);
  const hasActiveSession = sessionId !== null;
  const startDraft = useRoutineStore((s) => s.startDraft);

  const parseRepsTarget = (repsTarget: string | null): number => {
    if (!repsTarget) return 0;
    const match = repsTarget.match(/\d+/);
    if (!match) return 0;
    const parsed = parseInt(match[0], 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const { data: routines = [], isFetching } = useQuery({
    queryKey: ['routines'],
    queryFn: () => gitfitService.listRoutines(),
  });

  const createSessionMutation = useMutation({
    mutationFn: gitfitService.createWorkoutSession,
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: (routineId: string) => gitfitService.deleteRoutine(routineId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  const canStartSession = useMemo(
    () => !createSessionMutation.isPending,
    [createSessionMutation.isPending],
  );

  async function handleStartWorkout() {
    if (!hasActiveSession) {
      const created = await createSessionMutation.mutateAsync({});
      startSession(created.id, created.name);
      trackWorkoutSessionStarted({
        sessionId: created.id,
        source: 'empty',
      });
    } else if (sessionId) {
      trackWorkoutSessionStarted({
        sessionId,
        source: 'resume',
      });
    }
    router.push('/workout-log');
  }

  function handleOpenCreateRoutine() {
    startDraft('New Routine');
    router.push('/create-routine');
  }

  async function handleStartRoutine(routineId: string) {
    const routineSummary = routines.find((item) => item.id === routineId);
    if (!routineSummary) return;

    const routine = await gitfitService.getRoutineById(routineId);

    const created = await createSessionMutation.mutateAsync({
      routineId: routineSummary.id,
    });

    const mappedExercises = routine.routineExercises.map((routineExercise) => {
      const setCount = Math.max(1, routineExercise.sets ?? 1);

      return {
        id: `routine-exercise-${routineExercise.id}`,
        exercise: {
          exerciseId: routineExercise.exerciseId,
          name: routineExercise.exercise.name,
          gifUrl: routineExercise.exercise.gifUrl ?? '',
          targetMuscles: routineExercise.exercise.targetMuscles ?? [],
          bodyParts: routineExercise.exercise.bodyParts ?? [],
          equipments: [],
          secondaryMuscles: [],
          instructions: [],
        },
        notes: '',
        sets: Array.from({ length: setCount }, (_, index) => ({
          id: `routine-set-${routineExercise.id}-${index + 1}`,
          setNumber: index + 1,
          weightKg: routineExercise.weightTarget ?? 0,
          reps: parseRepsTarget(routineExercise.repsTarget),
        })),
      };
    });

    startSessionFromRoutine(created.id, created.name, mappedExercises);
    trackWorkoutSessionStarted({
      sessionId: created.id,
      source: 'routine',
      routineId: routineSummary.id,
      routineName: routineSummary.name,
    });
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
          disabled={!canStartSession}
          className="bg-[#ee9033] rounded-lg h-[30px] flex-row items-center justify-center gap-2 mb-5 border border-[rgba(72,72,71,0.2)]"
        >
          <MaterialIcons name="add" size={20} color="#111" />
          <Text className="text-[#111]" style={{ fontFamily: 'Lexend_700Bold', fontSize: 16, lineHeight: 28 }}>
            {createSessionMutation.isPending
              ? 'Creating Session...'
              : hasActiveSession
                ? 'Resume Workout'
                : 'Start Empty Workout'}
          </Text>
        </TouchableOpacity>

        {/* Routines Section */}
        <Text className="text-white text-lg font-bold mb-3">Routines</Text>

        <View className="flex-row gap-3">
          {/* New Routines Card */}
          <TouchableOpacity
            onPress={handleOpenCreateRoutine}
            className="flex-1 bg-[#ee9033] rounded-lg items-center justify-center h-[89px] gap-2 border border-[rgba(72,72,71,0.2)]"
          >
            <MaterialIcons name="note-add" size={24} color="#111" />
            <Text className="text-[#111] text-base font-bold text-center">New Routines</Text>
          </TouchableOpacity>

          {/* Explore Routines Card */}
          <TouchableOpacity className="flex-1 bg-[#ee9033] rounded-lg items-center justify-center h-[89px] gap-2 border border-[rgba(72,72,71,0.2)]">
            <MaterialIcons name="search" size={24} color="#111" />
            <Text className="text-[#111] text-base font-bold text-center">Explore Routines</Text>
          </TouchableOpacity>
        </View>

        {isFetching && (
          <Text
            className="text-[rgba(244,244,244,0.5)]"
            style={{ fontFamily: 'Lexend_400Regular', fontSize: 14, lineHeight: 22 }}
          >
            Loading routines...
          </Text>
        )}

        {routines.length > 0 && (
          <View className="mt-3 gap-2.5">
            <Text
              className="text-[rgba(244,244,244,0.5)]"
              style={{ fontFamily: 'Lexend_400Regular', fontSize: 18, lineHeight: 28 }}
            >
              {`My Routines (${routines.length})`}
            </Text>

            {routines.map((routine) => (
              <View
                key={routine.id}
                className="bg-[#1c1c1e] border border-black rounded-lg p-2.5 gap-2.5"
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{ color: '#fff', fontFamily: 'Lexend_400Regular', fontSize: 17, lineHeight: 22, flex: 1 }}
                    numberOfLines={1}
                  >
                    {routine.name.trim() || 'Untitled routine'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => { void deleteRoutineMutation.mutateAsync(routine.id); }}
                    disabled={deleteRoutineMutation.isPending}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="delete" size={20} color="#FF6868" />
                  </TouchableOpacity>
                </View>

                  <Text
                  style={{ color: 'rgba(244,244,244,0.5)', fontFamily: 'Lexend_400Regular', fontSize: 17, lineHeight: 22 }}
                  numberOfLines={1}
                >
                  {routine.programId ? 'Program routine' : 'Custom routine'}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    void handleStartRoutine(routine.id);
                  }}
                  disabled={!canStartSession}
                  className="bg-[#ee9033] rounded-lg h-7 items-center justify-center"
                >
                  <Text style={{ color: '#000', fontFamily: 'Lexend_700Bold', fontSize: 18, lineHeight: 28 }}>
                    Start Routine
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
