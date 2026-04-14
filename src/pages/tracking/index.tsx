import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  resolvePickupFromOrder,
  pickupAddressFromOrder,
  customerNameFromOrder,
} from '../../utils/orderLocation';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = 'AIzaSyCXzRyuiqH5qSnh1E5ka644etSb6gml6E4';

type RootStackParamList = {
  MainTabs: undefined;
  Tracking: { trip?: any };
};

type TrackingRouteProp = RouteProp<RootStackParamList, 'Tracking'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TrackingPage() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TrackingRouteProp>();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);

  const [order, setOrder] = useState<any | null>(route.params?.trip ?? null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routeError, setRouteError] = useState(false);

  const pickupCoords = useMemo(() => resolvePickupFromOrder(order), [order]);
  const pickupAddress = useMemo(() => pickupAddressFromOrder(order), [order]);
  const pickupShort =
    pickupAddress.split(',').map((s) => s.trim()).filter(Boolean)[0] || pickupAddress;
  const customerName = useMemo(() => customerNameFromOrder(order), [order]);

  useEffect(() => {
    let cancelled = false;
    const loadOrder = async () => {
      const paramTrip = route.params?.trip;
      try {
        if (paramTrip?.id) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', paramTrip.id)
            .maybeSingle();
          if (!cancelled) {
            if (data) setOrder(data);
            else if (paramTrip) setOrder(paramTrip);
            if (error) console.warn('Tracking: refresh order failed', error);
          }
        } else if (user?.id) {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('rider_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!cancelled && data) setOrder(data);
        } else if (!cancelled && paramTrip) {
          setOrder(paramTrip);
        }
      } finally {
        if (!cancelled) setOrderLoading(false);
      }
    };
    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [route.params?.trip?.id, user?.id]);

  useEffect(() => {
    if (!order?.id) return;
    const channel = supabase
      .channel(`tracking-order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            setOrder(payload.new);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  useEffect(() => {
    setRouteError(false);
  }, [pickupCoords?.lat, pickupCoords?.lng]);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let loc = await Location.getLastKnownPositionAsync({
          maxAge: 120000,
          requiredAccuracy: 5000,
        });
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
        setLocation(loc);
      } catch (err) {
        console.warn('Initial tracking location fix failed:', err);
        setErrorMsg('Could not get your location. Enable GPS and try again.');
      }
    };
    initializeLocation();
  }, []);

  useEffect(() => {
    if (!location || !pickupCoords) return;
    const id = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          {
            latitude: pickupCoords.lat,
            longitude: pickupCoords.lng,
          },
        ],
        {
          edgePadding: {
            right: width / 12,
            bottom: height / 4,
            left: width / 12,
            top: height / 8,
          },
          animated: true,
        }
      );
    }, 500);
    return () => clearTimeout(id);
  }, [location?.coords.latitude, location?.coords.longitude, pickupCoords?.lat, pickupCoords?.lng]);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startWatching = async () => {
      if (isTracking) {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (newLocation) => {
            setLocation(newLocation);
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            }
          }
        );
      }
    };

    startWatching();

    return () => {
      subscription?.remove();
    };
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const fitBoth = () => {
    if (!location || !pickupCoords || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      [
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude: pickupCoords.lat, longitude: pickupCoords.lng },
      ],
      {
        edgePadding: {
          right: width / 12,
          bottom: height / 4,
          left: width / 12,
          top: height / 8,
        },
        animated: true,
      }
    );
  };

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orderLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading trip…</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="map-outline" size={48} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>No active trip</Text>
        <Text style={styles.emptySub}>
          Open this screen from an active trip, or accept an order first.
        </Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!pickupCoords) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Pickup location unavailable</Text>
        <Text style={styles.emptySub}>
          This order has no pickup coordinates yet. Check the address in the database or order
          notes.
        </Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching your location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (location.coords.latitude + pickupCoords.lat) / 2,
          longitude: (location.coords.longitude + pickupCoords.lng) / 2,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={10}
          title="Your location"
          description="Rider"
        >
          <View style={styles.riderMarker}>
            <Ionicons name="navigate" size={18} color="#fff" />
          </View>
        </Marker>

        <Marker
          coordinate={{
            latitude: pickupCoords.lat,
            longitude: pickupCoords.lng,
          }}
          anchor={{ x: 0.5, y: 1 }}
          zIndex={5}
          title="Customer pickup"
          description={pickupAddress}
        >
          <View style={styles.customerMarkerColumn}>
            <View style={styles.customerLabel}>
              <Text style={styles.customerLabelText} numberOfLines={1}>
                Pickup
              </Text>
            </View>
            <View style={styles.customerDotOuter}>
              <View style={styles.customerDotInner} />
            </View>
          </View>
        </Marker>

        {!routeError ? (
          <MapViewDirections
            key={`${pickupCoords.lat}-${pickupCoords.lng}`}
            origin={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            destination={{
              latitude: pickupCoords.lat,
              longitude: pickupCoords.lng,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={5}
            strokeColor={colors.blue[600]}
            mode="DRIVING"
            precision="low"
            optimizeWaypoints={false}
            lineCap="round"
            lineJoin="round"
            onError={(errorMessage) => {
              console.warn('Directions API failed:', errorMessage);
              setRouteError(true);
              fitBoth();
              Alert.alert(
                'Maps API issue',
                'Directions could not be loaded. Showing a straight line instead. Enable the Directions API for your key if needed.'
              );
            }}
            onReady={(result) => {
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: width / 12,
                  bottom: height / 4,
                  left: width / 12,
                  top: height / 8,
                },
                animated: true,
              });
            }}
          />
        ) : (
          <Polyline
            coordinates={[
              { latitude: location.coords.latitude, longitude: location.coords.longitude },
              { latitude: pickupCoords.lat, longitude: pickupCoords.lng },
            ]}
            strokeColor={colors.blue[600]}
            strokeWidth={5}
            lineDashPattern={[5, 10]}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.recenterFab} onPress={fitBoth} activeOpacity={0.85}>
        <Ionicons name="expand-outline" size={22} color={colors.text.primary} />
      </TouchableOpacity>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBack}
            onPress={() => navigation.goBack()}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Live tracking</Text>
            <Text style={styles.headerRouteLine} numberOfLines={1}>
              <Text style={styles.headerOrigin}>You</Text>
              <Text style={styles.headerArrow}> → </Text>
              <Text style={styles.headerDest}>{pickupShort}</Text>
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {customerName}
            </Text>
          </View>
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.tripInfo}>
            <View style={styles.locationRow}>
              <Ionicons name="radio-button-on" size={20} color={colors.primary} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Rider (you)</Text>
                <Text style={styles.locationValue}>Green marker — live GPS</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.locationRow}>
              <Ionicons name="location" size={20} color={colors.blue[600]} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Customer / pickup</Text>
                <Text style={styles.locationValue}>{pickupAddress}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.trackButton, isTracking ? styles.stopButton : styles.startButton]}
            onPress={toggleTracking}
            activeOpacity={0.8}
          >
            <Ionicons name={isTracking ? 'stop-circle' : 'navigate'} size={24} color="white" />
            <Text style={styles.buttonText}>
              {isTracking ? 'Stop live tracking' : 'Start live tracking'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  goBackBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goBackBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    margin: 12,
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    gap: 8,
  },
  headerBack: {
    padding: 4,
    marginTop: 2,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerRouteLine: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  headerOrigin: {
    color: colors.primaryDark,
  },
  headerArrow: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  headerDest: {
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  recenterFab: {
    position: 'absolute',
    right: 16,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 5,
  },
  bottomCard: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tripInfo: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginLeft: 32,
    marginVertical: 4,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  riderMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 6,
  },
  customerMarkerColumn: {
    alignItems: 'center',
  },
  customerLabel: {
    backgroundColor: colors.blue[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    maxWidth: width * 0.45,
  },
  customerLabelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  customerDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.blue[600],
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
