import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Local asset imports
const containerIcon = require('../../assets/container.png');
const addNotesIcon = require('../../assets/add_notes.png');
const searchIcon = require('../../assets/search_icon.png');

function StatusBarComponent() {
  return null; // System StatusBar handles this on iOS
}

function ActionCard({ iconSource, label, onPress }: { iconSource: number; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.actionCardInner}>
        <Image source={iconSource} style={styles.actionIcon} />
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: '#000', paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout</Text>
      </View>

      {/* Start Empty Workout Button */}
      <TouchableOpacity style={styles.startButton} activeOpacity={0.8}>
        <Image source={containerIcon} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Start Empty Workout</Text>
      </TouchableOpacity>

      {/* Routines Label */}
      <View style={styles.routinesLabel}>
        <Text style={styles.subtitle}>Routines</Text>
      </View>

      {/* Action Cards */}
      <View style={styles.cardsContainer}>
        <ActionCard iconSource={addNotesIcon} label="New Routines" onPress={() => router.push('/create-routine')} />
        <ActionCard iconSource={searchIcon} label="Explore Routines" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  routinesLabel: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#ee9033',
    borderRadius: 8,
    height: 30,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  buttonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '400',
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginTop: 24,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ee9033',
    borderRadius: 8,
    padding: 10,
  },
  actionCardInner: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 69,
    gap: 8,
  },
  actionIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  actionLabel: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
