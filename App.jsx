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

    navigation.navigate('Connection', {
      name,
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Setup">
          {({ navigation }) => (
            <View style={styles.container}>
              <Text style={styles.title}>Accident Alert</Text>

              <Text style={styles.subtitle}>
                Enter your name to connect
              </Text>

              <TextInput
                placeholder="Your Name"
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
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f3f4f6',
    marginBottom: 20,
    padding: 14,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});