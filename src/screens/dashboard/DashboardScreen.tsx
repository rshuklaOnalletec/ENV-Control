import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Colors, Spacing, Typography } from '../../theme';
import { authService } from '../../services/authService';
import type { DashboardScreenProps } from '../../types/navigation';
import type { EmissionStats, EmissionEntry } from '../../types/emissions';
import type { User } from '../../types/user';

type Props = DashboardScreenProps<'DashboardHome'>;

// Mock data — will be replaced by real API calls
const MOCK_STATS: EmissionStats = {
  totalEmissions: 1247.5,
  entriesThisMonth: 23,
  pendingSubmissions: 5,
  reductionPercentage: 12.3,
  monthlyTrend: [],
};

const MOCK_RECENT_ENTRIES: EmissionEntry[] = [
  {
    id: '1',
    date: '2026-04-20',
    categoryId: 'energy',
    categoryName: 'Energy',
    subcategoryId: 'electricity',
    subcategoryName: 'Electricity',
    accountId: '6100',
    accountName: 'Utilities',
    amount: 1500,
    unit: 'kWh',
    co2Equivalent: 0.75,
    cost: 450.0,
    currency: 'USD',
    description: 'Office electricity - April',
    status: 'submitted',
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-04-20T10:00:00Z',
    createdBy: 'demo-user-001',
  },
  {
    id: '2',
    date: '2026-04-18',
    categoryId: 'transport',
    categoryName: 'Transport',
    subcategoryId: 'fleet',
    subcategoryName: 'Company Fleet',
    accountId: '6200',
    accountName: 'Transport',
    amount: 200,
    unit: 'liters',
    co2Equivalent: 0.46,
    cost: 320.0,
    currency: 'USD',
    description: 'Fleet fuel - Week 16',
    status: 'pending',
    createdAt: '2026-04-18T14:30:00Z',
    updatedAt: '2026-04-18T14:30:00Z',
    createdBy: 'demo-user-001',
  },
  {
    id: '3',
    date: '2026-04-15',
    categoryId: 'waste',
    categoryName: 'Waste',
    subcategoryId: 'general',
    subcategoryName: 'General Waste',
    accountId: '6300',
    accountName: 'Waste Management',
    amount: 500,
    unit: 'kg',
    co2Equivalent: 0.15,
    cost: 180.0,
    currency: 'USD',
    description: 'Office waste collection',
    status: 'submitted',
    createdAt: '2026-04-15T09:00:00Z',
    updatedAt: '2026-04-15T09:00:00Z',
    createdBy: 'demo-user-001',
  },
  {
    id: '4',
    date: '2026-04-12',
    categoryId: 'water',
    categoryName: 'Water',
    subcategoryId: 'municipal',
    subcategoryName: 'Municipal Water',
    accountId: '6100',
    accountName: 'Utilities',
    amount: 50,
    unit: 'm³',
    co2Equivalent: 0.02,
    cost: 95.0,
    currency: 'USD',
    description: 'Water usage - April',
    status: 'draft',
    createdAt: '2026-04-12T11:00:00Z',
    updatedAt: '2026-04-12T11:00:00Z',
    createdBy: 'demo-user-001',
  },
  {
    id: '5',
    date: '2026-04-10',
    categoryId: 'energy',
    categoryName: 'Energy',
    subcategoryId: 'natural_gas',
    subcategoryName: 'Natural Gas',
    accountId: '6100',
    accountName: 'Utilities',
    amount: 300,
    unit: 'm³',
    co2Equivalent: 0.56,
    cost: 275.0,
    currency: 'USD',
    description: 'Office heating - April',
    status: 'submitted',
    createdAt: '2026-04-10T08:00:00Z',
    updatedAt: '2026-04-10T08:00:00Z',
    createdBy: 'demo-user-001',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  energy: Colors.categoryEnergy,
  transport: Colors.categoryTransport,
  waste: Colors.categoryWaste,
  water: Colors.categoryWater,
};

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  submitted: { color: Colors.success, bg: Colors.successLight },
  pending: { color: Colors.warning, bg: Colors.warningLight },
  rejected: { color: Colors.error, bg: Colors.errorLight },
  draft: { color: Colors.textSecondary, bg: Colors.divider },
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<EmissionStats>(MOCK_STATS);
  const [recentEntries, setRecentEntries] = useState<EmissionEntry[]>(MOCK_RECENT_ENTRIES);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    setIsLoading(true);
    try {
      const storedUser = await authService.getStoredUser();
      setUser(storedUser);
      // In production, fetch stats from BC service here
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserAndData();
    setRefreshing(false);
  }, []);

  const navigateToEntry = () => {
    navigation.getParent()?.navigate('EntryTab', { screen: 'ManualEntry' });
  };

  const navigateToUpload = () => {
    navigation.getParent()?.navigate('UploadTab', { screen: 'UploadDocument' });
  };

  const navigateToHistory = () => {
    navigation.getParent()?.navigate('HistoryTab', { screen: 'HistoryList' });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back,
          </Text>
          <Text style={styles.userName}>
            {user?.displayName ?? 'User'}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {format(new Date(), 'EEEE, MMM d, yyyy')}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardHalf]}>
          <View style={[styles.statIconCircle, { backgroundColor: Colors.primaryBackground }]}>
            <Icon name="cloud-outline" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{stats.totalEmissions.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Total tCO2e</Text>
        </View>
        <View style={[styles.statCard, styles.statCardHalf]}>
          <View style={[styles.statIconCircle, { backgroundColor: Colors.successLight }]}>
            <Icon name="file-document-outline" size={22} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>{stats.entriesThisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={[styles.statCard, styles.statCardHalf]}>
          <View style={[styles.statIconCircle, { backgroundColor: Colors.warningLight }]}>
            <Icon name="clock-outline" size={22} color={Colors.warning} />
          </View>
          <Text style={styles.statValue}>{stats.pendingSubmissions}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, styles.statCardHalf]}>
          <View style={[styles.statIconCircle, { backgroundColor: Colors.successLight }]}>
            <Icon name="trending-down" size={22} color={Colors.success} />
          </View>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            -{stats.reductionPercentage}%
          </Text>
          <Text style={styles.statLabel}>vs Last Month</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToEntry}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: Colors.primary }]}>
            <Icon name="plus" size={24} color={Colors.white} />
          </View>
          <Text style={styles.actionLabel}>New Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToUpload}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: Colors.accent }]}>
            <Icon name="file-upload-outline" size={24} color={Colors.white} />
          </View>
          <Text style={styles.actionLabel}>Upload Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToHistory}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: Colors.categoryTransport }]}>
            <Icon name="history" size={24} color={Colors.white} />
          </View>
          <Text style={styles.actionLabel}>View History</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Entries */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Entries</Text>
        <TouchableOpacity onPress={navigateToHistory}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {recentEntries.map((entry) => {
        const catColor = CATEGORY_COLORS[entry.categoryId] ?? Colors.categoryOther;
        const statusConf = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.draft;
        return (
          <TouchableOpacity
            key={entry.id}
            style={styles.entryCard}
            onPress={() => navigation.navigate('EntryDetail', { entryId: entry.id })}
            activeOpacity={0.7}
          >
            <View style={[styles.entryCategoryDot, { backgroundColor: catColor }]} />
            <View style={styles.entryContent}>
              <View style={styles.entryTopRow}>
                <Text style={styles.entryCategory}>{entry.categoryName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
                  <Text style={[styles.statusText, { color: statusConf.color }]}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.entryDescription} numberOfLines={1}>
                {entry.description}
              </Text>
              <View style={styles.entryBottomRow}>
                <Text style={styles.entryDate}>
                  {format(new Date(entry.date), 'MMM d, yyyy')}
                </Text>
                <Text style={styles.entryAmount}>
                  {entry.co2Equivalent.toFixed(2)} tCO2e
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.massive,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  userName: {
    ...Typography.heading2,
    color: Colors.textPrimary,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardHalf: {
    width: '48%',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.heading1,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  viewAllText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusMd,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  entryCategoryDot: {
    width: 4,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  entryContent: {
    flex: 1,
  },
  entryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  entryCategory: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Spacing.borderRadiusSm,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  entryDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  entryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  entryAmount: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '600',
  },
});
