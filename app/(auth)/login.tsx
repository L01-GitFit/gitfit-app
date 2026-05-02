import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';

/**
 * Login screen — Google Sign-In entry point.
 * The navigation guard in app/_layout.tsx automatically redirects to (tabs)
 * as soon as the auth store receives a valid accessToken.
 */
export default function LoginScreen() {
  const { mutate: signInWithGoogle, isPending } = useGoogleLogin();

  const handleGoogleSignIn = () => {
    signInWithGoogle(undefined, {
      onError: (err) => {
        Alert.alert('Sign-in failed', err.message ?? 'An unexpected error occurred.');
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to GitFit</Text>
        <Text style={styles.subtitle}>Sign in to start your fitness journey.</Text>
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        disabled={isPending}
        activeOpacity={0.8}>
        {isPending ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
    padding: 32,
    paddingBottom: 64,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#f4f4f4',
    fontSize: 32,
    fontFamily: 'Lexend_700Bold',
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(244,244,244,0.5)',
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Lexend_600SemiBold',
  },
});
