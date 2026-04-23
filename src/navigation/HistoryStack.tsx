import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HistoryStackParamList } from '../types/navigation';
import { Colors } from '../theme';

// Placeholders — will be replaced by actual screens
const HistoryListPlaceholder: React.FC = () => null;
const HistoryDetailPlaceholder: React.FC = () => null;

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export const HistoryStack: React.FC = () => {
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
        name="HistoryList"
        component={HistoryListPlaceholder}
        options={{ title: 'History' }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailPlaceholder}
        options={{ title: 'Entry Details' }}
      />
    </Stack.Navigator>
  );
};
