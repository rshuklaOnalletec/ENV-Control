export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
  preferences: UserPreferences;
}

export type UserRole = 'admin' | 'finance' | 'staff';

export interface UserPreferences {
  notificationsEnabled: boolean;
  defaultCategoryId?: string;
  darkMode: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: AuthToken | null;
  error: string | null;
}
