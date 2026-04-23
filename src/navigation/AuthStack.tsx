import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { Colors } from '../theme';

// Placeholder — will be replaced by actual screen in Issue #4
const LoginPlaceholder: React.FC = () => null;

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginPlaceholder} />
    </Stack.Navigator>
  );
};
