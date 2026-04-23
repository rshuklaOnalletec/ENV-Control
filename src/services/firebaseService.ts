import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = 'env_control_fcm_token';

class FirebaseService {
  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  }

  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      if (token) {
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      }
      return token;
    } catch {
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(FCM_TOKEN_KEY);
  }

  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh(async (token) => {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      callback(token);
    });
  }

  onForegroundMessage(
    callback: (message: {
      title?: string;
      body?: string;
      data?: Record<string, string>;
    }) => void,
  ): () => void {
    return messaging().onMessage(async (remoteMessage) => {
      callback({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data as Record<string, string> | undefined,
      });
    });
  }

  async setupBackgroundHandler(): Promise<void> {
    messaging().setBackgroundMessageHandler(async (_remoteMessage) => {
      // Handle background messages — can be extended for data processing
    });
  }

  async getInitialNotification(): Promise<{
    title?: string;
    body?: string;
    data?: Record<string, string>;
  } | null> {
    const remoteMessage = await messaging().getInitialNotification();
    if (!remoteMessage) return null;

    return {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data as Record<string, string> | undefined,
    };
  }
}

export const firebaseService = new FirebaseService();
