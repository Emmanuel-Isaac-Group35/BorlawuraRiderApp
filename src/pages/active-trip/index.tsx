import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
<<<<<<< HEAD
import { fetchDrivingRoute, getOpenRouteServiceApiKey } from '../../lib/openRouteService';
=======
import { useNavigatrDirections } from '../../hooks/useNavigatrDirections';
import { SwipeButton } from '../../components/common/SwipeButton';
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c

const { width, height } = Dimensions.get('window');
const TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

<<<<<<< HEAD
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
=======
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
  ActiveTrip: { trip?: any };
  Tracking: { trip?: any };
  TripComplete: { trip?: any };
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
};

export default function ActiveTripPage() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<any, any>>();
  const dbTrip = route.params?.trip;
<<<<<<< HEAD
  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<any>(null);
  
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [riderAddress, setRiderAddress] = useState('LOCATING UNIT...');
  const [currentStatus, setCurrentStatus] = useState<'driving' | 'collecting' | 'approaching'>('driving');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('Subscriber');
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      if (!dbTrip?.id) return;
      const tripId = dbTrip?.user_id || dbTrip?.customer_id;
=======
  
  const currentHour = new Date().getHours();
  const isNightMode = currentHour < 6 || currentHour >= 18;
  
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  
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
    if (!currentLocation || !mapRef.current) return;
    mapRef.current.fitToCoordinates([
      { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude },
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
      if (tripId) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', tripId).maybeSingle();
        if (data) setCustomerName(data.full_name || 'Subscriber');
      }
    }
    fetchDetails();
  }, [dbTrip?.id]);

  useEffect(() => {
    let isMounted = true;
    async function getRoute() {
      if (!currentLocation || !dbTrip) return;
      // FIX: Use pickup_longitude (not longitude) — correct column name from DB
      const dest = { latitude: Number(dbTrip.pickup_latitude || 5.6037), longitude: Number(dbTrip.pickup_longitude || -0.1870) };
      const dist = getDistance(currentLocation.coords.latitude, currentLocation.coords.longitude, dest.latitude, dest.longitude);
      if (isMounted) setDistanceRemaining(dist);
      if (dist < 500 && currentStatus === 'driving') if (isMounted) setCurrentStatus('approaching');

      Location.reverseGeocodeAsync({ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude })
        .then(geo => { if (isMounted && geo.length > 0) setRiderAddress(`${geo[0].street || 'Sector Rd'}, ${geo[0].district || 'Zone'}`); })
        .catch(() => {});

      try {
        const apiKey = getOpenRouteServiceApiKey();
        // FIX: Skip route fetch gracefully when no ORS API key is configured
        if (!apiKey) return;
        const result = await fetchDrivingRoute(apiKey, { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }, dest);
        if (isMounted) { setRouteCoords(result.coordinates); if (mapRef.current) mapRef.current.fitToCoordinates([currentLocation.coords, dest], { edgePadding: { top: 100, right: 100, bottom: 100, left: 100 }, animated: true }); }
      } catch (err) { console.warn('Route fetch failed:', err); }
    }
    getRoute();
    return () => { isMounted = false; };
  }, [currentLocation?.coords.latitude, dbTrip?.id]);

  useEffect(() => {
    const startWatcher = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      locationSubRef.current = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 }, (loc) => setCurrentLocation(loc));
    };
    startWatcher();
    return () => { if (locationSubRef.current) locationSubRef.current.remove(); };
  }, []);

<<<<<<< HEAD
  const completeMission = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.from('orders').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', dbTrip.id);
=======
  const handleAction = async () => {
    if (currentStatus === 'accept_to_tracking') {
      setCurrentStatus('driving_to_pickup');
      if (dbTrip?.id) await supabase.from('orders').update({ sub_status: 'driving_to_pickup' }).eq('id', dbTrip.id);
    } else if (currentStatus === 'driving_to_pickup') {
      setCurrentStatus('arrived_at_pickup');
      if (dbTrip?.id) {
        await supabase.from('orders').update({ sub_status: 'arrived_at_pickup' }).eq('id', dbTrip.id);
      }
    } else if (currentStatus === 'arrived_at_pickup') {
      setCurrentStatus('waste_collected');
      if (dbTrip?.id) {
        await supabase.from('orders').update({ sub_status: 'waste_collected' }).eq('id', dbTrip.id);
      }
    } else if (currentStatus === 'waste_collected') {
      if (dbTrip?.id) {
        await supabase.from('orders').update({ 
          status: 'completed', 
          sub_status: 'completed',
          completed_at: new Date().toISOString() 
        }).eq('id', dbTrip.id);
      }
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
      navigation.replace('TripComplete', { trip: dbTrip });
    } catch (error) {
      Alert.alert('System Error', 'Operational failure during mission finalization.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, dbTrip?.id]);

<<<<<<< HEAD
  if (!currentLocation) return (
    <View style={styles.loader}>
       <ActivityIndicator size="large" color="#10b981" />
       <Text style={styles.loaderText}>TELEMTRY SYNC IN PROGRESS...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView ref={mapRef} style={styles.map} initialRegion={{ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
        <UrlTile urlTemplate={TILE_URL} maximumZ={19} zIndex={-1} />
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={6} strokeColor="#10b981" lineCap="round" />}
        <Marker coordinate={{ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }} tracksViewChanges={false}>
           <View style={styles.riderMarker}><MaterialCommunityIcons name="moped" size={22} color="#fff" /></View>
        </Marker>
        {/* FIX: Use pickup_longitude — correct DB column name */}
        <Marker coordinate={{ latitude: Number(dbTrip.pickup_latitude || 5.6037), longitude: Number(dbTrip.pickup_longitude || -0.1870) }} tracksViewChanges={false}>
           <View style={styles.customerMarker}><Ionicons name="person" size={20} color="#fff" /></View>
        </Marker>
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {currentStatus === 'approaching' && (
          <View style={styles.approachBanner}>
             <Ionicons name="alert-circle" size={16} color="#fff" />
             <Text style={styles.approachText}>FINAL SECTOR APPROACH DETECTED</Text>
          </View>
        )}

        <View style={styles.navPill}>
           <Image source={require('../../../assets/BorlaWuraLogo.png')} style={styles.miniLogo} />
           <View style={styles.dividerV} />
           <View style={styles.pillInfo}>
              <Text style={styles.customerLabel}>SUBSCRIBER: {customerName.toUpperCase()}</Text>
              <Text style={styles.addressText} numberOfLines={1}>{dbTrip?.address || 'Target Coordinates'}</Text>
           </View>
           <TouchableOpacity onPress={() => Linking.openURL(`tel:${dbTrip?.phone}`)} style={styles.callBtn}>
              <Ionicons name="call" size={18} color="#fff" />
           </TouchableOpacity>
=======
  const getButtonText = () => {
    if (currentStatus === 'accept_to_tracking') return 'Start Tracking';
    if (currentStatus === 'driving_to_pickup') return 'Arrived at Pickup';
    if (currentStatus === 'arrived_at_pickup') return 'Waste Collected';
    if (currentStatus === 'waste_collected') return 'Complete Trip';
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
        customMapStyle={isNightMode ? darkMapStyle : lightMapStyle}
        provider={PROVIDER_GOOGLE}
        mapType="standard"
        initialRegion={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onLongPress={(e) => {
          setCurrentLocation({
            ...currentLocation,
            coords: {
              ...currentLocation.coords,
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            }
          });
        }}
        showsUserLocation={false} 
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Rider marker (Top-down car) */}
        <Marker 
          ref={markerRef}
          coordinate={{ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }} 
          anchor={{ x: 0.5, y: 0.5 }} 
          zIndex={10}
          rotation={currentLocation.coords.heading || 0}
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
                <TouchableOpacity style={styles.uberChatBtn} onPress={() => navigation.navigate('Chat' as never, { trip: dbTrip || trip } as never)}>
                  <Ionicons name="chatbubble" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.uberChatBtn, { marginLeft: 8 }]} onPress={handleCall}>
                  <Ionicons name="call" size={24} color="#000" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <SwipeButton 
                    title={`Swipe to ${getButtonText()}`} 
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
        </View>

        <View style={{ flex: 1 }} pointerEvents="none" />

        <View style={styles.controlSheet}>
           <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                 <Text style={styles.metaLabel}>UNIT POSITIONING</Text>
                 <Text style={styles.locText} numberOfLines={1}>{riderAddress.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, currentStatus === 'approaching' && { backgroundColor: '#FEF2F2' }]}>
                 <Text style={[styles.statusBadgeText, currentStatus === 'approaching' && { color: '#EF4444' }]}>
                    {currentStatus === 'driving' ? 'IN TRANSIT' : currentStatus === 'approaching' ? 'APPROACHING' : 'STATIONED'}
                 </Text>
              </View>
           </View>

           <View style={styles.dividerH} />

           <View style={styles.telemetryRow}>
              <View>
                 <Text style={styles.metaLabel}>TELEMETRY: DISTANCE TO TARGET</Text>
                 <Text style={styles.telemetryVal}>{distanceRemaining ? `${(distanceRemaining / 1000).toFixed(2)} KM` : 'CALCULATING...'}</Text>
              </View>
           </View>

           <TouchableOpacity style={[styles.actionBtn, currentStatus === 'collecting' && { backgroundColor: '#0F172A' }]} onPress={() => currentStatus !== 'collecting' ? setCurrentStatus('collecting') : completeMission()} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.btnText}>{currentStatus !== 'collecting' ? 'MARK UNIT STATIONED' : 'EXECUTE MISSION COMPLETION'}</Text>
                  <Ionicons name={currentStatus !== 'collecting' ? "location" : "shield-checkmark"} size={24} color="#fff" />
                </>
              )}
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loaderText: { marginTop: 20, fontSize: 10, fontFamily: 'Montserrat_900Black', color: '#10b981', letterSpacing: 2 },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, paddingHorizontal: 16 },
  riderMarker: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', elevation: 10 },
  customerMarker: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', elevation: 10 },
  approachBanner: { backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10, elevation: 10 },
  approachText: { color: '#fff', fontSize: 9, fontFamily: 'Montserrat_900Black', letterSpacing: 1 },
  navPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, padding: 12, marginTop: 15, elevation: 15 },
  miniLogo: { width: 44, height: 44, borderRadius: 12 },
  dividerV: { width: 1, height: 24, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
  pillInfo: { flex: 1 },
  customerLabel: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#10b981', letterSpacing: 1 },
  addressText: { fontSize: 14, fontFamily: 'Montserrat_800ExtraBold', color: '#0F172A', marginTop: 2 },
  callBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  controlSheet: { backgroundColor: '#fff', borderRadius: 40, padding: 30, paddingBottom: 40, marginHorizontal: -16, elevation: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  metaLabel: { fontSize: 7, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1 },
  locText: { fontSize: 16, fontFamily: 'Montserrat_900Black', color: '#0F172A', marginTop: 4 },
  statusBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusBadgeText: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#10b981', letterSpacing: 1 },
  dividerH: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  telemetryRow: { marginBottom: 25 },
  telemetryVal: { fontSize: 24, fontFamily: 'Montserrat_900Black', color: '#10b981', marginTop: 4 },
  actionBtn: { height: 74, backgroundColor: '#10b981', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, elevation: 10 },
  btnText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_900Black', letterSpacing: 1 }
=======
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
});
