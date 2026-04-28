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
  const [contact1, setContact1] = useState('7827236408');
  const [contact2, setContact2] = useState('8527324332');
  const [contact3, setContact3] = useState('7078502257');

  const handleContinue = (navigation) => {
    const validateNumber = (num) => {
      let cleaned = num.replace(/\s+/g, '');

      if (cleaned.startsWith('+91')) {
        cleaned = cleaned.slice(3);
      }

      return /^[0-9]{10}$/.test(cleaned);
    };

    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (
      !validateNumber(contact1) ||
      !validateNumber(contact2) ||
      !validateNumber(contact3)
    ) {
      alert('Enter valid 10-digit phone numbers (with or without +91)');
      return;
    }

    navigation.navigate('Connection', {
      name,
      contacts: [contact1, contact2, contact3],
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Setup">
          {({ navigation }) => (
            <View style={styles.container}>
              <Text style={styles.title}>Accident Alert Setup</Text>

              <Text style={styles.sectionTitle}>Enter Name</Text>
              <TextInput
                placeholder="Enter your name"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.sectionTitle}>Enter Contacts</Text>

              <TextInput
                placeholder="Contact 1"
                style={styles.input}
                keyboardType="phone-pad"
                value={contact1}
                onChangeText={setContact1}
              />

              <TextInput
                placeholder="Contact 2"
                style={styles.input}
                keyboardType="phone-pad"
                value={contact2}
                onChangeText={setContact2}
              />

              <TextInput
                placeholder="Contact 3"
                style={styles.input}
                keyboardType="phone-pad"
                value={contact3}
                onChangeText={setContact3}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleContinue(navigation)}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </Stack.Screen>

        <Stack.Screen name="Connection" component={ConnectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 70,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: '#f3f4f6',
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});