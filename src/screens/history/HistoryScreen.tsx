import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Colors, Spacing, Typography } from '../../theme';
import type { HistoryScreenProps } from '../../types/navigation';
import type { EmissionEntry, EmissionStatus, EmissionFilter } from '../../types/emissions';

type Props = HistoryScreenProps<'HistoryList'>;

// Mock data
const MOCK_ENTRIES: EmissionEntry[] = [
  {
    id: '1', date: '2026-04-20', categoryId: 'energy', categoryName: 'Energy',
    subcategoryId: 'electricity', subcategoryName: 'Electricity', accountId: '6100',
    accountName: 'Utilities', amount: 1500, unit: 'kWh', co2Equivalent: 0.75,
    cost: 450.0, currency: 'USD', description: 'Office electricity - April',
    status: 'submitted', createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z', createdBy: 'demo',
  },
  {
    id: '2', date: '2026-04-18', categoryId: 'transport', categoryName: 'Transport',
    subcategoryId: 'fleet', subcategoryName: 'Company Fleet', accountId: '6200',
    accountName: 'Transport', amount: 200, unit: 'liters', co2Equivalent: 0.46,
    cost: 320.0, currency: 'USD', description: 'Fleet fuel - Week 16',
    status: 'pending', createdAt: '2026-04-18T14:30:00Z', updatedAt: '2026-04-18T14:30:00Z', createdBy: 'demo',
  },
  {
    id: '3', date: '2026-04-15', categoryId: 'waste', categoryName: 'Waste',
    subcategoryId: 'general', subcategoryName: 'General Waste', accountId: '6300',
    accountName: 'Waste Management', amount: 500, unit: 'kg', co2Equivalent: 0.15,
    cost: 180.0, currency: 'USD', description: 'Office waste collection',
    status: 'submitted', createdAt: '2026-04-15T09:00:00Z', updatedAt: '2026-04-15T09:00:00Z', createdBy: 'demo',
  },
  {
    id: '4', date: '2026-04-12', categoryId: 'water', categoryName: 'Water',
    subcategoryId: 'municipal', subcategoryName: 'Municipal Water', accountId: '6400',
    accountName: 'Water & Sewage', amount: 50, unit: 'm³', co2Equivalent: 0.02,
    cost: 95.0, currency: 'USD', description: 'Water usage - April',
    status: 'draft', createdAt: '2026-04-12T11:00:00Z', updatedAt: '2026-04-12T11:00:00Z', createdBy: 'demo',
  },
  {
    id: '5', date: '2026-04-10', categoryId: 'energy', categoryName: 'Energy',
    subcategoryId: 'natural_gas', subcategoryName: 'Natural Gas', accountId: '6100',
    accountName: 'Utilities', amount: 300, unit: 'm³', co2Equivalent: 0.56,
    cost: 275.0, currency: 'USD', description: 'Office heating - April',
    status: 'submitted', createdAt: '2026-04-10T08:00:00Z', updatedAt: '2026-04-10T08:00:00Z', createdBy: 'demo',
  },
  {
    id: '6', date: '2026-04-05', categoryId: 'transport', categoryName: 'Transport',
    subcategoryId: 'business_travel', subcategoryName: 'Business Travel', accountId: '6200',
    accountName: 'Transport', amount: 2400, unit: 'km', co2Equivalent: 0.61,
    cost: 890.0, currency: 'USD', description: 'Client visit - Chicago',
    status: 'rejected', createdAt: '2026-04-05T16:00:00Z', updatedAt: '2026-04-06T09:00:00Z', createdBy: 'demo',
  },
  {
    id: '7', date: '2026-03-28', categoryId: 'energy', categoryName: 'Energy',
    subcategoryId: 'electricity', subcategoryName: 'Electricity', accountId: '6100',
    accountName: 'Utilities', amount: 1400, unit: 'kWh', co2Equivalent: 0.70,
    cost: 420.0, currency: 'USD', description: 'Office electricity - March',
    status: 'submitted', createdAt: '2026-03-28T10:00:00Z', updatedAt: '2026-03-28T10:00:00Z', createdBy: 'demo',
  },
  {
    id: '8', date: '2026-03-20', categoryId: 'waste', categoryName: 'Waste',
    subcategoryId: 'recycling', subcategoryName: 'Recycling', accountId: '6300',
    accountName: 'Waste Management', amount: 200, unit: 'kg', co2Equivalent: 0.004,
    cost: 50.0, currency: 'USD', description: 'Recycling pickup - March',
    status: 'pending', createdAt: '2026-03-20T09:00:00Z', updatedAt: '2026-03-20T09:00:00Z', createdBy: 'demo',
  },
];

const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Newest First' },
  { key: 'date_asc', label: 'Oldest First' },
  { key: 'co2_desc', label: 'Highest Emissions' },
  { key: 'co2_asc', label: 'Lowest Emissions' },
];

const STATUS_FILTERS: { key: EmissionStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'pending', label: 'Pending' },
  { key: 'draft', label: 'Draft' },
  { key: 'rejected', label: 'Rejected' },
];

const CATEGORY_COLORS: Record<string, string> = {
  energy: Colors.categoryEnergy,
  transport: Colors.categoryTransport,
  waste: Colors.categoryWaste,
  water: Colors.categoryWater,
};

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  submitted: { color: Colors.success, bg: Colors.successLight },
  pending: { color: Colors.warning, bg: Colors.warningLight },
  rejected: { color: Colors.error, bg: Colors.errorLight },
  draft: { color: Colors.textSecondary, bg: Colors.divider },
};

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [entries, setEntries] = useState<EmissionEntry[]>(MOCK_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmissionStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState('date_desc');
  const [refreshing, setRefreshing] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [detailEntry, setDetailEntry] = useState<EmissionEntry | null>(null);

  const filteredEntries = entries
    .filter((entry) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.description.toLowerCase().includes(q) ||
          entry.categoryName.toLowerCase().includes(q) ||
          (entry.vendorName?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'co2_desc':
          return b.co2Equivalent - a.co2Equivalent;
        case 'co2_asc':
          return a.co2Equivalent - b.co2Equivalent;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In production, refetch from BC service
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDeleteEntry = (entry: EmissionEntry) => {
    if (entry.status !== 'draft' && entry.status !== 'pending') return;
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${entry.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          },
        },
      ],
    );
  };

  const renderEntry = ({ item }: { item: EmissionEntry }) => {
    const catColor = CATEGORY_COLORS[item.categoryId] ?? Colors.categoryOther;
    const statusConf = STATUS_STYLES[item.status] ?? STATUS_STYLES.draft;
    const canDelete = item.status === 'draft' || item.status === 'pending';

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => setDetailEntry(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryStripe, { backgroundColor: catColor }]} />
        <View style={styles.entryContent}>
          <View style={styles.entryTopRow}>
            <View style={styles.entryTitleRow}>
              <Text style={styles.entryCategory}>{item.categoryName}</Text>
              <Text style={styles.entrySub}> / {item.subcategoryName}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
              <Text style={[styles.statusText, { color: statusConf.color }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.entryDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.entryBottomRow}>
            <Text style={styles.entryDate}>
              {format(new Date(item.date), 'MMM d, yyyy')}
            </Text>
            <View style={styles.entryMetrics}>
              <Text style={styles.entryCo2}>{item.co2Equivalent.toFixed(3)} tCO2e</Text>
              <Text style={styles.entryCost}>${item.cost.toFixed(2)}</Text>
            </View>
          </View>
          {canDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEntry(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="trash-can-outline" size={16} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="file-search-outline" size={64} color={Colors.textDisabled} />
      <Text style={styles.emptyTitle}>No entries found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || statusFilter !== 'all'
          ? 'Try adjusting your filters'
          : 'Start tracking by creating a new entry'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="magnify" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          placeholderTextColor={Colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Icon name="sort" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((sf) => (
          <TouchableOpacity
            key={sf.key}
            style={[
              styles.filterChip,
              statusFilter === sf.key && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(sf.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === sf.key && styles.filterChipTextActive,
              ]}
            >
              {sf.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results Count */}
      <Text style={styles.resultCount}>
        {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
      </Text>

      {/* Entry List */}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.modalOption,
                  sortKey === opt.key && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSortKey(opt.key);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    sortKey === opt.key && styles.modalOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {sortKey === opt.key && (
                  <Icon name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Entry Detail Modal */}
      <Modal visible={detailEntry !== null} transparent animationType="slide">
        <View style={styles.detailOverlay}>
          <View style={styles.detailContent}>
            {detailEntry && (
              <>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>Entry Details</Text>
                  <TouchableOpacity onPress={() => setDetailEntry(null)}>
                    <Icon name="close" size={24} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>
                    {detailEntry.categoryName} / {detailEntry.subcategoryName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {format(new Date(detailEntry.date), 'MMMM d, yyyy')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>
                    {detailEntry.amount} {detailEntry.unit}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>CO2 Equivalent</Text>
                  <Text style={[styles.detailValue, { color: Colors.primary, fontWeight: '700' }]}>
                    {detailEntry.co2Equivalent.toFixed(4)} tCO2e
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cost</Text>
                  <Text style={styles.detailValue}>${detailEntry.cost.toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>G/L Account</Text>
                  <Text style={styles.detailValue}>
                    {detailEntry.accountId} - {detailEntry.accountName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{detailEntry.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: (STATUS_STYLES[detailEntry.status] ?? STATUS_STYLES.draft).bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: (STATUS_STYLES[detailEntry.status] ?? STATUS_STYLES.draft).color },
                      ]}
                    >
                      {detailEntry.status.charAt(0).toUpperCase() + detailEntry.status.slice(1)}
                    </Text>
                  </View>
                </View>
                {detailEntry.documentUrl && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Document</Text>
                    <Text style={[styles.detailValue, { color: Colors.primary }]}>
                      View attached document
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: Spacing.screenPadding,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    padding: 0,
  },
  sortButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadiusFull,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  resultCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.massive,
  },
  entryCard: {
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
  categoryStripe: {
    width: 4,
  },
  entryContent: {
    flex: 1,
    padding: Spacing.cardPadding,
  },
  entryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryCategory: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  entrySub: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
    marginBottom: Spacing.sm,
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
  entryMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryCo2: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: Spacing.md,
  },
  entryCost: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.cardPadding,
    right: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.massive,
  },
  emptyTitle: {
    ...Typography.heading3,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.xxl,
    width: '80%',
  },
  modalTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalOptionActive: {
    backgroundColor: Colors.primaryBackground,
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadiusSm,
  },
  modalOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  modalOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  detailContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Spacing.borderRadiusXl,
    borderTopRightRadius: Spacing.borderRadiusXl,
    padding: Spacing.xxl,
    maxHeight: '80%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  detailTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
});
