import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import type { ExternalExercise } from '@/types/exercise.types';

type Props = {
  exercise: ExternalExercise;
  selected: boolean;
  onPress: () => void;
  onInfo?: () => void;
};

export default function ExerciseSelectCard({ exercise, selected, onPress, onInfo }: Props) {
  const primaryMuscle = exercise.targetMuscles[0] ?? exercise.bodyParts[0] ?? '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between border-b-2 border-[#1c1c1e] px-4 py-2.5"
    >
      {/* Left content: accent bar (selected only) + image + text */}
      <View className="flex-row items-center flex-1 gap-2.5">
        {selected && (
          <View
            style={{ width: 5, height: 50, borderRadius: 5, backgroundColor: '#ee9033' }}
          />
        )}
        <Image
          source={{ uri: exercise.gifUrl }}
          style={{ width: 60, height: 60, borderRadius: 30 }}
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text
            style={{ color: selected ? '#ee9033' : '#f4f4f4', fontSize: 12, lineHeight: 22 }}
            numberOfLines={2}
          >
            {exercise.name}
          </Text>
          <Text
            style={{
              color: selected ? 'rgba(238,144,51,0.5)' : 'rgba(244,244,244,0.5)',
              fontSize: 12,
            }}
            numberOfLines={1}
          >
            {primaryMuscle}
          </Text>
        </View>
      </View>

      {/* Info icon */}
      <TouchableOpacity onPress={onInfo} hitSlop={8} className="pl-2">
        <MaterialIcons
          name="info-outline"
          size={24}
          color={selected ? '#ee9033' : '#f4f4f4'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
