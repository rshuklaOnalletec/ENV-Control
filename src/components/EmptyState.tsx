import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Typography } from '../../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  subtitle,
  children,
}) => (
  <View style={styles.container}>
    <Icon name={icon} size={64} color={Colors.textDisabled} />
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.massive },
  title: { ...Typography.heading3, color: Colors.textSecondary, marginTop: Spacing.lg },
  subtitle: { ...Typography.body, color: Colors.textDisabled, marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xxl },
});
