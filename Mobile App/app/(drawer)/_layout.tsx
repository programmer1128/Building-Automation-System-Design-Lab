import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Colors } from '@/constants/Colors';
import { LayoutDashboard, TrendingUp, Server, CreditCard, History, FileText, Mail, Wallet } from 'lucide-react-native';
import CustomDrawer from '@/components/CustomDrawer';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { GraphProvider } from '@/context/GraphContext'; 

export default function DrawerLayout() {
  return (
    <GraphProvider> 
      <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
        <StatusBar style="light" backgroundColor={Colors.dark.background} translucent={false} />
        
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Drawer
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
              headerStyle: { 
                backgroundColor: Colors.dark.background,
                elevation: 0, 
                shadowOpacity: 0, 
                borderBottomWidth: 1,
                borderBottomColor: Colors.dark.border,
                height: Platform.OS === 'ios' ? 110 : 90,
              },
              headerTitleContainerStyle: { paddingTop: 10 },
              headerTintColor: Colors.dark.text,
              headerTitleStyle: { fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
              drawerStyle: { backgroundColor: Colors.dark.background, width: 280 },
              drawerActiveTintColor: Colors.dark.primary,
              drawerInactiveTintColor: Colors.dark.textMuted,
              drawerLabelStyle: { marginLeft: 5, fontSize: 15, fontWeight: '500' },
            }}
          >
            {/* 1. MONITOR */}
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: 'Monitor',
                title: 'SMARTHIVE INTEGRITY MONITOR',
                drawerIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
              }}
            />

            {/* 2. LOAD GRAPH */}
            <Drawer.Screen
              name="graph"
              options={{
                drawerLabel: 'Load Graph',
                title: 'REAL-TIME LOAD GRAPH',
                drawerIcon: ({ color }) => <TrendingUp size={22} color={color} />,
              }}
            />

            {/* 3. ANALYTICS */}
            <Drawer.Screen
              name="analytics"
              options={{
                drawerLabel: 'Appliance Analytics',
                title: 'DEVICE DETAILS',
                drawerIcon: ({ color }) => <Server size={22} color={color} />,
              }}
            />

            {/* 4. SYSTEM LOGS (FIXED) */}
            <Drawer.Screen
              name="logs"
              options={{
                drawerLabel: 'System Logs', // Professional Case
                title: 'SYSTEM INCIDENT LOGS', // Uppercase Header
                drawerIcon: ({ color }) => <FileText size={22} color={color} />, // Matching Icon
              }}
            />

            {/* HIDDEN: DEVICE INSPECTION */}
            <Drawer.Screen
              name="analytics/[id]"
              options={{
                drawerItemStyle: { display: 'none' },
                title: 'DEVICE INSPECTION',
                headerLeft: () => null,
              }}
            />

            {/* 6. GMAIL LOGS (NEW) */}
            <Drawer.Screen
              name="gmail"
              options={{
                drawerLabel: 'Gmail Logs',
                title: 'GMAIL INCIDENT HISTORY',
                drawerIcon: ({ color }) => <Mail size={22} color={color} />,
              }}
            />

            {/* 7. BILLING */}
            <Drawer.Screen
              name="billing"
              options={{
                drawerLabel: 'Maintenance Billing',
                title: 'MAINTENANCE BILLING',
                drawerIcon: ({ color }) => <CreditCard size={22} color={color} />,
              }}
            />

            {/* 8. HISTORY */}
            <Drawer.Screen
              name="history"
              options={{
                drawerLabel: 'Payment History',
                title: 'PAYMENT LEDGER',
                drawerIcon: ({ color }) => <History size={22} color={color} />,
              }}
            />

            {/* 9. COMMON BALANCE */}
            <Drawer.Screen
              name="balance"
              options={{
                drawerLabel: 'Common Balance',
                title: 'COMMON BALANCE FUND',
                drawerIcon: ({ color }) => <Wallet size={22} color={color} />,
              }}
            />

          </Drawer>
        </GestureHandlerRootView>
      </View>
    </GraphProvider>
  );
}