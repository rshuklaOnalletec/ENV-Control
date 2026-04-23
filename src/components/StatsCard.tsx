import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Typography } from '../../theme';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color?: string;
  trend?: { value: string; positive: boolean };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = Colors.primary,
  trend,
}) => (
  <View style={styles.card}>
    <View style={[styles.iconCircle, { backgroundColor: color + '1A' }]}>
      <Icon name={icon} size={22} color={color} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.value}>{value}</Text>
    {trend && (
      <View style={styles.trendRow}>
        <Icon
          name={trend.positive ? 'trending-down' : 'trending-up'}
          size={14}
          color={trend.positive ? Colors.success : Colors.error}
        />
        <Text
          style={[styles.trendText, { color: trend.positive ? Colors.success : Colors.error }]}
        >
          {trend.value}
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusMd,
    padding: Spacing.cardPadding,
    flex: 1,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xxs },
  value: { ...Typography.heading2, color: Colors.textPrimary },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  trendText: { ...Typography.caption, fontWeight: '600', marginLeft: Spacing.xxs },
});
