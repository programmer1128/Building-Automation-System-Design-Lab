import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Colors } from '@/constants/Colors';
import { Zap, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomDrawer(props: any) {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwtToken');
    router.replace('/auth');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      {/* 1. HEADER (Logo Area) */}
      <View style={styles.header}>
        <Zap size={32} color={Colors.dark.primary} fill={Colors.dark.primary} />
        <Text style={styles.brand}>SmartHive</Text>
        <Text style={styles.tagline}>Mobile Command</Text>
      </View>

      {/* 2. MENU ITEMS (The List) */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* 3. FOOTER (Logout Button) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Colors.dark.danger} />
          <Text style={styles.logoutText}>Logout System</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    marginBottom: 10,
    marginTop: 20,
  },
  brand: {
    color: Colors.dark.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'Courier',
  },
  tagline: {
    color: Colors.dark.textMuted,
    fontSize: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: Colors.dark.danger,
    fontWeight: 'bold',
    fontSize: 16,
  },
});