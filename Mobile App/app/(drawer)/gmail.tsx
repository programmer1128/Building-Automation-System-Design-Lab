import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useGraphData, EmailLog } from '@/context/GraphContext';
import { Mail, ChevronDown, ChevronUp, User, Clock, FileText } from 'lucide-react-native';

// Enable layout animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EmailCard = ({ item }: { item: EmailLog }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  // Theme: Cyber Blue (#3b82f6)
  const accentColor = '#3b82f6'; 
  const bgColors = ['rgba(15, 23, 42, 1)', 'rgba(30, 41, 59, 0.5)'] as [string, string];

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={toggleExpand}>
      <LinearGradient
        colors={bgColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.card, expanded && { borderColor: accentColor, borderWidth: 1 }]}
      >
        {/* Left Accent Strip */}
        <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

        <View style={styles.cardContent}>
          
          {/* HEADER ROW */}
          <View style={styles.headerRow}>
            <View style={styles.idContainer}>
                <Mail size={14} color={accentColor} style={{ marginRight: 6 }} />
                <Text style={styles.deviceId}>{item.deviceId}</Text>
            </View>
            <View style={styles.metaContainer}>
                <Clock size={12} color={Colors.dark.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.timestamp}>
                  {item.sentAt ? new Date(item.sentAt).toLocaleTimeString() : 'Unknown'}
                </Text>
            </View>
          </View>

          {/* RECIPIENT ROW */}
          <View style={styles.recipientRow}>
             <Text style={styles.label}>To:</Text>
             <Text style={styles.recipientText} numberOfLines={1}>{item.recipient}</Text>
             {expanded ? <ChevronUp size={16} color={Colors.dark.textMuted} /> : <ChevronDown size={16} color={Colors.dark.textMuted} />}
          </View>

          {/* EXPANDED CONTENT */}
          {expanded && (
            <View style={styles.expandedContent}>
                <View style={styles.separator} />
                
                {/* Subject */}
                <Text style={styles.subjectLabel}>SUBJECT</Text>
                <Text style={styles.subjectText}>{item.subject}</Text>

                {/* Body */}
                <View style={styles.bodyContainer}>
                    <Text style={styles.bodyText}>{item.body}</Text>
                </View>
            </View>
          )}

        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function GmailScreen() {
  const { emailLogs } = useGraphData();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <Mail size={20} color={Colors.dark.textMuted} />
        <Text style={styles.screenTitle}>GMAIL INCIDENT HISTORY</Text>
      </View>

      <FlatList
        data={emailLogs}
        renderItem={({ item }) => <EmailCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Mail size={48} color={Colors.dark.primary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>Outbox Empty</Text>
            <Text style={styles.emptySubtitle}>No alerts have been dispatched recently.</Text>
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
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceId: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    fontFamily: 'Courier',
  },
  recipientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    marginRight: 5,
  },
  recipientText: {
    color: '#cbd5e1',
    fontSize: 13,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  expandedContent: {
    marginTop: 5,
  },
  subjectLabel: {
    color: '#3b82f6', // Cyber Blue
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subjectText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
  },
  bodyContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bodyText: {
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
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