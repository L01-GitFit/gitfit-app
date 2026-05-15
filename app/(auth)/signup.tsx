import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSignUp } from '@/hooks/useSignUp';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import ApiErrorDialog from '@/components/ApiErrorDialog';
import { toApiErrorMessage } from '@/utils/apiErrorMessage';

import gg from '../../assets/gg.png';
import back from '../../assets/back.png';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const { mutate: signUp, isPending: signingUp } = useSignUp();
  const { mutate: signInWithGoogle, isPending: googleSigningIn } = useGoogleLogin();

  const showApiError = (message?: string) => {
    setApiError(toApiErrorMessage(message));
  };

  const handleSignUp = () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      Alert.alert('Missing information', 'Please enter email, password, and username.');
      return;
    }

    signUp(
      {
        email: email.trim(),
        password,
        username: username.trim(),
      },
      {
        onError: (err) => {
          showApiError(err.message);
        },
      },
    );
  };

  const handleGoogleSignUp = () => {
    signInWithGoogle(undefined, {
      onError: (err) => {
        showApiError(err.message ?? 'An unexpected error occurred.');
      },
    });
  };

  const isBusy = signingUp || googleSigningIn;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            minHeight: 61 + insets.top,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Image source={back} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sign up</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.form}>
        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <Text style={[styles.label, { marginTop: 30 }]}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="minimum 6 characters"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Username */}
        <Text style={[styles.label, { marginTop: 30 }]}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
        />

        {/* Sign Up */}
        <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp} disabled={isBusy}>
          {signingUp ? <ActivityIndicator color="#000" /> : <Text style={styles.signUpBtnText}>SIGN UP</Text>}
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        {/* Google */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignUp} disabled={isBusy}>
          {googleSigningIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Image source={gg} style={styles.googleIcon} />
              <Text style={styles.googleBtnText}>Sign up with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ApiErrorDialog
        visible={Boolean(apiError)}
        title="Sign-up failed"
        message={apiError ?? ''}
        onClose={() => setApiError(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  header: {
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 61,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Lexend_400Regular',
  },

  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  headerSpacer: {
    width: 48,
    height: 48,
  },

  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#fff',
  },

  form: {
    flex: 1,
    paddingHorizontal: 25,
    marginTop: 20,
  },

  label: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 5,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
  },

  signUpBtn: {
    backgroundColor: '#F2994A',
    borderRadius: 8,
    marginTop: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signUpBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },

  or: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
    fontWeight: '500',
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
  },

  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  googleBtnText: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 20,
  },
  switchRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  switchText: {
    color: '#fff',
    fontSize: 14,
  },
  switchLink: {
    color: '#F2994A',
    fontWeight: '700',
    fontSize: 14,
  },
});
