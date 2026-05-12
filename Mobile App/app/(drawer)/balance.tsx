import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useGraphData, Transaction } from '@/context/GraphContext';
import { Wallet, TrendingUp, ArrowDownLeft, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- MINI INFLOW CARD ---
const InflowCard = ({ item }: { item: Transaction }) => {
  return (
    <View style={styles.inflowRow}>
      <View style={styles.inflowLeft}>
         <View style={styles.iconCircle}>
             <ArrowDownLeft size={16} color="#10b981" />
         </View>
         <View>
             <Text style={styles.inflowAmount}>+ ₹{item.amount}</Text>
             <Text style={styles.inflowDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
         </View>
      </View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
         <Text style={styles.inflowItems} numberOfLines={1}>{item.itemsPaid}</Text>
         <Text style={styles.inflowPayer} numberOfLines={1}>By: {item.payerName}</Text>
      </View>
    </View>
  );
};

export default function BalanceScreen() {
  const { commonBalance, transactions } = useGraphData();
  
  // ANIMATION STATE
  const [displayBalance, setDisplayBalance] = useState(0);

  // THE COUNTING ENGINE (Mimics Web Logic)
  useEffect(() => {
    if (displayBalance < commonBalance) {
        // Calculate dynamic step for speed
        const diff = commonBalance - displayBalance;
        const step = Math.ceil(diff / 10); 
        
        const timer = setTimeout(() => {
            setDisplayBalance(prev => Math.min(prev + step, commonBalance));
        }, 30); // 30ms frame rate for smooth counting
        
        return () => clearTimeout(timer);
    } else if (displayBalance > commonBalance) {
        // If balance dropped (unlikely but possible), snap to it
        setDisplayBalance(commonBalance);
    }
  }, [commonBalance, displayBalance]);

  // Get last 10 transactions for the "Live Stream"
  const recentInflows = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <View style={styles.container}>
      
      {/* 1. HERO VAULT CARD */}
      <LinearGradient
        colors={['#064e3b', '#022c22', '#000000']} // Deep Emerald to Black
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
         <View style={styles.heroHeader}>
             <View style={styles.heroIconBox}>
                 <Wallet size={24} color="#10b981" />
             </View>
             <Text style={styles.heroTitle}>TOTAL ACCUMULATED FUNDS</Text>
         </View>

         <Text style={styles.balanceText}>
             ₹{displayBalance.toLocaleString()}
         </Text>

         <View style={styles.heroFooter}>
             <Activity size={16} color="#10b981" />
             <Text style={styles.footerText}>Secure Storage • Real-Time Update</Text>
         </View>
      </LinearGradient>

      {/* 2. SECTION HEADER */}
      <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={Colors.dark.textMuted} />
          <Text style={styles.sectionTitle}>RECENT INFLOW STREAM</Text>
      </View>

      {/* 3. INFLOW LIST */}
      <FlatList
        data={recentInflows}
        renderItem={({ item }) => <InflowCard item={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Waiting for Inflow...</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // HERO CARD
  heroCard: {
    borderRadius: 24,
    padding: 30,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    elevation: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  balanceText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    fontFamily: 'Courier', // Monospace for numbers looks PRO
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 20,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  footerText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.5,
  },

  // LIST STYLES
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 10,
  },
  sectionTitle: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  inflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inflowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inflowAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inflowDate: {
    color: Colors.dark.textMuted,
    fontSize: 10,
  },
  inflowItems: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    maxWidth: 120,
  },
  inflowPayer: {
    color: Colors.dark.textMuted,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'right',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.textMuted,
    fontStyle: 'italic',
  }
});