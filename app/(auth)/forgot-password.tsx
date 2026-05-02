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

import back from '../../assets/back.png';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSend = () => {
    router.push('/(auth)/reset-password');
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* vùng xám */}
      <View style={styles.topGray}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Image source={back} style={styles.backIcon} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Forgot password?</Text>

          <View style={{ width: 40 }} />
        </View>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  topGray: {
    backgroundColor: '#1C1C1E',
    paddingTop: 50,
    paddingBottom: 20,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
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
});
