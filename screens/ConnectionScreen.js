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

const ConnectionScreen = ({ route, navigation }) => {
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

    setBtStatus('Not Connected');
  };

  // 🌐 WebSocket
  useEffect(() => {
    requestPermissions();

    const socket = new WebSocket('ws://172.27.176.13:3000');

    socket.onopen = () => setStatus('🟢 Server Connected');

    socket.onmessage = event => {
      const msg = event.data;

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
      } else {
        setBtStatus('Not Connected');
      }
    } catch (err) {
      console.log(err);
      setBtStatus('Not Connected');
    }
  };

  // 📡 Read Bluetooth
  const readData = async (device) => {
    try {
      while (true) {
        const msg = await device.read();
        if (!msg) continue;

        const cleanMsg = msg.replace(/[^\x20-\x7E]/g, '').trim();
        if (!cleanMsg) continue;

        console.log('📡', cleanMsg);
        setSensorData(cleanMsg);

        if (cleanMsg === 'ACCIDENT') {
          triggerAccident();
        }

        if (cleanMsg.startsWith('LAT:')) {
          const parts = cleanMsg.split(',');
          const lat = parts[0].split(':')[1];
          const lon = parts[1].split(':')[1];

          setLocation({ lat, lon });
        }
      }
    } catch (err) {
      console.log(err);
      setBtStatus('Not Connected');
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

      ws.send(`ACCIDENT|LAT:${lat},LON:${lon}`);
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

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <Text style={styles.appTitle}>🛡 Guardian Alert</Text>
      </View>

      {/* USER */}
      <Text style={styles.title}>Welcome, {name}</Text>
      <Text style={styles.subtitle}>System Status Overview</Text>

      {/* ACCIDENT ALERT */}
      {accident && (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>🚨 ACCIDENT DETECTED</Text>

          {location ? (
            <TouchableOpacity onPress={openMap}>
              <Text style={styles.alertLocation}>📍 Tap to view location</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.alertLocation}>📍 Location not available</Text>
          )}
        </View>
      )}

      {/* STATUS CARDS */}
      <View style={styles.row}>
        <View style={styles.statusCard}>
          <Text>🟢 Server</Text>
          <Text style={styles.statusText}>
            {status.includes("Connected") ? "Connected" : "Connecting..."}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text>🔵 HC-05</Text>
          <Text style={styles.statusText}>
            {btStatus.includes("Connected") ? "Connected" : "Tap to Connect"}
          </Text>
        </View>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={connectBluetooth}
      >
        <Text style={styles.buttonText}>Connect </Text>
      </TouchableOpacity>

      {/* SENSOR DATA */}
      <View style={styles.sensorCard}>
        <Text style={styles.sensorTitle}>Live Sensor Data</Text>

        <Text style={styles.sensorValue}>
          {sensorData.includes("MAG")
            ? sensorData.split(":")[1]
            : "--"}
        </Text>

        <Text style={styles.sensorUnit}>IMPACT FORCE LEVEL</Text>
      </View>

    </View>
  );
};

export default ConnectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fb",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  backButton: {
    fontSize: 30,
    color: "black",
    marginRight: 10,
    marginBottom:10
  },

  appTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statusCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    elevation: 2,
  },

  statusText: {
    fontWeight: "bold",
    marginTop: 5,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  sensorCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },

  sensorTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },

  sensorValue: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },

  sensorUnit: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 5,
  },

  alertCard: {
    backgroundColor: "#dc2626",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },

  alertTitle: {
    color: "white",
    fontWeight: "bold",
  },

  alertLocation: {
    color: "#fee2e2",
    marginTop: 5,
  },
});