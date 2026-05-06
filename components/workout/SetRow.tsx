import { useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  onKgChange?: (value: string) => void;
  onRepsChange?: (value: string) => void;
  onDelete?: () => void;
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
  onKgChange,
  onRepsChange,
  onDelete,
}: SetRowProps) {
  const palette = VARIANT_STYLES[variant];
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidthRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx < -8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(Math.max(g.dx, -110));
      },
      onPanResponderRelease: (_, g) => {
        const threshold = rowWidthRef.current > 0 ? -(rowWidthRef.current / 2) : -80;
        if (g.dx <= threshold) {
          Animated.timing(translateX, {
            toValue: -500,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            // Reset local animated state in case this component instance is reused by React.
            translateX.setValue(0);
            onDelete?.();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const deleteOpacity = translateX.interpolate({
    inputRange: [-110, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ overflow: 'hidden' }}>
      {/* Delete background */}
      <Animated.View style={[styles.deleteBackground, { opacity: deleteOpacity }]}>
        <MaterialIcons name="delete" size={22} color="#fff" />
      </Animated.View>

      <Animated.View
        style={[
          styles.row,
          { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor, transform: [{ translateX }] },
        ]}
        onLayout={(e) => {
          rowWidthRef.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}>
      <Text style={[styles.setText, { color: palette.textColor }]}>{setNumber}</Text>
      <Text style={[styles.previousText, { color: palette.mutedColor }]} numberOfLines={1}>
        {previous}
      </Text>
      {onKgChange ? (
        <TextInput
          style={[styles.metricText, { color: palette.textColor, padding: 0 }]}
          value={kg}
          onChangeText={onKgChange}
          keyboardType="numeric"
          selectTextOnFocus
        />
      ) : (
        <Text style={[styles.metricText, { color: palette.textColor }]}>{kg}</Text>
      )}
      {onRepsChange ? (
        <TextInput
          style={[styles.metricText, { color: palette.textColor, padding: 0 }]}
          value={reps}
          onChangeText={onRepsChange}
          keyboardType="numeric"
          selectTextOnFocus
        />
      ) : (
        <Text style={[styles.metricText, { color: palette.textColor }]}>{reps}</Text>
      )}
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
          size={14}
          color={checked ? '#111111' : palette.mutedColor}
        />
      </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff6868',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  row: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  setText: {
    width: 24,
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
  },
  previousText: {
    flex: 1.35,
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    paddingRight: 4,
  },
  metricText: {
    width: 36,
    textAlign: 'center',
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
  },
  rpeWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpePill: {
    minWidth: 36,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    textAlign: 'center',
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
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
    width: 22,
    height: 22,
    marginLeft: 0,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F1F1',
  },
});
