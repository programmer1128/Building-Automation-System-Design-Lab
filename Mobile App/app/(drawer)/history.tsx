import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useGraphData, Transaction } from '@/context/GraphContext';
import { History, CheckCircle, X, ArrowDownLeft, Wallet } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TransactionCard = ({ item, onPress }: { item: Transaction; onPress: (t: Transaction) => void }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onPress(item)}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconBox}>
             <ArrowDownLeft size={20} color="#10b981" />
          </View>
          <View>
             <Text style={styles.payerName}>{item.payerName}</Text>
             <Text style={styles.dateText}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
           <Text style={styles.amountText}>+ ₹{item.amount}</Text>
           <Text style={styles.successBadge}>SUCCESS</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function HistoryScreen() {
  const { transactions } = useGraphData();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Sorting: Newest first
  const sortedTxns = [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <View style={styles.container}>
       
       {/* HEADER */}
       <View style={styles.header}>
          <History size={20} color={Colors.dark.textMuted} />
          <Text style={styles.title}>PAYMENT LEDGER</Text>
       </View>

       {/* LIST */}
       <FlatList
         data={sortedTxns}
         renderItem={({ item }) => <TransactionCard item={item} onPress={setSelectedTxn} />}
         keyExtractor={item => item.id.toString()}
         contentContainerStyle={styles.listContent}
         showsVerticalScrollIndicator={false}
         ListEmptyComponent={
             <View style={styles.emptyContainer}>
                 <Wallet size={48} color={Colors.dark.primary} style={{ opacity: 0.5 }} />
                 <Text style={styles.emptyText}>Ledger Empty</Text>
                 <Text style={styles.subText}>No recorded transactions found.</Text>
             </View>
         }
       />

       {/* RECEIPT MODAL */}
       <Modal visible={!!selectedTxn} transparent animationType="fade">
          <View style={styles.modalOverlay}>
             <View style={styles.receiptContainer}>
                
                {/* Receipt Header */}
                <View style={styles.receiptHeader}>
                   <CheckCircle size={40} color="#10b981" style={{ marginBottom: 10 }} />
                   <Text style={styles.receiptTitle}>Payment Successful</Text>
                   <Text style={styles.receiptSub}>Transaction Verified</Text>
                </View>

                {/* Receipt Body */}
                {selectedTxn && (
                  <View style={styles.receiptBody}>
                     <View style={styles.row}>
                        <Text style={styles.label}>Transaction ID</Text>
                        <Text style={styles.valueMonospace}>{selectedTxn.razorpayPaymentId}</Text>
                     </View>
                     
                     <View style={styles.divider} />
                     
                     <View style={styles.row}>
                        <Text style={styles.label}>Payer Name</Text>
                        <Text style={styles.value}>{selectedTxn.payerName}</Text>
                     </View>

                     <View style={styles.row}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{selectedTxn.payerEmail}</Text>
                     </View>

                     <View style={styles.row}>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>{new Date(selectedTxn.timestamp).toLocaleString()}</Text>
                     </View>

                     <View style={styles.divider} />

                     <View style={styles.row}>
                        <Text style={styles.label}>Items Covered</Text>
                        <Text style={styles.valueSmall}>{selectedTxn.itemsPaid}</Text>
                     </View>

                     <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>Total Amount Paid</Text>
                        <Text style={styles.totalAmount}>₹{selectedTxn.amount}</Text>
                     </View>
                  </View>
                )}

                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedTxn(null)}>
                   <X size={20} color="#fff" />
                   <Text style={styles.closeText}>CLOSE RECEIPT</Text>
                </TouchableOpacity>

             </View>
          </View>
       </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 15 },
  title: { color: Colors.dark.textMuted, fontWeight: 'bold', fontSize: 12, letterSpacing: 2 },
  listContent: { paddingBottom: 50 },
  
  // Card Styles
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
  payerName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  dateText: { color: Colors.dark.textMuted, fontSize: 10, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  amountText: { color: '#10b981', fontSize: 16, fontWeight: 'bold', fontFamily: 'Courier' },
  successBadge: { color: '#10b981', fontSize: 8, fontWeight: 'bold', marginTop: 2, letterSpacing: 0.5 },
  
  // Empty State
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  subText: { color: Colors.dark.textMuted, marginTop: 5 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  receiptContainer: { width: '100%', backgroundColor: '#0f172a', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  receiptHeader: { alignItems: 'center', marginBottom: 20 },
  receiptTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  receiptSub: { color: '#10b981', fontSize: 12, marginTop: 4, letterSpacing: 1 },
  receiptBody: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: Colors.dark.textMuted, fontSize: 12 },
  value: { color: '#fff', fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  valueMonospace: { color: '#fff', fontSize: 12, fontFamily: 'Courier', letterSpacing: 0.5 },
  valueSmall: { color: '#cbd5e1', fontSize: 11, maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }, // Dashed imitation
  totalBox: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  totalAmount: { color: '#10b981', fontSize: 22, fontWeight: 'bold' },
  closeButton: { marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#334155', padding: 14, borderRadius: 12 },
  closeText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 14 }
});