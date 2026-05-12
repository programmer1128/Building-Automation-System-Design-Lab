import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, StatusBar, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useGraphData } from '@/context/GraphContext';
import { Zap, AlertTriangle, ShieldCheck, Server, AlertOctagon, User, Radio, Activity, Cpu } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer'; // Usually available in RN environments, if not we use a fallback

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2; 

export default function MonitorScreen() {
  const { devices, currentLoad, refreshData } = useGraphData();
  const [username, setUsername] = useState('COMMANDER'); 
  const [refreshing, setRefreshing] = useState(false);

  // 1. ADVANCED IDENTITY FETCHING (PRESERVED EXACTLY)
  useEffect(() => {
    const getIdentity = async () => {
      try {
        // Priority 1: Check Explicit Storage
        const name = await AsyncStorage.getItem('userName');
        const email = await AsyncStorage.getItem('userEmail');
        
        if (name) {
            setUsername(name);
            return;
        }

        // Priority 2: Extract from Token (JWT Decode)
        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
            const parts = token.split('.');
            if (parts.length === 3) {
                // Base64 Decode the Payload
                const payload = JSON.parse(atob(parts[1])); // Requires polyfill in some RN versions
                // Try common JWT username fields
                const jwtName = payload.sub || payload.username || payload.name || payload.email;
                if (jwtName) {
                    setUsername(jwtName.split('@')[0].toUpperCase());
                    return;
                }
            }
        }

        // Priority 3: Fallback to Email
        if (email) {
            setUsername(email.split('@')[0].toUpperCase());
        }

      } catch (e) {
        // Silent fail to default
      }
    };
    getIdentity();
  }, []);

  // Helper for Base64 decode (PRESERVED EXACTLY)
  const atob = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';
    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshData(); 
    setTimeout(() => setRefreshing(false), 800); 
  }, [refreshData]);

  // Logic Engine
  const activeThreats = devices.filter(d => d.breakdown);
  const activeAnomalies = devices.filter(d => d.anomaly && !d.breakdown);
  const totalDevices = devices.length;
  
  let healthScore = 100;
  if (totalDevices > 0) {
      healthScore -= (activeThreats.length * 25); 
      healthScore -= (activeAnomalies.length * 10); 
  }
  healthScore = Math.max(0, Math.min(100, healthScore)); 

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <LinearGradient
        colors={['#020617', '#0f172a', '#000000']} // Deep Metal Background
        style={StyleSheet.absoluteFill}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        
        {/* --- ZONE A: THE METALLIC ID --- */}
        <LinearGradient
            colors={['#1e293b', '#0f172a']} // Dark Slate Metal
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.idCard}
        >
            <View style={styles.idBorderTop} /> 
            
            <View style={styles.idTopRow}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarBox}>
                        <User size={24} color="#e2e8f0" />
                    </View>
                    <View style={styles.onlineDot} />
                </View>
                <View style={styles.idInfo}>
                    <Text style={styles.welcomeLabel}>AUTHENTICATED USER</Text>
                    <Text style={styles.usernameText} numberOfLines={1}>{username}</Text>
                </View>
                <View style={styles.badgeContainer}>
                    <Radio size={12} color="#10b981" />
                    <Text style={styles.badgeText}>ONLINE</Text>
                </View>
            </View>
        </LinearGradient>

        {/* --- ZONE B: THE METALLIC QUAD GRID --- */}
        <View style={styles.gridContainer}>
            
            {/* 1. NET LOAD (Sapphire Metallic) */}
            <LinearGradient 
                // Light Blue -> Deep Blue -> Black Blue (Metallic Shine)
                colors={['#1e3a8a', '#172554', '#0f172a']} 
                start={{x:0, y:0}} end={{x:1, y:1}}
                style={[styles.card, { borderColor: '#3b82f6' }]}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                        <Zap size={18} color="#60a5fa" />
                    </View>
                    <Text style={[styles.cardLabel, { color: '#93c5fd' }]}>TOTAL LOAD</Text>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.bigNumber}>{currentLoad.toFixed(0)}</Text>
                    <Text style={[styles.unit, { color: '#60a5fa' }]}>WATTS</Text>
                </View>
            </LinearGradient>

            {/* 2. NODES (Gunmetal Metallic) */}
            <LinearGradient 
                // Lighter Grey -> Graphite -> Deep Slate (Metallic Shine)
                colors={['#475569', '#334155', '#1e293b']} 
                start={{x:0, y:0}} end={{x:1, y:1}}
                style={[styles.card, { borderColor: '#94a3b8' }]}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(148, 163, 184, 0.15)' }]}>
                        <Cpu size={18} color="#cbd5e1" />
                    </View>
                    <Text style={[styles.cardLabel, { color: '#e2e8f0' }]}>MONITORED DEVICES</Text>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.bigNumber}>{totalDevices}</Text>
                    <Text style={[styles.unit, { color: '#cbd5e1' }]}>ACTIVE</Text>
                </View>
            </LinearGradient>

            {/* 3. ALERTS (Orange/Bronze Metallic - REQUESTED UPDATE) */}
            <LinearGradient 
                // Active: Bright Metallic Orange | Inactive: Dark Bronze
                colors={activeAnomalies.length > 0 
                    ? ['#ea580c', '#c2410c', '#7c2d12'] 
                    : ['#431407', '#2a1205', '#0f172a']} 
                start={{x:0, y:0}} end={{x:1, y:1}}
                style={[styles.card, { borderColor: activeAnomalies.length > 0 ? '#fbbf24' : '#7c2d12' }]}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: activeAnomalies.length > 0 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(251, 191, 36, 0.05)' }]}>
                        <AlertTriangle size={18} color={activeAnomalies.length > 0 ? '#fbbf24' : '#d97706'} />
                    </View>
                    <Text style={[styles.cardLabel, { color: activeAnomalies.length > 0 ? '#fcd34d' : '#fdba74' }]}>ALERTS</Text>
                </View>
                <View style={styles.cardBody}>
                    <Text style={[styles.bigNumber, { color: activeAnomalies.length > 0 ? '#fbbf24' : '#fdba74' }]}>
                        {activeAnomalies.length}
                    </Text>
                    <Text style={[styles.unit, { color: activeAnomalies.length > 0 ? '#f59e0b' : '#c2410c' }]}>FLAGS</Text>
                </View>
            </LinearGradient>

            {/* 4. HEALTH (Emerald Metallic) */}
            <LinearGradient 
                // Emerald Highlight -> Deep Green -> Black Green (Metallic Shine)
                colors={['#059669', '#064e3b', '#022c22']} 
                start={{x:0, y:0}} end={{x:1, y:1}}
                style={[styles.card, { borderColor: '#10b981' }]}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                        <ShieldCheck size={18} color="#34d399" />
                    </View>
                    <Text style={[styles.cardLabel, { color: '#a7f3d0' }]}>SYSTEM HEALTH</Text>
                </View>
                <View style={styles.cardBody}>
                    <Text style={[styles.bigNumber, { color: '#34d399' }]}>{healthScore}%</Text>
                    <Activity size={16} color="#34d399" style={{ marginTop: 8 }} />
                </View>
            </LinearGradient>

        </View>

        {/* --- ZONE C: ACTIVE THREAT CONSOLE --- */}
        {activeThreats.length > 0 ? (
            <LinearGradient
                colors={['#991b1b', '#7f1d1d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.threatConsole}
            >
                <View style={styles.threatHeader}>
                    <View style={styles.blinkIcon}>
                        <AlertOctagon size={24} color="#fca5a5" />
                    </View>
                    <View>
                        <Text style={styles.threatTitle}>CRITICAL BREAKDOWN PREDICTED</Text>
                        <Text style={styles.threatSub}>IMMEDIATE ACTION REQUIRED</Text>
                    </View>
                </View>

                <View style={styles.threatDivider} />

                <View style={styles.threatList}>
                    {activeThreats.map(t => (
                        <View key={t.deviceId} style={styles.threatTag}>
                            <Text style={styles.threatTagText}>{t.deviceId}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>
        ) : (
            // NOMINAL WATERMARK
            <View style={styles.nominalContainer}>
                <ShieldCheck size={48} color="#64748b" />
                <Text style={styles.nominalText}>ALL SYSTEMS NOMINAL</Text>
                <View style={styles.nominalLine} />
                <Text style={styles.nominalSub}>GRID INTEGRITY AT 100%</Text>
            </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  
  // ID CARD (Metallic)
  idCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  idBorderTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  idTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
    position: 'relative',
  },
  avatarBox: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2, borderColor: '#1e293b',
  },
  idInfo: {
    flex: 1,
  },
  welcomeLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  usernameText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 4,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // GRID - FINAL METALLIC POLISH
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_GAP,
    marginBottom: 30,
  },
  card: {
    width: CARD_WIDTH,
    height: 145,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1, // Defined thin metallic border
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32, height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardBody: {
    alignItems: 'flex-start',
  },
  bigNumber: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: -1,
    lineHeight: 38,
    // Text Shadow for depth
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unit: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },

  // THREAT CONSOLE
  threatConsole: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#450a0a',
  },
  threatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blinkIcon: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  threatTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  threatSub: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  threatDivider: {
    height: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    marginVertical: 12,
  },
  threatList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  threatTag: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  threatTagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // NOMINAL WATERMARK
  nominalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    opacity: 0.8, // High visibility
  },
  nominalText: {
    color: '#94a3b8', // Bright Slate
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 15,
    textTransform: 'uppercase',
  },
  nominalLine: {
    width: 40,
    height: 2,
    backgroundColor: '#475569',
    marginVertical: 10,
  },
  nominalSub: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
});