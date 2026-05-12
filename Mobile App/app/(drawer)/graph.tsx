import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { useGraphData } from '@/context/GraphContext'; // <--- Consume Global Data

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 90;
const MAX_POINTS = 20;
const SPACING = GRAPH_WIDTH / MAX_POINTS;

export default function GraphScreen() {
  // GET REAL-TIME DATA FROM "THE BRAIN"
  const { dataPoints, currentLoad, yAxisMax } = useGraphData();

  return (
    <View style={styles.container}>
      
      {/* 1. KPI CARD */}
      <LinearGradient
        colors={['rgba(30, 41, 59, 1)', 'rgba(15, 23, 42, 1)']}
        style={styles.kpiCard}
      >
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none" 
        />
        
        <View style={styles.kpiContent}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE STREAM</Text>
            </View>
            
            <Text style={styles.kpiLabel}>CURRENT SYSTEM LOAD</Text>
            <Text style={styles.kpiValue}>
              {currentLoad.toFixed(0)} <Text style={styles.unit}>W</Text>
            </Text>
        </View>
      </LinearGradient>

      {/* 2. GRAPH CONTAINER */}
      <View style={styles.chartWrapper}>
        <View style={styles.chartHeader}>
           {/* MATCHING FONT STYLE */}
           <Text style={styles.chartTitle}>POWER CONSUMPTION (WATTS)</Text>
        </View>

        <LineChart
          data={dataPoints}
          areaChart
          isAnimated
          animationDuration={300}
          
          // FIX: REDUCED CURVATURE prevents the "Dip" below zero
          curved
          curvature={0.2} 
          
          width={GRAPH_WIDTH}
          height={280}
          spacing={SPACING}
          initialSpacing={0}
          
          maxValue={yAxisMax}
          noOfSections={5}
          
          // AXES & LABELS
          yAxisTextStyle={{ color: Colors.dark.textMuted, fontSize: 10, fontWeight: 'bold' }}
          xAxisColor={Colors.dark.border}
          yAxisColor={Colors.dark.border}
          
          // REMOVED TIMESTAMPS (Empty Labels)
          xAxisLabelTextStyle={{ color: 'transparent', width: 0 }} 
          
          rulesColor="#334155"
          rulesType="dashed"
          yAxisLabelWidth={35}
          
          // STYLING
          color="#60a5fa"
          startFillColor={Colors.dark.primary}
          startOpacity={0.5}
          endFillColor={Colors.dark.primary}
          endOpacity={0.0}
          thickness={3}
          hideDataPoints
          endSpacing={0} 
        />
        
        {/* MATCHING TITLE FONT & PLACEMENT */}
        <Text style={styles.xAxisTitle}>TIME (SECONDS)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 20,
  },
  kpiCard: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    elevation: 8,
  },
  kpiContent: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    zIndex: 1,
  },
  liveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.success,
  },
  liveText: {
    color: Colors.dark.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
  kpiLabel: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 5,
    fontWeight: '600',
    marginTop: 10,
  },
  kpiValue: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '800',
    fontFamily: 'Courier',
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  unit: {
    fontSize: 20,
    color: Colors.dark.primary,
    fontFamily: 'System',
    fontWeight: '600',
  },
  chartWrapper: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    paddingVertical: 20,
    paddingRight: 25,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    elevation: 5,
  },
  chartHeader: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  chartTitle: {
    color: Colors.dark.textMuted,
    fontSize: 10,           // Matches X-Axis Title Size
    fontWeight: 'bold',     // Matches X-Axis Title Weight
    letterSpacing: 1,       // Professional Spacing
    marginLeft: 10,
  },
  xAxisTitle: {
    color: Colors.dark.textMuted,
    fontSize: 10,           // Exact Match
    fontWeight: 'bold',     // Exact Match
    letterSpacing: 1,       // Exact Match
    marginTop: 15,          // Clean Spacing
  }
});