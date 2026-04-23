import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../config/appConfig';
import { AuthToken } from '../types/user';

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: inject auth token
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const tokenJson = await AsyncStorage.getItem(
          AppConfig.app.tokenStorageKey,
        );
        if (tokenJson) {
          const token: AuthToken = JSON.parse(tokenJson);
          if (token.accessToken) {
            config.headers.Authorization = `Bearer ${token.accessToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor: handle 401 with token refresh
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken.accessToken);
            originalRequest.headers.Authorization = `Bearer ${newToken.accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, '');
            await this.clearTokens();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        throw this.normalizeError(error);
      },
    );
  }

  private processQueue(error: unknown, token: string): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<AuthToken> {
    const tokenJson = await AsyncStorage.getItem(
      AppConfig.app.tokenStorageKey,
    );
    if (!tokenJson) {
      throw new Error('No token available for refresh');
    }

    const currentToken: AuthToken = JSON.parse(tokenJson);
    const response = await axios.post(AppConfig.businessCentral.tokenUrl, {
      grant_type: 'refresh_token',
      refresh_token: currentToken.refreshToken,
      client_id: AppConfig.businessCentral.clientId,
      scope: AppConfig.businessCentral.scope,
    });

    const newToken: AuthToken = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || currentToken.refreshToken,
      expiresAt: Date.now() + response.data.expires_in * 1000,
      tokenType: response.data.token_type,
    };

    await AsyncStorage.setItem(
      AppConfig.app.tokenStorageKey,
      JSON.stringify(newToken),
    );

    return newToken;
  }

  private async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([
      AppConfig.app.tokenStorageKey,
      AppConfig.app.refreshTokenStorageKey,
      AppConfig.app.userStorageKey,
    ]);
  }

  private normalizeError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const data = error.response?.data;

      // Handle BC-style errors
      if (data?.error) {
        return {
          code: data.error.code || 'API_ERROR',
          message: data.error.message || error.message,
          status,
          details: data.error.details,
        };
      }

      return {
        code: 'NETWORK_ERROR',
        message: error.message || 'An unexpected error occurred',
        status,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 0,
    };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  async uploadFile<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const response = await this.instance.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(
            Math.round((progressEvent.loaded * 100) / progressEvent.total),
          );
        }
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
