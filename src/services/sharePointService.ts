import { AppConfig } from '../config/appConfig';
import { apiClient } from './apiClient';

interface SharePointFile {
  id: string;
  name: string;
  webUrl: string;
  size: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
  file?: {
    mimeType: string;
  };
}

interface SharePointUploadResponse {
  id: string;
  name: string;
  webUrl: string;
  size: number;
}

interface SharePointListResponse {
  value: SharePointFile[];
  '@odata.nextLink'?: string;
}

class SharePointService {
  private get graphBaseUrl(): string {
    return 'https://graph.microsoft.com/v1.0';
  }

  private get driveUrl(): string {
    return `${this.graphBaseUrl}/drives/${AppConfig.sharePoint.driveId}`;
  }

  async uploadDocument(
    fileName: string,
    fileContent: Blob | ArrayBuffer,
    folderPath: string = 'Emissions',
    onProgress?: (progress: number) => void,
  ): Promise<SharePointUploadResponse> {
    const encodedPath = encodeURIComponent(`${folderPath}/${fileName}`);
    const url = `${this.driveUrl}/root:/${encodedPath}:/content`;

    const formData = new FormData();
    formData.append('file', fileContent as Blob, fileName);

    return apiClient.uploadFile<SharePointUploadResponse>(
      url,
      formData,
      onProgress,
    );
  }

  async listFiles(folderPath: string = 'Emissions'): Promise<SharePointFile[]> {
    const encodedPath = encodeURIComponent(folderPath);
    const response = await apiClient.get<SharePointListResponse>(
      `${this.driveUrl}/root:/${encodedPath}:/children`,
      {
        params: {
          $orderby: 'createdDateTime desc',
          $top: 50,
        },
      },
    );
    return response.value;
  }

  async getFileUrl(fileId: string): Promise<string> {
    const file = await apiClient.get<SharePointFile>(
      `${this.driveUrl}/items/${fileId}`,
    );
    return file.webUrl;
  }

  async downloadFile(fileId: string): Promise<ArrayBuffer> {
    return apiClient.get<ArrayBuffer>(
      `${this.driveUrl}/items/${fileId}/content`,
      {
        responseType: 'arraybuffer',
      },
    );
  }

  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`${this.driveUrl}/items/${fileId}`);
  }
}

export const sharePointService = new SharePointService();
