import 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import i18n from './src/i18n';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation';
import { navigationRef } from './src/navigation/RootNavigation';
import { StyleSheet, LogBox } from 'react-native';

LogBox.ignoreLogs([
  '`expo-notifications` functionality is not fully supported',
  '[expo-av]: Expo AV has been deprecated',
]);

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </AuthProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});







