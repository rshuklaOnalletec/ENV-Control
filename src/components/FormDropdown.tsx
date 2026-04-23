import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Typography } from '../../theme';

export interface DropdownOption {
  label: string;
  value: string;
}

interface FormDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const FormDropdown: React.FC<FormDropdownProps> = ({
  label,
  options,
  value,
  onSelect,
  placeholder = 'Select...',
  error,
  required,
}) => {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.selector, error ? styles.selectorError : null]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.selectorText, !selected && styles.placeholder]}>
          {selected?.label ?? placeholder}
        </Text>
        <Icon name="chevron-down" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.optionActive]}
                  onPress={() => { onSelect(item.value); setVisible(false); }}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {item.value === value && <Icon name="check" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: { ...Typography.label, color: Colors.textPrimary, marginBottom: Spacing.sm },
  required: { color: Colors.error },
  selector: {
    height: Spacing.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadiusMd,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
  },
  selectorError: { borderColor: Colors.error },
  selectorText: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  placeholder: { color: Colors.textDisabled },
  errorText: { ...Typography.caption, color: Colors.error, marginTop: Spacing.xs },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: Colors.white, borderRadius: Spacing.borderRadiusLg, padding: Spacing.xxl, width: '80%', maxHeight: '60%' },
  modalTitle: { ...Typography.heading3, color: Colors.textPrimary, marginBottom: Spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  optionActive: { backgroundColor: Colors.primaryBackground, marginHorizontal: -Spacing.md, paddingHorizontal: Spacing.md, borderRadius: Spacing.borderRadiusSm },
  optionText: { ...Typography.body, color: Colors.textPrimary },
  optionTextActive: { color: Colors.primary, fontWeight: '600' },
});
