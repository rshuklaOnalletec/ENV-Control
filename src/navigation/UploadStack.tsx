import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UploadStackParamList } from '../types/navigation';
import { Colors } from '../theme';

// Placeholders — will be replaced by actual screens
const UploadDocumentPlaceholder: React.FC = () => null;
const ReviewExtractionPlaceholder: React.FC = () => null;
const UploadSuccessPlaceholder: React.FC = () => null;

const Stack = createNativeStackNavigator<UploadStackParamList>();

export const UploadStack: React.FC = () => {
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
        name="UploadDocument"
        component={UploadDocumentPlaceholder}
        options={{ title: 'Upload Bill' }}
      />
      <Stack.Screen
        name="ReviewExtraction"
        component={ReviewExtractionPlaceholder}
        options={{ title: 'Review Data' }}
      />
      <Stack.Screen
        name="UploadSuccess"
        component={UploadSuccessPlaceholder}
        options={{ title: 'Success', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
};
