import { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

type RoutineSetRowProps = {
  setNumber: number;
  kg: string;
  reps: string;
  onKgChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onDelete: () => void;
};

export default function RoutineSetRow({
  setNumber,
  kg,
  reps,
  onKgChange,
  onRepsChange,
  onDelete,
}: RoutineSetRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidthRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx < -8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(Math.max(gesture.dx, -110));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const threshold = rowWidthRef.current > 0 ? -(rowWidthRef.current / 2) : -80;
        if (gesture.dx <= threshold) {
          Animated.timing(translateX, {
            toValue: -500,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            onDelete();
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
    }),
  ).current;

  const deleteOpacity = translateX.interpolate({
    inputRange: [-110, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.rowWrap}>
      <Animated.View style={[styles.deleteBackground, { opacity: deleteOpacity }]}>
        <MaterialIcons name="delete" size={20} color="#fff" />
      </Animated.View>

      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        onLayout={(event) => {
          rowWidthRef.current = event.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <Text style={styles.setText}>{setNumber}</Text>
        <TextInput
          style={styles.metricInput}
          value={kg}
          onChangeText={onKgChange}
          keyboardType="numeric"
          placeholder="-"
          placeholderTextColor="rgba(244,244,244,0.5)"
          selectTextOnFocus
        />
        <TextInput
          style={styles.metricInput}
          value={reps}
          onChangeText={onRepsChange}
          keyboardType="numeric"
          placeholder="-"
          placeholderTextColor="rgba(244,244,244,0.5)"
          selectTextOnFocus
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    overflow: 'hidden',
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff6868',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  row: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    backgroundColor: '#000000',
  },
  setText: {
    width: 30,
    color: '#f4f4f4',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Lexend_400Regular',
  },
  metricInput: {
    width: 24,
    color: '#f4f4f4',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Lexend_400Regular',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});