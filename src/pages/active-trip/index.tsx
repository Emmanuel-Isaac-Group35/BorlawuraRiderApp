import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { supabase } from '../../lib/supabase';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigatrDirections } from '../../hooks/useNavigatrDirections';
import { SwipeButton } from '../../components/common/SwipeButton';

const { width, height } = Dimensions.get('window');
const ROUTE_BLUE = '#1A73E8';

const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

type RootStackParamList = {
  MainTabs: undefined;
  ActiveTrip: { trip?: any; initialRiderLocation?: Location.LocationObject | null };
  Tracking: { trip?: any };
  TripComplete: { trip?: any };
};

type ActiveTripRouteProp = RouteProp<RootStackParamList, 'ActiveTrip'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TripStatus = 'accept_to_tracking' | 'driving_to_pickup' | 'arrived_at_pickup' | 'waste_collected';

export default function ActiveTripPage() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ActiveTripRouteProp>();
  const dbTrip = route.params?.trip;
  
  const currentHour = new Date().getHours();
  const isNightMode = currentHour < 6 || currentHour >= 18;
  
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(
    route.params?.initialRiderLocation || null
  );
  
  // Use DB sub_status to ensure we recover exactly where we left off
  const [currentStatus, setCurrentStatus] = useState<TripStatus>(() => {
    const validStatuses = ['driving_to_pickup', 'arrived_at_pickup', 'waste_collected'];
    if (dbTrip?.sub_status && validStatuses.includes(dbTrip.sub_status)) {
      return dbTrip.sub_status as TripStatus;
    }
    return 'accept_to_tracking';
  });

  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number} | null>(null);
  
  const [customerName, setCustomerName] = useState(
    (dbTrip?.customer_name && dbTrip?.customer_name !== 'Customer') ? dbTrip.customer_name : 
    (dbTrip?.customerName && dbTrip?.customerName !== 'Customer') ? dbTrip.customerName :
    'Customer'
  );
  const [customerPhone, setCustomerPhone] = useState(dbTrip?.customer_phone || dbTrip?.customerPhone || '');

  // Determine Coordinates
  let lat = Number(dbTrip?.pickup_latitude) || Number(dbTrip?.pickup_lat);
  let lng = Number(dbTrip?.pickup_longitude) || Number(dbTrip?.pickup_lng);
  
  if ((!lat || !lng) && dbTrip?.notes?.includes('[GPS:')) {
    const coordsMatch = dbTrip.notes.match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
    if (coordsMatch) {
      lat = Number(coordsMatch[1]);
      lng = Number(coordsMatch[2]);
    }
  }
  
  const destination = { lat: lat || 5.6037, lng: lng || -0.1870 };
  const pickupAddress = dbTrip?.address || dbTrip?.pickup_location || 'Pickup Location';

  const routeOrigin = currentLocation
    ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }
    : null;
  const routeDestination = {
    latitude: destination.lat,
    longitude: destination.lng,
  };

  const displayLocation = currentLocation || {
    coords: {
      latitude: destination.lat,
      longitude: destination.lng,
      heading: 0,
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: 0,
      speed: 0
    },
    timestamp: Date.now()
  };

  const {
    coordinates: routeCoordinates,
    summary: routeSummary,
    loading: routeLoading,
  } = useNavigatrDirections(routeOrigin, routeDestination, 750);

  useEffect(() => {
    if (routeSummary) {
      setRouteInfo({ distance: routeSummary.distanceKm, duration: routeSummary.durationMin });
    } else {
      setRouteInfo(null);
    }
  }, [routeSummary]);

  useEffect(() => {
    if (!routeCoordinates?.length || routeCoordinates.length < 2 || !mapRef.current) return;
    mapRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 120, right: 40, bottom: 220, left: 40 },
      animated: true,
    });
  }, [routeCoordinates]);

  const fitBoth = () => {
    if (!displayLocation || !mapRef.current) return;
    mapRef.current.fitToCoordinates([
      { latitude: displayLocation.coords.latitude, longitude: displayLocation.coords.longitude },
      { latitude: destination.lat, longitude: destination.lng }
    ], {
      edgePadding: { top: 120, right: 40, bottom: 220, left: 40 },
      animated: true,
    });
  };

  // Removed animateMarkerToCoordinate as it causes a native crash in the New Architecture (Fabric)
  // The Marker will naturally update its position via the currentLocation state binding.

  useEffect(() => {
    // Name and Phone fetching logic
    async function fetchCustomerDetails() {
      const tripId = dbTrip?.user_id || dbTrip?.userId || dbTrip?.customer_id;
      if (tripId) {
        const { data } = await supabase.from('profiles').select('full_name, first_name, last_name, email, phone, phone_number').eq('id', tripId).maybeSingle();
        if (data) {
          if (!customerName || customerName === 'Customer') {
             const resolvedName = data.full_name || (data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : (data.email?.split('@')[0] || 'Customer'));
             setCustomerName(resolvedName);
          }
          if (!customerPhone && (data.phone || data.phone_number)) {
             setCustomerPhone(data.phone || data.phone_number);
          }
        }
      }
    }
    fetchCustomerDetails();

    // Listen for real-time customer cancellations
    const cancelSubscription = supabase
      .channel(`active-trip-cancel-${dbTrip?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${dbTrip?.id}`
        },
        (payload) => {
          if (payload.new.status === 'cancelled') {
             Alert.alert(
               'Order Cancelled',
               'The customer has cancelled this pickup request. Returning to Home...',
               [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
             );
          }
        }
      )
      .subscribe();

    let subscription: Location.LocationSubscription;
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // Show the map quickly: cached fix first, then a fast fresh fix, then periodic updates.
      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 120000,
        requiredAccuracy: 5000,
      });
      if (lastKnown) {
        setCurrentLocation(lastKnown);
      }

      try {
        const quickFresh = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        setCurrentLocation(quickFresh);
      } catch {
        if (!lastKnown) {
          const fallback = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setCurrentLocation(fallback);
        }
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (newLoc) => setCurrentLocation(newLoc)
      );
    };
    startTracking();
    return () => {
      subscription?.remove();
      supabase.removeChannel(cancelSubscription);
    };
  }, [dbTrip]);

  const handleAction = async () => {
    if (currentStatus === 'accept_to_tracking') {
      setCurrentStatus('driving_to_pickup');
      if (dbTrip?.id) await supabase.from('orders').update({ sub_status: 'driving_to_pickup' }).eq('id', dbTrip.id);
    } else if (currentStatus === 'driving_to_pickup') {
      setCurrentStatus('arrived_at_pickup');
      if (dbTrip?.id) {
        await supabase.from('orders').update({ sub_status: 'arrived_at_pickup' }).eq('id', dbTrip.id);
      }
    } else if (currentStatus === 'arrived_at_pickup' || currentStatus === 'waste_collected') {
      if (dbTrip?.id) {
        await supabase.from('orders').update({ 
          status: 'completed', 
          sub_status: 'completed',
          completed_at: new Date().toISOString() 
        }).eq('id', dbTrip.id);
      }
      navigation.replace('TripComplete', { trip: dbTrip });
    }
  };

  const getButtonText = () => {
    if (currentStatus === 'accept_to_tracking') return 'Start Tracking';
    if (currentStatus === 'driving_to_pickup') return 'Arrive At Pickup';
    if (currentStatus === 'arrived_at_pickup') return 'Waste Collected';
    if (currentStatus === 'waste_collected') return 'Waste Collected';
    return 'Next';
  };
  
  const handleCall = () => {
    const phoneToCall = customerPhone || dbTrip?.customer_phone || dbTrip?.customerPhone;
    if (!phoneToCall) {
      Alert.alert('Phone Unavailable', 'The customer has not provided a valid phone number on their profile.');
      return;
    }
    Linking.openURL(`tel:${phoneToCall}`);
  };

  const handleCancelTrip = () => {
    Alert.alert(
      "Cancel Trip",
      "Are you sure you want to cancel this trip? The order will be unassigned from you.",
      [
        { text: "No, Keep Trip", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive", 
          onPress: async () => {
            if (dbTrip?.id) {
               await supabase.from('orders').update({ 
                  status: 'pending', 
                  sub_status: null,
                  rider_id: null 
               }).eq('id', dbTrip.id);
            }
            navigation.navigate('MainTabs');
          }
        }
      ]
    );
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={isNightMode ? darkMapStyle : lightMapStyle}
        provider={PROVIDER_GOOGLE}
        mapType="standard"
        initialRegion={{
          latitude: displayLocation.coords.latitude,
          longitude: displayLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onLongPress={(e) => {
          setCurrentLocation({
            ...displayLocation,
            coords: {
              ...displayLocation.coords,
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            }
          });
        }}
        showsUserLocation={true} 
        showsMyLocationButton={true}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {/* Rider marker (Top-down car) - Keep as fallback but native dot is better */}
        <Marker 
          ref={markerRef}
          coordinate={{ latitude: displayLocation.coords.latitude, longitude: displayLocation.coords.longitude }} 
          anchor={{ x: 0.5, y: 0.5 }} 
          zIndex={10}
          rotation={displayLocation.coords.heading || 0}
        >
          <View style={styles.carMarkerContainer}>
            <View style={styles.carWindshield} />
            <View style={styles.carRoof} />
            <View style={styles.carRearWindow} />
          </View>
        </Marker>

        {/* Destination marker */}
        <Marker coordinate={{ latitude: destination.lat, longitude: destination.lng }} anchor={{ x: 0.5, y: 0.5 }} zIndex={5}>
          <View style={styles.destMarkerContainer}>
            <View style={styles.destMarkerInner} />
          </View>
        </Marker>

        {routeCoordinates && routeCoordinates.length >= 2 ? (
          <>
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#1E54B7" // Darker border-like blue
              strokeWidth={7}
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#4A89F3" // Uber bright blue
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
            <Marker coordinate={routeCoordinates[Math.floor(routeCoordinates.length / 2)]} zIndex={15}>
              <View style={styles.etaMapBubble}>
                <Text style={styles.etaMapBubbleTime}>
                  {routeSummary?.durationMin ? routeSummary.durationMin : 1}
                </Text>
                <Text style={styles.etaMapBubbleMin}>min</Text>
              </View>
            </Marker>
          </>
        ) : !routeLoading ? (
          <Polyline
            coordinates={[
              {
                latitude: displayLocation.coords.latitude,
                longitude: displayLocation.coords.longitude,
              },
              { latitude: destination.lat, longitude: destination.lng },
            ]}
            strokeColor={ROUTE_BLUE}
            strokeWidth={4}
            lineDashPattern={[6, 10]}
          />
        ) : null}
      </MapView>

      {/* Floating Top Header */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.headerPill}>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.iconButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>{pickupAddress}</Text>
            <Text style={styles.headerSubtitle}>{customerName}</Text>
          </View>
          <TouchableOpacity onPress={handleCall} style={styles.iconButton}>
            <Ionicons name="call" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <TouchableOpacity style={styles.recenterFab} onPress={fitBoth} activeOpacity={0.85}>
        <Ionicons name="expand-outline" size={22} color={colors.text.primary} />
      </TouchableOpacity>

      {/* Floating Bottom Card */}
      <View style={styles.bottomOverlay}>
        <View style={styles.bottomCard}>
          {currentStatus !== 'accept_to_tracking' ? (
            <View style={styles.uberDetailsContainer}>
              <View style={styles.dragHandle} />
              <Text style={styles.uberTitle}>
                {currentStatus === 'driving_to_pickup' 
                  ? `Pickup in ${routeInfo?.duration ? Math.ceil(routeInfo.duration) : 1} min`
                  : currentStatus === 'arrived_at_pickup'
                  ? 'Arrived at Pickup'
                  : 'Waste Collected'}
              </Text>
              
              <View style={styles.uberProfileRow}>
                <View style={styles.uberAvatarWrapper}>
                  <View style={styles.uberAvatar}>
                     <Ionicons name="person" size={30} color={colors.gray[400]} />
                  </View>
                  <View style={styles.uberRatingBadge}>
                    <Ionicons name="star" size={10} color="#DAA520" />
                    <Text style={styles.uberRatingText}>5.0</Text>
                  </View>
                </View>
                
                <View style={styles.uberInfoContent}>
                  <View style={styles.uberInfoHeader}>
                     <Text style={styles.uberName}>{customerName}</Text>
                     <View style={styles.uberOrderBadge}>
                       <Text style={styles.uberOrderBadgeText}>
                         {dbTrip?.id ? `#${dbTrip.id.toString().substring(0, 4).toUpperCase()}` : 'ORD'}
                       </Text>
                     </View>
                  </View>
                  <Text style={styles.uberSubtitle}>Customer • Top-rated</Text>
                </View>
              </View>

              <View style={styles.uberActionRow}>
                <TouchableOpacity style={styles.uberChatBtn} onPress={() => navigation.navigate('Chat' as never, { trip: dbTrip } as never)}>
                  <Ionicons name="chatbubble" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.uberChatBtn, { marginLeft: 8 }]} onPress={handleCall}>
                  <Ionicons name="call" size={24} color="#000" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <SwipeButton 
                    title={getButtonText()}
                    onSwipeComplete={handleAction} 
                  />
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.startNavBtn]}
              onPress={handleAction}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Start Tracking</Text>
            </TouchableOpacity>
          )}

          {/* Cancel Trip Button */}
          {currentStatus !== 'waste_collected' && (
            <TouchableOpacity style={styles.cancelTripBtn} onPress={handleCancelTrip}>
              <Text style={styles.cancelTripText}>Cancel Trip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  map: {
    width: width,
    height: height,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconButton: {
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  etaPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  etaTime: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  etaDist: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startNavBtn: {
    backgroundColor: colors.blue[600],
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
  },
  recenterFab: {
    position: 'absolute',
    right: 20,
    bottom: 230,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
  destMarkerContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  destMarkerInner: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 1, // slight square-ish
  },
  cancelTripBtn: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelTripText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  carMarkerContainer: {
    width: 24,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  carRoof: {
    width: 18,
    height: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    zIndex: 2,
  },
  carWindshield: {
    position: 'absolute',
    top: 6,
    width: 18,
    height: 8,
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    zIndex: 1,
  },
  carRearWindow: {
    position: 'absolute',
    bottom: 6,
    width: 16,
    height: 5,
    backgroundColor: '#1f2937',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    zIndex: 1,
  },
  etaMapBubble: {
    backgroundColor: '#5B4BBF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  etaMapBubbleTime: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 18,
  },
  etaMapBubbleMin: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  uberDetailsContainer: {
    width: '100%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  uberTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 20,
  },
  uberProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  uberAvatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  uberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uberRatingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  uberRatingText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
    color: '#000',
  },
  uberInfoContent: {
    flex: 1,
  },
  uberInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  uberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  uberOrderBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  uberOrderBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  uberSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  uberActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uberChatBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uberPrimaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uberPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  }
});
