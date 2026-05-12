import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useGraphData, Device } from '@/context/GraphContext';
import { Zap, Thermometer, Wind, Lightbulb, Tv, Server } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Precise gap calculation

const getIcon = (type: string, color: string) => {
  const props = { size: 28, color: color, strokeWidth: 2 };
  const lower = (type || '').toLowerCase();
  if (lower.includes('ac')) return <Wind {...props} />;
  if (lower.includes('heater')) return <Thermometer {...props} />;
  if (lower.includes('light')) return <Lightbulb {...props} />;
  if (lower.includes('tv')) return <Tv {...props} />;
  if (lower.includes('server')) return <Server {...props} />;
  return <Zap {...props} />;
};

const DeviceCard = ({ item }: { item: Device }) => {
  const router = useRouter();
  const { uiColor, uiStatus, uiMessage, name, type, wattage, isOn, deviceId } = item;
  
  // Design Logic:
  // 1. Background: Very subtle tint of the status color fading into dark slate
  const bgColors = [uiColor + '10', '#0f172a'] as [string, string]; 
  
  // 2. Border: Stronger opacity if ON or Alert, faint if OFF
  const borderOpacity = isOn || uiStatus !== 'NORMAL' ? 0.3 : 0.1;

  // 3. Shadow: Only glow if ON or Alert
  const shadowStyle = isOn || uiStatus !== 'NORMAL' ? {
      shadowColor: uiColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5
  } : {};

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push(`/analytics/${deviceId}`)} 
    >
      <LinearGradient 
        colors={bgColors} 
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 1}} 
        // Using borderOverlay instead for cleaner strokes, setting main border to 0 where handled by overlay
        style={[styles.card, shadowStyle, { borderColor: uiColor, borderWidth: 1, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0 }]} 
      >
        {/* Professional Border Overlay */}
        <View style={[styles.borderOverlay, { borderColor: uiColor, opacity: borderOpacity }]} />

        {/* TOP SECTION: Icon & Status Dot */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: uiColor + '15' }]}>
            {getIcon(type, uiColor)}
          </View>
          {/* Pulsing Status Dot */}
          <View style={[styles.statusDot, { backgroundColor: uiColor, opacity: isOn ? 1 : 0.4 }]} />
        </View>

        {/* MIDDLE SECTION: Info */}
        <View style={styles.cardBody}>
            {/* REMOVED the small duplicate deviceId here */}
            <Text style={styles.deviceName} numberOfLines={1}>{name}</Text>
            
            {/* Status Message (e.g. BREAKDOWN PREDICTED) */}
            <View style={[styles.msgContainer, { backgroundColor: uiColor + '10', borderColor: uiColor + '30' }]}>
                <Text style={[styles.statusMessage, { color: uiColor }]} numberOfLines={2}>
                    {uiMessage.toUpperCase()}
                </Text>
            </View>
        </View>

        {/* BOTTOM SECTION: Wattage */}
        <View style={styles.cardFooter}>
          <Text style={[styles.wattage, { color: isOn ? '#fff' : Colors.dark.textMuted }]}>
            {isOn ? wattage : 0} <Text style={styles.unit}>W</Text>
          </Text>
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function AnalyticsScreen() {
  const { devices } = useGraphData();

  return (
    <View style={styles.container}>
      <FlatList
        data={devices}
        renderItem={({ item }) => <DeviceCard item={item} />}
        keyExtractor={item => item.deviceId}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Syncing Device Matrix...</Text>
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
    paddingTop: 20 
  },
  listContent: { 
    paddingBottom: 40 
  },
  row: { 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  card: { 
    width: CARD_WIDTH, 
    height: 175, 
    borderRadius: 20, 
    padding: 16, 
    position: 'relative', 
    justifyContent: 'space-between'
  },
  borderOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    borderWidth: 1.5, 
    borderRadius: 20 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  iconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginTop: 6,
    marginRight: 4
  },
  cardBody: {
    marginTop: 10,
    flex: 1
  },
  deviceName: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '700', 
    letterSpacing: 0.3,
    marginBottom: 6 // Added slightly more spacing since ID is gone
  },
  // Removed deviceId style entirely
  msgContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    marginTop: 2
  },
  statusMessage: { 
    fontSize: 9, 
    fontWeight: '800', 
    letterSpacing: 0.5,
    textAlign: 'left'
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'baseline'
  },
  wattage: { 
    fontSize: 22, 
    fontWeight: '800', 
    fontFamily: 'Courier',
    letterSpacing: -0.5
  },
  unit: { 
    fontSize: 12, 
    color: Colors.dark.textMuted, 
    fontFamily: 'System', 
    fontWeight: '600',
    marginLeft: 2
  },
  emptyContainer: { 
    marginTop: 60, 
    alignItems: 'center' 
  },
  emptyText: { 
    color: Colors.dark.textMuted, 
    fontSize: 14, 
    fontStyle: 'italic' 
  }
});