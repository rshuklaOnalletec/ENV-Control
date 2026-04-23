import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from './Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttons}>
          <Button title={cancelLabel} variant="ghost" onPress={onCancel} style={styles.btn} />
          <Button
            title={confirmLabel}
            variant={destructive ? 'destructive' : 'primary'}
            onPress={onConfirm}
            style={styles.btn}
          />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: Colors.white, borderRadius: Spacing.borderRadiusLg, padding: Spacing.xxl, width: '85%' },
  title: { ...Typography.heading3, color: Colors.textPrimary, marginBottom: Spacing.sm },
  message: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.xxl },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { marginLeft: Spacing.sm },
});
