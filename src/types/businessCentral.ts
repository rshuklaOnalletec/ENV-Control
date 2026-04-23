export interface BCJournalEntry {
  id?: string;
  journalTemplateName: string;
  journalBatchName: string;
  lineNo: number;
  accountType: 'G/L Account';
  accountNo: string;
  postingDate: string;
  documentType: 'Invoice' | 'Credit Memo' | ' ';
  documentNo: string;
  description: string;
  amount: number;
  dimensionSetId?: number;
  shortcutDimension1Code?: string;
  shortcutDimension2Code?: string;
}

export interface BCGLAccount {
  id: string;
  no: string;
  name: string;
  accountType: 'Posting' | 'Heading' | 'Total' | 'Begin-Total' | 'End-Total';
  accountCategory: string;
  accountSubcategory: string;
  directPosting: boolean;
  blocked: boolean;
}

export interface BCDimension {
  id: string;
  code: string;
  name: string;
  codeCaption: string;
  blocked: boolean;
}

export interface BCDimensionValue {
  id: string;
  dimensionCode: string;
  code: string;
  name: string;
  dimensionValueType: 'Standard' | 'Heading' | 'Total' | 'Begin-Total' | 'End-Total';
  blocked: boolean;
}

export interface BCJournalTemplate {
  name: string;
  description: string;
  type: string;
  recurring: boolean;
}

export interface BCJournalBatch {
  journalTemplateName: string;
  name: string;
  description: string;
}

export interface BCCompanyInfo {
  id: string;
  displayName: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BCApiResponse<T> {
  '@odata.context'?: string;
  '@odata.count'?: number;
  value: T[];
}

export interface BCApiError {
  error: {
    code: string;
    message: string;
    target?: string;
    details?: Array<{
      code: string;
      message: string;
      target?: string;
    }>;
  };
}
