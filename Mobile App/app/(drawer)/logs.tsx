import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useGraphData, SystemLog } from '@/context/GraphContext';
import { AlertOctagon, AlertTriangle, FileText, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LogCard = ({ item }: { item: SystemLog }) => {
  // Logic from Web Dashboard:
  // if breakdown -> RED "BREAKDOWN PREDICTED"
  // else -> ORANGE "Anomaly Detected"
  
  const isBreakdown = item.breakdown;
  const statusColor = isBreakdown ? '#ef4444' : '#f97316'; // Red vs Orange
  const message = isBreakdown ? 'BREAKDOWN PREDICTED' : 'Anomaly Detected';
  const Icon = isBreakdown ? AlertOctagon : AlertTriangle;
  
  // Subtle background tint
  const bgColors = ['rgba(15, 23, 42, 1)', 'rgba(30, 41, 59, 0.5)'] as [string, string];

  return (
    <LinearGradient
      colors={bgColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.card}
    >
      {/* Colored Left Accent */}
      <View style={[styles.accentStrip, { backgroundColor: statusColor }]} />

      <View style={styles.cardContent}>
        {/* Row 1: Header (ID & Timestamp) */}
        <View style={styles.headerRow}>
          <Text style={styles.deviceId}>{item.deviceId}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Just Now'}
          </Text>
        </View>

        {/* Row 2: Message & Power */}
        <View style={styles.detailRow}>
          <View style={styles.messageBox}>
            <Icon size={14} color={statusColor} style={{ marginRight: 6 }} />
            <Text style={[styles.messageText, { color: statusColor }]}>
              {message}
            </Text>
          </View>
          
          <Text style={styles.powerText}>
            {item.power} <Text style={styles.unit}>W</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default function LogsScreen() {
  const { logs } = useGraphData();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <FileText size={20} color={Colors.dark.textMuted} />
        <Text style={styles.screenTitle}>SYSTEM INCIDENT LOGS</Text>
      </View>

      <FlatList
        data={logs}
        renderItem={({ item }) => <LogCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Activity size={48} color={Colors.dark.primary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>System Nominal</Text>
            <Text style={styles.emptySubtitle}>No anomalies or breakdowns recorded.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 15,
  },
  screenTitle: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  accentStrip: {
    width: 4,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deviceId: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  timestamp: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    fontFamily: 'Courier',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  messageText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  powerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
  unit: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    marginTop: 5,
  },
});