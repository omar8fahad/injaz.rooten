import { BundleInspector } from '../.rorkai/inspector';
import { RorkErrorBoundary } from '../.rorkai/rork-error-boundary';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useSettingsStore } from "@/store/settingsStore";
import { colors } from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const settingsStore = useSettingsStore();
  
  // Safely access settings with fallback
  const activeTheme = settingsStore?.settings?.theme || 'jasmineFlowers';

  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return <RootLayoutNav theme={activeTheme} />;
}

function RootLayoutNav({ theme }: { theme: string }) {
  const themeColors = colors[theme as keyof typeof colors] || colors.jasmineFlowers;
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: themeColors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="routine/[id]" 
        options={{ 
          title: "تفاصيل الروتين",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="routine/create" 
        options={{ 
          title: "إنشاء روتين",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="routine/edit/[id]" 
        options={{ 
          title: "تعديل الروتين",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="book/[id]" 
        options={{ 
          title: "تفاصيل الكتاب",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="book/create" 
        options={{ 
          title: "إضافة كتاب جديد",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="book/edit/[id]" 
        options={{ 
          title: "تعديل الكتاب",
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}