import { View, Text, StyleSheet } from 'react-native';

/**
 * Workout tab screen — placeholder.
 * TODO: Implement the workout logging and history UI.
 */
export default function WorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
  },
  title: {
    color: '#f4f4f4',
    fontSize: 24,
    fontFamily: 'Lexend_700Bold',
  },
});
