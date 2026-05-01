import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
} from 'react-native';

import RNBluetoothClassic from 'react-native-bluetooth-classic';

const ConnectionScreen = ({ route }) => {
  const name = route?.params?.name || 'User';

  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState('Connecting...');
  const [btStatus, setBtStatus] = useState('Not Connected');
  const [accident, setAccident] = useState(false);
  const [sensorData, setSensorData] = useState('No data yet');
  const [location, setLocation] = useState("");

  // 🔐 Permissions
  const requestPermissions = async () => {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
  };

  // 🌐 WebSocket Setup
  useEffect(() => {
    requestPermissions();

    const socket = new WebSocket('ws://192.168.1.13:3000');

    socket.onopen = () => {
      console.log('✅ Server connected');
      setStatus('🟢 Server Connected');
    };

    socket.onmessage = event => {
      console.log('📩 WS:', event.data);

      if (event.data === 'ACCIDENT') {
        setAccident(true);
        Alert.alert('🚨 Accident Detected (Other Device)');
      }

      if (event.data.startsWith("LAT:")) {
        setLocation(event.data);
      }
    };

    socket.onerror = () => {
      setStatus('❌ Server Error');
    };

    socket.onclose = () => {
      setStatus('🔴 Server Disconnected');
    };

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
      console.log('Bluetooth error:', err);
    }
  };

  // 📡 Read Bluetooth Data (FINAL STABLE)
  const readData = async (device) => {
    try {
      while (true) {
        const msg = await device.read();

        if (!msg) continue;

        const cleanMsg = msg.replace(/[^\x20-\x7E]/g, "").trim();

        if (!cleanMsg) continue;

        console.log("📡 Data:", cleanMsg);

        setSensorData(cleanMsg);

        // 🚨 Accident trigger
        if (cleanMsg === "ACCIDENT") {
          triggerAccident();
        }

        // 📍 GPS parsing
        if (cleanMsg.startsWith("LAT:")) {
          setLocation(cleanMsg);
        }
      }
    } catch (err) {
      console.log("Read error:", err);
    }
  };

  // 🚨 Trigger accident
  const triggerAccident = () => {
    if (accident) return;

    setAccident(true);
    Alert.alert('🚨 Accident Detected (This Device)');

    if (ws && ws.readyState === 1) {
      ws.send('ACCIDENT');

      if (location) {
        ws.send(location); // send GPS too
      }

      console.log('📤 Sent to server');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {name}</Text>

      <Text style={styles.status}>{status}</Text>
      <Text style={styles.status}>{btStatus}</Text>

      <TouchableOpacity style={styles.button} onPress={connectBluetooth}>
        <Text style={styles.buttonText}>Connect HC-05</Text>
      </TouchableOpacity>

      {/* 📡 Live Sensor Data */}
      <Text style={{ marginTop: 20 }}>
        Data: {sensorData}
      </Text>

      {/* 🚨 FINAL UI */}
      {accident && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>🚨 ACCIDENT DETECTED</Text>

          {location ? (
            <Text style={styles.locationText}>
              📍 {location}
            </Text>
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