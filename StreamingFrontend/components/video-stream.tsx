import { Buffer } from 'buffer';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface VideoStreamProps {
  camId: 'camera1' | 'camera2';
}

const VideoStream: React.FC<VideoStreamProps> = ({ camId }) => {

  const [appState, setAppState] = useState(AppState.currentState);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const shouldConnect = appState === 'active';

    if (!shouldConnect) {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      return; 
    }
  }, [camId, appState]); 

  useEffect(() => {
    const SERVER_IP = "10.168.237.229"; 
    const socketUrl = `ws://${SERVER_IP}:8000/ws/stream/${camId}`;

    ws.current = new WebSocket(socketUrl);
    ws.current.binaryType = 'arraybuffer'; 

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        console.log("WS got message from backend")
        // Synchronous conversion from binary to base64 using Buffer
        const base64String = Buffer.from(event.data).toString('base64');
        setImageUri(`data:image/jpeg;base64,${base64String}`);
      } catch (e) {
        console.error("Frame transformation error:", e);
      }
    };

    ws.current.onerror = (e) => {
      setError(`Connection failed for ${camId}`);
      console.error("WebSocket Error:", e);
    };


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
          <Image
          style={styles.video}
          source={{ uri: imageUri }}
          contentFit="contain"
          // Crucial: transition={0} removes the cross-fade animation that causes flickering
          transition={0} 
          // Prevents memory leaks by not caching thousands of individual stream frames
          cachePolicy="none" 
        />
        ) : (
          <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
          <ThemedText style={styles.text}>
            {error || `Connecting to ${camId}...`}
          </ThemedText>
        </View>
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