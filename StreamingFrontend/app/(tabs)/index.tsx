import { StyleSheet, useColorScheme } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { View } from 'react-native';

type CameraID = 'camera1' | 'camera2';

export default function HomeScreen() {
  const [camId, setCamId] = useState<CameraID>('camera1');
  const theme = useColorScheme() ?? 'light';

  return (
    <View>
       <Picker
            selectedValue={camId}
            onValueChange={(itemValue) => {
              setCamId(itemValue as CameraID);
              console.log("Camera id", itemValue)
            }}
            style={styles.picker}
            itemStyle={styles.pickertext}
            dropdownIconColor={theme === 'dark' ? '#fff' : '#000'}
          >
            <Picker.Item label="Living Room" value="camera1" />
            <Picker.Item label="Bedroom" value="camera2" />
          </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
    picker: {
    height: 50,
    width: '100%',
  },
  pickertext: {
    color: 'white'
  }
});
