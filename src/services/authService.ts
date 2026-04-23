import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AppConfig } from '../config/appConfig';
import { AuthToken, LoginCredentials, User } from '../types/user';

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: AuthToken }> {
    // Demo login support
    if (
      credentials.email === AppConfig.demo.email &&
      credentials.password === AppConfig.demo.password
    ) {
      return this.demoLogin();
    }

    // Production OAuth2 flow
    const tokenResponse = await axios.post(
      AppConfig.businessCentral.tokenUrl,
      new URLSearchParams({
        grant_type: 'password',
        client_id: AppConfig.businessCentral.clientId,
        client_secret: AppConfig.businessCentral.clientSecret,
        scope: AppConfig.businessCentral.scope,
        username: credentials.email,
        password: credentials.password,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const token: AuthToken = {
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      expiresAt: Date.now() + tokenResponse.data.expires_in * 1000,
      tokenType: tokenResponse.data.token_type,
    };

    await this.storeToken(token);

    // Fetch user profile from Microsoft Graph
    const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });

    const user: User = {
      id: userResponse.data.id,
      email: userResponse.data.mail || userResponse.data.userPrincipalName,
      displayName: userResponse.data.displayName,
      firstName: userResponse.data.givenName || '',
      lastName: userResponse.data.surname || '',
      role: 'staff',
      organization: userResponse.data.companyName || '',
      preferences: {
        notificationsEnabled: true,
        darkMode: false,
      },
    };

    await this.storeUser(user);
    return { user, token };
  }

  private async demoLogin(): Promise<{ user: User; token: AuthToken }> {
    const token: AuthToken = {
      accessToken: 'demo_access_token',
      refreshToken: 'demo_refresh_token',
      expiresAt: Date.now() + 3600 * 1000,
      tokenType: 'Bearer',
    };

    const user: User = {
      id: 'demo-user-001',
      email: AppConfig.demo.email,
      displayName: AppConfig.demo.userName,
      firstName: 'Demo',
      lastName: 'User',
      role: 'finance',
      organization: AppConfig.demo.organization,
      preferences: {
        notificationsEnabled: true,
        darkMode: false,
      },
    };

    await this.storeToken(token);
    await this.storeUser(user);
    return { user, token };
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      AppConfig.app.tokenStorageKey,
      AppConfig.app.refreshTokenStorageKey,
      AppConfig.app.userStorageKey,
      AppConfig.app.settingsStorageKey,
    ]);
  }

  async getStoredToken(): Promise<AuthToken | null> {
    const tokenJson = await AsyncStorage.getItem(AppConfig.app.tokenStorageKey);
    if (!tokenJson) return null;
    const token: AuthToken = JSON.parse(tokenJson);
    if (Date.now() >= token.expiresAt) return null;
    return token;
  }

  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(AppConfig.app.userStorageKey);
    if (!userJson) return null;
    return JSON.parse(userJson);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return token !== null;
  }

  private async storeToken(token: AuthToken): Promise<void> {
    await AsyncStorage.setItem(
      AppConfig.app.tokenStorageKey,
      JSON.stringify(token),
    );
  }

  private async storeUser(user: User): Promise<void> {
    await AsyncStorage.setItem(
      AppConfig.app.userStorageKey,
      JSON.stringify(user),
    );
  }
}

export const authService = new AuthService();
