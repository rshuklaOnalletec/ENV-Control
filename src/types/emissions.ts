export type EmissionStatus = 'draft' | 'pending' | 'submitted' | 'rejected';

export type EmissionScope = 'scope1' | 'scope2' | 'scope3';

export interface EmissionCategory {
  id: string;
  code: string;
  name: string;
  scope: EmissionScope;
  icon: string;
  color: string;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  emissionFactor: number;
  unit: string;
}

export interface EmissionEntry {
  id: string;
  date: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  accountId: string;
  accountName: string;
  amount: number;
  unit: string;
  co2Equivalent: number;
  cost: number;
  currency: string;
  description: string;
  status: EmissionStatus;
  documentId?: string;
  documentUrl?: string;
  vendorName?: string;
  journalEntryId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface EmissionStats {
  totalEmissions: number;
  entriesThisMonth: number;
  pendingSubmissions: number;
  reductionPercentage: number;
  monthlyTrend: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  year: number;
  totalCO2: number;
  entryCount: number;
}

export interface EmissionFilter {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  status?: EmissionStatus;
  searchQuery?: string;
  sortBy?: 'date' | 'amount' | 'co2';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
