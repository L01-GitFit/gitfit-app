import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

type ExerciseCardProps = {
  title: string;
  muscleGroup: string;
  equipment: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

const COLORS = {
  surface: '#141414',
  border: '#2A2A2A',
  text: '#F4F4F4',
  textMuted: '#A7A7A7',
  primary: '#EE9033',
};

export function ExerciseCard({
  title,
  muscleGroup,
  equipment,
  selected = false,
  disabled = false,
  onPress,
}: ExerciseCardProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}>
      <View style={styles.leadingIcon}>
        <MaterialIcons name="fitness-center" size={20} color={selected ? '#111111' : COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          {muscleGroup} - {equipment}
        </Text>
      </View>
      <View style={[styles.selectionIndicator, selected && styles.selectionIndicatorSelected]}>
        {disabled ? (
          <MaterialIcons name="check" size={16} color={COLORS.textMuted} />
        ) : selected ? (
          <MaterialIcons name="done" size={16} color="#111111" />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 82,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(238, 144, 51, 0.16)',
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  leadingIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(238, 144, 51, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    marginBottom: 5,
  },
  meta: {
    color: COLORS.textMuted,
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
});
