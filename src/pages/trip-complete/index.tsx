import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

export default function TripCompletePage() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<any, any>>();
  const trip = route.params?.trip;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
<<<<<<< HEAD
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);
=======
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
    pickupLocation: dbTrip?.address || dbTrip?.pickup_location || 'N/A',
    wasteType: dbTrip?.waste_type || dbTrip?.waste_size || 'General Waste',
    distance: Number(dbTrip?.distance_value || dbTrip?.distance || 1.2).toFixed(1),
    duration: calculateDuration(),
    date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };

  const handleDone = async () => {
    navigation.navigate('MainTabs');
  };
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0e3325', '#1a4d3a', '#0e3325']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
           <Animated.View style={[styles.successIconBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.outerCircle}>
                 <View style={styles.innerCircle}>
                    <Ionicons name="checkmark-done" size={60} color="#fff" />
                 </View>
              </View>
           </Animated.View>

           <Animated.View style={[styles.textGroup, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.title}>MISSION COMPLETE</Text>
              <Text style={styles.subTitle}>High-quality service delivered.</Text>
           </Animated.View>

           <Animated.View style={[styles.statsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.statItem}>
                 <Text style={styles.statLabel}>SERVICE</Text>
                 <Text style={styles.statValue}>PICKUP</Text>
              </View>
<<<<<<< HEAD
              <View style={styles.dividerV} />
              <View style={styles.statItem}>
                 <Text style={styles.statLabel}>RATING</Text>
                 <View style={styles.ratingRow}>
                    <Text style={styles.statValue}>5.0</Text>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                 </View>
=======

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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
              </View>
              <View style={styles.dividerV} />
              <View style={styles.statItem}>
                 <Text style={styles.statLabel}>POINTS</Text>
                 <Text style={styles.statValue}>+25</Text>
              </View>
           </Animated.View>

<<<<<<< HEAD
           <View style={styles.footer}>
              <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.replace('MainTabs')}>
                 <Text style={styles.doneText}>BACK TO COMMAND</Text>
                 <Ionicons name="arrow-forward" size={24} color="#0e3325" />
              </TouchableOpacity>
           </View>
        </View>
      </SafeAreaView>
=======
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
                  <Text style={styles.primaryButtonText}>Done & Return Home</Text>
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
      <ConfettiCannon
         count={100}
         origin={{x: width / 2, y: -20}}
         autoStart={true}
         fadeOut={true}
         fallSpeed={3500}
      />
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  successIconBox: { marginBottom: 40 },
  outerCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
  innerCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 20 },
  textGroup: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 28, fontFamily: 'Montserrat_900Black', color: '#fff', letterSpacing: 2 },
  subTitle: { fontSize: 14, fontFamily: 'Montserrat_700Bold', color: '#10b981', marginTop: 10 },
  statsCard: { backgroundColor: '#fff', width: '100%', borderRadius: 32, padding: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 15 },
  statItem: { alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1.5 },
  statValue: { fontSize: 18, fontFamily: 'Montserrat_900Black', color: '#0e3325' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dividerV: { width: 1, height: 40, backgroundColor: '#F1F5F9' },
  footer: { position: 'absolute', bottom: 60, width: width - 60 },
  doneBtn: { height: 74, backgroundColor: '#fff', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, elevation: 20 },
  doneText: { fontSize: 18, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 1 }
=======
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
    fontSize: 18,
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
});
