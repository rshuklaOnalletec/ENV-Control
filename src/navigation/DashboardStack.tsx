import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../types/navigation';
import { Colors } from '../theme';

// Placeholders — will be replaced by actual screens
const DashboardHomePlaceholder: React.FC = () => null;
const EntryDetailPlaceholder: React.FC = () => null;

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardStack: React.FC = () => {
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
        name="DashboardHome"
        component={DashboardHomePlaceholder}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="EntryDetail"
        component={EntryDetailPlaceholder}
        options={{ title: 'Entry Details' }}
      />
    </Stack.Navigator>
  );
};
