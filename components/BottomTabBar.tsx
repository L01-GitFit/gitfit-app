import { useEffect, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FloatingWorkoutBanner from '@/components/workout/FloatingWorkoutBanner';
import DiscardWorkoutDialog from '@/components/workout/DiscardWorkoutDialog';
import { useWorkoutSessionStore } from '@/store/workoutSession.store';

type TabName = 'home' | 'workout' | 'profile';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const TABS: { name: TabName; label: string; icon: string }[] = [
  { name: 'home', label: 'HOME', icon: 'home' },
  { name: 'workout', label: 'WORKOUT', icon: 'fitness-center' },
  { name: 'profile', label: 'PROFILE', icon: 'person' },
];

export default function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const sessionId = useWorkoutSessionStore((s) => s.sessionId);
  const isMinimized = useWorkoutSessionStore((s) => s.isMinimized);
  const startedAt = useWorkoutSessionStore((s) => s.startedAt);
  const exercises = useWorkoutSessionStore((s) => s.exercises);
  const restore = useWorkoutSessionStore((s) => s.restore);
  const resetSession = useWorkoutSessionStore((s) => s.resetSession);

  const [elapsed, setElapsed] = useState(0);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (!startedAt || !sessionId) return;
    const initial = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    setElapsed(initial);
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [startedAt, sessionId]);

  const lastExercise = exercises[exercises.length - 1];
  const exerciseName = lastExercise?.externalExercise.name ?? 'Workout in progress';

  function handleBannerExpand() {
    restore();
    router.push('/workout-log');
  }

  function confirmDiscard() {
    setShowDiscardDialog(false);
    resetSession();
  }

  return (
    <View style={{ backgroundColor: '#000' }}>
      {sessionId && isMinimized && (
        <FloatingWorkoutBanner
          workout={{ duration: formatDuration(elapsed), exercise: exerciseName }}
          onExpand={handleBannerExpand}
          onDiscard={() => setShowDiscardDialog(true)}
        />
      )}
      <View style={styles.container}>
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index]?.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index].name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptors[state.routes[index]?.key]?.options?.tabBarAccessibilityLabel}>
            {isFocused && <View style={styles.activePill} />}
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={isFocused ? '#ee9033' : 'rgba(244,244,244,0.5)'}
            />
            <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      </View>

      <DiscardWorkoutDialog
        visible={showDiscardDialog}
        onConfirm={confirmDiscard}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 27,
    borderTopWidth: 1,
    borderTopColor: 'rgba(72,72,71,0.1)',
    gap: 21,
    // subtle top shadow in orange
    shadowColor: '#ee9033',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 53,
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 8,
    backgroundColor: 'rgba(238,144,51,0.18)',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#ee9033',
  },
  labelInactive: {
    color: 'rgba(244,244,244,0.5)',
  },
});
