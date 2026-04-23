import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { Colors, Spacing, Typography } from '../../theme';
import { sharePointService } from '../../services/sharePointService';
import { documentIntelligenceService } from '../../services/documentIntelligenceService';
import { businessCentralService } from '../../services/businessCentralService';
import type { UploadScreenProps } from '../../types/navigation';
import type { ExtractedField, ExtractedLineItem, ExtractionStatus } from '../../types/document';

type Props = UploadScreenProps<'UploadDocument'>;

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export const UploadScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus | 'idle'>('idle');
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [extractedLineItems, setExtractedLineItems] = useState<ExtractedLineItem[]>([]);
  const [confidence, setConfidence] = useState(0);

  // Editable extracted values
  const [vendorName, setVendorName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets?.[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri!,
          name: asset.fileName || 'photo.jpg',
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        });
        resetExtraction();
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const captureFromCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });
      if (result.assets?.[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri!,
          name: asset.fileName || `capture_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        });
        resetExtraction();
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      setSelectedFile({
        uri: result.uri,
        name: result.name || 'document',
        type: result.type || 'application/pdf',
        size: result.size || 0,
      });
      resetExtraction();
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const resetExtraction = () => {
    setExtractionStatus('idle');
    setExtractedFields([]);
    setExtractedLineItems([]);
    setVendorName('');
    setInvoiceDate('');
    setTotalAmount('');
    setDescription('');
    setConfidence(0);
    setUploadProgress(0);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    resetExtraction();
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) return;

    try {
      // Step 1: Upload to SharePoint
      setExtractionStatus('uploading');
      const uploadResponse = await sharePointService.uploadDocument(
        selectedFile.name,
        { uri: selectedFile.uri } as unknown as Blob,
        'Emissions',
        (progress) => setUploadProgress(progress),
      );

      // Step 2: Submit to Azure Document Intelligence
      setExtractionStatus('processing');
      const operationId = await documentIntelligenceService.analyzeDocument(
        uploadResponse.webUrl,
      );

      // Step 3: Poll for results
      const result = await documentIntelligenceService.pollForResult(operationId);

      setExtractionStatus('completed');
      setExtractedFields(result.fields);
      setExtractedLineItems(result.lineItems);
      setConfidence(result.confidence);

      // Pre-fill editable fields from extraction
      const vendorField = result.fields.find((f) => f.name === 'VendorName');
      const dateField = result.fields.find((f) => f.name === 'InvoiceDate');
      const totalField = result.fields.find((f) => f.name === 'InvoiceTotal');
      const descField = result.fields.find((f) => f.name === 'Description');

      if (vendorField) setVendorName(vendorField.value);
      if (dateField) setInvoiceDate(dateField.value);
      if (totalField) setTotalAmount(totalField.value);
      if (descField) setDescription(descField.value);
    } catch (err) {
      setExtractionStatus('failed');
      Alert.alert(
        'Extraction Failed',
        err instanceof Error ? err.message : 'Failed to process document',
      );
    }
  };

  const handleSubmitToBC = async () => {
    setIsSubmitting(true);
    try {
      await businessCentralService.postJournalEntry({
        journalTemplateName: 'GENERAL',
        journalBatchName: 'EMISSIONS',
        lineNo: 0,
        accountType: 'G/L Account',
        accountNo: '6100',
        postingDate: invoiceDate || new Date().toISOString().split('T')[0],
        documentType: 'Invoice',
        documentNo: `SCAN-${Date.now()}`,
        description: `[AI] ${vendorName} - ${description}`,
        amount: parseFloat(totalAmount) || 0,
      });

      Alert.alert(
        'Submitted',
        'Extracted entry has been submitted to Business Central.',
        [
          { text: 'Upload Another', onPress: () => { setSelectedFile(null); resetExtraction(); } },
          {
            text: 'Go to Dashboard',
            onPress: () => navigation.getParent()?.navigate('DashboardTab', { screen: 'DashboardHome' }),
          },
        ],
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageFile = selectedFile?.type.startsWith('image/');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* File Selection Area */}
      {!selectedFile ? (
        <View style={styles.uploadArea}>
          <View style={styles.uploadIconCircle}>
            <Icon name="cloud-upload-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Upload a Bill or Invoice</Text>
          <Text style={styles.uploadSubtitle}>
            Select a PDF or image to extract emission data using AI
          </Text>

          <View style={styles.uploadActions}>
            <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
              <Icon name="file-document-outline" size={28} color={Colors.primary} />
              <Text style={styles.uploadOptionText}>Browse Files</Text>
              <Text style={styles.uploadOptionCaption}>PDF, JPEG, PNG</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadOption} onPress={pickFromGallery}>
              <Icon name="image-outline" size={28} color={Colors.accent} />
              <Text style={styles.uploadOptionText}>Gallery</Text>
              <Text style={styles.uploadOptionCaption}>Pick a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadOption} onPress={captureFromCamera}>
              <Icon name="camera-outline" size={28} color={Colors.categoryTransport} />
              <Text style={styles.uploadOptionText}>Camera</Text>
              <Text style={styles.uploadOptionCaption}>Take a photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* File Preview */}
          <View style={styles.filePreview}>
            <View style={styles.filePreviewHeader}>
              <Text style={styles.filePreviewTitle}>Selected Document</Text>
              <TouchableOpacity onPress={handleClearFile}>
                <Icon name="close-circle" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {isImageFile && (
              <Image source={{ uri: selectedFile.uri }} style={styles.thumbnailImage} resizeMode="contain" />
            )}
            <View style={styles.fileInfo}>
              <Icon
                name={isImageFile ? 'image' : 'file-pdf-box'}
                size={24}
                color={Colors.primary}
              />
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
              </View>
            </View>

            {/* Upload Progress */}
            {extractionStatus === 'uploading' && (
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Uploading to SharePoint...</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
                <Text style={styles.progressPercent}>{uploadProgress}%</Text>
              </View>
            )}

            {/* Processing Status */}
            {extractionStatus === 'processing' && (
              <View style={styles.processingSection}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.processingText}>
                  AI is analyzing your document...
                </Text>
              </View>
            )}

            {/* Extract Button */}
            {extractionStatus === 'idle' && (
              <TouchableOpacity
                style={styles.extractButton}
                onPress={handleUploadAndExtract}
                activeOpacity={0.8}
              >
                <Icon name="brain" size={20} color={Colors.white} />
                <Text style={styles.extractButtonText}>Extract with AI</Text>
              </TouchableOpacity>
            )}

            {/* Failed State */}
            {extractionStatus === 'failed' && (
              <View style={styles.failedSection}>
                <Icon name="alert-circle" size={20} color={Colors.error} />
                <Text style={styles.failedText}>Extraction failed</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleUploadAndExtract}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Extracted Data (editable) */}
          {extractionStatus === 'completed' && (
            <View style={styles.extractedSection}>
              <View style={styles.extractedHeader}>
                <Text style={styles.extractedTitle}>Extracted Data</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {(confidence * 100).toFixed(0)}% confidence
                  </Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Vendor Name</Text>
                <TextInput
                  style={styles.editableInput}
                  value={vendorName}
                  onChangeText={setVendorName}
                  placeholder="Vendor name"
                  placeholderTextColor={Colors.textDisabled}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Invoice Date</Text>
                <TextInput
                  style={styles.editableInput}
                  value={invoiceDate}
                  onChangeText={setInvoiceDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textDisabled}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Total Amount</Text>
                <TextInput
                  style={styles.editableInput}
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.editableInput, styles.editableTextArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Entry description"
                  placeholderTextColor={Colors.textDisabled}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Line Items */}
              {extractedLineItems.length > 0 && (
                <>
                  <Text style={styles.lineItemsTitle}>Line Items</Text>
                  {extractedLineItems.map((item, index) => (
                    <View key={index} style={styles.lineItem}>
                      <Text style={styles.lineItemDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <Text style={styles.lineItemAmount}>
                        ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </>
              )}

              {/* Submit to BC */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmitToBC}
                disabled={isSubmitting}
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
            </View>
          )}
        </>
      )}
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
  uploadArea: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.xxxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  uploadIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  uploadTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  uploadSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  uploadActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  uploadOption: {
    alignItems: 'center',
    padding: Spacing.md,
    flex: 1,
  },
  uploadOptionText: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  uploadOptionCaption: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  filePreview: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  filePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filePreviewTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
  thumbnailImage: {
    width: '100%',
    height: 200,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
  },
  fileDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  fileName: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  fileSize: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressSection: {
    marginTop: Spacing.md,
  },
  progressLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressPercent: {
    ...Typography.caption,
    color: Colors.primary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  processingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.primaryBackground,
    borderRadius: Spacing.borderRadiusMd,
  },
  processingText: {
    ...Typography.body,
    color: Colors.primary,
    marginLeft: Spacing.md,
  },
  extractButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    height: Spacing.buttonHeight,
    borderRadius: Spacing.borderRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extractButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  failedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
  },
  failedText: {
    ...Typography.body,
    color: Colors.error,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  retryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.error,
    borderRadius: Spacing.borderRadiusSm,
  },
  retryButtonText: {
    ...Typography.label,
    color: Colors.white,
  },
  extractedSection: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.cardPadding,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  extractedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  extractedTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
  confidenceBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Spacing.borderRadiusSm,
  },
  confidenceText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  editableInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: Colors.white,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  editableTextArea: {
    height: 70,
    paddingVertical: Spacing.md,
    textAlignVertical: 'top',
  },
  lineItemsTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  lineItemDesc: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  lineItemAmount: {
    ...Typography.label,
    color: Colors.primary,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: Spacing.buttonHeight,
    borderRadius: Spacing.borderRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    marginLeft: Spacing.sm,
  },
});
