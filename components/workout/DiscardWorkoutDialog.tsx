import { Modal, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DiscardWorkoutDialog({ visible, onConfirm, onCancel }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60 px-8">
        <View className="w-full rounded-lg border border-[rgba(244,244,244,0.5)] bg-[#1c1c1e] gap-3 p-2.5">
          {/* Message */}
          <Text className="text-[#f4f4f4] text-center text-xs leading-5">
            Are you sure you want to discard this workout
          </Text>

          {/* Discard button */}
          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.8}
            className="w-full items-center justify-center rounded-lg bg-[#111] py-1"
          >
            <Text className="text-[#ff6868] font-bold text-lg leading-7 text-center">
              Discard Workout
            </Text>
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            onPress={onCancel}
            activeOpacity={0.8}
            className="w-full items-center justify-center rounded-lg bg-[#111] py-1"
          >
            <Text className="text-[#f4f4f4] font-bold text-lg leading-7 text-center">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
