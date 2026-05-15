import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email first.');
      return;
    }

    Alert.alert('Not available yet', 'Password recovery API is not available on backend yet.');
    router.push('/(auth)/reset-password');
  };

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
          <Image source={require('../../assets/back.png')} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Forgot Password</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>
            SEND PASSWORD RECOVERY
          </Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Back to</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
            <Text style={styles.switchLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  sendBtn: {
    backgroundColor: '#F2994A',
    borderRadius: 8,
    marginTop: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
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
