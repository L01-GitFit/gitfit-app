import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { SetRow } from './SetRow';
import type { ActiveExercise, ActiveSet } from '@/store/workoutSession.store';

type Props = {
  exercise: ActiveExercise;
  onAddSet: () => void;
  onToggleSet: (setNumber: number) => void;
  onUpdateSet: (
    setNumber: number,
    data: Partial<Pick<ActiveSet, 'weightKg' | 'reps' | 'rpe'>>,
  ) => void;
  onRemoveSet: (setNumber: number) => void;
  onRemoveExercise?: () => void;
};

export default function ExerciseLogCard({
  exercise,
  onAddSet,
  onToggleSet,
  onUpdateSet,
  onRemoveSet,
  onRemoveExercise,
}: Props) {
  const { externalExercise, sets } = exercise;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={{ uri: externalExercise.gifUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <Text style={styles.exerciseName} numberOfLines={2}>
          {externalExercise.name}
        </Text>
        <TouchableOpacity
          hitSlop={8}
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              'Remove Exercise',
              `Remove "${externalExercise.name}" from this workout?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => onRemoveExercise?.() },
              ],
            );
          }}
        >
          <MaterialIcons name="more-vert" size={24} color="#f4f4f4" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.notes}
        placeholder="Add notes here..."
        placeholderTextColor="#545454"
        multiline
      />

      {sets.length > 0 && (
        <View style={styles.tableWrap}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colText, { width: 30 }]}>SET</Text>
            <Text style={[styles.colText, { width: 85, textAlign: 'center' }]}>PREVIOUS</Text>
            <Text style={[styles.colText, { width: 24, textAlign: 'center' }]}>KG</Text>
            <Text style={[styles.colText, { width: 42, textAlign: 'center' }]}>REPS</Text>
            <View style={styles.rpeHeader}>
              <Text style={styles.colText}>RPE</Text>
            </View>
            <View style={styles.checkHeader}>
              <MaterialIcons name="check" size={16} color="#f4f4f4" />
            </View>
          </View>

          <View style={styles.setList}>
            {sets.map((set) => (
              <SetRow
                key={set.id ?? `${set.exerciseDbId}-${set.setNumber}`}
                setNumber={set.setNumber}
                previous={set.previous ?? '-'}
                kg={set.weightKg === 0 ? '' : String(set.weightKg)}
                reps={set.reps === 0 ? '' : String(set.reps)}
                rpe={set.rpe != null ? String(set.rpe) : 'RPE'}
                checked={set.isCompleted}
                variant={set.isPr ? 'achievement' : set.isCompleted ? 'completed' : 'default'}
                onToggle={() => onToggleSet(set.setNumber)}
                onKgChange={(v) => onUpdateSet(set.setNumber, { weightKg: parseFloat(v) || 0 })}
                onRepsChange={(v) => onUpdateSet(set.setNumber, { reps: parseInt(v, 10) || 0 })}
                onDelete={() => onRemoveSet(set.setNumber)}
              />
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet} activeOpacity={0.7}>
        <MaterialIcons name="add" size={12} color="#f4f4f4" />
        <Text style={styles.addSetText}>Add set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 19,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d9d9d9',
  },
  moreButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: {
    flex: 1,
    color: '#ee9033',
    fontSize: 20,
    lineHeight: 25,
    fontFamily: 'Lexend_400Regular',
  },
  notes: {
    color: '#545454',
    fontSize: 20,
    lineHeight: 25,
    fontFamily: 'Lexend_400Regular',
    padding: 0,
    minHeight: 25,
  },
  tableWrap: {
    gap: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 9,
    paddingBottom: 10,
  },
  colText: {
    color: '#f4f4f4',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Lexend_400Regular',
  },
  rpeHeader: {
    width: 64,
    alignItems: 'center',
  },
  checkHeader: {
    width: 20,
    alignItems: 'center',
  },
  setList: {
    gap: 0,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 34,
    width: 152,
    alignSelf: 'center',
    backgroundColor: '#1c1c1e',
    borderWidth: 1,
    borderColor: 'rgba(72,72,71,0.2)',
    borderRadius: 8,
  },
  addSetText: {
    color: '#f4f4f4',
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Lexend_700Bold',
  },
});
