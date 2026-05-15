import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkoutSessionStore } from '@/store/workoutSession.store';
import DiscardWorkoutDialog from '@/components/workout/DiscardWorkoutDialog';
import ExerciseLogCard from '@/components/workout/ExerciseLogCard';
import gitfitService from '@/services/gitfit.service';
import { useLogSet } from '@/hooks/useLogSet';
import type { ActiveExercise, ActiveSet } from '@/store/workoutSession.store';
import { trackWorkoutLogged } from '@/utils/sentryAnalytics';

const exerciseIcon = require('../assets/exercise.png');

type AchievedBanner = {
  exerciseName: string;
  message: string;
  gifUrl: string;
};

type ExerciseBaseline = {
  previous: string;
  maxWeight: number;
  maxReps: number;
  setCount: number;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase();
}

function formatPreviousValue(weightKg: number | null, reps: number | null): string {
  if (weightKg == null || reps == null) return '-';
  const weightText = Number.isInteger(weightKg) ? String(weightKg) : weightKg.toFixed(1);
  return `${weightText}kg x ${reps}`;
}

function parsePreviousSetValue(previous: string): { weightKg: number; reps: number } | null {
  if (!previous || previous === '-' || previous.length > 50) {
    return null;
  }

  const safeRegex = /(\d+(?:\.\d+)?)\s{0,5}kg\s{0,5}x\s{0,5}(\d+)/i;
  const match = previous.match(safeRegex);
  if (!match) {
    return null;
  }

  return {
    weightKg: parseFloat(match[1]),
    reps: parseInt(match[2], 10),
  };
}

export default function WorkoutLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sessionId = useWorkoutSessionStore((s) => s.sessionId);
  const startedAt = useWorkoutSessionStore((s) => s.startedAt);
  const minimize = useWorkoutSessionStore((s) => s.minimize);
  const resetSession = useWorkoutSessionStore((s) => s.resetSession);
  const exercises = useWorkoutSessionStore((s) => s.exercises);
  const addSet = useWorkoutSessionStore((s) => s.addSet);
  const updateSet = useWorkoutSessionStore((s) => s.updateSet);
  const toggleSet = useWorkoutSessionStore((s) => s.toggleSet);
  const removeSet = useWorkoutSessionStore((s) => s.removeSet);
  const removeExercise = useWorkoutSessionStore((s) => s.removeExercise);
  const [elapsed, setElapsed] = useState(0);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [achievedBanner, setAchievedBanner] = useState<AchievedBanner | null>(null);
  const bannerTranslateY = useRef(new Animated.Value(-120)).current;
  const hideBannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const achievementSetByExerciseRef = useRef<Record<string, number | null>>({});
  const queryClient = useQueryClient();
  const logSetMutation = useLogSet(sessionId ?? '');

  const finishMutation = useMutation({
    mutationFn: (id: string) => gitfitService.finishWorkoutSession(id),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => gitfitService.cancelWorkoutSession(id),
  });

  const allSets = exercises.flatMap((e) => e.sets);
  const completedSets = allSets.filter((s) => s.isCompleted);
  const totalSetCount = allSets.length;
  const completedSetCount = completedSets.length;
  const volume = completedSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
  const completedReps = completedSets.reduce((sum, s) => sum + s.reps, 0);
  const progress = useMemo(
    () => (totalSetCount > 0 ? completedSetCount / totalSetCount : 0),
    [completedSetCount, totalSetCount],
  );
  const exerciseKey = useMemo(
    () => exercises.map((ex) => ex.externalExercise.exerciseId).sort().join('|'),
    [exercises],
  );

  const { data: baselineByExercise = {} } = useQuery({
    queryKey: ['exercise-previous', exerciseKey],
    enabled: exercises.length > 0,
    queryFn: async () => {
      const sessionList = await gitfitService.getWorkoutSessions({
        status: 'COMPLETED',
        page: 1,
        limit: 12,
      });

      if (sessionList.data.length === 0) {
        return exercises.reduce<Record<string, ExerciseBaseline>>((acc, ex) => {
          acc[ex.externalExercise.exerciseId] = {
            previous: '-',
            maxWeight: 0,
            maxReps: 0,
            setCount: 0,
          };
          return acc;
        }, {});
      }

      const sessionDetails = await Promise.all(
        sessionList.data.map((session) => gitfitService.getWorkoutSessionById(session.id)),
      );

      return exercises.reduce<Record<string, ExerciseBaseline>>((acc, ex) => {
        const externalId = ex.externalExercise.exerciseId;
        const targetName = normalizeExerciseName(ex.externalExercise.name);
        let previous = '-';
        let maxWeight = 0;
        let maxReps = 0;

        for (const session of sessionDetails) {
          const matchedSets = session.workoutSets.filter(
            (set) =>
              normalizeExerciseName(set.exercise.name) === targetName &&
              set.weightKg != null &&
              set.reps != null,
          );

          for (const matchedSet of matchedSets) {
            maxWeight = Math.max(maxWeight, matchedSet.weightKg ?? 0);
            maxReps = Math.max(maxReps, matchedSet.reps ?? 0);
          }

          if (matchedSets.length > 0) {
            const latestSet = matchedSets[matchedSets.length - 1];
            previous = formatPreviousValue(latestSet.weightKg, latestSet.reps);
            acc[externalId] = { previous, maxWeight, maxReps, setCount: matchedSets.length };
            break;
          }
        }

        if (!acc[externalId]) {
          acc[externalId] = { previous, maxWeight, maxReps, setCount: 0 };
        }
        return acc;
      }, {});
    },
  });

  // Auto-populate sets from previous session when a new exercise is added
  useEffect(() => {
    exercises.forEach((ex) => {
      if (ex.sets.length !== 0) return;
      const exerciseId = ex.externalExercise.exerciseId;
      const baseline = baselineByExercise[exerciseId];
      if (!baseline) return; // wait for baseline query to include this exercise
      const count = baseline.setCount > 0 ? baseline.setCount : 1;
      for (let i = 0; i < count; i++) {
        addSet(ex.id, {
          exerciseDbId: exerciseId,
          exerciseName: ex.externalExercise.name,
          gifUrl: ex.externalExercise.gifUrl,
          previous: baseline.previous,
          setNumber: i + 1,
          reps: 0,
          weightKg: 0,
          rpe: undefined,
          isWarmup: false,
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baselineByExercise, exercises]);

  function pickBestCompletedSet(sets: ActiveSet[]): ActiveSet | null {
    const completedSets = sets.filter((set) => set.isCompleted);
    if (completedSets.length === 0) return null;

    return completedSets.reduce((best, current) => {
      if (!best) return current;

      if (current.weightKg > best.weightKg) return current;
      if (current.weightKg === best.weightKg && current.reps > best.reps) return current;
      return best;
    }, completedSets[0] ?? null);
  }

  function recomputeAchievements(nextExercises: ActiveExercise[]) {
    for (const exercise of nextExercises) {
      const exerciseId = exercise.externalExercise.exerciseId;
      const baseline = baselineByExercise[exerciseId] ?? {
        previous: '-',
        maxWeight: 0,
        maxReps: 0,
      };
      const bestCompletedSet = pickBestCompletedSet(exercise.sets);

      const qualifiesAsRecord =
        bestCompletedSet != null &&
        (bestCompletedSet.weightKg > baseline.maxWeight || bestCompletedSet.reps > baseline.maxReps);

      const nextAchievementSetNumber = qualifiesAsRecord ? bestCompletedSet!.setNumber : null;

      for (const set of exercise.sets) {
        const shouldBeAchievement =
          set.isCompleted && nextAchievementSetNumber != null && set.setNumber === nextAchievementSetNumber;

        if (set.isPr !== shouldBeAchievement) {
          updateSet(exercise.id, set.setNumber, { isPr: shouldBeAchievement });
        }
      }

      const previousAchievementSetNumber = achievementSetByExerciseRef.current[exercise.id] ?? null;
      if (nextAchievementSetNumber !== previousAchievementSetNumber) {
        achievementSetByExerciseRef.current[exercise.id] = nextAchievementSetNumber;

        if (nextAchievementSetNumber != null && bestCompletedSet) {
          showAchievedBanner(bestCompletedSet, baseline);
        }
      }
    }
  }

  useEffect(() => {
    const initial = startedAt
      ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      : 0;
    setElapsed(initial);
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (hideBannerTimeoutRef.current) {
      clearTimeout(hideBannerTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    recomputeAchievements(exercises);
  }, [baselineByExercise]);

  function showAchievedBanner(set: ActiveSet, baseline: ExerciseBaseline) {
    if (hideBannerTimeoutRef.current) {
      clearTimeout(hideBannerTimeoutRef.current);
    }

    const isNewMaxWeight = set.weightKg > baseline.maxWeight;
    const isNewMaxReps = set.reps > baseline.maxReps;

    let message = 'New personal record';
    if (isNewMaxWeight && isNewMaxReps) {
      message = `New Max Weight & Reps - ${set.weightKg}kg x ${set.reps}`;
    } else if (isNewMaxWeight) {
      message = `New Max Weight - ${set.weightKg}kg`;
    } else if (isNewMaxReps) {
      message = `New Max Reps - ${set.reps}`;
    }

    setAchievedBanner({
      exerciseName: set.exerciseName,
      message,
      gifUrl: set.gifUrl,
    });

    bannerTranslateY.stopAnimation();
    bannerTranslateY.setValue(-120);

    Animated.timing(bannerTranslateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();

    hideBannerTimeoutRef.current = setTimeout(() => {
      Animated.timing(bannerTranslateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setAchievedBanner(null));
    }, 2000);
  }

  async function handleToggleSet(exercise: ActiveExercise, setNumber: number) {
    const targetSet = exercise.sets.find((set) => set.setNumber === setNumber);
    if (!targetSet) return;

    // If checking a set with no values entered, auto-fill from previous
    const isChecking = !targetSet.isCompleted;
    if (isChecking && targetSet.weightKg === 0 && targetSet.reps === 0 && targetSet.previous && targetSet.previous !== '-') {
      const parsed = parsePreviousSetValue(targetSet.previous);
      if (parsed) {
        updateSet(exercise.id, setNumber, {
          weightKg: parsed.weightKg,
          reps: parsed.reps,
        });
      }
    }

    toggleSet(exercise.id, setNumber);

    const latestExercises = useWorkoutSessionStore.getState().exercises;
    recomputeAchievements(latestExercises);
  }

  function handleUpdateSet(exerciseId: string, setNumber: number, data: Partial<ActiveSet>) {
    updateSet(exerciseId, setNumber, data);
    const latestExercises = useWorkoutSessionStore.getState().exercises;
    recomputeAchievements(latestExercises);
  }

  function handleRemoveSet(exerciseId: string, setNumber: number) {
    removeSet(exerciseId, setNumber);
    const latestExercises = useWorkoutSessionStore.getState().exercises;
    recomputeAchievements(latestExercises);
  }

  function handleAddSet(exercise: ActiveExercise) {
    const exerciseId = exercise.externalExercise.exerciseId;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const nextNumber = (lastSet?.setNumber ?? 0) + 1;
    addSet(exercise.id, {
      exerciseDbId: exerciseId,
      exerciseName: exercise.externalExercise.name,
      gifUrl: exercise.externalExercise.gifUrl,
      previous: baselineByExercise[exerciseId]?.previous ?? '-',
      setNumber: nextNumber,
      reps: 0,
      weightKg: 0,
      rpe: undefined,
      isWarmup: false,
    });
  }

  function handleMinimize() {
    minimize();
    router.back();
  }

  async function handleFinish() {
    if (!sessionId) {
      router.back();
      return;
    }

    try {
      const completedPayloads = exercises
        .flatMap((exercise) =>
          exercise.sets
            .filter((set) => set.isCompleted)
            .map((set) => ({
              exercise: {
                exerciseDbId: exercise.externalExercise.exerciseId,
                name: exercise.externalExercise.name,
                gifUrl: exercise.externalExercise.gifUrl,
                targetMuscles: Array.isArray(exercise.externalExercise.targetMuscles)
                  ? exercise.externalExercise.targetMuscles
                  : [],
                bodyParts: Array.isArray(exercise.externalExercise.bodyParts)
                  ? exercise.externalExercise.bodyParts
                  : [],
                equipments: Array.isArray(exercise.externalExercise.equipments)
                  ? exercise.externalExercise.equipments
                  : [],
                secondaryMuscles: Array.isArray(exercise.externalExercise.secondaryMuscles)
                  ? exercise.externalExercise.secondaryMuscles
                  : [],
                instructions: Array.isArray(exercise.externalExercise.instructions)
                  ? exercise.externalExercise.instructions
                  : [],
              },
              setNumber: set.setNumber,
              reps: set.reps > 0 ? set.reps : undefined,
              weightKg: set.weightKg > 0 ? set.weightKg : undefined,
              rpe: set.rpe,
              isWarmup: set.isWarmup,
            })),
        );

      for (const payload of completedPayloads) {
        await logSetMutation.mutateAsync(payload);
      }

      await finishMutation.mutateAsync(sessionId);
      trackWorkoutLogged({
        sessionId,
        completedSets: completedSetCount,
        totalVolumeKg: volume,
        durationSeconds: elapsed,
        exerciseCount: exercises.length,
      });
      await queryClient.invalidateQueries({ queryKey: ['sessions', 'completed'] });
      resetSession();
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to finish workout.';
      Alert.alert('Finish failed', message);
    }
  }

  function handleDiscard() {
    setShowDiscardDialog(true);
  }

  async function confirmDiscard() {
    setShowDiscardDialog(false);

    if (sessionId) {
      try {
        await cancelMutation.mutateAsync(sessionId);
      } catch {
        // Local reset still executes so user is not blocked by backend cancellation errors.
      }
    }

    resetSession();
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['left', 'right']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      {achievedBanner ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.achievedBanner,
            { transform: [{ translateY: bannerTranslateY }] },
          ]}
        >
          <Image
            source={{ uri: achievedBanner.gifUrl }}
            style={styles.achievedBannerImage}
            resizeMode="cover"
          />
          <View style={styles.achievedBannerTextWrap}>
            <Text style={styles.achievedBannerTitle} numberOfLines={1}>
              {achievedBanner.exerciseName}
            </Text>
            <Text style={styles.achievedBannerMessage} numberOfLines={1}>
              {achievedBanner.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            minHeight: 61 + insets.top,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleMinimize}
          hitSlop={8}
          style={styles.headerIconButton}
        >
          <MaterialIcons name="keyboard-arrow-down" size={32} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Log Workout</Text>

        <TouchableOpacity
          onPress={() => {
            void handleFinish();
          }}
          disabled={finishMutation.isPending || logSetMutation.isPending}
          style={styles.finishButton}
        >
          <Text style={styles.finishButtonText}>
            {finishMutation.isPending || logSetMutation.isPending ? 'Saving...' : 'Finish'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatDuration(elapsed)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>{volume} Kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sets</Text>
            <Text style={styles.statValue}>{completedReps}</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
      >
        {exercises.length === 0 ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <Image source={exerciseIcon} style={styles.emptyStateIcon} resizeMode="cover" />
            <Text style={styles.emptyTitle}>Get started</Text>
            <Text style={styles.emptyDescription}>
              Add an exercise to start your workout.
            </Text>
          </View>
        ) : (
          /* Exercise cards */
          <View style={styles.exerciseList}>
            {exercises.map((ex) => {
              return (
                <ExerciseLogCard
                  key={ex.id}
                  exercise={ex}
                  onAddSet={() => handleAddSet(ex)}
                  onToggleSet={(setNumber) => {
                    void handleToggleSet(ex, setNumber);
                  }}
                  onUpdateSet={(setNumber, data) => handleUpdateSet(ex.id, setNumber, data)}
                  onRemoveSet={(setNumber) => handleRemoveSet(ex.id, setNumber)}
                  onRemoveExercise={() => removeExercise(ex.id)}
                />
              );
            })}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            onPress={() => router.push('/add-exercise?mode=workout')}
            style={styles.primaryActionButton}
          >
            <MaterialIcons name="add" size={18} color="#f4f4f4" />
            <Text style={styles.primaryActionText}>Add Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDiscard}
            style={styles.secondaryActionButton}
          >
            <Text style={styles.secondaryActionText}>Discard Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DiscardWorkoutDialog
        visible={showDiscardDialog}
        onConfirm={confirmDiscard}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1c1c1e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 61,
    paddingTop: 8,
  },
  headerIconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#f4f4f4',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Lexend_400Regular',
  },
  finishButton: {
    backgroundColor: '#ee9033',
    borderRadius: 8,
    width: 110,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#111111',
    fontSize: 18,
    lineHeight: 28,
    textTransform: 'uppercase',
    fontFamily: 'Lexend_700Bold',
    letterSpacing: -0.45,
  },
  progressSection: {
    backgroundColor: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#1c1c1e',
    paddingBottom: 18,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(217,217,217,0.4)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e08e02',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 42,
    paddingTop: 23,
  },
  statItem: {
    width: 73,
    alignItems: 'flex-start',
  },
  statLabel: {
    color: '#f4f4f4',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Lexend_400Regular',
    marginBottom: 0,
  },
  statValue: {
    color: '#e08e02',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Lexend_400Regular',
  },
  exerciseList: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 36,
    gap: 27,
  },
  emptyStateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1111',
  },
  emptyTitle: {
    color: '#f4f4f4',
    fontSize: 32,
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
  },
  emptyDescription: {
    color: 'rgba(244,244,244,0.5)',
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Lexend_400Regular',
    textAlign: 'center',
  },
  actionsWrap: {
    paddingHorizontal: 48,
    paddingBottom: 40,
    paddingTop: 18,
    gap: 10,
  },
  primaryActionButton: {
    backgroundColor: '#1c1c1e',
    borderWidth: 1,
    borderColor: 'rgba(72,72,71,0.2)',
    borderRadius: 8,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#f4f4f4',
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Lexend_700Bold',
  },
  secondaryActionButton: {
    backgroundColor: '#1c1c1e',
    borderWidth: 1,
    borderColor: 'rgba(72,72,71,0.2)',
    borderRadius: 8,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: '#ff6868',
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Lexend_700Bold',
  },
  achievedBanner: {
    position: 'absolute',
    top: 56,
    left: 20,
    right: 20,
    zIndex: 20,
    backgroundColor: '#1c1c1e',
    borderWidth: 0.5,
    borderColor: '#ee9033',
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 19,
  },
  achievedBannerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d9d9d9',
  },
  achievedBannerTextWrap: {
    flex: 1,
    gap: 7,
  },
  achievedBannerTitle: {
    color: '#f4f4f4',
    fontSize: 20,
    lineHeight: 25,
    fontFamily: 'Lexend_400Regular',
  },
  achievedBannerMessage: {
    color: '#ee9033',
    fontSize: 20,
    lineHeight: 25,
    fontFamily: 'Lexend_400Regular',
  },
});
