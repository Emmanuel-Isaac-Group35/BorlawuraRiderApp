import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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

  const calculateDuration = () => {
    if (dbTrip?.duration) return typeof dbTrip.duration === 'number' ? `${dbTrip.duration} mins` : dbTrip.duration;
    if (dbTrip?.accepted_at && (dbTrip?.completed_at || dbTrip?.updated_at)) {
      const start = new Date(dbTrip.accepted_at).getTime();
      const end = new Date(dbTrip.completed_at || dbTrip.updated_at).getTime();
      const diff = Math.floor((end - start) / (1000 * 60));
      return diff > 0 ? `${diff} mins` : '8 mins';
    }
    return '12 mins';
  };

  const tripData = {
    customerName: customerName,
    pickupLocation: dbTrip?.address || dbTrip?.pickup_location || 'Pickup Location',
    dropLocation: dbTrip?.drop_location || 'N/A',
    wasteType: dbTrip?.waste_type || dbTrip?.waste_size || 'General Waste',
    distance: Number(dbTrip?.distance_value || dbTrip?.distance || 1.2).toFixed(1),
    duration: calculateDuration(),
    date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };

  const handleDone = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[colors.primaryLighter, '#ffffff']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header / Success Indicator */}
            <View style={styles.header}>
              <View style={styles.successIconWrapper}>
                <View style={styles.successOuterCircle}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.successInnerCircle}
                  >
                    <Ionicons name="checkmark" size={50} color="#fff" />
                  </LinearGradient>
                </View>
              </View>
              <Text style={styles.title}>Trip Completed!</Text>
              <Text style={styles.subtitle}>Thanks for completing this pickup.</Text>
            </View>

            {/* Trip Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Trip Summary</Text>
                <Text style={styles.cardDate}>{tripData.date}</Text>
              </View>

              <View style={styles.summaryList}>
                <View style={styles.summaryItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#E1F9F0' }]}>
                    <Feather name="user" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemLabel}>Customer</Text>
                    <Text style={styles.itemValue}>{tripData.customerName}</Text>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#E0EEFF' }]}>
                    <Feather name="map-pin" size={20} color={colors.secondary} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemLabel}>Pickup</Text>
                    <Text style={styles.itemValue} numberOfLines={1}>{tripData.pickupLocation}</Text>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                    <Feather name="target" size={20} color="#9333EA" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemLabel}>Drop-off</Text>
                    <Text style={styles.itemValue}>{tripData.dropLocation}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Feather name="trash-2" size={18} color="#D97706" />
                  </View>
                  <Text style={styles.statLabel}>Type</Text>
                  <Text style={styles.statValue} numberOfLines={1}>{tripData.wasteType}</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconBox, { backgroundColor: '#CCFBF1' }]}>
                    <Feather name="navigation" size={18} color="#0D9488" />
                  </View>
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>{tripData.distance} km</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconBox, { backgroundColor: '#FCE7F3' }]}>
                    <Feather name="clock" size={18} color="#DB2777" />
                  </View>
                  <Text style={styles.statLabel}>Duration</Text>
                  <Text style={styles.statValue}>{tripData.duration}</Text>
                </View>
              </View>
            </View>

            {/* Action Section */}
            <View style={styles.actionSection}>
              <TouchableOpacity
                onPress={handleDone}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Feather name="home" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Back to Home</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.bonusBanner}>
                <View style={styles.bonusIconBox}>
                  <MaterialCommunityIcons name="trophy-variant" size={22} color="#fff" />
                </View>
                <View style={styles.bonusContent}>
                  <Text style={styles.bonusTitle}>Keep it up!</Text>
                  <Text style={styles.bonusText}>
                    You're doing great! Complete 2 more trips today to earn a bonus.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successOuterCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  successInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cardDate: {
    fontSize: 13,
    color: colors.text.light,
    fontWeight: '500',
  },
  summaryList: {
    gap: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  actionSection: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 18,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  bonusBanner: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  bonusIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusContent: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
  },
  bonusText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    lineHeight: 16,
  },
});





