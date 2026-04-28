import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';

import RNBluetoothClassic from 'react-native-bluetooth-classic';
import SendSMS from 'react-native-sms';
import { Linking } from 'react-native';


const ConnectionScreen = ({ route }) => {
  const name = route?.params?.name || 'User';
  const contacts = route?.params?.contacts || [];

  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Not Connected');
  const [data, setData] = useState('');
  const [accident, setAccident] = useState(false);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // 🔐 Permissions
  const requestPermissions = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  // 🔘 Connect
  const connectDevice = async () => {
    try {
      const devices = await RNBluetoothClassic.getBondedDevices();
      const hc05 = devices.find(d => d.name === 'HC-05');

      if (!hc05) {
        console.log('HC-05 not paired');
        return;
      }

      const connection = await hc05.connect();

      if (connection) {
        setConnected(true);
        setStatus('Connected ✅');
        readData(hc05);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 📡 Read Data (stable loop)
  const readData = async (device) => {
    try {
      while (true) {
        const message = await device.read();
        if (!message) continue;

        console.log("RAW:", message);

        setData(message);

        // 📍 GPS parsing
        if (message.includes('LAT')) {
          const lat = message.split(':')[1]?.trim();
          setLatitude(lat);
        }

        if (message.includes('LON')) {
          const lon = message.split(':')[1]?.trim();
          setLongitude(lon);
        }

        // 🚨 Accident
        if (message.includes('ACCIDENT') && !accident) {
          setAccident(true);
          handleAccident();
        }
      }
    } catch (err) {
      console.log('Read error:', err);
    }
  };

  // 🚨 Accident handler
  const handleAccident = () => {
    const lat = latitude || "28.6139";
    const lon = longitude || "77.2090";

    const message = `🚨 Accident detected!
Location: https://maps.google.com/?q=${lat},${lon}`;

    SendSMS.send({
      body: message,
      recipients: contacts,
      successTypes: ['sent', 'queued'],
    });
  };

  // 🧪 Test SMS
  const testSMS = () => {
  console.log("Opening SMS app...");

  const number = "8527324332";   //contacts[0]
  const message = "Test SMS from Accident App";

  const url = `sms:${number}?body=${encodeURIComponent(message)}`;

  Linking.openURL(url)
    .then(() => console.log("SMS app opened"))
    .catch(err => console.log("Error opening SMS:", err));
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {name}</Text>

      <View style={styles.centerBox}>

        {/* CONNECT */}
        <TouchableOpacity style={styles.button} onPress={connectDevice}>
          <Text style={styles.buttonText}>
            {connected ? 'Connected' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>

        {/* TEST SMS */}
        <TouchableOpacity style={styles.testButton} onPress={testSMS}>
          <Text style={styles.buttonText}>Test SMS</Text>
        </TouchableOpacity>

        <Text style={styles.status}>Status: {status}</Text>

        <Text style={styles.data}>Data: {data}</Text>

        <Text style={styles.data}>
          GPS: {latitude || "28.6139"}, {longitude || "77.2090"}
        </Text>

        {/* 🚨 NICE LOOKING ALERT TEXT */}
        {accident && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>🚨 Accident Detected</Text>
            <Text style={styles.alertSub}>
              Emergency message sent to contacts
            </Text>
          </View>
        )}

        <Text style={styles.note}>
          Ensure your safety device is powered on
        </Text>

      </View>
    </View>
  );
};

export default ConnectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 10,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30,
    marginBottom: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    color: '#374151',
  },
  data: {
    fontSize: 14,
    marginBottom: 10,
    color: '#6b7280',
  },

  // 🚨 NEW STYLED ALERT BOX
  alertBox: {
    backgroundColor: '#fee2e2',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 18,
    color: '#b91c1c',
    fontWeight: 'bold',
  },
  alertSub: {
    fontSize: 12,
    color: '#7f1d1d',
    marginTop: 4,
  },

  note: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});