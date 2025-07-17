import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types';
import { colors } from '@/constants/colors';
import { Platform } from 'react-native';

// Only import notifications on native platforms
let Notifications: any = null;
let notificationsAvailable = false;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    notificationsAvailable = true;
    
    // Configure notification handler only if available
    if (Notifications && Notifications.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  } catch (error) {
    console.warn('Notifications not available:', error);
    notificationsAvailable = false;
  }
}

interface SettingsState {
  settings: AppSettings;
  setTheme: (theme: AppSettings['theme']) => void;
  setFontSize: (size: number) => void;
  toggleNotifications: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  requestNotificationPermissions: () => Promise<boolean>;
  scheduleDailyReminder: () => Promise<void>;
  cancelDailyReminder: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        theme: 'jasmineFlowers',
        fontSize: 16,
        notifications: {
          enabled: false,
          dailyReminderTime: '08:00',
        },
      },
      setTheme: (theme) => 
        set((state) => ({
          settings: { ...state.settings, theme }
        })),
      setFontSize: (fontSize) => 
        set((state) => ({
          settings: { ...state.settings, fontSize }
        })),
      toggleNotifications: (enabled) => 
        set((state) => ({
          settings: { 
            ...state.settings, 
            notifications: { 
              ...state.settings.notifications, 
              enabled 
            } 
          }
        })),
      setDailyReminderTime: (dailyReminderTime) => 
        set((state) => ({
          settings: { 
            ...state.settings, 
            notifications: { 
              ...state.settings.notifications, 
              dailyReminderTime 
            } 
          }
        })),
      
      requestNotificationPermissions: async () => {
        if (Platform.OS === 'web' || !notificationsAvailable || !Notifications) {
          return true;
        }
        
        try {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          
          return finalStatus === 'granted';
        } catch (error) {
          console.warn('Error requesting notification permissions:', error);
          return false;
        }
      },
      
      scheduleDailyReminder: async () => {
        if (Platform.OS === 'web' || !notificationsAvailable || !Notifications) {
          return;
        }
        
        try {
          await Notifications.cancelAllScheduledNotificationsAsync();
          
          const state = useSettingsStore.getState();
          if (!state.settings.notifications.enabled) {
            return;
          }
          
          const [hours, minutes] = state.settings.notifications.dailyReminderTime.split(':').map(Number);
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'تذكير يومي',
              body: 'حان وقت مراجعة روتينك اليومي ومتابعة تقدمك',
            },
            trigger: {
              hour: hours,
              minute: minutes,
              repeats: true,
            },
          });
          
          console.log('Daily reminder scheduled for', `${hours}:${minutes}`);
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      },
      
      cancelDailyReminder: async () => {
        if (Platform.OS === 'web' || !notificationsAvailable || !Notifications) {
          return;
        }
        
        try {
          await Notifications.cancelAllScheduledNotificationsAsync();
          console.log('Daily reminders cancelled');
        } catch (error) {
          console.error('Error cancelling notifications:', error);
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);