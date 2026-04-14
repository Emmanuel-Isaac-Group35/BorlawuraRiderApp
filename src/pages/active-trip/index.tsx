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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { supabase } from '../../lib/supabase';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useOpenRouteDirections } from '../../hooks/useOpenRouteDirections';

const { width, height } = Dimensions.get('window');
const ROUTE_BLUE = '#1A73E8';

// Custom minimalist map style
const mapStyle = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
];

type RootStackParamList = {
  MainTabs: undefined;
  ActiveTrip: { trip?: any };
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
  
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [currentStatus, setCurrentStatus] = useState<TripStatus>('accept_to_tracking');
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number} | null>(null);
  
  const [customerName, setCustomerName] = useState(
    (dbTrip?.customer_name && dbTrip?.customer_name !== 'Customer') ? dbTrip.customer_name : 
    (dbTrip?.customerName && dbTrip?.customerName !== 'Customer') ? dbTrip.customerName :
    'Customer'
  );

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

  const {
    coordinates: routeCoordinates,
    summary: routeSummary,
    loading: routeLoading,
  } = useOpenRouteDirections(routeOrigin, routeDestination, 750);

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

  useEffect(() => {
    // Name fetching logic
    async function fetchCustomerDetails() {
      const tripId = dbTrip?.user_id || dbTrip?.userId || dbTrip?.customer_id;
      if (tripId && (!customerName || customerName === 'Customer')) {
        const { data } = await supabase.from('profiles').select('full_name, first_name, last_name, email').eq('id', tripId).maybeSingle();
        if (data) {
          const resolvedName = data.full_name || (data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : (data.email?.split('@')[0] || 'Customer'));
          setCustomerName(resolvedName);
        }
      }
    }
    fetchCustomerDetails();

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
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 25,
        },
        (newLoc) => setCurrentLocation(newLoc)
      );
    };
    startTracking();
    return () => subscription?.remove();
  }, [dbTrip]);

  const handleAction = async () => {
    if (currentStatus === 'accept_to_tracking') {
      setCurrentStatus('driving_to_pickup');
      // Optionally open real turn-by-turn navigation in Google Maps App
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
      Linking.openURL(url).catch(() => {});
    } else if (currentStatus === 'driving_to_pickup') {
      setCurrentStatus('arrived_at_pickup');
      if (dbTrip?.id) await supabase.from('orders').update({ sub_status: 'arrived_at_pickup' }).eq('id', dbTrip.id);
    } else if (currentStatus === 'arrived_at_pickup') {
      setCurrentStatus('waste_collected');
      if (dbTrip?.id) await supabase.from('orders').update({ sub_status: 'waste_collected' }).eq('id', dbTrip.id);
    } else if (currentStatus === 'waste_collected') {
      navigation.replace('TripComplete', { trip: dbTrip });
    }
  };

  const getButtonText = () => {
    if (currentStatus === 'accept_to_tracking') return 'Start Tracking';
    if (currentStatus === 'driving_to_pickup') return 'Arrived at Pickup';
    if (currentStatus === 'arrived_at_pickup') return 'Waste Collected';
    if (currentStatus === 'waste_collected') return 'Complete Trip';
    return 'Next';
  };
  
  const handleCall = () => {
    const phone = dbTrip?.customer_phone || '+233501234567';
    Linking.openURL(`tel:${phone}`);
  };

  if (!currentLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.text.secondary }}>Acquiring GPS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false} 
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Rider marker */}
        <Marker coordinate={{ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }} zIndex={10}>
          <View style={styles.riderMarker}>
            <View style={styles.riderMarkerInner}>
              <Ionicons name="car" size={18} color="#fff" />
            </View>
          </View>
        </Marker>

        {/* Destination marker */}
        <Marker coordinate={{ latitude: destination.lat, longitude: destination.lng }} zIndex={5}>
          <View style={styles.destMarker}>
             <Ionicons name="location" size={24} color={colors.primary} />
          </View>
        </Marker>

        {routeCoordinates && routeCoordinates.length >= 2 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={ROUTE_BLUE}
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        ) : !routeLoading ? (
          <Polyline
            coordinates={[
              {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Tracking', { trip: dbTrip })}
            style={styles.iconButton}
            accessibilityLabel="Open live tracking map"
          >
            <Ionicons name="map-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCall} style={styles.iconButton}>
            <Ionicons name="call" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {routeInfo && currentStatus === 'driving_to_pickup' && (
          <View style={styles.etaPill}>
            <Text style={styles.etaTime}>{Math.ceil(routeInfo.duration)} min</Text>
            <Text style={styles.etaDist}>{routeInfo.distance.toFixed(1)} km</Text>
          </View>
        )}
      </SafeAreaView>

      {/* Floating Bottom Car */}
      <View style={styles.bottomOverlay}>
        <View style={styles.bottomCard}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              currentStatus === 'accept_to_tracking' ? styles.startNavBtn : styles.primaryBtn
            ]}
            onPress={handleAction}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={currentStatus === 'accept_to_tracking' ? 'navigate' : 'checkmark-circle'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '700',
  },
  riderMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderMarkerInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  destMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
