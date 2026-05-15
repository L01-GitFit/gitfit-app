import { Modal, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function ApiErrorDialog({ visible, title = 'Request failed', message, onClose }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60 px-8">
        <View className="w-full rounded-lg border border-[rgba(244,244,244,0.5)] bg-[#1c1c1e] gap-3 p-2.5">
          <Text className="text-[#ff6868] text-center font-bold text-base">{title}</Text>
          <Text className="text-[#f4f4f4] text-center text-xs leading-5">{message}</Text>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            className="w-full items-center justify-center rounded-lg bg-[#111] py-1"
          >
            <Text className="text-[#f4f4f4] font-bold text-lg leading-7 text-center">OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}