import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
};

export default function ExerciseLogCard({
  exercise,
  onAddSet,
  onToggleSet,
  onUpdateSet,
  onRemoveSet,
}: Props) {
  const { externalExercise, sets } = exercise;

  return (
    <View style={styles.card}>
      {/* Exercise header */}
      <View style={styles.header}>
        <Image
          source={{ uri: externalExercise.gifUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <Text style={styles.exerciseName} numberOfLines={2}>
          {externalExercise.name}
        </Text>
        <TouchableOpacity hitSlop={8}>
          <MaterialIcons name="more-vert" size={24} color="#f4f4f4" />
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <TextInput
        style={styles.notes}
        placeholder="Add notes here..."
        placeholderTextColor="#545454"
        multiline
      />

      {/* Set table */}
      {sets.length > 0 && (
        <View style={styles.tableWrap}>
          {/* Column headers */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colText, { width: 24 }]}>SET</Text>
            <Text style={[styles.colText, { flex: 1.35 }]}>PREVIOUS</Text>
            <Text style={[styles.colText, { width: 36, textAlign: 'center' }]}>KG</Text>
            <Text style={[styles.colText, { width: 36, textAlign: 'center' }]}>REPS</Text>
            <View style={{ width: 44, alignItems: 'center' }}>
              <Text style={styles.colText}>RPE</Text>
            </View>
            <View style={{ width: 22, alignItems: 'center' }}>
              <MaterialIcons name="check" size={13} color="#f4f4f4" />
            </View>
          </View>

          {/* Set rows */}
          <View style={styles.setList}>
            {sets.map((set) => (
              <SetRow
                key={set.id ?? `${set.exerciseDbId}-${set.setNumber}`}
                setNumber={set.setNumber}
                previous="-"
                kg={set.weightKg === 0 ? '' : String(set.weightKg)}
                reps={set.reps === 0 ? '' : String(set.reps)}
                rpe={set.rpe != null ? String(set.rpe) : 'RPE'}
                checked={set.isCompleted}
                variant={set.isCompleted ? 'completed' : 'default'}
                onToggle={() => onToggleSet(set.setNumber)}
                onKgChange={(v) => onUpdateSet(set.setNumber, { weightKg: parseFloat(v) || 0 })}
                onRepsChange={(v) => onUpdateSet(set.setNumber, { reps: parseInt(v, 10) || 0 })}
                onDelete={() => onRemoveSet(set.setNumber)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Add set button */}
      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet} activeOpacity={0.7}>
        <MaterialIcons name="add" size={14} color="#f4f4f4" />
        <Text style={styles.addSetText}>Add set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 14,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  exerciseName: {
    flex: 1,
    color: '#ee9033',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Lexend_500Medium',
  },
  notes: {
    color: '#545454',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Lexend_400Regular',
    padding: 0,
  },
  tableWrap: {
    gap: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  colText: {
    color: '#f4f4f4',
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Lexend_400Regular',
  },
  setList: {
    gap: 0,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 38,
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
  },
  addSetText: {
    color: '#f4f4f4',
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'Lexend_500Medium',
  },
});
