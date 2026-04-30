import { ThemedText } from '@/components/themed-text';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// 1. Define the interface contract
interface VideoStreamProps {
  camId: 'camera1' | 'camera2';
}

const VideoStream: React.FC<VideoStreamProps> = ({ camId }) => {
  // 2. Return a placeholder UI to verify mounting
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 2. Define connection parameters
    const SERVER_IP = "10.168.237.229"; 
    const socketUrl = `ws://${SERVER_IP}:8000/ws/stream/${camId}`;

    // 3. Initialize the connection
    ws.current = new WebSocket(socketUrl);

    // 4. Cleanup: Close the socket when the component unmounts or camId changes
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [camId]);
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