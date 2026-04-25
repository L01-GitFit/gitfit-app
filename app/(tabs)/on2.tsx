import { Link, useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Image assets from Figma
const imgLogo = "https://www.figma.com/api/mcp/asset/623b1434-95b4-4f8b-977b-8a5111b1b1c9";
const imgImageWithFallback = "https://www.figma.com/api/mcp/asset/2560d465-fc7b-4e9f-b00c-a81eac2928cf";
const imgLogWorkoutHasExerciseNewRecord1 = "https://www.figma.com/api/mcp/asset/c080a79c-6b7e-45a7-a4c3-4fcc78b71a6b";
const imgLevels = "https://www.figma.com/api/mcp/asset/5dbfc262-a3a6-4d3a-a948-aca67abec5f2";

function LogoWithName() {
  return (
    <View style={styles.logoContainer}>
      <Image 
        source={{ uri: imgLogo }} 
        style={styles.logoImage}
      />
      <View style={styles.logoTextContainer}>
        <Text style={styles.logoTextGit}>GitFit</Text>
        <Text style={styles.logoTextDot}>.</Text>
      </View>
    </View>
  );
}

function SignUpGoogleButton() {
  return (
    <Link href="/signup" asChild>
      <TouchableOpacity style={styles.signUpButton}>
        <Text style={styles.buttonIcon}>G</Text>
        <Text style={styles.buttonText}>Sign up with Google</Text>
      </TouchableOpacity>
    </Link>
  );
}

function SignUpEmailButton() {
  return (
    <Link href="/signup" asChild>
      <TouchableOpacity style={styles.signUpButton}>
        <Text style={styles.buttonIcon}>✉</Text>
        <Text style={styles.buttonText}>Sign up with Email</Text>
      </TouchableOpacity>
    </Link>
  );
}

function PageIndicator({ currentPage = 1 }: { currentPage?: number }) {
  const router = useRouter();
  
  return (
    <View style={styles.indicatorContainer}>
      <TouchableOpacity 
        onPress={() => router.push('/onboarding')}
        style={styles.indicatorDot}
      >
        <View style={currentPage === 0 ? styles.indicatorActive : styles.indicatorInactive} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.push('/onboarding2')}
        style={styles.indicatorDot}
      >
        <View style={currentPage === 1 ? styles.indicatorActive : styles.indicatorInactive} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.push('/onboarding3')}
        style={styles.indicatorDot}
      >
        <View style={currentPage === 2 ? styles.indicatorActive : styles.indicatorInactive} />
      </TouchableOpacity>
    </View>
  );
}

export default function Onboarding2Screen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <Image 
          source={{ uri: imgImageWithFallback }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>9:41</Text>
        <Image 
          source={{ uri: imgLevels }} 
          style={styles.levelsIcon}
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <LogoWithName />
        </View>

        {/* Phone Preview */}
        <View style={styles.phonePreviewContainer}>
          <View style={styles.phoneFrame}>
            <Image 
              source={{ uri: imgLogWorkoutHasExerciseNewRecord1 }} 
              style={styles.phoneImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Description Text */}
        <Text style={styles.descriptionText}>
          Track your progress with detailed analytics.
        </Text>

        {/* Page Indicator */}
        <PageIndicator currentPage={1} />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <SignUpGoogleButton />
          <SignUpEmailButton />
        </View>

        {/* Login Link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/login">
            <Text style={styles.loginLinkText}>Log in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 54,
  },
  timeText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  levelsIcon: {
    width: 48,
    height: 27,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 51,
    height: 51,
  },
  logoTextContainer: {
    flexDirection: 'row',
  },
  logoTextGit: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 30,
    color: '#ee9033',
  },
  logoTextDot: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 30,
    color: '#f4f4f4',
  },
  phonePreviewContainer: {
    marginTop: 40,
    paddingHorizontal: 19,
  },
  phoneFrame: {
    width: 186,
    height: 403,
    borderRadius: 30,
    overflow: 'hidden',
  },
  phoneImage: {
    width: '100%',
    height: '100%',
  },
  descriptionText: {
    marginTop: 24,
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  indicatorDot: {
    padding: 4,
  },
  indicatorActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ee9033',
  },
  indicatorInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(238, 144, 51, 0.4)',
  },
  buttonsContainer: {
    marginTop: 60,
    width: '100%',
    paddingHorizontal: 18,
    gap: 12,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
    height: 40,
    borderRadius: 8,
    gap: 10,
  },
  buttonIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  buttonText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#111',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  loginText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#f4f4f4',
  },
  loginLinkText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#ee9033',
  },
});