import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

export type ActiveWorkout = {
  duration: string;
  exercise: string;
};

type Props = {
  workout: ActiveWorkout;
  /** Called when user taps the banner to expand the session screen */
  onExpand?: () => void;
  /** Called when user taps the delete/discard button */
  onDiscard?: () => void;
};

export default function FloatingWorkoutBanner({ workout, onExpand, onDiscard }: Props) {
  return (
    <View className="mx-4 mb-5">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onExpand}
        className="bg-[#ee9033] rounded-[50px] flex-row items-center p-2 gap-2"
      >
        {/* Expand button */}
        <View className="bg-[#d2ad05] rounded-[32px] w-16 h-16 items-center justify-center">
          <MaterialIcons name="keyboard-arrow-up" size={36} color="#111" />
        </View>

        {/* Workout info */}
        <View className="flex-1 flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-green-500" />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-[#111] text-xs font-bold">Workout</Text>
              <Text className="text-[#111] text-xs">{workout.duration}</Text>
            </View>
            <Text className="text-[#111] text-xs capitalize">{workout.exercise}</Text>
          </View>
        </View>

        {/* Discard button */}
        <TouchableOpacity
          onPress={onDiscard}
          hitSlop={8}
          className="bg-[#d2ad05] rounded-[32px] w-16 h-16 items-center justify-center"
        >
          <MaterialIcons name="delete" size={28} color="#FF6868" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}
