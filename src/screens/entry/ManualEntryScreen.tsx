import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Colors, Spacing, Typography } from '../../theme';
import { businessCentralService } from '../../services/businessCentralService';
import type { EntryScreenProps } from '../../types/navigation';
import type { BCGLAccount, BCDimensionValue } from '../../types/businessCentral';
import type { EmissionCategory, SubCategory } from '../../types/emissions';

type Props = EntryScreenProps<'ManualEntry'>;

// Mock categories — in production, fetched from BC dimensions
const MOCK_CATEGORIES: EmissionCategory[] = [
  {
    id: 'energy',
    code: 'ENERGY',
    name: 'Energy',
    scope: 'scope2',
    icon: 'flash',
    color: Colors.categoryEnergy,
    subcategories: [
      { id: 'electricity', code: 'ELEC', name: 'Electricity', categoryId: 'energy', emissionFactor: 0.0005, unit: 'kWh' },
      { id: 'natural_gas', code: 'GAS', name: 'Natural Gas', categoryId: 'energy', emissionFactor: 0.00185, unit: 'm³' },
      { id: 'heating_oil', code: 'OIL', name: 'Heating Oil', categoryId: 'energy', emissionFactor: 0.0027, unit: 'liters' },
    ],
  },
  {
    id: 'transport',
    code: 'TRANSPORT',
    name: 'Transport',
    scope: 'scope1',
    icon: 'car',
    color: Colors.categoryTransport,
    subcategories: [
      { id: 'fleet', code: 'FLEET', name: 'Company Fleet', categoryId: 'transport', emissionFactor: 0.0023, unit: 'liters' },
      { id: 'business_travel', code: 'TRAVEL', name: 'Business Travel', categoryId: 'transport', emissionFactor: 0.000255, unit: 'km' },
      { id: 'commuting', code: 'COMMUTE', name: 'Employee Commuting', categoryId: 'transport', emissionFactor: 0.00017, unit: 'km' },
    ],
  },
  {
    id: 'waste',
    code: 'WASTE',
    name: 'Waste',
    scope: 'scope3',
    icon: 'delete',
    color: Colors.categoryWaste,
    subcategories: [
      { id: 'general', code: 'GEN', name: 'General Waste', categoryId: 'waste', emissionFactor: 0.0003, unit: 'kg' },
      { id: 'recycling', code: 'RECYCLE', name: 'Recycling', categoryId: 'waste', emissionFactor: 0.00002, unit: 'kg' },
    ],
  },
  {
    id: 'water',
    code: 'WATER',
    name: 'Water',
    scope: 'scope3',
    icon: 'water',
    color: Colors.categoryWater,
    subcategories: [
      { id: 'municipal', code: 'MUNI', name: 'Municipal Water', categoryId: 'water', emissionFactor: 0.000344, unit: 'm³' },
      { id: 'wastewater', code: 'WASTE_W', name: 'Wastewater', categoryId: 'water', emissionFactor: 0.000708, unit: 'm³' },
    ],
  },
];

const MOCK_ACCOUNTS: BCGLAccount[] = [
  { id: '1', no: '6100', name: 'Utilities Expense', accountType: 'Posting', accountCategory: 'Expense', accountSubcategory: 'Utilities', directPosting: true, blocked: false },
  { id: '2', no: '6200', name: 'Transport Expense', accountType: 'Posting', accountCategory: 'Expense', accountSubcategory: 'Transport', directPosting: true, blocked: false },
  { id: '3', no: '6300', name: 'Waste Management', accountType: 'Posting', accountCategory: 'Expense', accountSubcategory: 'Operations', directPosting: true, blocked: false },
  { id: '4', no: '6400', name: 'Water & Sewage', accountType: 'Posting', accountCategory: 'Expense', accountSubcategory: 'Utilities', directPosting: true, blocked: false },
  { id: '5', no: '6500', name: 'Environmental Services', accountType: 'Posting', accountCategory: 'Expense', accountSubcategory: 'Environmental', directPosting: true, blocked: false },
];

export const ManualEntryScreen: React.FC<Props> = ({ navigation }) => {
  const [categories] = useState<EmissionCategory[]>(MOCK_CATEGORIES);
  const [accounts] = useState<BCGLAccount[]>(MOCK_ACCOUNTS);

  // Form state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown visibility
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories ?? [];
  const selectedSubcategory = subcategories.find((s) => s.id === selectedSubcategoryId);
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const co2Equivalent = selectedSubcategory && amount
    ? (parseFloat(amount) * selectedSubcategory.emissionFactor).toFixed(4)
    : '0.0000';

  const isFormValid =
    selectedCategoryId !== '' &&
    selectedSubcategoryId !== '' &&
    selectedAccountId !== '' &&
    amount.trim() !== '' &&
    parseFloat(amount) > 0 &&
    description.trim() !== '';

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId('');
    setShowCategoryPicker(false);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setShowSubcategoryPicker(false);
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    setShowAccountPicker(false);
  };

  const handleSubmit = async () => {
    if (!isFormValid || !selectedSubcategory || !selectedAccount) return;

    setIsSubmitting(true);
    try {
      await businessCentralService.postJournalEntry({
        journalTemplateName: 'GENERAL',
        journalBatchName: 'EMISSIONS',
        lineNo: 0,
        accountType: 'G/L Account',
        accountNo: selectedAccount.no,
        postingDate: date,
        documentType: 'Invoice',
        documentNo: `EMI-${Date.now()}`,
        description: `[${selectedCategory?.code}] ${description}`,
        amount: parseFloat(cost || '0'),
        shortcutDimension1Code: selectedCategory?.code,
        shortcutDimension2Code: selectedSubcategory.code,
      });

      Alert.alert(
        'Entry Submitted',
        `Emission entry for ${co2Equivalent} tCO2e has been submitted to Business Central.`,
        [
          { text: 'Add Another', onPress: resetForm },
          {
            text: 'Go to Dashboard',
            onPress: () => navigation.getParent()?.navigate('DashboardTab', { screen: 'DashboardHome' }),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        'Submission Failed',
        err instanceof Error ? err.message : 'Failed to submit entry. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
    setSelectedAccountId('');
    setAmount('');
    setCost('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            {selectedCategory ? (
              <View style={styles.pickerValue}>
                <Icon name={selectedCategory.icon} size={20} color={selectedCategory.color} />
                <Text style={styles.pickerValueText}>{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text style={styles.pickerPlaceholder}>Select category</Text>
            )}
            <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={styles.dropdownList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.dropdownItem,
                    cat.id === selectedCategoryId && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleCategorySelect(cat.id)}
                >
                  <Icon name={cat.icon} size={20} color={cat.color} />
                  <Text style={styles.dropdownItemText}>{cat.name}</Text>
                  <Text style={styles.dropdownItemCaption}>Scope {cat.scope.slice(-1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Subcategory Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Subcategory *</Text>
          <TouchableOpacity
            style={[styles.pickerButton, !selectedCategoryId && styles.pickerDisabled]}
            onPress={() => selectedCategoryId && setShowSubcategoryPicker(!showSubcategoryPicker)}
            disabled={!selectedCategoryId}
          >
            {selectedSubcategory ? (
              <Text style={styles.pickerValueText}>{selectedSubcategory.name}</Text>
            ) : (
              <Text style={styles.pickerPlaceholder}>
                {selectedCategoryId ? 'Select subcategory' : 'Select category first'}
              </Text>
            )}
            <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {showSubcategoryPicker && (
            <View style={styles.dropdownList}>
              {subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.dropdownItem,
                    sub.id === selectedSubcategoryId && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleSubcategorySelect(sub.id)}
                >
                  <Text style={styles.dropdownItemText}>{sub.name}</Text>
                  <Text style={styles.dropdownItemCaption}>
                    {sub.emissionFactor} tCO2e/{sub.unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* G/L Account Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>G/L Account *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowAccountPicker(!showAccountPicker)}
          >
            {selectedAccount ? (
              <Text style={styles.pickerValueText}>
                {selectedAccount.no} - {selectedAccount.name}
              </Text>
            ) : (
              <Text style={styles.pickerPlaceholder}>Select G/L account</Text>
            )}
            <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {showAccountPicker && (
            <View style={styles.dropdownList}>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.dropdownItem,
                    acc.id === selectedAccountId && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleAccountSelect(acc.id)}
                >
                  <Text style={styles.dropdownItemText}>
                    {acc.no} - {acc.name}
                  </Text>
                  <Text style={styles.dropdownItemCaption}>{acc.accountSubcategory}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Emission Date *</Text>
          <View style={styles.inputContainer}>
            <Icon name="calendar" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textDisabled}
            />
          </View>
        </View>

        {/* Amount */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Amount ({selectedSubcategory?.unit ?? 'units'}) *
          </Text>
          <View style={styles.inputContainer}>
            <Icon name="scale" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* CO2 Equivalent (calculated) */}
        {amount && selectedSubcategory && (
          <View style={styles.co2Banner}>
            <Icon name="cloud-outline" size={20} color={Colors.primary} />
            <Text style={styles.co2Text}>
              Estimated CO2: <Text style={styles.co2Value}>{co2Equivalent} tCO2e</Text>
            </Text>
          </View>
        )}

        {/* Cost */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cost (USD)</Text>
          <View style={styles.inputContainer}>
            <Icon name="currency-usd" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description *</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe this emission entry..."
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (!isFormValid || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Icon name="send" size={20} color={Colors.white} />
              <Text style={styles.submitButtonText}>Submit to Business Central</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetForm}
          disabled={isSubmitting}
        >
          <Text style={styles.resetButtonText}>Clear Form</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.massive,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: Colors.white,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
  },
  pickerDisabled: {
    backgroundColor: Colors.background,
    opacity: 0.6,
  },
  pickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerValueText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  pickerPlaceholder: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  dropdownList: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryBackground,
  },
  dropdownItemText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  dropdownItemCaption: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: Colors.white,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
  },
  textAreaContainer: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    padding: 0,
  },
  textArea: {
    height: 66,
  },
  co2Banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.lg,
  },
  co2Text: {
    ...Typography.body,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  co2Value: {
    fontWeight: '700',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: Spacing.buttonHeight,
    borderRadius: Spacing.borderRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.primaryLight,
    opacity: 0.7,
  },
  submitButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    marginLeft: Spacing.sm,
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: Spacing.buttonHeight,
    marginTop: Spacing.md,
  },
  resetButtonText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
});
