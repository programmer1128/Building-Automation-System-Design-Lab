import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// 1. Define the interface contract
interface VideoStreamProps {
  camId: 'camera1' | 'camera2';
}

const VideoStream: React.FC<VideoStreamProps> = ({ camId }) => {
  // 2. Return a placeholder UI to verify mounting
  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
        <ThemedText style={styles.text}>
          Initializing stream for {camId}...
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    marginTop: 10,
  },
});

export default VideoStream;