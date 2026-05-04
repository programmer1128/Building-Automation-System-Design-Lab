import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, // <--- NEW IMPORT
  Platform // <--- NEW IMPORT
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useGraphData, Bill } from '@/context/GraphContext';
import { CreditCard, CheckCircle, AlertCircle, X, Receipt } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '@/constants/Config';
import RazorpayCheckout from 'react-native-razorpay'; 

// --- COMPONENTS ---

const BillCard = ({ item }: { item: Bill }) => {
  return (
    <View style={styles.billRow}>
      <View style={styles.billIcon}>
         <Receipt size={18} color={Colors.dark.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
         <Text style={styles.billDevice}>{item.deviceId}</Text>
         <Text style={styles.billDate}>{new Date(item.generatedAt).toLocaleDateString()}</Text>
      </View>
      <View>
         <Text style={styles.billAmount}>₹{item.amount}</Text>
         <Text style={styles.billStatus}>PENDING</Text>
      </View>
    </View>
  );
};

export default function BillingScreen() {
  const { bills, refreshData } = useGraphData();
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Derived State
  const totalDue = bills.reduce((sum, bill) => sum + bill.amount, 0);

  // --- PAYMENT LOGIC ---

  const handlePayPress = () => {
    setShowModal(true);
  };

  const processPayment = async () => {
    if (!name || !email) {
        Alert.alert("Missing Info", "Please enter Name and Email for the receipt.");
        return;
    }

    setLoading(true);
    try {
        const token = await AsyncStorage.getItem('jwtToken');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. CREATE ORDER (Backend)
        const orderRes = await axios.post(ENDPOINTS.CREATE_ORDER, { amount: totalDue }, { headers });
        const orderData = typeof orderRes.data === 'string' ? JSON.parse(orderRes.data) : orderRes.data;

        // 2. OPEN RAZORPAY
        const options = {
            description: 'Consolidated Utility Bill',
            image: 'https://i.imgur.com/3g7nmJC.png', 
            currency: orderData.currency,
            key: 'rzp_test_S0IvbKCzGAoXnH', 
            amount: orderData.amount,
            name: 'SmartHive Energy',
            order_id: orderData.id,
            prefill: { email: email, contact: '', name: name },
            theme: { color: Colors.dark.primary }
        };

        RazorpayCheckout.open(options).then(async (data: any) => {
            // 3. SUCCESS: VERIFY PAYMENT
            const verifyPayload = {
                orderId: data.razorpay_order_id,
                paymentId: data.razorpay_payment_id,
                signature: data.razorpay_signature,
                payerName: name,
                payerEmail: email
            };

            const verifyRes = await axios.post(ENDPOINTS.VERIFY_PAYMENT, verifyPayload, { headers });

            if (verifyRes.data === true) {
                Alert.alert("Success", "Payment Verified Successfully!");
                setShowModal(false);
                refreshData(); 
                setName('');
                setEmail('');
            } else {
                Alert.alert("Verification Failed", "Server could not verify the transaction.");
            }
        }).catch((error: any) => {
            console.log("Razorpay Error:", error);
            Alert.alert("Payment Cancelled", "Transaction was not completed.");
        });

    } catch (error) {
        console.log("Payment Init Error:", error);
        Alert.alert("Error", "Could not initiate payment sequence.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 1. FINANCIAL SUMMARY CARD */}
      <LinearGradient
        colors={totalDue > 0 ? ['#1e3a8a', '#172554'] : ['#064e3b', '#022c22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>OUTSTANDING DUES</Text>
            {totalDue > 0 ? <AlertCircle size={20} color="#fca5a5" /> : <CheckCircle size={20} color="#86efac" />}
        </View>
        
        <Text style={styles.amount}>
            ₹{totalDue.toLocaleString()}
        </Text>
        
        <Text style={styles.subtext}>
            {totalDue > 0 ? `${bills.length} Pending Invoices` : "All payments are up to date."}
        </Text>
      </LinearGradient>

      {/* 2. LIST HEADER */}
      <View style={styles.listHeader}>
         <Text style={styles.listTitle}>INVOICE DETAILS</Text>
      </View>

      {/* 3. BILLS LIST */}
      <FlatList
        data={bills}
        renderItem={({ item }) => <BillCard item={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <CheckCircle size={48} color={Colors.dark.success} style={{ opacity: 0.5 }} />
                <Text style={styles.emptyText}>No Dues Found</Text>
            </View>
        }
      />

      {/* 4. PAY BUTTON (Floating) */}
      {totalDue > 0 && (
          <TouchableOpacity style={styles.payButton} onPress={handlePayPress} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.dark.primary, '#2563eb']}
                style={styles.payGradient}
              >
                  <CreditCard size={20} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.payText}>PAY TOTAL DUE</Text>
              </LinearGradient>
          </TouchableOpacity>
      )}

      {/* 5. PAYMENT MODAL (NOW WITH KEYBOARD AVOIDANCE) */}
      <Modal visible={showModal} transparent animationType="slide">
          {/* GOD-LEVEL FIX: 
              We replace the simple View with KeyboardAvoidingView.
              'behavior' creates the push-up effect.
          */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.modalOverlay}
          >
              <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Secure Checkout</Text>
                      <TouchableOpacity onPress={() => setShowModal(false)}>
                          <X size={24} color={Colors.dark.textMuted} />
                      </TouchableOpacity>
                  </View>
                  
                  <View style={styles.inputGroup}>
                      <Text style={styles.label}>Payer Name</Text>
                      <TextInput 
                        style={styles.input} 
                        placeholder="John Doe" 
                        placeholderTextColor="#475569"
                        value={name}
                        onChangeText={setName}
                      />
                  </View>

                  <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email Receipt To</Text>
                      <TextInput 
                        style={styles.input} 
                        placeholder="john@example.com" 
                        placeholderTextColor="#475569"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                      />
                  </View>

                  <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Payable</Text>
                      <Text style={styles.totalValue}>₹{totalDue}</Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.modalButton, (!name || !email) && { opacity: 0.5 }]} 
                    onPress={processPayment}
                    disabled={loading || !name || !email}
                  >
                      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>PROCEED TO PAYMENT</Text>}
                  </TouchableOpacity>
              </View>
          </KeyboardAvoidingView>
      </Modal>

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
  summaryCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 25,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  amount: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
    fontFamily: 'Courier',
    marginBottom: 5,
  },
  subtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  listHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 10,
  },
  listTitle: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  billIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  billDevice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  billDate: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  billAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  billStatus: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 2,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.textMuted,
    marginTop: 10,
    fontSize: 16,
  },
  payButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 16,
    elevation: 10,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  payGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    fontSize: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  totalLabel: {
    color: Colors.dark.textMuted,
    fontSize: 16,
  },
  totalValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});