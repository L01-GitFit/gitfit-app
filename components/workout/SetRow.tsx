import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

export type SetRowVariant = 'default' | 'completed' | 'achievement';

type SetRowProps = {
  setNumber: number;
  previous: string;
  kg: string;
  reps: string;
  rpe: string;
  checked?: boolean;
  variant?: SetRowVariant;
  achievementLabel?: string;
  onToggle?: () => void;
};

const VARIANT_STYLES = {
  default: {
    backgroundColor: '#111111',
    borderColor: '#1E1E1E',
    textColor: '#F4F4F4',
    mutedColor: '#CFCFCF',
    checkColor: '#F1F1F1',
  },
  completed: {
    backgroundColor: '#4E8E1D',
    borderColor: '#4E8E1D',
    textColor: '#F8FFF0',
    mutedColor: '#F8FFF0',
    checkColor: '#DDF4C8',
  },
  achievement: {
    backgroundColor: '#F2B108',
    borderColor: '#F2B108',
    textColor: '#2A1A00',
    mutedColor: '#2A1A00',
    checkColor: '#C98900',
  },
} as const;

export function SetRow({
  setNumber,
  previous,
  kg,
  reps,
  rpe,
  checked = false,
  variant = 'default',
  achievementLabel,
  onToggle,
}: SetRowProps) {
  const palette = VARIANT_STYLES[variant];

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor },
      ]}>
      <Text style={[styles.setText, { color: palette.textColor }]}>{setNumber}</Text>
      <Text style={[styles.previousText, { color: palette.mutedColor }]} numberOfLines={1}>
        {previous}
      </Text>
      <Text style={[styles.metricText, { color: palette.textColor }]}>{kg}</Text>
      <Text style={[styles.metricText, { color: palette.textColor }]}>{reps}</Text>
      <View style={styles.rpeWrap}>
        <Text style={[styles.rpePill, { color: palette.mutedColor }]}>{rpe}</Text>
        {achievementLabel ? <Text style={styles.achievementText}>{achievementLabel}</Text> : null}
      </View>
      <Pressable
        hitSlop={6}
        onPress={onToggle}
        style={[
          styles.checkButton,
          checked && {
            backgroundColor: palette.checkColor,
            borderColor: palette.checkColor,
          },
        ]}>
        <MaterialIcons
          name="check"
          size={10}
          color={checked ? '#111111' : palette.mutedColor}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 20,
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  setText: {
    width: 16,
    fontFamily: 'Lexend_500Medium',
    fontSize: 9,
  },
  previousText: {
    flex: 1.35,
    fontFamily: 'Lexend_400Regular',
    fontSize: 8,
    paddingRight: 4,
  },
  metricText: {
    width: 30,
    textAlign: 'center',
    fontFamily: 'Lexend_500Medium',
    fontSize: 8,
  },
  rpeWrap: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpePill: {
    minWidth: 28,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    textAlign: 'center',
    fontFamily: 'Lexend_500Medium',
    fontSize: 7,
    overflow: 'hidden',
  },
  achievementText: {
    marginTop: 1,
    color: '#2A1A00',
    fontFamily: 'Lexend_700Bold',
    fontSize: 5,
    letterSpacing: 0.2,
  },
  checkButton: {
    width: 14,
    height: 14,
    marginLeft: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F1F1',
  },
});
