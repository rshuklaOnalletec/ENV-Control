/**
 * Centralized configuration for all API keys and endpoints.
 * In production, these values should come from environment variables.
 */

export const AppConfig = {
  // Microsoft Business Central
  businessCentral: {
    baseUrl: 'https://api.businesscentral.dynamics.com/v2.0',
    tenantId: '<YOUR_TENANT_ID>',
    environment: 'production',
    companyId: '<YOUR_COMPANY_ID>',
    clientId: '<YOUR_BC_CLIENT_ID>',
    clientSecret: '<YOUR_BC_CLIENT_SECRET>',
    scope: 'https://api.businesscentral.dynamics.com/.default',
    tokenUrl: 'https://login.microsoftonline.com/<YOUR_TENANT_ID>/oauth2/v2.0/token',
  },

  // Microsoft SharePoint
  sharePoint: {
    siteUrl: 'https://<YOUR_TENANT>.sharepoint.com/sites/<YOUR_SITE>',
    driveId: '<YOUR_DRIVE_ID>',
    folderId: '<YOUR_FOLDER_ID>',
    clientId: '<YOUR_SP_CLIENT_ID>',
    scope: 'https://graph.microsoft.com/.default',
  },

  // Azure Document Intelligence (Form Recognizer)
  documentIntelligence: {
    endpoint: 'https://<YOUR_RESOURCE>.cognitiveservices.azure.com',
    apiKey: '<YOUR_ADI_API_KEY>',
    modelId: 'prebuilt-invoice',
    apiVersion: '2024-02-29-preview',
  },

  // Firebase Cloud Messaging
  firebase: {
    projectId: '<YOUR_FIREBASE_PROJECT_ID>',
    messagingSenderId: '<YOUR_SENDER_ID>',
    appId: '<YOUR_APP_ID>',
  },

  // App Settings
  app: {
    name: 'ENV-Control',
    version: '1.0.0',
    defaultPageSize: 20,
    tokenStorageKey: 'env_control_auth_token',
    refreshTokenStorageKey: 'env_control_refresh_token',
    userStorageKey: 'env_control_user',
    settingsStorageKey: 'env_control_settings',
  },

  // Demo Credentials
  demo: {
    email: 'demo@envcontrol.com',
    password: 'demo123',
    userName: 'Demo User',
    organization: 'ENV-Control Demo Corp',
  },
} as const;
