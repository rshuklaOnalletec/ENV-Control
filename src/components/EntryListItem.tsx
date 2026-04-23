import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Colors, Spacing, Typography } from '../../theme';
import type { EmissionEntry } from '../../types/emissions';

interface EntryListItemProps {
  entry: EmissionEntry;
  categoryColor: string;
  onPress: () => void;
}

const STATUS_MAP: Record<string, { color: string; bg: string }> = {
  submitted: { color: Colors.success, bg: Colors.successLight },
  pending: { color: Colors.warning, bg: Colors.warningLight },
  rejected: { color: Colors.error, bg: Colors.errorLight },
  draft: { color: Colors.textSecondary, bg: Colors.divider },
};

export const EntryListItem: React.FC<EntryListItemProps> = ({
  entry,
  categoryColor,
  onPress,
}) => {
  const status = STATUS_MAP[entry.status] ?? STATUS_MAP.draft;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.stripe, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.category} numberOfLines={1}>
            {entry.categoryName}
          </Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>
              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={1}>
          {entry.description}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{format(new Date(entry.date), 'MMM d, yyyy')}</Text>
          <Text style={styles.co2}>{entry.co2Equivalent.toFixed(3)} tCO2e</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  stripe: { width: 4 },
  content: { flex: 1, padding: Spacing.cardPadding },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  category: { ...Typography.label, color: Colors.textPrimary, flex: 1 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs, borderRadius: Spacing.borderRadiusSm },
  badgeText: { ...Typography.caption, fontWeight: '600' },
  description: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.sm },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { ...Typography.caption, color: Colors.textDisabled },
  co2: { ...Typography.label, color: Colors.primary, fontWeight: '600' },
});
