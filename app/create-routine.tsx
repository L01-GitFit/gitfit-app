import { Stack } from 'expo-router';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Local asset imports
const exerciseIcon = require('../assets/exercise.png');
const addExerciseIcon = require('../assets/add_exercise.png');

export default function CreateRoutineScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />

        {/* Header Bar + Nav Row */}
        <View style={styles.headerBar}>
          <View style={styles.navRow}>
            <TouchableOpacity>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Routine</Text>
            <TouchableOpacity>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Content */}
      <View style={styles.form}>
        {/* Routine Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Routine title"
            placeholderTextColor="rgba(244,244,244,0.5)"
          />
        </View>

        {/* Exercise Icon + Helper Text */}
        <View style={styles.centerContent}>
          <Image source={exerciseIcon} style={styles.exerciseIcon} />
          <Text style={styles.helperText}>Get started by adding an exercise to your routine.</Text>
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
          <Image source={addExerciseIcon} style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerBar: {
    height: 89,
    backgroundColor: '#1c1c1e',
    justifyContent: 'flex-end',
  },
  navRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  cancelText: {
    color: '#007ce2',
    fontSize: 12,
    fontWeight: '300',
  },
  title: {
    color: '#f4f4f4',
    fontSize: 24,
    fontWeight: '400',
  },
  saveText: {
    color: '#007ce2',
    fontSize: 12,
    fontWeight: '300',
  },
  form: {
    paddingHorizontal: 16,
    marginTop: 14,
    alignItems: 'center',
    gap: 14,
  },
  inputContainer: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#1c1c1e',
    paddingVertical: 10,
  },
  input: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '400',
  },
  centerContent: {
    alignItems: 'center',
    width: 358,
    gap: 27,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
  },
  helperText: {
    color: 'rgba(244,244,244,0.5)',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 28,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    height: 30,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(72,72,71,0.2)',
  },
  addButtonIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  addButtonText: {
    color: '#f4f4f4',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
