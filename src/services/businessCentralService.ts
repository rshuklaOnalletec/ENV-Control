import { AppConfig } from '../config/appConfig';
import { apiClient } from './apiClient';
import {
  BCApiResponse,
  BCGLAccount,
  BCDimension,
  BCDimensionValue,
  BCJournalEntry,
  BCJournalTemplate,
  BCJournalBatch,
  BCCompanyInfo,
} from '../types/businessCentral';

class BusinessCentralService {
  private get baseUrl(): string {
    const { baseUrl, tenantId, environment, companyId } =
      AppConfig.businessCentral;
    return `${baseUrl}/${tenantId}/${environment}/api/v2.0/companies(${companyId})`;
  }

  // Company Info
  async getCompanyInfo(): Promise<BCCompanyInfo> {
    return apiClient.get<BCCompanyInfo>(
      `${AppConfig.businessCentral.baseUrl}/${AppConfig.businessCentral.tenantId}/${AppConfig.businessCentral.environment}/api/v2.0/companies(${AppConfig.businessCentral.companyId})`,
    );
  }

  // G/L Accounts
  async getGLAccounts(): Promise<BCGLAccount[]> {
    const response = await apiClient.get<BCApiResponse<BCGLAccount>>(
      `${this.baseUrl}/generalLedgerAccounts`,
      {
        params: {
          $filter: "accountType eq 'Posting' and directPosting eq true and blocked eq false",
          $orderby: 'no',
        },
      },
    );
    return response.value;
  }

  async getGLAccount(id: string): Promise<BCGLAccount> {
    return apiClient.get<BCGLAccount>(
      `${this.baseUrl}/generalLedgerAccounts(${id})`,
    );
  }

  // Dimensions
  async getDimensions(): Promise<BCDimension[]> {
    const response = await apiClient.get<BCApiResponse<BCDimension>>(
      `${this.baseUrl}/dimensions`,
      {
        params: {
          $filter: 'blocked eq false',
        },
      },
    );
    return response.value;
  }

  async getDimensionValues(dimensionId: string): Promise<BCDimensionValue[]> {
    const response = await apiClient.get<BCApiResponse<BCDimensionValue>>(
      `${this.baseUrl}/dimensions(${dimensionId})/dimensionValues`,
      {
        params: {
          $filter: "dimensionValueType eq 'Standard' and blocked eq false",
          $orderby: 'code',
        },
      },
    );
    return response.value;
  }

  // Journal Templates & Batches
  async getJournalTemplates(): Promise<BCJournalTemplate[]> {
    const response = await apiClient.get<BCApiResponse<BCJournalTemplate>>(
      `${this.baseUrl}/journalTemplates`,
    );
    return response.value;
  }

  async getJournalBatches(templateName: string): Promise<BCJournalBatch[]> {
    const response = await apiClient.get<BCApiResponse<BCJournalBatch>>(
      `${this.baseUrl}/journalBatches`,
      {
        params: {
          $filter: `journalTemplateName eq '${templateName}'`,
        },
      },
    );
    return response.value;
  }

  // Journal Entries
  async postJournalEntry(entry: Omit<BCJournalEntry, 'id'>): Promise<BCJournalEntry> {
    return apiClient.post<BCJournalEntry>(
      `${this.baseUrl}/generalJournalLines`,
      entry,
    );
  }

  async getJournalEntries(
    top: number = 20,
    skip: number = 0,
    filter?: string,
  ): Promise<{ entries: BCJournalEntry[]; count: number }> {
    const params: Record<string, string | number> = {
      $top: top,
      $skip: skip,
      $count: 'true',
      $orderby: 'postingDate desc',
    };
    if (filter) {
      params.$filter = filter;
    }

    const response = await apiClient.get<BCApiResponse<BCJournalEntry>>(
      `${this.baseUrl}/generalJournalLines`,
      { params },
    );
    return {
      entries: response.value,
      count: response['@odata.count'] ?? response.value.length,
    };
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/generalJournalLines(${id})`);
  }
}

export const businessCentralService = new BusinessCentralService();
