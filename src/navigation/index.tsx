import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Pages
import HomePage from '../pages/home';
import TripsPage from '../pages/trips';
import EarningsPage from '../pages/earnings';
import ProfilePage from '../pages/profile';
import RequestPage from '../pages/request';
import ActiveTripPage from '../pages/active-trip';
import TripCompletePage from '../pages/trip-complete';
import SupportPage from '../pages/support';
import NotFound from '../pages/NotFound';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trips') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomePage}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Trips" 
        component={TripsPage}
        options={{ title: 'Trips' }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsPage}
        options={{ title: 'Earnings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfilePage}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Request" component={RequestPage} />
      <Stack.Screen name="ActiveTrip" component={ActiveTripPage} />
      <Stack.Screen name="TripComplete" component={TripCompletePage} />
      <Stack.Screen name="Support" component={SupportPage} />
      <Stack.Screen name="NotFound" component={NotFound} />
    </Stack.Navigator>
  );
}







