import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      // Artificial delay to ensure navigation system is ready
      setTimeout(() => {
        if (token) {
          router.replace('/(drawer)');
        } else {
          router.replace('/auth');
        }
      }, 100);
    } catch (e) {
      router.replace('/auth');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.dark.primary} />
    </View>
  );
}