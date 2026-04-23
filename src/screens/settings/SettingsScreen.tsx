import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography } from '../../theme';
import { AppConfig } from '../../config/appConfig';
import { authService } from '../../services/authService';
import type { User, UserPreferences } from '../../types/user';

export const SettingsScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notificationsEnabled: true,
    darkMode: false,
  });
  const [bcConnected, setBcConnected] = useState(true);
  const [spConnected, setSpConnected] = useState(true);

  useEffect(() => {
    loadUserAndPreferences();
  }, []);

  const loadUserAndPreferences = async () => {
    const storedUser = await authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setPreferences(storedUser.preferences);
    }

    const settingsJson = await AsyncStorage.getItem(AppConfig.app.settingsStorageKey);
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      setPreferences((prev) => ({ ...prev, ...settings }));
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await AsyncStorage.setItem(
      AppConfig.app.settingsStorageKey,
      JSON.stringify(updated),
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of ENV-Control?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            // Navigation to login is handled by auth state change in AppNavigator
          },
        },
      ],
    );
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{user?.displayName ?? 'User'}</Text>
        <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        <View style={styles.profileBadge}>
          <Icon name="shield-account" size={14} color={Colors.primary} />
          <Text style={styles.profileRole}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Staff'}
          </Text>
        </View>
        <Text style={styles.profileOrg}>{user?.organization ?? ''}</Text>
      </View>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="bell-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={(val) => updatePreference('notificationsEnabled', val)}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={preferences.notificationsEnabled ? Colors.primary : Colors.textDisabled}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="moon-waning-crescent" size={22} color={Colors.textPrimary} />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={preferences.darkMode}
            onValueChange={(val) => updatePreference('darkMode', val)}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={preferences.darkMode ? Colors.primary : Colors.textDisabled}
          />
        </View>
      </View>

      {/* Connections Section */}
      <Text style={styles.sectionTitle}>Connections</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="microsoft" size={22} color={Colors.primary} />
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Business Central</Text>
              <Text style={styles.settingCaption}>Journal entries & accounts</Text>
            </View>
          </View>
          <View style={[styles.connectionBadge, bcConnected ? styles.connectedBadge : styles.disconnectedBadge]}>
            <View style={[styles.connectionDot, bcConnected ? styles.connectedDot : styles.disconnectedDot]} />
            <Text style={[styles.connectionText, bcConnected ? styles.connectedText : styles.disconnectedText]}>
              {bcConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="microsoft-sharepoint" size={22} color={Colors.accent} />
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>SharePoint</Text>
              <Text style={styles.settingCaption}>Document storage</Text>
            </View>
          </View>
          <View style={[styles.connectionBadge, spConnected ? styles.connectedBadge : styles.disconnectedBadge]}>
            <View style={[styles.connectionDot, spConnected ? styles.connectedDot : styles.disconnectedDot]} />
            <Text style={[styles.connectionText, spConnected ? styles.connectedText : styles.disconnectedText]}>
              {spConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="information-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.settingLabel}>App Version</Text>
          </View>
          <Text style={styles.settingValue}>{AppConfig.app.version}</Text>
        </View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="help-circle-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.settingLabel}>Help & Support</Text>
          </View>
          <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="file-document-outline" size={22} color={Colors.textPrimary} />
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </View>
          <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        {AppConfig.app.name} v{AppConfig.app.version} {'\n'}
        Sustainability Emissions Tracking
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.massive,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.heading1,
    color: Colors.white,
  },
  profileName: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  profileEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadiusFull,
    marginBottom: Spacing.xs,
  },
  profileRole: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  profileOrg: {
    ...Typography.bodySmall,
    color: Colors.textDisabled,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusLg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextGroup: {
    marginLeft: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  settingCaption: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
  },
  settingValue: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadiusFull,
  },
  connectedBadge: {
    backgroundColor: Colors.successLight,
  },
  disconnectedBadge: {
    backgroundColor: Colors.errorLight,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  connectedDot: {
    backgroundColor: Colors.success,
  },
  disconnectedDot: {
    backgroundColor: Colors.error,
  },
  connectionText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  connectedText: {
    color: Colors.success,
  },
  disconnectedText: {
    color: Colors.error,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    height: Spacing.buttonHeight,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.xxl,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
  },
});
