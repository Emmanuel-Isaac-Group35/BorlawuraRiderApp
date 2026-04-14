import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';

type RootStackParamList = {
  MainTabs: undefined;
  TripComplete: { trip?: any };
};

type TripCompleteRouteProp = RouteProp<RootStackParamList, 'TripComplete'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TripCompletePage() {
  const navigation = useNavigation<NavigationProp>();

  const route = useRoute<TripCompleteRouteProp>();
  const dbTrip = route.params?.trip;

  const [customerName, setCustomerName] = useState(dbTrip?.customer_name || 'Customer');

  useEffect(() => {
    async function fetchCustomerDetails() {
      if (dbTrip?.user_id && !dbTrip?.customer_name) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, first_name, last_name')
          .eq('id', dbTrip.user_id)
          .single();
        if (data) {
          setCustomerName(data.full_name || (data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : 'Customer'));
        }
      }
    }
    fetchCustomerDetails();
  }, [dbTrip?.user_id, dbTrip?.customer_name]);

  const tripData = {
    customerName: customerName,
    pickupLocation: dbTrip?.address || dbTrip?.pickup_location || 'Pickup Location',
    dropLocation: dbTrip?.drop_location || 'N/A',
    wasteType: dbTrip?.waste_type || dbTrip?.waste_size || 'General Waste',
    distance: Number(dbTrip?.distance_value || dbTrip?.distance || 0),
    duration: 'N/A mins',
    date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };

  const handleDone = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={96} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Trip Completed!</Text>
          <Text style={styles.successSubtitle}>
            Thanks for completing this pickup.
          </Text>
        </View>

        {/* Trip Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Summary</Text>

          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Customer</Text>
                <Text style={styles.summaryValue}>{tripData.customerName}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.blue[100] }]}>
                <Ionicons name="location-outline" size={20} color={colors.blue[600]} />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Pickup</Text>
                <Text style={styles.summaryValue}>{tripData.pickupLocation}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#e9d5ff' }]}>
                <Ionicons name="business-outline" size={20} color="#9333ea" />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Drop-off</Text>
                <Text style={styles.summaryValue}>{tripData.dropLocation}</Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryGridItem}>
                <View style={[styles.summaryGridIcon, { backgroundColor: colors.amber[100] }]}>
                  <Ionicons name="trash-outline" size={18} color={colors.amber[600]} />
                </View>
                <Text style={styles.summaryGridLabel}>Type</Text>
                <Text style={styles.summaryGridValue}>{tripData.wasteType}</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <View style={[styles.summaryGridIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="map-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.summaryGridLabel}>Distance</Text>
                <Text style={styles.summaryGridValue}>{tripData.distance} km</Text>
              </View>
              <View style={styles.summaryGridItem}>
                <View style={[styles.summaryGridIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="time-outline" size={18} color="#ef4444" />
                </View>
                <Text style={styles.summaryGridLabel}>Duration</Text>
                <Text style={styles.summaryGridValue}>{tripData.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleDone}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Encouragement Message */}
        <View style={styles.encouragementCard}>
          <View style={styles.encouragementIcon}>
            <Ionicons name="trophy-outline" size={20} color="#ffffff" />
          </View>
          <View style={styles.encouragementContent}>
            <Text style={styles.encouragementTitle}>Keep it up!</Text>
            <Text style={styles.encouragementText}>
              You're doing great! Complete 2 more trips today to earn a bonus.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLighter,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  summaryContent: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    marginTop: 12,
  },
  summaryGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryGridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryGridLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  summaryGridValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  encouragementCard: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[100],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
  },
  encouragementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue[600],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  encouragementContent: {
    flex: 1,
  },
  encouragementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  encouragementText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});







