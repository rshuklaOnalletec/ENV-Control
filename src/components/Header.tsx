import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Typography } from '../../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: { icon: string; onPress: () => void };
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onBack, rightAction }) => (
  <View style={styles.container}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
    ) : (
      <View style={styles.backBtn} />
    )}
    <View style={styles.center}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {rightAction ? (
      <TouchableOpacity onPress={rightAction.onPress} style={styles.rightBtn}>
        <Icon name={rightAction.icon} size={24} color={Colors.primary} />
      </TouchableOpacity>
    ) : (
      <View style={styles.rightBtn} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: { width: 40 },
  center: { flex: 1, alignItems: 'center' },
  title: { ...Typography.heading3, color: Colors.textPrimary },
  subtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.xxs },
  rightBtn: { width: 40, alignItems: 'flex-end' },
});
