import axios from 'axios';
import { AppConfig } from '../config/appConfig';
import {
  ExtractionResult,
  ExtractedField,
  ExtractedLineItem,
  DocumentAnalysisResponse,
} from '../types/document';

class DocumentIntelligenceService {
  private get endpoint(): string {
    return AppConfig.documentIntelligence.endpoint;
  }

  private get apiKey(): string {
    return AppConfig.documentIntelligence.apiKey;
  }

  private get modelId(): string {
    return AppConfig.documentIntelligence.modelId;
  }

  private get apiVersion(): string {
    return AppConfig.documentIntelligence.apiVersion;
  }

  async analyzeDocument(
    documentUrl: string,
  ): Promise<string> {
    const url = `${this.endpoint}/documentintelligence/documentModels/${this.modelId}:analyze?api-version=${this.apiVersion}`;

    const response = await axios.post(
      url,
      { urlSource: documentUrl },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    // Extract operation ID from Operation-Location header
    const operationLocation = response.headers['operation-location'];
    if (!operationLocation) {
      throw new Error('No operation location returned from Document Intelligence');
    }

    const operationId = operationLocation.split('/').pop()?.split('?')[0];
    if (!operationId) {
      throw new Error('Could not parse operation ID');
    }

    return operationId;
  }

  async analyzeDocumentFromBytes(
    fileContent: ArrayBuffer,
    contentType: string,
  ): Promise<string> {
    const url = `${this.endpoint}/documentintelligence/documentModels/${this.modelId}:analyze?api-version=${this.apiVersion}`;

    const response = await axios.post(url, fileContent, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
        'Content-Type': contentType,
      },
    });

    const operationLocation = response.headers['operation-location'];
    if (!operationLocation) {
      throw new Error('No operation location returned from Document Intelligence');
    }

    const operationId = operationLocation.split('/').pop()?.split('?')[0];
    if (!operationId) {
      throw new Error('Could not parse operation ID');
    }

    return operationId;
  }

  async getAnalysisResult(
    operationId: string,
  ): Promise<DocumentAnalysisResponse> {
    const url = `${this.endpoint}/documentintelligence/documentModels/${this.modelId}/analyzeResults/${operationId}?api-version=${this.apiVersion}`;

    const response = await axios.get(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
      },
    });

    const data = response.data;

    if (data.status === 'succeeded') {
      return {
        operationId,
        status: 'succeeded',
        percentCompleted: 100,
        result: this.parseAnalysisResult(data, operationId),
      };
    }

    return {
      operationId,
      status: data.status,
      percentCompleted: data.percentCompleted ?? 0,
    };
  }

  async pollForResult(
    operationId: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000,
  ): Promise<ExtractionResult> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.getAnalysisResult(operationId);

      if (result.status === 'succeeded' && result.result) {
        return result.result;
      }

      if (result.status === 'failed') {
        throw new Error(
          result.error?.message || 'Document analysis failed',
        );
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Document analysis timed out');
  }

  private parseAnalysisResult(
    rawResult: Record<string, unknown>,
    documentId: string,
  ): ExtractionResult {
    const analyzeResult = rawResult.analyzeResult as Record<string, unknown> | undefined;
    const documents = (analyzeResult?.documents as Array<Record<string, unknown>>) ?? [];
    const firstDoc = documents[0] ?? {};
    const docFields = (firstDoc.fields ?? {}) as Record<
      string,
      { content?: string; valueString?: string; valueNumber?: number; valueDate?: string; confidence?: number; type?: string }
    >;

    const fields: ExtractedField[] = Object.entries(docFields).map(
      ([name, field]) => ({
        name,
        value: field.content || field.valueString || String(field.valueNumber ?? field.valueDate ?? ''),
        confidence: field.confidence ?? 0,
        fieldType: this.mapFieldType(field.type),
      }),
    );

    const itemsField = docFields.Items as unknown as { valueArray?: Array<{ valueObject?: Record<string, { content?: string; valueNumber?: number; confidence?: number }> }> } | undefined;
    const lineItems: ExtractedLineItem[] = (itemsField?.valueArray ?? []).map(
      (item) => {
        const obj = item.valueObject ?? {};
        return {
          description: obj.Description?.content ?? '',
          quantity: obj.Quantity?.valueNumber ?? 1,
          unitPrice: obj.UnitPrice?.valueNumber ?? 0,
          amount: obj.Amount?.valueNumber ?? 0,
          confidence: obj.Amount?.confidence ?? 0,
        };
      },
    );

    return {
      documentId,
      status: 'completed',
      confidence: (firstDoc.confidence as number) ?? 0,
      fields,
      lineItems,
      rawResponse: rawResult,
    };
  }

  private mapFieldType(
    type?: string,
  ): 'string' | 'number' | 'date' | 'currency' {
    switch (type) {
      case 'number':
      case 'integer':
        return 'number';
      case 'date':
        return 'date';
      case 'currency':
        return 'currency';
      default:
        return 'string';
    }
  }
}

export const documentIntelligenceService = new DocumentIntelligenceService();
