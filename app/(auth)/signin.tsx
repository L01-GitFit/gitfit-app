import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';

import gg from '../../assets/gg.png';
import back from '../../assets/back.png';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* vùng xám trên cùng */}
      <View style={styles.topGray}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Image source={back} style={styles.backIcon} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Sign in</Text>

          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.form}>
        {/* Email */}
        <Text style={styles.label}>Email or Username</Text>
        <TextInput
          style={styles.input}
          placeholder="email or username"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
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

        {/* Sign In */}
        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn}>
          <Text style={styles.signInBtnText}>SIGN IN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        <Text style={styles.or}>or</Text>

        {/* Google */}
        <TouchableOpacity style={styles.googleBtn} onPress={handleSignIn}>
          <Image source={gg} style={styles.googleIcon} />
          <Text style={styles.googleBtnText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  /* nền xám trên */
  topGray: {
    backgroundColor: '#1C1C1E',
    paddingBottom: 20,
    paddingTop: 50,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingTop: 30,
  },

  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    paddingTop: 30,
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
    marginTop: 25,
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

  signInBtn: {
    backgroundColor: '#F2994A',
    borderRadius: 8,
    marginTop: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signInBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },

  forgot: {
    color: '#2D9CDB',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
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
});
