import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectionScreen from './screens/ConnectionScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [name, setName] = useState('');

  const handleContinue = (navigation) => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    navigation.navigate('Connection', { name });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Setup">
          {({ navigation }) => (
            <View style={styles.container}>

              {/* ICON */}
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 30 }}>💀</Text>
              </View>

              {/* TITLE */}
              <Text style={styles.title}>Accident Alert</Text>
              <Text style={styles.subtitle}>
                Stay safe. Connect your device.
              </Text>

              {/* CARD */}
              <View style={styles.card}>
                <Text style={styles.label}>Full Name</Text>

                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#9ca3af" // ✅ FIXED visibility
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleContinue(navigation)}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>

                {/* FOOTER TEXT */}
                <Text style={styles.footerText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.link}>Safety Protocols</Text> and{' '}
                  <Text style={styles.link}>Privacy Terms</Text>.
                </Text>
              </View>

              {/* FEATURES */}
              <View style={styles.featuresRow}>
                <View style={styles.featureBox}>
                  <Text>📡</Text>
                  <Text style={styles.featureText}>Sensor Active</Text>
                </View>

                <View style={styles.featureBox}>
                  <Text>📍</Text>
                  <Text style={styles.featureText}>GPS Tracking</Text>
                </View>

                <View style={styles.featureBox}>
                  <Text>🆘</Text>
                  <Text style={styles.featureText}>SOS Ready</Text>
                </View>
              </View>

            </View>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="Connection"
          component={ConnectionScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    padding: 20,
    justifyContent: "center",
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dbeafe",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 25,
  },

  label: {
    fontWeight: "600",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#1d4ed8",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
  },

  link: {
    color: "#2563eb",
    fontWeight: "600",
  },

  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  featureBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },

  featureText: {
    fontSize: 12,
    marginTop: 5,
    color: "#374151",
  },
});