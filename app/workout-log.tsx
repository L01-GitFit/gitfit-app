import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { useWorkoutSessionStore } from '@/store/workoutSession.store';
import DiscardWorkoutDialog from '@/components/workout/DiscardWorkoutDialog';
import ExerciseLogCard from '@/components/workout/ExerciseLogCard';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function WorkoutLogScreen() {
  const router = useRouter();
  const startedAt = useWorkoutSessionStore((s) => s.startedAt);
  const minimize = useWorkoutSessionStore((s) => s.minimize);
  const resetSession = useWorkoutSessionStore((s) => s.resetSession);
  const exercises = useWorkoutSessionStore((s) => s.exercises);
  const addSet = useWorkoutSessionStore((s) => s.addSet);
  const updateSet = useWorkoutSessionStore((s) => s.updateSet);
  const toggleSet = useWorkoutSessionStore((s) => s.toggleSet);
  const removeSet = useWorkoutSessionStore((s) => s.removeSet);
  const [elapsed, setElapsed] = useState(0);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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

  useEffect(() => {
    const initial = startedAt
      ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      : 0;
    setElapsed(initial);
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  function handleMinimize() {
    minimize();
    router.back();
  }

  function handleFinish() {
    // TODO: save workout, then navigate back
    router.back();
  }

  function handleDiscard() {
    setShowDiscardDialog(true);
  }

  function confirmDiscard() {
    setShowDiscardDialog(false);
    resetSession();
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleMinimize}
          hitSlop={8}
          style={styles.headerIconButton}
        >
          <MaterialIcons name="keyboard-arrow-down" size={32} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Log Workout</Text>

        <TouchableOpacity
          onPress={handleFinish}
          style={styles.finishButton}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressLabel}>Workout progress</Text>
          <Text style={styles.progressValue}>{completedSetCount}/{totalSetCount || 0} sets</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(progress * 100, totalSetCount > 0 ? 4 : 0)}%` }]} />
        </View>
      </View>

      {/* Stats bar */}
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
          <Text style={styles.statLabel}>Reps</Text>
          <Text style={styles.statValue}>{completedReps}</Text>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
      >
        {exercises.length === 0 ? (
          /* Empty state */
          <View className="flex-1 items-center justify-center px-8 gap-7">
            <MaterialIcons name="fitness-center" size={48} color="#f4f4f4" />
            <Text className="text-[#f4f4f4] text-3xl font-bold text-center">Get started</Text>
            <Text className="text-[rgba(244,244,244,0.5)] text-lg text-center">
              Add an exercise to start your workout.
            </Text>
          </View>
        ) : (
          /* Exercise cards */
          <View style={styles.exerciseList}>
            {exercises.map((ex) => {
              const exerciseId = ex.externalExercise.exerciseId;
              return (
                <ExerciseLogCard
                  key={exerciseId}
                  exercise={ex}
                  onAddSet={() => {
                    const lastSet = ex.sets[ex.sets.length - 1];
                    const nextNumber = (lastSet?.setNumber ?? 0) + 1;
                    addSet(exerciseId, {
                      exerciseDbId: exerciseId,
                      exerciseName: ex.externalExercise.name,
                      gifUrl: ex.externalExercise.gifUrl,
                      setNumber: nextNumber,
                      reps: lastSet?.reps ?? 12,
                      weightKg: lastSet?.weightKg ?? 0,
                      rpe: lastSet?.rpe,
                      isWarmup: false,
                    });
                  }}
                  onToggleSet={(setNumber) => toggleSet(exerciseId, setNumber)}
                  onUpdateSet={(setNumber, data) => updateSet(exerciseId, setNumber, data)}
                  onRemoveSet={(setNumber) => removeSet(exerciseId, setNumber)}
                />
              );
            })}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            onPress={() => router.push('/add-exercise')}
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
    minHeight: 56,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#f4f4f4',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Lexend_500Medium',
  },
  finishButton: {
    backgroundColor: '#ee9033',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  finishButtonText: {
    color: '#111111',
    fontSize: 13,
    lineHeight: 16,
    textTransform: 'uppercase',
    fontFamily: 'Lexend_700Bold',
  },
  progressSection: {
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#f4f4f4',
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Lexend_400Regular',
  },
  progressValue: {
    color: '#e08e02',
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Lexend_500Medium',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#d9d9d9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#e08e02',
  },
  statsBar: {
    backgroundColor: '#1c1c1e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 2,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  statItem: {
    minWidth: 86,
    alignItems: 'flex-start',
  },
  statLabel: {
    color: '#f4f4f4',
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Lexend_400Regular',
    marginBottom: 4,
  },
  statValue: {
    color: '#e08e02',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Lexend_500Medium',
  },
  exerciseList: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actionsWrap: {
    paddingHorizontal: 48,
    paddingBottom: 40,
    paddingTop: 24,
    gap: 10,
  },
  primaryActionButton: {
    backgroundColor: '#1c1c1e',
    borderWidth: 1,
    borderColor: 'rgba(72,72,71,0.2)',
    borderRadius: 10,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#f4f4f4',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: 'Lexend_500Medium',
  },
  secondaryActionButton: {
    backgroundColor: '#1c1c1e',
    borderWidth: 1,
    borderColor: 'rgba(72,72,71,0.2)',
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: '#ff6868',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: 'Lexend_500Medium',
  },
});
