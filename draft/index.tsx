import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { SetRow, SetRowVariant } from '@/components/workout/SetRow';

type ScreenMode = 'logWorkout' | 'addExercise';
type FilterKey = 'All' | 'Chest' | 'Back' | 'Legs' | 'Shoulders';

type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: Exclude<FilterKey, 'All'>;
  equipment: string;
};

type WorkoutSet = {
  id: string;
  previous: string;
  kg: string;
  reps: string;
  rpe: string;
  checked: boolean;
  achievement?: string;
};

type LoggedExercise = {
  id: string;
  name: string;
  equipmentLabel: string;
  notePlaceholder: string;
  sets: WorkoutSet[];
};

const COLORS = {
  background: '#000000',
  surface: '#121212',
  surfaceMuted: '#1D1D1D',
  surfaceSoft: '#242424',
  border: '#2E2E2E',
  text: '#F4F4F4',
  textMuted: '#8F8F8F',
  primary: '#EE9033',
  danger: '#F45C5C',
  success: '#4E8E1D',
  achievement: '#F2B108',
};

const FILTERS: FilterKey[] = ['All', 'Chest', 'Back', 'Legs', 'Shoulders'];

const EXERCISE_LIBRARY: ExerciseOption[] = [
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'incline-dumbbell', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell' },
  { id: 'back-squat', name: 'Back Squat', muscleGroup: 'Legs', equipment: 'Barbell' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'Legs', equipment: 'Barbell' },
  { id: 'shoulder-press', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell' },
];

const EXERCISE_TEMPLATES: Record<string, Omit<LoggedExercise, 'id'>> = {
  'bench-press': {
    name: 'Bench Press',
    equipmentLabel: 'Barbell',
    notePlaceholder: 'Add notes here...',
    sets: [
      { id: 'set-1', previous: '-', kg: '40', reps: '12', rpe: 'RPE', checked: false },
      { id: 'set-2', previous: '40 kg x 12', kg: '40', reps: '12', rpe: 'RPE', checked: false },
      { id: 'set-3', previous: '40 kg x 12', kg: '40', reps: '10', rpe: 'RPE', checked: false },
      { id: 'set-4', previous: '40 kg x 12', kg: '60', reps: '12', rpe: 'RPE', checked: false },
    ],
  },
  'incline-dumbbell': {
    name: 'Incline Dumbbell Press',
    equipmentLabel: 'Dumbbell',
    notePlaceholder: 'Add notes here...',
    sets: [
      { id: 'set-1', previous: '-', kg: '22.5', reps: '10', rpe: 'RPE', checked: false },
      { id: 'set-2', previous: '20 kg x 10', kg: '22.5', reps: '10', rpe: 'RPE', checked: false },
      { id: 'set-3', previous: '20 kg x 10', kg: '22.5', reps: '8', rpe: 'RPE', checked: false },
      { id: 'set-4', previous: '20 kg x 8', kg: '25', reps: '8', rpe: 'RPE', checked: false },
    ],
  },
  'lat-pulldown': {
    name: 'Lat Pulldown',
    equipmentLabel: 'Cable',
    notePlaceholder: 'Add notes here...',
    sets: [
      { id: 'set-1', previous: '-', kg: '45', reps: '12', rpe: 'RPE', checked: false },
      { id: 'set-2', previous: '40 kg x 12', kg: '45', reps: '12', rpe: 'RPE', checked: false },
      { id: 'set-3', previous: '40 kg x 12', kg: '45', reps: '10', rpe: 'RPE', checked: false },
      { id: 'set-4', previous: '42.5 kg x 10', kg: '50', reps: '10', rpe: 'RPE', checked: false },
    ],
  },
  'barbell-row': {
    name: 'Barbell Row',
    equipmentLabel: 'Barbell',
    notePlaceholder: 'Add notes here...',
    sets: [
      { id: 'set-1', previous: '-', kg: '50', reps: '10', rpe: 'RPE', checked: false },
      { id: 'set-2', previous: '45 kg x 10', kg: '50', reps: '10', rpe: 'RPE', checked: false },
      { id: 'set-3', previous: '45 kg x 10', kg: '50', reps: '8', rpe: 'RPE', checked: false },
      { id: 'set-4', previous: '47.5 kg x 8', kg: '55', reps: '8', rpe: 'RPE', checked: false },
    ],
  },
  'back-squat': {
    name: 'Back Squat',
    equipmentLabel: 'Barbell',
    notePlaceholder: 'Add notes here...',
    sets: [
      { id: 'set-1', previous: '-', kg: '80', reps: '6', rpe: 'RPE', checked: false },
      { id: 'set-2', previous: '75 kg x 6', kg: '80', reps: '6', rpe: 'RPE', checked: false },
      { id: 'set-3', previous: '75 kg x 6', kg: '80', reps: '6', rpe: 'RPE', checked: false },
      { id: 'set-4', previous: '77.5 kg x 6', kg: '85', reps: '6', rpe: 'RPE', checked: false },
    ],
  },
  'romanian-deadlift': {
    name: 'Romanian Deadlift',
    equipmentLabel: 'Barbell',
    notePlaceholder: 'Add notes here...',
    sets: [
      { id: 'set-1', previous: '-', kg: '70', reps: '8', rpe: 'RPE', checked: false },
      { id: 'set-2', previous: '65 kg x 8', kg: '70', reps: '8', rpe: 'RPE', checked: false },
      { id: 'set-3', previous: '65 kg x 8', kg: '70', reps: '8', rpe: 'RPE', checked: false },
      { id: 'set-4', previous: '67.5 kg x 8', kg: '75', reps: '8', rpe: 'RPE', checked: false },
    ],
  },
  'shoulder-press': {
    name: 'Shoulder Press',
    equipmentLabel: 'Dumbbell',
    notePlaceholder: 'Add notes here...',
    sets: [
      { id: 'set-1', previous: '-', kg: '18', reps: '10', rpe: 'RPE', checked: false },
      { id: 'set-2', previous: '16 kg x 10', kg: '18', reps: '10', rpe: 'RPE', checked: false },
      { id: 'set-3', previous: '16 kg x 10', kg: '18', reps: '8', rpe: 'RPE', checked: false },
      { id: 'set-4', previous: '16 kg x 8', kg: '20', reps: '8', rpe: 'RPE', checked: false },
    ],
  },
  'lateral-raise': {
    name: 'Lateral Raise',
    equipmentLabel: 'Dumbbell',
    notePlaceholder: 'Add notes here...',
    sets: [
      { id: 'set-1', previous: '-', kg: '9', reps: '15', rpe: 'RPE', checked: false },
      { id: 'set-2', previous: '8 kg x 15', kg: '9', reps: '15', rpe: 'RPE', checked: false },
      { id: 'set-3', previous: '8 kg x 15', kg: '9', reps: '12', rpe: 'RPE', checked: false },
      { id: 'set-4', previous: '8 kg x 12', kg: '10', reps: '12', rpe: 'RPE', checked: false },
    ],
  },
};

type FinishedWorkoutResult = {
  exercises: LoggedExercise[];
  bestSetVolume: number;
};

function getSetVariant(set: WorkoutSet): SetRowVariant {
  if (set.checked && set.achievement) {
    return 'achievement';
  }

  if (set.checked) {
    return 'completed';
  }

  return 'default';
}

function toNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateTotalVolume(exercises: LoggedExercise[]) {
  return exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets.reduce((setTotal, set) => {
        return setTotal + toNumber(set.kg) * toNumber(set.reps);
      }, 0)
    );
  }, 0);
}

function buildFinishedWorkoutState(exercises: LoggedExercise[]): FinishedWorkoutResult {
  let bestVolume = -1;
  let bestExerciseId = '';
  let bestSetId = '';

  exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      const currentVolume = toNumber(set.kg) * toNumber(set.reps);

      if (currentVolume > bestVolume) {
        bestVolume = currentVolume;   
        bestExerciseId = exercise.id;
        bestSetId = set.id;
      }
    });
  });

  return {
    bestSetVolume: bestVolume,
    exercises: exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({
        ...set,
        checked: true,
        achievement:
          exercise.id === bestExerciseId && set.id === bestSetId ? 'BEST' : undefined,
      })),
    })),
  };
}

export default function WorkoutLogScreen() {
  const [mode, setMode] = useState<ScreenMode>('logWorkout');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('All');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [bestSetVolume, setBestSetVolume] = useState<number | null>(null);

  const filteredExercises = EXERCISE_LIBRARY.filter((exercise) => {
    const matchesFilter = selectedFilter === 'All' || exercise.muscleGroup === selectedFilter;
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      exercise.name.toLowerCase().includes(searchQuery.trim().toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalSets = useMemo(
    () => loggedExercises.reduce((count, exercise) => count + exercise.sets.length, 0),
    [loggedExercises],
  );

  const completedSetCount = useMemo(
    () =>
      loggedExercises.reduce((count, exercise) => {
        return count + exercise.sets.filter((set) => set.checked).length;
      }, 0),
    [loggedExercises],
  );

  const totalVolume = useMemo(() => calculateTotalVolume(loggedExercises), [loggedExercises]);

  const durationLabel = workoutFinished
    ? '3min 6s'
    : loggedExercises.length === 0
      ? '1s'
      : completedSetCount === 0
        ? '5s'
        : '3min 6s';

  const finishWorkout = () => {
    if (loggedExercises.length === 0) {
      return;
    }

    const finishedWorkout = buildFinishedWorkoutState(loggedExercises);
    setLoggedExercises(finishedWorkout.exercises);
    setBestSetVolume(finishedWorkout.bestSetVolume > 0 ? finishedWorkout.bestSetVolume : null);
    setWorkoutFinished(true);
  };

  const addSelectedExercise = () => {
    if (!selectedExerciseId) {
      return;
    }

    const template = EXERCISE_TEMPLATES[selectedExerciseId];

    if (!template) {
      return;
    }

    setLoggedExercises((current) => {
      const alreadyAdded = current.some((exercise) => exercise.id === selectedExerciseId);

      if (alreadyAdded) {
        return current;
      }

      return [...current, { id: selectedExerciseId, ...template }];
    });

    setWorkoutFinished(false);
    setBestSetVolume(null);
    setMode('logWorkout');
    setSelectedExerciseId(null);
    setSearchQuery('');
    setSelectedFilter('All');
  };

  const toggleSet = (exerciseId: string, setId: string) => {
    if (workoutFinished) {
      return;
    }

    setLoggedExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setId ? { ...set, checked: !set.checked } : set,
          ),
        };
      }),
    );
  };

  const addSetToExercise = (exerciseId: string) => {
    if (workoutFinished) {
      return;
    }

    setLoggedExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const nextSetNumber = exercise.sets.length + 1;
        const lastSet = exercise.sets[exercise.sets.length - 1];

        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: `set-${nextSetNumber}`,
              previous: `${lastSet.kg} kg x ${lastSet.reps}`,
              kg: lastSet.kg,
              reps: lastSet.reps,
              rpe: 'RPE',
              checked: false,
            },
          ],
        };
      }),
    );
  };

  const removeExercise = (exerciseId: string) => {
    setLoggedExercises((current) => {
      const nextExercises = current.filter((exercise) => exercise.id !== exerciseId);

      if (nextExercises.length === 0) {
        setWorkoutFinished(false);
        setBestSetVolume(null);
        return nextExercises;
      }

      if (workoutFinished) {
        const nextFinishedWorkout = buildFinishedWorkoutState(nextExercises);
        setBestSetVolume(
          nextFinishedWorkout.bestSetVolume > 0 ? nextFinishedWorkout.bestSetVolume : null,
        );
        return nextFinishedWorkout.exercises;
      }

      return nextExercises;
    });
  };

  const openExerciseMenu = (exercise: LoggedExercise) => {
    Alert.alert(exercise.name, 'Choose an action', [
      {
        text: 'Edit exercise',
        onPress: () => Alert.alert('Edit exercise', `${exercise.name} editing is not available yet.`),
      },
      {
        text: 'Remove exercise',
        style: 'destructive',
        onPress: () => removeExercise(exercise.id),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const resetWorkout = () => {
    setWorkoutFinished(false);
    setBestSetVolume(null);
    setLoggedExercises([]);
    setMode('logWorkout');
  };

  const renderMetricBar = () => (
    <View style={styles.metricBar}>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>Duration</Text>
        <Text style={styles.metricValue}>{durationLabel}</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>Volume</Text>
        <Text style={styles.metricValue}>{totalVolume} Kg</Text>
      </View>
      <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>Sets</Text>
        <Text style={styles.metricValue}>{completedSetCount}</Text>
      </View>
    </View>
  );

  const renderAchievementBanner = () => {
    if (!workoutFinished || bestSetVolume === null) {
      return null;
    }

    return (
      <View style={styles.achievementBanner}>
        <Text style={styles.achievementBannerTitle}>New best set unlocked</Text>
        <Text style={styles.achievementBannerSubtitle}>Best Set Volume - {bestSetVolume} kg</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="fitness-center" size={26} color={COLORS.text} />
      <Text style={styles.emptyStateTitle}>Get started</Text>
      <Text style={styles.emptyStateText}>Add an exercise to start your workout.</Text>

      <Pressable style={styles.actionButton} onPress={() => setMode('addExercise')}>
        <Text style={styles.actionButtonText}>+ Add Exercise</Text>
      </Pressable>
      <Pressable style={styles.discardButton} onPress={resetWorkout}>
        <Text style={styles.discardButtonText}>Discard Workout</Text>
      </Pressable>
    </View>
  );

  const renderExerciseBlock = (exercise: LoggedExercise) => (
    <View key={exercise.id} style={styles.exerciseSection}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseAvatar}>
          <MaterialIcons name="fitness-center" size={15} color="#111111" />
        </View>
        <Text style={styles.exerciseName}>
          {exercise.name} ({exercise.equipmentLabel})
        </Text>
        <Pressable
          hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
          style={styles.menuButton}
          onPress={() => {
            console.log('three dots pressed');
            Alert.alert('Exercise options', 'Choose', [
              { text: 'Edit exercise' },
              {
                text: 'Remove exercise',
                style: 'destructive',
                onPress: () => removeExercise(exercise.id),
              },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}>
          <MaterialIcons name="more-vert" size={15} color={COLORS.text} />
        </Pressable>
      </View>

      <Text style={styles.noteText}>{exercise.notePlaceholder}</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colSet]}>Set</Text>
        <Text style={[styles.tableHeaderText, styles.colPrevious]}>Previous</Text>
        <Text style={[styles.tableHeaderText, styles.colSmall]}>Kg</Text>
        <Text style={[styles.tableHeaderText, styles.colSmall]}>Reps</Text>
        <Text style={[styles.tableHeaderText, styles.colRpe]}>RPE</Text>
        <View style={styles.colCheck}>
          <MaterialIcons name="check" size={10} color={COLORS.text} />
        </View>
      </View>

      <View style={styles.rowsContainer}>
        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            setNumber={index + 1}
            previous={set.previous}
            kg={set.kg}
            reps={set.reps}
            rpe={set.rpe}
            checked={set.checked}
            variant={getSetVariant(set)}
            achievementLabel={set.achievement}
            onToggle={() => toggleSet(exercise.id, set.id)}
          />
        ))}
      </View>

      <Pressable style={styles.addSetButton} onPress={() => addSetToExercise(exercise.id)}>
        <Text style={styles.addSetButtonText}>+ Add set</Text>
      </Pressable>
    </View>
  );

  const renderLogWorkout = () => {
    const isEmpty = loggedExercises.length === 0;

    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <MaterialIcons name="keyboard-arrow-down" size={18} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Log Workout</Text>
          <Pressable
            style={[
              styles.finishButton,
              (isEmpty || workoutFinished) && styles.finishButtonDisabled,
            ]}
            onPress={finishWorkout}
            disabled={isEmpty || workoutFinished}>
            <Text style={styles.finishButtonText}>FINISH</Text>
          </Pressable>
        </View>

        {renderMetricBar()}
        {renderAchievementBanner()}

        {isEmpty ? (
          renderEmptyState()
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {loggedExercises.map(renderExerciseBlock)}

            <Pressable style={styles.actionButton} onPress={() => setMode('addExercise')}>
              <Text style={styles.actionButtonText}>+ Add Exercise</Text>
            </Pressable>
            <Pressable style={styles.discardButton} onPress={resetWorkout}>
              <Text style={styles.discardButtonText}>Discard Workout</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>
    );
  };

  const renderAddExercise = () => {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.addHeader}>
          <Pressable style={styles.backButton} onPress={() => setMode('logWorkout')}>
            <MaterialIcons name="arrow-back" size={18} color={COLORS.text} />
          </Pressable>
          <Text style={styles.addHeaderTitle}>Add Exercise</Text>
          <View style={styles.addHeaderSpacer} />
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {FILTERS.map((filter) => {
            const selected = filter === selectedFilter;

            return (
              <Pressable
                key={filter}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
                onPress={() => setSelectedFilter(filter)}>
                <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.exerciseList}>
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              title={exercise.name}
              muscleGroup={exercise.muscleGroup}
              equipment={exercise.equipment}
              selected={selectedExerciseId === exercise.id}
              disabled={loggedExercises.some((loggedExercise) => loggedExercise.id === exercise.id)}
              onPress={() => setSelectedExerciseId(exercise.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.addFooter}>
          <Pressable
            style={[
              styles.addExerciseButton,
              !selectedExerciseId && styles.finishButtonDisabled,
            ]}
            onPress={addSelectedExercise}
            disabled={!selectedExerciseId}>
            <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {mode === 'logWorkout' ? renderLogWorkout() : renderAddExercise()}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
    marginLeft: 4,
    textAlign: 'left',
  },
  finishButton: {
    minWidth: 52,
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.45,
  },
  finishButtonText: {
    color: '#111111',
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  metricBar: {
    flexDirection: 'row',
    borderTopWidth: 3,
    borderTopColor: '#555555',
    borderBottomWidth: 1,
    borderBottomColor: '#202020',
    paddingTop: 10,
    paddingBottom: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    color: COLORS.text,
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    marginBottom: 2,
  },
  metricValue: {
    color: COLORS.primary,
    fontFamily: 'Lexend_500Medium',
    fontSize: 10,
  },
  achievementBanner: {
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.achievement,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  achievementBannerTitle: {
    color: COLORS.text,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
    marginBottom: 2,
  },
  achievementBannerSubtitle: {
    color: COLORS.primary,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 72,
  },
  emptyStateTitle: {
    color: COLORS.text,
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    marginTop: 16,
  },
  emptyStateText: {
    color: COLORS.textMuted,
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    marginTop: 10,
    marginBottom: 24,
  },
  actionButton: {
    alignSelf: 'stretch',
    height: 17,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: COLORS.text,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
  },
  discardButton: {
    alignSelf: 'stretch',
    height: 17,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  discardButtonText: {
    color: COLORS.danger,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
  },
  scrollContent: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  exerciseSection: {
    marginBottom: 18,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  exerciseName: {
    flex: 1,
    color: COLORS.primary,
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
  },
  menuButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  noteText: {
    color: '#636363',
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  tableHeaderText: {
    color: COLORS.text,
    fontFamily: 'Lexend_700Bold',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  colSet: {
    width: 16,
  },
  colPrevious: {
    flex: 1.35,
  },
  colSmall: {
    width: 30,
    textAlign: 'center',
  },
  colRpe: {
    width: 34,
    textAlign: 'center',
  },
  colCheck: {
    width: 20,
    alignItems: 'flex-end',
  },
  rowsContainer: {
    gap: 3,
  },
  addSetButton: {
    alignSelf: 'center',
    height: 17,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginTop: 12,
  },
  addSetButtonText: {
    color: COLORS.text,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
  },
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  addHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    marginRight: 24,
  },
  addHeaderSpacer: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
  },
  filterRow: {
    gap: 10,
    paddingVertical: 16,
    paddingRight: 16,
  },
  filterChip: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  filterChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(238, 144, 51, 0.16)',
  },
  filterChipText: {
    color: COLORS.textMuted,
    fontFamily: 'Lexend_500Medium',
    fontSize: 12,
  },
  filterChipTextSelected: {
    color: COLORS.primary,
  },
  exerciseList: {
    gap: 12,
    paddingBottom: 18,
  },
  addFooter: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  addExerciseButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addExerciseButtonText: {
    color: '#111111',
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
  },
});
