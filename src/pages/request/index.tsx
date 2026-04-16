import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../lib/supabase';
import { colors } from '../../utils/colors';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import * as Location from 'expo-location';


type RootStackParamList = {
  Request: { trip?: any };
  ActiveTrip: { trip?: any };
};

type RequestPageProps = RouteProp<RootStackParamList, 'Request'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RequestPage() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RequestPageProps>();
  const trip = route.params?.trip;
  const { user, profile } = useAuth();

  const [timeLeft, setTimeLeft] = useState(25);
  const [isAccepting, setIsAccepting] = useState(false);
  const [customerName, setCustomerName] = useState('Customer');
  const [pickupAddress, setPickupAddress] = useState('Pickup Location');
  const [tripDistance, setTripDistance] = useState(0);
  const [tripCoords, setTripCoords] = useState({ lat: 5.6037, lng: -0.1870 });
  const [fullTripData, setFullTripData] = useState(trip);

  const hasDeclinedRef = useRef(false);

  useEffect(() => {
    async function resolveAllTripData() {
      if (!trip?.id) return;

      try {
        // 1. Fetch Full Trip Data from DB to ensure nothing is missing from params
        const { data: dbData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', trip.id)
          .maybeSingle();
        
        const currentTrip = dbData || trip;
        setFullTripData(currentTrip);

        // 2. Resolve Name
        const tripId = currentTrip.user_id || currentTrip.userId || currentTrip.customer_id;
        let resolvedName = currentTrip.customer_name || currentTrip.customerName || 
                           currentTrip.user_name || currentTrip.userName || 
                           currentTrip.full_name || currentTrip.fullName || 
                           (currentTrip.first_name ? `${currentTrip.first_name} ${currentTrip.last_name || ''}`.trim() : null);

        if (tripId && (!resolvedName || resolvedName === 'Customer')) {
          let { data: profile } = await supabase.from('profiles').select('*').eq('id', tripId).maybeSingle();
          if (!profile) {
              const { data: userRecord } = await supabase.from('users').select('*').eq('id', tripId).maybeSingle();
              if (userRecord) {
                // @ts-ignore
                profile = { ...userRecord, first_name: null, last_name: null };
              }
          }
          if (!profile) {
              const { data: riderProfile } = await supabase.from('riders').select('*').eq('id', tripId).maybeSingle();
              profile = riderProfile;
          }
          if (profile) {
            resolvedName = profile.full_name || (profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : (profile.email?.split('@')[0]));
            if (resolvedName) {
              // Update database record for future reference
              await supabase.from('orders').update({ customer_name: resolvedName }).eq('id', trip.id);
            }
          }
        }
        setCustomerName(resolvedName || (tripId ? `Customer #${tripId.substring(0, 4)}` : 'Customer'));

        // 3. Resolve Address
        let addr = currentTrip.address || currentTrip.pickup_location || '';
        addr = addr.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''); // Clean leading/trailing commas
        setPickupAddress(addr || 'Pickup Location');

        // 4. Resolve Distance & Coordinates
        let lat = Number(currentTrip.pickup_latitude || currentTrip.pickup_lat);
        let lng = Number(currentTrip.pickup_longitude || currentTrip.pickup_lng);
        
        if ((!lat || !lng) && currentTrip.notes?.includes('[GPS:')) {
           const coordsMatch = currentTrip.notes.match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
           if (coordsMatch) { lat = Number(coordsMatch[1]); lng = Number(coordsMatch[2]); }
        }
        
        if (lat && lng) {
          setTripCoords({ lat, lng });
          
          try {
            // Calculate distance to rider's real location with robust error handling
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              let riderLoc = await Location.getLastKnownPositionAsync({});
              if (!riderLoc) {
                riderLoc = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                });
              }
              
              if (riderLoc) {
                const dist = calculateHaversine(
                  riderLoc.coords.latitude, riderLoc.coords.longitude,
                  lat, lng
                );
                setTripDistance(Number(dist.toFixed(1)));
              }
            }
          } catch (locationError) {
            console.error('Location detection failure in Request index.tsx:', locationError);
            setTripDistance(Number(currentTrip.distance_value || currentTrip.distance || 0));
          }
        } else {
          setTripDistance(Number(currentTrip.distance_value || currentTrip.distance || 0));
        }

      } catch (err) {
        console.error('Error resolving trip data:', err);
      }
    }
    resolveAllTripData();
  }, [trip?.id]);

  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const request = {
    id: fullTripData?.id,
    customerName: customerName,
    pickupLocation: pickupAddress,
    wasteType: fullTripData?.waste_type || fullTripData?.waste_size || 'General Waste',
    distance: tripDistance,
    coordinates: tripCoords
  };

  useEffect(() => {
    if (isAccepting) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasDeclinedRef.current) {
      handleDecline(true); // missed request counts as decline
    }
  }, [timeLeft, isAccepting]);

  // Listen for user cancellation during the request ring
  useEffect(() => {
    if (!fullTripData?.id) return;
    const cancelSubscription = supabase
      .channel(`request-cancel-${fullTripData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${fullTripData.id}`
        },
        (payload) => {
          if (payload.new.status === 'cancelled') {
             Alert.alert('Request Cancelled', 'The customer just cancelled this pickup request.');
             handleDecline(false); // don't penalize rider
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cancelSubscription);
    };
  }, [fullTripData?.id]);


  const handleAccept = async () => {
    setIsAccepting(true);
    
    try {
      if (trip?.id && user?.id) {
        // Update trip status in database to 'active' and assign to rider
        const { error } = await supabase
          .from('orders')
          .update({ 
             status: 'active',
             sub_status: 'accepted',
             rider_id: user.id,
             accepted_at: new Date().toISOString()
          })
          .eq('id', trip.id);
        
        if (error) {
           console.error("Supabase Order Update Error:", error);
           throw error;
        }
      }

      setIsAccepting(false);
      
      // Navigate after a success alert
      Alert.alert(
        'Order Accepted', 
        'You have successfully accepted this trip.',
        [
          { text: 'OK', onPress: () => navigation.replace('ActiveTrip', { trip }) }
        ]
      );
    } catch (error) {
      console.error('Error accepting trip:', error);
      setIsAccepting(false);
      Alert.alert(
        'Acceptance Failed', 
        (error as any).message || 'Could not accept this order. Please try again or check your connection.'
      );
    }
  };

  const handleDecline = async (penalize: boolean = true) => {
    if (!hasDeclinedRef.current) {
      hasDeclinedRef.current = true;
      if (user?.id && penalize) {
         // Silently log decline for accurate acceptance rate calculation
         supabase.from('audit_logs').insert({
             user_id: user.id,
             action: 'request_declined',
             details: { trip_id: trip?.id }
         }).then(() => {}).catch(() => {});
      }
    }
    navigation.goBack();
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${request.coordinates.lat},${request.coordinates.lng}`;
    Linking.openURL(url);
  };

  const progress = (25 - timeLeft) / 25;
  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>New Pickup Request</Text>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={18} color="#ffffff" />
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Ring */}
        <View style={styles.timerContainer}>
          <View style={styles.timerRing}>
            <Svg width={128} height={128}>
              <Circle
                cx={64}
                cy={64}
                r={56}
                stroke={colors.gray[200]}
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx={64}
                cy={64}
                r={56}
                stroke={colors.primary}
                strokeWidth={8}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 64 64)`}
              />
            </Svg>
            <View style={styles.timerContent}>
              <Text style={styles.timerValue}>{timeLeft}</Text>
              <Text style={styles.timerLabel}>seconds</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <View style={styles.customerHeader}>
            <View style={styles.customerIcon}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{request.customerName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#facc15" />
                <Text style={styles.rating}>4.8</Text>
              </View>
            </View>
          </View>

          {/* Pickup Location */}
          <View style={styles.locationRow}>
            <View style={[styles.locationIcon, { backgroundColor: colors.blue[100] }]}>
              <Ionicons name="location-outline" size={20} color={colors.blue[600]} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationValue}>{request.pickupLocation}</Text>
              <Text style={styles.distance}>{request.distance} km away</Text>
            </View>
          </View>

          {/* Waste Type */}
          <View style={styles.locationRow}>
            <View style={[styles.locationIcon, { backgroundColor: colors.amber[100] }]}>
              <Ionicons name="trash-outline" size={20} color={colors.amber[600]} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Waste Type</Text>
              <Text style={styles.locationValue}>{request.wasteType}</Text>
            </View>
          </View>
        </View>

        {/* Map Preview */}
        <View style={styles.card}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: request.coordinates.lat,
                longitude: request.coordinates.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: request.coordinates.lat,
                  longitude: request.coordinates.lng,
                }}
              />
            </MapView>
            <TouchableOpacity
              onPress={handleNavigate}
              style={styles.navigateButton}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={18} color={colors.primary} />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Alert */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle-outline" size={18} color={colors.blue[600]} />
          </View>
          <Text style={styles.infoText}>
            Accepting this request means you commit to picking up the waste
            within 30 minutes.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={handleDecline}
          disabled={isAccepting}
          style={[styles.actionButton, styles.declineButton]}
          activeOpacity={0.8}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAccept}
          disabled={isAccepting}
          style={[styles.actionButton, styles.acceptButton, isAccepting && styles.acceptButtonDisabled]}
          activeOpacity={0.8}
        >
          {isAccepting ? (
            <>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.acceptButtonText}>Accepting...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLighter,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  timerRing: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timerLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  customerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: colors.primary,
  },
  mapContainer: {
    height: 192,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  navigateButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[100],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue[100],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  declineButton: {
    backgroundColor: colors.gray[200],
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  acceptButtonDisabled: {
    opacity: 0.5,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});







