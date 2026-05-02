import { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';

const LOGIN_HREF = '/(auth)/login' as Href;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
  id: string;
  description: string;
  phoneImage: ImageSourcePropType;
  bgImage: ImageSourcePropType;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    description: 'Log your workouts easily, all in one place.',
    phoneImage: require('@/assets/d1.jpg'),
    bgImage: require('@/assets/b1.jpg'),
  },
  {
    id: '2',
    description: 'Track your progress with detailed analytics.',
    phoneImage: require('@/assets/d2.jpg'),
    bgImage: require('@/assets/b2.jpg'),
  },
  {
    id: '3',
    description: 'Reach your goals and build lasting habits.',
    phoneImage: require('@/assets/d3.jpg'),
    bgImage: require('@/assets/b3.jpg'),
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function LogoWithName() {
  return (
    <View className="flex-row items-center gap-1.5">
      <Image source={require('@/assets/logo_1.jpg')} className="w-[51px] h-[51px]" />
      <View className="flex-row">
        <Text className="font-lexend-bold text-[30px] text-[#ee9033]">GitFit</Text>
        <Text className="font-lexend-bold text-[30px] text-[#f4f4f4]">.</Text>
      </View>
    </View>
  );
}

function PageIndicator({
  activeIndex,
  onDotPress,
}: {
  activeIndex: number;
  onDotPress: (index: number) => void;
}) {
  return (
    <View className="flex-row justify-center mt-5 gap-2">
      {SLIDES.map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onDotPress(i)} className="p-1">
          <View
            className={`w-2 h-2 rounded-full ${i === activeIndex ? 'bg-[#ee9033]' : 'bg-[#ee9033]/40'}`}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const {
    mutate: signInWithGoogle,
    isPending: googleLoading,
    error: googleError,
  } = useGoogleLogin();

  // Surface Google login errors to the user
  const handleGoogleSignIn = () => {
    signInWithGoogle(undefined, {
      onError: (err) => {
        Alert.alert('Sign-in failed', err.message ?? 'An unexpected error occurred.');
      },
    });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  return (
    <View className="flex-1 bg-[#111]" style={{ paddingTop: insets.top }}>
      {/* Background image — swaps with the active slide */}
      <View className="absolute inset-0">
        <Image
          source={SLIDES[activeIndex].bgImage}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-[#111]/70" />
      </View>

      {/* Logo — static above the carousel */}
      <View className="items-center pt-[30px] mb-2">
        <LogoWithName />
      </View>

      {/* Horizontal paging carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH }} className="items-center pt-6">
            <View className="w-[186px] h-[320px] rounded-[30px] overflow-hidden">
              <Image source={item.phoneImage} className="w-full h-full" resizeMode="cover" />
            </View>
            <Text className="mt-6 font-lexend text-base text-white text-center px-8">
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Dot indicator — tapping a dot scrolls to that slide */}
      <PageIndicator activeIndex={activeIndex} onDotPress={scrollToIndex} />

      {/* Action buttons — static at the bottom */}
      <View className="px-[18px] pt-6 gap-3" style={{ paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          className="flex-row items-center justify-center bg-[#f4f4f4] h-10 rounded-lg gap-2.5"
          onPress={handleGoogleSignIn}
          disabled={googleLoading}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator size="small" color="#111" />
          ) : (
            <>
              <Image
                source={require('@/assets/gg.png')}
                className="w-[18px] h-[18px]"
                resizeMode="contain"
              />
              <Text className="font-lexend text-xs text-[#111]">Sign up with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-[#f4f4f4] h-10 rounded-lg gap-2.5"
          onPress={() => router.push(LOGIN_HREF)}
        >
          <Image
            source={require('@/assets/mail.png')}
            className="w-[18px] h-[18px]"
            resizeMode="contain"
          />
          <Text className="font-lexend text-xs text-[#111]">Sign up with Email</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-1.5">
          <Text className="font-lexend text-xs text-[#f4f4f4]">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push(LOGIN_HREF)}>
            <Text className="font-lexend-bold text-xs text-[#ee9033]">Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
