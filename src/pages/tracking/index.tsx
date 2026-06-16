import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Borla Wura Stable Tile Engine
const TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

type RootStackParamList = {
  MainTabs: undefined;
  Tracking: { trip?: any };
};

type TrackingRouteProp = RouteProp<RootStackParamList, 'Tracking'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TrackingPage() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrackingRouteProp>();
  const trip = route.params?.trip;
  
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sub: any;
    const start = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }
        const initial = await Location.getCurrentPositionAsync({});
        setCurrentLocation(initial);
        setLoading(false);

        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
          (loc) => setCurrentLocation(loc)
        );
      } catch (e) {
        setLoading(false);
      }
    };
    start();
    return () => sub?.remove();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>INITIALIZING RADAR...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <MapView
        style={styles.map}
        mapType="standard"
        initialRegion={{
          latitude: currentLocation?.coords.latitude || 5.6037,
          longitude: currentLocation?.coords.longitude || -0.1870,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile urlTemplate={TILE_URL} maximumZ={19} zIndex={-1} />
        
        {currentLocation && (
          <Marker coordinate={{ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }}>
            <View style={styles.markerBox}>
              <View style={styles.markerPulse} />
              <View style={styles.markerInner} />
            </View>
          </Marker>
        )}
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
           <Image source={require('../../../assets/BorlaWuraLogo.png')} style={styles.headerLogo} />
           <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>LIVE TRACKING</Text>
              <Text style={styles.headerSub}>OFFICIAL PARTNER MISSION</Text>
           </View>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#fff" />
           </TouchableOpacity>
        </View>

        <View style={styles.bottomCard}>
           <Text style={styles.cardLabel}>MISSION LOCATION</Text>
           <Text style={styles.addressText} numberOfLines={2}>
              {trip?.address || trip?.pickup_location || 'Scanning for coordinates...'}
           </Text>
           
           <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                 <View style={styles.statusDot} />
                 <Text style={styles.statusText}>EN ROUTE</Text>
              </View>
              <Text style={styles.signalText}>GPS LOCK: ACTIVE</Text>
           </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e3325' },
  map: { width, height },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e3325' },
  loadingText: { marginTop: 20, color: '#10b981', fontSize: 10, fontFamily: 'Montserrat_900Black', letterSpacing: 3 },
  overlay: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#0e3325', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#10b981' },
  headerLogo: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff' },
  headerTitleBox: { flex: 1, paddingLeft: 12 },
  headerTitle: { color: '#fff', fontSize: 13, fontFamily: 'Montserrat_900Black' },
  headerSub: { color: '#10b981', fontSize: 7, fontFamily: 'Montserrat_800ExtraBold', letterSpacing: 1 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  bottomCard: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 32, padding: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
  cardLabel: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 6 },
  addressText: { fontSize: 16, fontFamily: 'Montserrat_900Black', color: '#0e3325', lineHeight: 22, marginBottom: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  statusText: { fontSize: 9, fontFamily: 'Montserrat_900Black', color: '#10b981' },
  signalText: { fontSize: 8, fontFamily: 'Montserrat_800ExtraBold', color: '#9CA3AF', letterSpacing: 1 },
  markerBox: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  markerPulse: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: '#10b981', opacity: 0.2 },
  markerInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' }
});
