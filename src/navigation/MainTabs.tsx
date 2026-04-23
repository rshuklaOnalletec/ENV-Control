import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from '../types/navigation';
import { Colors, Spacing } from '../theme';
import { DashboardStack } from './DashboardStack';
import { EntryStack } from './EntryStack';
import { UploadStack } from './UploadStack';
import { HistoryStack } from './HistoryStack';

// Placeholder for Settings — will be replaced
const SettingsPlaceholder: React.FC = () => null;

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  DashboardTab: 'view-dashboard',
  EntryTab: 'plus-circle-outline',
  UploadTab: 'file-upload-outline',
  HistoryTab: 'history',
  SettingsTab: 'cog-outline',
};

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Icon name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: Spacing.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as const,
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="EntryTab"
        component={EntryStack}
        options={{ tabBarLabel: 'New Entry' }}
      />
      <Tab.Screen
        name="UploadTab"
        component={UploadStack}
        options={{ tabBarLabel: 'Upload' }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{ tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsPlaceholder}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
