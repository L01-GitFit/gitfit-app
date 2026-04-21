import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const defaultAvatar = require('../../assets/default-avatar.png');

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-white text-2xl font-bold">Profile</Text>
        </View>

        {/* Avatar */}
        <View className="items-center py-2 gap-2 mt-4">
          <View className="w-16 h-16 rounded-full overflow-hidden">
            <Image source={defaultAvatar} className="w-full h-full" resizeMode="cover" />
          </View>
          <TouchableOpacity>
            <Text className="text-[#ee9033] text-xs">Change profile photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form fields */}
        <View className="px-4 py-2 gap-12 mt-4">
          {/* Public profile data */}
          <View className="gap-6">
            <Text className="text-[rgba(244,244,244,0.5)] text-xs">Public profile data</Text>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e]">
              <Text className="text-[#f4f4f4] text-xs">Name</Text>
              <Text className="text-[rgba(244,244,244,0.5)] text-xs">Your full name</Text>
            </View>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e]">
              <Text className="text-[#f4f4f4] text-xs">Bio</Text>
              <Text className="text-[rgba(244,244,244,0.5)] text-xs">Describe yourself</Text>
            </View>
          </View>

          {/* Private data */}
          <View className="gap-4">
            <Text className="text-[rgba(244,244,244,0.5)] text-xs">Private data</Text>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e]">
              <Text className="text-[#f4f4f4] text-xs">Sex</Text>
              <Text className="text-[#ee9033] text-xs">Male</Text>
            </View>

            <View className="flex-row items-center justify-between px-2 py-2 border-b-2 border-[#1c1c1e]">
              <Text className="text-[#f4f4f4] text-xs">Birthday</Text>
              <Text className="text-[#ee9033] text-xs">Jan 01, 2004</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
