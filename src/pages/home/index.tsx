import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { colors } from '../../utils/colors';
import { Toast } from '../../components/common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { fetchStats, toggleOnlineStatus } from '../../lib/api';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  MainTabs: undefined;
  Request: { trip?: any };
  Profile: undefined;
  Tracking: { trip?: any };
  Trips: undefined;
  Support: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomePage() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, user, settings } = useAuth();
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weeklyEarnings: 0,
    todayTrips: 0,
    rating: 5.0,
    totalTrips: 0,
    acceptanceRate: 100,
  });
  const [isOnline, setIsOnline] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [activeRiders, setActiveRiders] = useState<{id: string, lat: number, lng: number}[]>([]);

  // Update rider's location in Supabase when moving and online
  useEffect(() => {
    if (user && isOnline && location) {
      supabase
        .from('riders')
        .update({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error('Error updating location:', error);
        });
    }
  }, [location, isOnline, user]);

  // Fetch real-time active riders globally
  useEffect(() => {
    if (!isOnline || !user) {
      setActiveRiders([]);
      return;
    }

    const fetchOtherRiders = async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('id, latitude, longitude')
        .eq('is_online', true)
        .neq('id', user.id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (data && !error) {
        setActiveRiders(data.map(r => ({ id: r.id, lat: r.latitude!, lng: r.longitude! })));
      }
    };

    fetchOtherRiders();
    
    // Subscribe to realtime updates for other riders
    const channel = supabase
      .channel('active-riders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'riders', filter: 'is_online=eq.true' },
        (payload) => {
          if (payload.new.id !== user.id && payload.new.latitude && payload.new.longitude) {
            setActiveRiders(prev => {
              const exists = prev.find(r => r.id === payload.new.id);
              if (exists) {
                return prev.map(r => r.id === payload.new.id ? { id: r.id, lat: payload.new.latitude, lng: payload.new.longitude } : r);
              }
              return [...prev, { id: payload.new.id, lat: payload.new.latitude, lng: payload.new.longitude }];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'riders', filter: 'is_online=eq.false' },
        (payload) => {
          setActiveRiders(prev => prev.filter(r => r.id !== payload.new.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, user]);

  // Network Connectivity Monitoring
  useEffect(() => {
    let wasConnected = true;

    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected;

      if (isConnected === false && isOnline && user) {
        wasConnected = false;
        // Network connection lost
        setIsOnline(false);
        Alert.alert(
          'Network Connection Lost',
          'You have been automatically taken offline because your device lost internet connection.'
        );
        // Try updating DB immediately (may fail if completely disconnected)
        toggleOnlineStatus(user.id, false).catch(e => console.log('Failed to update DB offline state', e));
      } else if (isConnected === true && !wasConnected && user) {
        wasConnected = true;
        // Upon reconnection, sync the offline state clearly to the backend if they remained offline
        if (!isOnline) {
          toggleOnlineStatus(user.id, false).catch(e => console.log('Sync offline status failed', e));
        }
      }
    });

    return () => unsubscribe();
  }, [isOnline, user]);

  // Focus effect to load stats
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadStats();
      }
    }, [user])
  );

  useEffect(() => {
    if (profile) {
      setStats(prev => ({ ...prev, rating: Number(profile.rating) }));
      if (profile.is_online !== undefined) {
        setIsOnline(profile.is_online);
      }
    }
  }, [profile]);

  // Initialize and Watch Maps Location
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    
    const startLocationTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        // Get initial location to render map quickly
        let loc = await Location.getLastKnownPositionAsync({});
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
        setLocation(loc);

        // Subscribe to live location updates so the car marker actually moves
        locationSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 10,   // Update every 10 meters of movement
                timeInterval: 5000,     // OR every 5 seconds
            },
            (newLocation) => {
                setLocation(newLocation);
            }
        );

      } catch (err) {
        console.warn('Location fetching error:', err);
        // Fallback to center of Accra if completely failed
        setLocation(prev => prev || {
          coords: {
            latitude: 5.6037,
            longitude: -0.1870,
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0,
          },
          timestamp: Date.now(),
        });
      }
    };

    startLocationTracking();

    return () => {
        if (locationSubscription) {
            locationSubscription.remove();
        }
    };
  }, []);

  // Listen for realtime orders
  useEffect(() => {
    if (!user || !isOnline) return;

    // Secondary Security check: Ensure documents are still present
    const isVerified = !!profile?.license_photo_url && 
                       !!profile?.ghana_card_photo_url && 
                       !!profile?.vehicle_photo_url;
    
    if (!isVerified) {
       // If somehow online but not verified, force offline
       updateOnlineStatus(false);
       return;
    }

    const tripsSubscription = supabase
      .channel('new-trip-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload: any) => {
          const isRequestedForOtherRider = payload.new.rider_id && payload.new.rider_id !== user.id;

          if (payload.new.status === 'pending' && isOnline && !isRequestedForOtherRider) {
            const enrichedTrip = { ...payload.new };
            const tripId = payload.new.user_id || payload.new.userId || payload.new.customer_id;
            
            const existingName = payload.new.customer_name || payload.new.customerName || 
                             payload.new.user_name || payload.new.userName || 
                             payload.new.full_name || payload.new.fullName ||
                             payload.new.client_name || payload.new.clientName ||
                             (payload.new.first_name ? (`${payload.new.first_name} ${payload.new.last_name || ''}`).trim() : null);

            if (tripId && (!existingName || existingName === 'Customer')) {
              try {
                let { data: profile_data, error: profile_error } = await supabase
                  .from('profiles')
                  .select('full_name, first_name, last_name, email')
                  .eq('id', tripId)
                  .maybeSingle();
                
                if (!profile_data || profile_error?.code === '42P01') {
                   const { data: riderProfile } = await supabase
                    .from('riders')
                    .select('first_name, last_name, email')
                    .eq('id', tripId)
                    .maybeSingle();
                   if (riderProfile) profile_data = { ...riderProfile, full_name: null } as any;
                }

                if (profile_data) {
                  const resolvedName = (profile_data as any).full_name || 
                                              ((profile_data as any).first_name ? (`${(profile_data as any).first_name} ${(profile_data as any).last_name || ''}`).trim() : 
                                              ((profile_data as any).email?.split('@')[0] || 'Customer'));
                  enrichedTrip.customer_name = resolvedName;

                  await supabase
                    .from('orders')
                    .update({ customer_name: resolvedName })
                    .eq('id', payload.new.id);
                }
              } catch (err) {
                console.error('Error fetching/updating customer profile:', err);
              }
            } else if (existingName && existingName !== 'Customer') {
               enrichedTrip.customer_name = existingName;
            }

            // Auto-Accept Logic
            if (settings.autoAccept) {
               try {
                 await supabase
                   .from('orders')
                   .update({ 
                     rider_id: user.id, 
                     status: 'accepted',
                     accepted_at: new Date().toISOString() 
                   })
                   .eq('id', payload.new.id);
                 
                 navigation.navigate('Tracking', { trip: enrichedTrip });
                 return;
               } catch (e) {
                 console.error('Auto-accept failed:', e);
               }
            }

            if (settings.pushNotifications) {
              setShowNotification(true);
              setTimeout(() => {
                navigation.navigate('Request', { trip: enrichedTrip });
              }, 1000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tripsSubscription);
    };
  }, [user, isOnline]);

  const loadStats = async () => {
    if (!user) return;
    try {
      const data = await fetchStats(user.id);
      setStats(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleToggleOnline = () => {
    if (!isOnline) {
      // Security Check: Ensure rider is verified with documents
      const isVerified = !!profile?.license_photo_url && 
                         !!profile?.ghana_card_photo_url && 
                         !!profile?.vehicle_photo_url;

      if (!isVerified) {
        Alert.alert(
          'Verification Required',
          'Please upload your Rider License, Ghana Card, and Tricycle Registration in the Profile section to start receiving orders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Update Profile', onPress: () => navigation.navigate('Profile' as any) }
          ]
        );
        return;
      }

      Alert.alert(
        'Go Online',
        'Are you ready to start receiving ride requests?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Go Online', onPress: () => updateOnlineStatus(true) }
        ]
      );
    } else {
      updateOnlineStatus(false);
    }
  };

  const updateOnlineStatus = async (status: boolean) => {
    if (!user) return;
    
    // Always update visual local state safely
    setIsOnline(status);
    if (status) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 1500);
    }
    
    try {
      await toggleOnlineStatus(user.id, status);
    } catch (error) {
      console.error('Error updating online status:', error);
      // Soft fail, user may be offline
    }
  };

  const recenterMap = () => {
    if (location && mapRef.current) {
        mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }}
        showsUserLocation={false} 
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={mapStyle}
      >
          {/* Custom car marker (The Rider) */}
          <Marker
             coordinate={{
                 latitude: location.coords.latitude,
                 longitude: location.coords.longitude,
             }}
             zIndex={10}
          >
             <View style={styles.markerContainer}>
                 <View style={styles.markerHighlight} />
                 <View style={styles.carIconWrapper}>
                    <Ionicons name="car" size={24} color="#333" />
                 </View>
             </View>
          </Marker>

          {/* Real-time active riders */}
          {isOnline && activeRiders.map((rider) => (
             <Marker
                key={rider.id}
                coordinate={{
                    latitude: rider.lat,
                    longitude: rider.lng,
                }}
                zIndex={1}
             >
                <View style={[styles.markerContainer, { opacity: 0.85 }]}>
                    <View style={[styles.carIconWrapper, { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.gray[100] }]}>
                        <Ionicons name="car" size={18} color={colors.primary} />
                    </View>
                </View>
             </Marker>
          ))}
      </MapView>

      {/* Foreground UI Components */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        
        {/* Top Action Toggle Button */}
        <View style={[styles.actionToggleWrapper, { paddingTop: 16, paddingBottom: 0, transform: [] }]} pointerEvents="box-none">
          <TouchableOpacity 
            style={[
              styles.goOnlineButton, 
              { backgroundColor: isOnline ? colors.error : colors.primary }
            ]}
            onPress={handleToggleOnline}
            activeOpacity={0.9}
          >
              <Text style={styles.goOnlineText}>
                 {isOnline ? 'Go offline' : 'Go online'}
              </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Tools & Actions Sheet Spacer - takes up middle space */}
        <View style={{ flex: 1 }} pointerEvents="none" />

        {/* Bottom Controls Area */}
        <View style={styles.controlsArea} pointerEvents="box-none">
           {/* Floating Action Buttons */}
           <View style={styles.floatingControlsBlock} pointerEvents="box-none">
              <TouchableOpacity style={styles.floatingActionButton} onPress={recenterMap}>
                  <Ionicons name="locate" size={22} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatingActionButton}>
                  <Ionicons name="options-outline" size={22} color="#000" />
              </TouchableOpacity>
           </View>
           
           {/* Performance Card */}
           <View style={styles.performanceCardWrapper}>
             <View style={styles.performanceCard}>
               <Text style={styles.performanceCardTitle}>Performance</Text>
               <View style={styles.performanceGrid}>
                 <View style={styles.performanceItem}>
                   <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                     <Ionicons name="star" size={20} color="#facc15" />
                   </View>
                   <Text style={styles.performanceValue}>{stats.rating}</Text>
                   <Text style={styles.performanceLabel}>Rating</Text>
                 </View>
                 <View style={styles.performanceItem}>
                   <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
                     <Ionicons name="location" size={20} color="#0284c7" />
                   </View>
                   <Text style={styles.performanceValue}>{stats.totalTrips}</Text>
                   <Text style={styles.performanceLabel}>Total Trips</Text>
                 </View>
                 <View style={styles.performanceItem}>
                   <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                     <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                   </View>
                   <Text style={styles.performanceValue}>{stats.acceptanceRate}%</Text>
                   <Text style={styles.performanceLabel}>Acceptance</Text>
                 </View>
               </View>
             </View>
           </View>
        </View>

      </SafeAreaView>

      <Toast
        visible={showNotification}
        message={isOnline ? "You're Now Online!" : "You're Now Offline"}
        subtitle={isOnline ? "Waiting for pickup requests..." : "Stop driving for now."}
        type={isOnline ? "success" : "info"}
        onHide={() => setShowNotification(false)}
      />
    </View>
  );
}

const mapStyle = [
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "transit",
    "stylers": [{ "visibility": "off" }]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#daedd4',
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  earningsPill: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginTop: -2,
  },
  controlsArea: {
    justifyContent: 'flex-end',
  },
  floatingControlsBlock: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: -20, 
    zIndex: 10,
  },
  floatingActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionToggleWrapper: {
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
    transform: [{ translateY: 24 }],  
  },
  goOnlineButton: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  goOnlineText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 36, 
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    minHeight: 180,
  },
  sheetHandleWrapper: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  alertOuterIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeaea',
    marginRight: 12,
  },
  alertInnerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error,
  },
  alertTextContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  promoCard: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerHighlight: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  carIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  performanceCardWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
  },
  performanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
  }
});
