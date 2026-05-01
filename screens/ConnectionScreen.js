import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Linking,
} from 'react-native';

import RNBluetoothClassic from 'react-native-bluetooth-classic';

const ConnectionScreen = ({ route }) => {
  const name = route?.params?.name || 'User';

  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState('Connecting...');
  const [btStatus, setBtStatus] = useState('Not Connected');
  const [accident, setAccident] = useState(false);
  const [sensorData, setSensorData] = useState('No data yet');
  const [location, setLocation] = useState(null);

  // 🔐 Permissions
  const requestPermissions = async () => {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
  };

  // 🌐 WebSocket
  useEffect(() => {
    requestPermissions();

    const socket = new WebSocket('ws://192.168.1.13:3000');

    socket.onopen = () => {
      setStatus('🟢 Server Connected');
    };

    socket.onmessage = event => {
      const msg = event.data;
      console.log('📩 WS:', msg);

      // ✅ Receive combined message
      if (msg.startsWith('ACCIDENT')) {
        setAccident(true);
        Alert.alert('🚨 Accident Detected (Other Device)');

        const parts = msg.split('|');

        if (parts[1]) {
          const coords = parts[1];

          const lat = coords.split(',')[0].split(':')[1];
          const lon = coords.split(',')[1].split(':')[1];

          setLocation({ lat, lon });
        }
      }
    };

    socket.onerror = () => setStatus('❌ Server Error');
    socket.onclose = () => setStatus('🔴 Server Disconnected');

    setWs(socket);

    return () => socket.close();
  }, []);

  // 🔵 Connect Bluetooth
  const connectBluetooth = async () => {
    try {
      const devices = await RNBluetoothClassic.getBondedDevices();
      const hc05 = devices.find(d => d.name === 'HC-05');

      if (!hc05) {
        Alert.alert('HC-05 not paired');
        return;
      }

      const connected = await hc05.connect();

      if (connected) {
        setBtStatus('🟢 HC-05 Connected');
        readData(hc05);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 📡 Read Bluetooth Data
  const readData = async (device) => {
    try {
      while (true) {
        const msg = await device.read();

        if (!msg) continue;

        const cleanMsg = msg.replace(/[^\x20-\x7E]/g, '').trim();
        if (!cleanMsg) continue;

        console.log('📡 BT:', cleanMsg);

        setSensorData(cleanMsg);

        // detect accident from Arduino
        if (cleanMsg === 'ACCIDENT') {
          triggerAccident();
        }

        // store GPS
        if (cleanMsg.startsWith('LAT:')) {
          const parts = cleanMsg.split(',');

          const lat = parts[0].split(':')[1];
          const lon = parts[1].split(':')[1];

          setLocation({ lat, lon });
        }
      }
    } catch (err) {
      console.log('Read error:', err);
    }
  };

  // 🚨 Trigger Accident
  const triggerAccident = () => {
    if (accident) return;

    setAccident(true);
    Alert.alert('🚨 Accident Detected (This Device)');

    if (ws && ws.readyState === 1) {
      const lat = location?.lat || "28.6692";
      const lon = location?.lon || "77.4538";

      const message = `ACCIDENT|LAT:${lat},LON:${lon}`;

      ws.send(message);

      console.log("📤 Sent:", message);
    }
  };

  // 📍 Open Map
  const openMap = () => {
    if (!location) return;

    const url = `https://www.google.com/maps?q=${location.lat},${location.lon}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {name}</Text>

      <Text style={styles.status}>{status}</Text>
      <Text style={styles.status}>{btStatus}</Text>

      <TouchableOpacity style={styles.button} onPress={connectBluetooth}>
        <Text style={styles.buttonText}>Connect HC-05</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20 }}>
        Data: {sensorData}
      </Text>

      {accident && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>🚨 ACCIDENT DETECTED</Text>

          {location ? (
            <TouchableOpacity onPress={openMap}>
              <Text style={styles.locationText}>
                📍 Tap to view location
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.locationText}>
              📍 Location not available
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ConnectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  alertBox: {
    marginTop: 30,
    backgroundColor: '#fee2e2',
    padding: 20,
    borderRadius: 10,
  },
  alertText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationText: {
    marginTop: 10,
    fontSize: 14,
    color: '#7f1d1d',
  },
});