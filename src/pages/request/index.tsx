import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
<<<<<<< HEAD
  Image,
=======
  Vibration,
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD
=======
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
import { supabase } from '../../lib/supabase';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const { width } = Dimensions.get('window');
const TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

export default function RequestPage() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<any, any>>();
  const trip = route.params?.trip;
  const [isAccepting, setIsAccepting] = useState(false);
<<<<<<< HEAD
=======
  const [customerName, setCustomerName] = useState('Customer');
  const [pickupAddress, setPickupAddress] = useState('Pickup Location');
  const [tripDistance, setTripDistance] = useState(0);
  const [tripCoords, setTripCoords] = useState({ lat: 5.6037, lng: -0.1870 });
  const [fullTripData, setFullTripData] = useState(trip);

  const hasDeclinedRef = useRef(false);

  useEffect(() => {
    // Ringtone and Vibration Effect
    const playRingtone = async () => {
      try {
        // Use a generic pleasant ding if no local file is available, or rely heavily on vibration pattern
        // Here we create a simple oscillating vibration pattern: vibrate 500ms, pause 1000ms
        const PATTERN = [0, 500, 1000];
        Vibration.vibrate(PATTERN, true); // true = loop

      } catch (err) {
         console.log("Audio/Vibration error", err);
      }
    };

    playRingtone();

    return () => {
      Vibration.cancel();
    };
  }, []);

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

  const formatScheduleDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
      return dateString;
    }
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

  // Listen for user cancellation or if another rider accepts it during the request ring
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
          } else if (payload.new.rider_id && payload.new.rider_id !== user?.id) {
             // Another rider accepted it first
             Alert.alert('Missed It!', 'Another rider was faster and already accepted this request.');
             handleDecline(false); // don't penalize rider
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cancelSubscription);
    };
  }, [fullTripData?.id, user?.id]);

>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
<<<<<<< HEAD
      await supabase.from('orders').update({ status: 'active', rider_id: (await supabase.auth.getUser()).data.user?.id }).eq('id', trip.id);
      navigation.replace('ActiveTrip', { trip });
=======
      if (trip?.id && user?.id) {
        // Update trip status in database to 'active' and assign to rider
        // Use .is('rider_id', null) to prevent overwriting another rider who accepted it first
        const { data, error } = await supabase
          .from('orders')
          .update({ 
             status: 'active',
             sub_status: 'accepted',
             rider_id: user.id,
             accepted_at: new Date().toISOString()
          })
          .eq('id', trip.id)
          .is('rider_id', null)
          .select();
        
        if (error) {
           console.error("Supabase Order Update Error:", error);
           throw error;
        }

        if (!data || data.length === 0) {
           Alert.alert('Missed It!', 'Another rider was faster and already accepted this request.');
           setIsAccepting(false);
           handleDecline(false);
           return;
        }
      }

      setIsAccepting(false);
      
      const isScheduled = fullTripData?.service_type === 'Scheduled Pickup' || fullTripData?.service_type === 'Scheduled' || !!fullTripData?.pickup_time;
      
      if (isScheduled) {
        Alert.alert(
          'Scheduled Order Accepted', 
          'You have successfully accepted this scheduled trip. You can view it in your Trips tab.',
          [
            { text: 'OK', onPress: () => navigation.navigate('MainTabs' as never) }
          ]
        );
      } else {
        Alert.alert(
          'Order Accepted', 
          'You have successfully accepted this trip.',
          [
            { text: 'OK', onPress: () => navigation.replace('ActiveTrip', { trip }) }
          ]
        );
      }
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
    } catch (error) {
      Alert.alert('Error', 'Could not accept mission.');
      navigation.goBack();
    } finally {
      setIsAccepting(false);
    }
  };

  if (!trip) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <MapView
        style={styles.map}
        initialRegion={{ latitude: Number(trip.pickup_latitude || 5.6037), longitude: Number(trip.longitude || -0.1870), latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      >
<<<<<<< HEAD
        <UrlTile urlTemplate={TILE_URL} maximumZ={19} zIndex={-1} />
        <Marker coordinate={{ latitude: Number(trip.pickup_latitude || 5.6037), longitude: Number(trip.longitude || -0.1870) }}>
           <View style={styles.radarDot} />
        </Marker>
      </MapView>
=======
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {(fullTripData?.service_type === 'Scheduled Pickup' || fullTripData?.service_type === 'Scheduled' || fullTripData?.pickup_time) ? '📅 Scheduled Request' : 'New Pickup Request'}
          </Text>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={18} color="#ffffff" />
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>
        </View>
      </LinearGradient>
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
           <View style={styles.logoPill}>
              <Image source={require('../../../assets/BorlaWuraLogo.png')} style={styles.miniLogo} />
              <Text style={styles.headerTitle}>MISSION SIGNAL</Text>
           </View>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#fff" />
           </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} pointerEvents="none" />

        <View style={styles.requestCard}>
           <View style={styles.detailsRow}>
              <View>
                 <Text style={styles.label}>CATEGORY</Text>
                 <Text style={styles.value}>{trip.waste_type?.toUpperCase() || 'GENERAL'}</Text>
              </View>
<<<<<<< HEAD
              <View style={styles.distBadge}>
                 <Text style={styles.distText}>NEARBY</Text>
              </View>
           </View>
           <View style={styles.divider} />
           <View style={styles.addrBox}>
              <Ionicons name="location" size={18} color="#10b981" />
              <View style={styles.addrContent}>
                 <Text style={styles.label}>PICKUP POINT</Text>
                 <Text style={styles.addrValue} numberOfLines={2}>{trip.address || 'Accra, Ghana'}</Text>
              </View>
           </View>
           <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} disabled={isAccepting}>
              {isAccepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.acceptText}>ACCEPT MISSION</Text>}
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
=======
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

          {/* Scheduled Time (If applicable) */}
          {(fullTripData?.service_type === 'Scheduled Pickup' || fullTripData?.service_type === 'Scheduled' || fullTripData?.pickup_time) && (
            <View style={styles.locationRow}>
              <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Scheduled For</Text>
                <Text style={styles.locationValue}>{formatScheduleDate(fullTripData?.scheduled_at || fullTripData?.pickup_time)}</Text>
              </View>
            </View>
          )}

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
              provider={PROVIDER_GOOGLE}
              scrollEnabled={false}
              zoomEnabled={false}
              toolbarEnabled={false}
              showsUserLocation={false} 
              showsMyLocationButton={false}
              showsCompass={false}
            >
              <Marker
                coordinate={{
                  latitude: request.coordinates.lat,
                  longitude: request.coordinates.lng,
                }}
              />
            </MapView>
              {/* removed navigate external link button */}
          </View>
        </View>

        {/* Info Alert */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle-outline" size={18} color={colors.blue[600]} />
          </View>
          <Text style={styles.infoText}>
            {(fullTripData?.service_type === 'Scheduled Pickup' || fullTripData?.service_type === 'Scheduled' || fullTripData?.pickup_time) 
               ? `Accepting this request means you commit to picking up the waste on ${formatScheduleDate(fullTripData?.scheduled_at || fullTripData?.pickup_time)}.`
               : `Accepting this request means you commit to picking up the waste within 30 minutes.`}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={() => handleDecline(true)}
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e3325' },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  logoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14, 51, 37, 0.9)', padding: 6, paddingRight: 16, borderRadius: 20, gap: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  miniLogo: { width: 28, height: 28, borderRadius: 8 },
  headerTitle: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#fff', letterSpacing: 2 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  requestCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, paddingBottom: 32, marginBottom: 8, elevation: 20 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 7, fontFamily: 'Montserrat_900Black', color: '#9CA3AF', letterSpacing: 1 },
  value: { fontSize: 16, fontFamily: 'Montserrat_900Black', color: '#0e3325', marginTop: 2 },
  distBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  distText: { fontSize: 7, fontFamily: 'Montserrat_900Black', color: '#10b981' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 16 },
  addrBox: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  addrContent: { flex: 1 },
  addrValue: { fontSize: 12, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325', marginTop: 2 },
  acceptBtn: { height: 54, backgroundColor: '#10b981', borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  acceptText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_900Black', letterSpacing: 1 },
  radarDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' }
});
