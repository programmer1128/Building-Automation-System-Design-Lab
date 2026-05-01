import { ThemedText } from '@/components/themed-text';
import { Buffer } from 'buffer';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// 1. Define the interface contract
interface VideoStreamProps {
  camId: 'camera1' | 'camera2';
}

const VideoStream: React.FC<VideoStreamProps> = ({ camId }) => {

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 2. Return a placeholder UI to verify mounting
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 2. Define connection parameters
    const SERVER_IP = "10.168.237.229"; 
    const socketUrl = `ws://${SERVER_IP}:8000/ws/stream/${camId}`;

    // 3. Initialize the connection
    ws.current = new WebSocket(socketUrl);
    ws.current.binaryType = 'arraybuffer'; 

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        // Synchronous conversion from binary to base64 using Buffer
        console.log("WS got message from backend")
        // Synchronous conversion from binary to base64 using Buffer
        const base64String = Buffer.from(event.data).toString('base64');
        setImageUri(`data:image/jpeg;base64,${base64String}`);
      } catch (e) {
        console.error("Frame transformation error:", e);
      }
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket Error:", e);
    };


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
        {imageUri ? (
          <ThemedText style={styles.text}>Frame Received: Processing...</ThemedText>
        ) : (
          <ActivityIndicator size="large" color="#fff" />
        )}
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
  video: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: '#fff',
    marginTop: 10,
  },
});

export default VideoStream;