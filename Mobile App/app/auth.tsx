import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ENDPOINTS } from '@/constants/Config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Zap } from 'lucide-react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const url = isLogin ? ENDPOINTS.LOGIN : ENDPOINTS.REGISTER;

    try {
      const response = await axios.post(url, { username, password });

      if (isLogin) {
        // SAVE TOKEN
        const token = response.data.jwt;
        await AsyncStorage.setItem('jwtToken', token);
        
        // NAVIGATE TO DASHBOARD (DRAWER)
        router.replace('/(drawer)');
      } else {
        Alert.alert('Success', 'Registration Complete! Please Login.');
        setIsLogin(true);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Connection Failed. Check IP Config.';
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Zap size={60} color={Colors.dark.primary} fill={Colors.dark.primary} />
        <Text style={styles.title}>SmartHive</Text>
        <Text style={styles.subtitle}>Mobile Command Center</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter Admin ID" 
          placeholderTextColor={Colors.dark.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter Password" 
          placeholderTextColor={Colors.dark.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'UNLOCK SYSTEM' : 'REGISTER ADMIN'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleText}>
            {isLogin ? "New here? Create Access ID" : "Have an ID? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 10,
    fontFamily: 'Courier', // Monospace feel
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textMuted,
    marginTop: 5,
  },
  form: {
    backgroundColor: Colors.dark.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  label: {
    color: Colors.dark.textMuted,
    marginBottom: 8,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.dark.background,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleText: {
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});