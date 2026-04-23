export type DocumentType = 'invoice' | 'receipt' | 'utility_bill' | 'other';

export type ExtractionStatus = 'uploading' | 'processing' | 'completed' | 'failed';

export interface DocumentUpload {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uri: string;
  sharePointUrl?: string;
  documentType: DocumentType;
  uploadedAt: string;
  status: ExtractionStatus;
}

export interface ExtractionResult {
  documentId: string;
  status: ExtractionStatus;
  confidence: number;
  fields: ExtractedField[];
  lineItems: ExtractedLineItem[];
  rawResponse?: unknown;
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  fieldType: 'string' | 'number' | 'date' | 'currency';
  boundingBox?: number[];
}

export interface ExtractedLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category?: string;
  confidence: number;
}

export interface DocumentAnalysisRequest {
  documentUrl: string;
  modelId: string;
}

export interface DocumentAnalysisResponse {
  operationId: string;
  status: 'notStarted' | 'running' | 'succeeded' | 'failed';
  percentCompleted?: number;
  result?: ExtractionResult;
  error?: {
    code: string;
    message: string;
  };
}
