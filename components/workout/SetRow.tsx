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
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: '#F4F4F4',
    mutedColor: '#606060',
    checkColor: '#F1F1F1',
    pillBackgroundColor: '#D9D9D9',
    pillTextColor: '#606060',
    checkIconColor: '#7A7A7A',
  },
  completed: {
    backgroundColor: '#2B620F',
    borderColor: '#2B620F',
    textColor: '#F4F4F4',
    mutedColor: '#F4F4F4',
    checkColor: '#9FD46B',
    pillBackgroundColor: '#489811',
    pillTextColor: '#F4F4F4',
    checkIconColor: '#2B620F',
  },
  achievement: {
    backgroundColor: '#F2B108',
    borderColor: '#F2B108',
    textColor: '#2A1A00',
    mutedColor: '#2A1A00',
    checkColor: '#C98900',
    pillBackgroundColor: '#C98900',
    pillTextColor: '#2A1A00',
    checkIconColor: '#2A1A00',
  },
} as const;

function parsePrevious(prev: string): { weightKg: number; reps: number } | null {
  if (!prev || prev === '-') return null;
  const match = prev.match(/([\d.]+)\s*kg\s*x\s*(\d+)/i);
  if (!match) return null;
  return { weightKg: parseFloat(match[1]), reps: parseInt(match[2], 10) };
}

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
  const prevParsed = parsePrevious(previous);
  const kgPlaceholder = prevParsed ? String(prevParsed.weightKg) : '-';
  const repsPlaceholder = prevParsed ? String(prevParsed.reps) : '-';
  const placeholderOpacity = 0.5;
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
          {
            backgroundColor: palette.backgroundColor,
            borderColor: palette.borderColor,
            transform: [{ translateX }],
          },
        ]}
        onLayout={(e) => {
          rowWidthRef.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}>
        {variant === 'achievement' ? (
          <MaterialIcons name="workspace-premium" size={30}  color="#ee9033" />
        ) : (
          <Text style={[styles.setText, { color: palette.textColor }]}>{setNumber}</Text>
        )}
        <Text style={[styles.previousText, { color: palette.textColor }]} numberOfLines={1}>
          {previous}
        </Text>
        {onKgChange ? (
          <TextInput
            style={[styles.kgText, { color: palette.textColor }]}
            value={kg}
            placeholder={kgPlaceholder}
            placeholderTextColor={`${palette.textColor}${Math.round(placeholderOpacity * 255).toString(16).padStart(2, '0')}`}
            onChangeText={onKgChange}
            keyboardType="numeric"
            selectTextOnFocus
          />
        ) : (
          <Text style={[styles.kgText, { color: palette.textColor }]}>{kg}</Text>
        )}
        {onRepsChange ? (
          <TextInput
            style={[styles.repsText, { color: palette.textColor }]}
            value={reps}
            placeholder={repsPlaceholder}
            placeholderTextColor={`${palette.textColor}${Math.round(placeholderOpacity * 255).toString(16).padStart(2, '0')}`}
            onChangeText={onRepsChange}
            keyboardType="numeric"
            selectTextOnFocus
          />
        ) : (
          <Text style={[styles.repsText, { color: palette.textColor }]}>{reps}</Text>
        )}
        <View style={styles.rpeWrap}>
          <Text
            style={[
              styles.rpePill,
              {
                backgroundColor: palette.pillBackgroundColor,
                color: palette.pillTextColor,
              },
            ]}>
            {rpe}
          </Text>
          {achievementLabel ? <Text style={styles.achievementText}>{achievementLabel}</Text> : null}
        </View>
        <Pressable
          hitSlop={6}
          onPress={onToggle}
          style={[
            styles.checkButton,
            { backgroundColor: checked ? palette.checkColor : '#F4F4F4' },
          ]}>
          <MaterialIcons
            name="check"
            size={15}
            color={checked ? palette.checkIconColor : palette.checkIconColor}
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
    height: 45,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setText: {
    width: 30,
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    lineHeight: 20,
  },
  previousText: {
    width: 85,
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  kgText: {
    width: 24,
    textAlign: 'center',
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    lineHeight: 20,
    padding: 0,
  },
  repsText: {
    width: 42,
    textAlign: 'center',
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    lineHeight: 20,
    padding: 0,
  },
  rpeWrap: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpePill: {
    width: 64,
    height: 35,
    borderRadius: 24,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: 7,
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
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
