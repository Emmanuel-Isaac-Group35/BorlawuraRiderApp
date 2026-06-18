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
import { fetchDrivingRoute, getOpenRouteServiceApiKey } from '../../lib/openRouteService';

const { width, height } = Dimensions.get('window');
const TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
  Chat: { trip?: any };

};

export default function ActiveTripPage() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<any, any>>();
  const dbTrip = route.params?.trip;
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

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 25,
        },
        async (newLoc) => {
          setCurrentLocation(newLoc);
          if (dbTrip?.id) {
            const { error } = await supabase
              .from('orders')
              .update({
                rider_lat: newLoc.coords.latitude,
                rider_lng: newLoc.coords.longitude,
                rider_heading: newLoc.coords.heading ?? 0,
              })
              .eq('id', dbTrip.id);
            if (error) {
              console.error('Failed to update rider location in Supabase:', error);
            }
          }
        }
      );
    };
    startTracking();
    return () => {
      subscription?.remove();
      supabase.removeChannel(cancelSubscription);
    };
    startWatcher();
    return () => { if (locationSubRef.current) locationSubRef.current.remove(); };
  }, []);

  const completeMission = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.from('orders').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', dbTrip.id);
      navigation.replace('TripComplete', { trip: dbTrip });
    } catch (error) {
      Alert.alert('System Error', 'Operational failure during mission finalization.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, dbTrip?.id]);

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
});
