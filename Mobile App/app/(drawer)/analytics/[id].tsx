import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useGraphData } from '@/context/GraphContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Zap, Activity, Power, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Helper to pick a large icon
const getLargeIcon = (type: string) => {
  const lower = type.toLowerCase();
  if (lower.includes('ac')) return '❄️';
  if (lower.includes('heater')) return '🔥';
  if (lower.includes('light')) return '💡';
  return '⚡';
};

export default function ApplianceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getDeviceById } = useGraphData();
  const device = getDeviceById(id as string);

  const handleBack = () => {
    router.navigate('/(drawer)/analytics');
  };

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Device not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonSimple}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { uiColor, uiStatus, uiMessage, name, type, wattage, isOn } = device;
  const gradientColors = [uiColor, Colors.dark.background] as [string, string];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        {/* FIX: Use the custom handleBack function */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.dark.text} />
          <Text style={styles.backText}>Back to Matrix</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Main Status Card */}
      <LinearGradient colors={gradientColors} start={{x:0, y:0}} end={{x:0, y:0.6}} style={styles.statusCard}>
        <View style={styles.iconContainer}>
            <Text style={styles.largeIcon}>{getLargeIcon(type)}</Text>
        </View>
        <Text style={styles.deviceName}>{name}</Text>
        <Text style={styles.deviceType}>{type}</Text>
        
        <View style={[styles.statusBadge, { backgroundColor: uiColor }]}>
            <Text style={styles.statusText}>{uiStatus}</Text>
        </View>
        <Text style={[styles.statusMessage, { color: uiColor }]}>{uiMessage}</Text>
      </LinearGradient>

      {/* 3. Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Wattage Card */}
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Zap size={24} color={Colors.dark.primary} />
            </View>
            <Text style={styles.statLabel}>Real-Time Load</Text>
            <Text style={styles.statValue}>{wattage} <Text style={styles.unit}>W</Text></Text>
        </View>
        
        {/* Status Card */}
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: isOn ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)' }]}>
                <Power size={24} color={isOn ? Colors.dark.success : Colors.dark.textMuted} />
            </View>
            <Text style={styles.statLabel}>Power State</Text>
            <Text style={styles.statValue}>{isOn ? 'ON' : 'OFF'}</Text>
        </View>

        {/* Health Card */}
        <View style={[styles.statCard, styles.fullWidthCard]}>
            <View style={[styles.statIcon, { backgroundColor: uiStatus === 'NORMAL' || uiStatus === 'OFF' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                {uiStatus === 'NORMAL' || uiStatus === 'OFF' ? (
                    <Activity size={24} color={Colors.dark.success} />
                ) : (
                    <AlertTriangle size={24} color={uiColor} />
                )}
            </View>
            <View>
                <Text style={styles.statLabel}>System Health</Text>
                <Text style={[styles.statValueSmall, { color: uiColor }]}>{uiMessage}</Text>
            </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background },
  notFound: { color: Colors.dark.textMuted, fontSize: 18, marginBottom: 20 },
  header: { marginBottom: 20, marginTop: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonSimple: { padding: 10, backgroundColor: Colors.dark.card, borderRadius: 8 },
  backText: { color: Colors.dark.text, fontSize: 16, marginLeft: 5 },
  statusCard: { alignItems: 'center', padding: 30, borderRadius: 24, marginBottom: 30, elevation: 5 },
  iconContainer: { width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  largeIcon: { fontSize: 40 },
  deviceName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  deviceType: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textTransform: 'uppercase', marginBottom: 15 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  statusText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  statusMessage: { fontSize: 16, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  statCard: { backgroundColor: Colors.dark.card, width: (width - 55) / 2, padding: 20, borderRadius: 16, alignItems: 'flex-start', borderWidth: 1, borderColor: Colors.dark.border },
  fullWidthCard: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 15 },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statLabel: { color: Colors.dark.textMuted, fontSize: 12, marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', fontFamily: 'Courier' },
  statValueSmall: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  unit: { fontSize: 14, color: Colors.dark.textMuted, fontFamily: 'System' },
});