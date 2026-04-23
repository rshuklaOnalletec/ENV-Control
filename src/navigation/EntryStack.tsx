import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EntryStackParamList } from '../types/navigation';
import { Colors } from '../theme';

// Placeholders — will be replaced by actual screens
const ManualEntryPlaceholder: React.FC = () => null;
const EntrySuccessPlaceholder: React.FC = () => null;

const Stack = createNativeStackNavigator<EntryStackParamList>();

export const EntryStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textInverse,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="ManualEntry"
        component={ManualEntryPlaceholder}
        options={{ title: 'New Entry' }}
      />
      <Stack.Screen
        name="EntrySuccess"
        component={EntrySuccessPlaceholder}
        options={{ title: 'Success', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
};
