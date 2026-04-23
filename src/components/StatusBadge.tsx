import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  submitted: { color: Colors.success, bg: Colors.successLight },
  pending: { color: Colors.warning, bg: Colors.warningLight },
  rejected: { color: Colors.error, bg: Colors.errorLight },
  draft: { color: Colors.textSecondary, bg: Colors.divider },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'md' && styles.badgeMd]}>
      <Text style={[styles.text, { color: config.color }, size === 'md' && styles.textMd]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Spacing.borderRadiusSm,
    alignSelf: 'flex-start',
  },
  badgeMd: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  text: { ...Typography.caption, fontWeight: '600' },
  textMd: { fontSize: 13 },
});
