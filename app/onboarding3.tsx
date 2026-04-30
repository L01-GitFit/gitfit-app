import { Link, useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import mo1 from '../assets/logo_1.jpg';
import gg from '../assets/gg.png';
import em from '../assets/mail.png';
import d3 from '../assets/d3.jpg';
import b3 from '../assets/b3.jpg';

function LogoWithName() {
  return (
    <View style={styles.logoContainer}>
      <Image source={mo1} style={styles.logoImage} />
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
        <Image source={gg} style={styles.icon} resizeMode="contain" />
        <Text style={styles.buttonText}>
          Sign up with Google
        </Text>
      </TouchableOpacity>
    </Link>
  );
}

function SignUpEmailButton() {
  return (
    <Link href="/signup" asChild>
      <TouchableOpacity style={styles.signUpButton}>
        <Image source={em} style={styles.icon} resizeMode="contain" />
        <Text style={styles.buttonText}>
          Sign up with Email
        </Text>
      </TouchableOpacity>
    </Link>
  );
}

function PageIndicator({ currentPage = 2 }: { currentPage?: number }) {
  const router = useRouter();

  return (
    <View style={styles.indicatorContainer}>
      <TouchableOpacity onPress={() => router.push('/onboarding')}>
        <View
          style={currentPage === 0 ? styles.indicatorActive : styles.indicatorInactive}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/onboarding2')}>
        <View
          style={currentPage === 1 ? styles.indicatorActive : styles.indicatorInactive}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/onboarding3')}>
        <View
          style={currentPage === 2 ? styles.indicatorActive : styles.indicatorInactive}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Image source={b3} style={styles.backgroundImage} resizeMode="cover" />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 50 }]}>
        <LogoWithName />

        <View style={styles.phonePreviewContainer}>
          <View style={styles.phoneFrame}>
            <Image source={d3} style={styles.phoneImage} resizeMode="cover" />
          </View>
        </View>

        <Text style={styles.descriptionText}>
          Log your workouts easily, all in one place.
        </Text>

        <PageIndicator currentPage={2} />

        <View style={styles.buttonsContainer}>
          <SignUpGoogleButton />
          <SignUpEmailButton />
        </View>

        <View
          style={[
            styles.loginLinkContainer,
            { marginBottom: insets.bottom + 16 },
          ]}
        >
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/signin">
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

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginTop: 28,
  },

  phoneFrame: {
    width: 170,
    height: 360,
    borderRadius: 28,
    overflow: 'hidden',
  },

  phoneImage: {
    width: '100%',
    height: '100%',
  },

  descriptionText: {
    marginTop: 18,
    fontFamily: 'Lexend_400Regular',
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },

  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
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
    backgroundColor: 'rgba(238,144,51,0.4)',
  },

  buttonsContainer: {
    marginTop: 24,
    width: '100%',
    gap: 10,
  },

  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    height: 42,
    borderRadius: 8,
    paddingHorizontal: 16,
  },

  icon: {
    width: 18,
    height: 18,
  },

  buttonText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#111',
    marginRight: 18,
  },

  loginLinkContainer: {
    marginTop: 12,
    flexDirection: 'row',
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