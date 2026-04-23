import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
};

// Dashboard Stack
export type DashboardStackParamList = {
  DashboardHome: undefined;
  EntryDetail: { entryId: string };
};

// Entry Stack
export type EntryStackParamList = {
  ManualEntry: undefined;
  EntrySuccess: { entryId: string };
};

// Upload Stack
export type UploadStackParamList = {
  UploadDocument: undefined;
  ReviewExtraction: { documentId: string };
  UploadSuccess: { entryId: string };
};

// History Stack
export type HistoryStackParamList = {
  HistoryList: undefined;
  HistoryDetail: { entryId: string };
};

// Settings Stack
export type SettingsStackParamList = {
  SettingsHome: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  EntryTab: NavigatorScreenParams<EntryStackParamList>;
  UploadTab: NavigatorScreenParams<UploadStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen Props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type DashboardScreenProps<T extends keyof DashboardStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DashboardStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type EntryScreenProps<T extends keyof EntryStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<EntryStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type UploadScreenProps<T extends keyof UploadStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<UploadStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type HistoryScreenProps<T extends keyof HistoryStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HistoryStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

export type SettingsScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
