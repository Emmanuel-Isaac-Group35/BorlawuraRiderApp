import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
<<<<<<< HEAD
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile } from 'react-native-maps';
=======
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toggleOnlineStatus } from '../../lib/api';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = (width - (CARD_MARGIN * 4)) / 3;

export default function HomePage() {
<<<<<<< HEAD
  const navigation = useNavigation<any>();
  const { profile, user } = useAuth();
=======
  const navigation = useNavigation<NavigationProp>();
  const { profile, user, settings } = useAuth();
  const [stats, setStats] = useState({
    todayTrips: 0,
    rating: 5.0,
    totalTrips: 0,
    acceptanceRate: 100,
  });
  const [isOnline, setIsOnline] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<any>(null);
  
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [otherRiders, setOtherRiders] = useState<any[]>([]);
  const [riderAddress, setRiderAddress] = useState('SYNCING RADAR...');
  const [newJob, setNewJob] = useState<any>(null);
  const [customerName, setCustomerName] = useState('Subscriber');
  const [isAccepting, setIsAccepting] = useState(false);

<<<<<<< HEAD
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // FIX: Use a ref to avoid stale closure inside the location watcher useEffect
  const isOnlineRef = useRef(false);
=======
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
          if (error) Alert.alert('DB Location Update Failed', typeof error === 'object' ? JSON.stringify(error, null, 2) : error);
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

  // Focus effect to load stats and check for active trips (Crash Recovery)
  useFocusEffect(
    useCallback(() => {
      const checkActiveTrip = async () => {
        if (!user) return;
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('rider_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
            
          if (data && !error) {
             navigation.navigate('ActiveTrip', { trip: data });
          }
        } catch (err) {
          console.log('Crash recovery check failed:', err);
        }
      };

      if (user) {
        loadStats();
        checkActiveTrip();
      }
    }, [user, navigation])
  );
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

<<<<<<< HEAD
=======
  // Listen for realtime orders with a robust fallback
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
  useEffect(() => {
    if (!user?.id) return;
    const fetchFleet = async () => {
      const { data } = await supabase.from('riders').select('*').eq('is_online', true).neq('id', user.id);
      if (data) setOtherRiders(data);
    };
    fetchFleet();

<<<<<<< HEAD
    const fleetChannel = supabase
      .channel('fleet_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'riders' }, (payload) => {
        const updated = payload.new as any;
        if (!updated) return;
        setOtherRiders(prev => {
          if (updated.id === user.id || !updated.is_online) return prev.filter(r => r.id !== updated.id);
          const index = prev.findIndex(r => r.id === updated.id);
          if (index > -1) {
             const copy = [...prev];
             copy[index] = updated;
             return copy;
          }
          return [...prev, updated];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(fleetChannel); };
  }, [user?.id]);

  useEffect(() => {
    if (!isOnline || !user?.id) return;
    const jobChannel = supabase
      .channel('job_intercept')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `status=eq.pending` }, async (p) => {
        const trip = p.new as any;
        setNewJob(trip);
        if (trip.user_id) {
          const { data } = await supabase.from('profiles').select('full_name').eq('id', trip.user_id).single();
          if (data) setCustomerName(data.full_name || 'Subscriber');
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(jobChannel); };
  }, [isOnline, user?.id]);

  useEffect(() => {
    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      locationSubRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
        async (loc) => {
          setLocation(loc);
          Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
            .then(geo => {
              if (geo.length > 0) setRiderAddress(`${geo[0].street || 'Sector Path'}, ${geo[0].district || 'Zone'}`);
            }).catch(() => {});
          if (mapRef.current) {
            mapRef.current.animateToRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
          }
          if (isOnlineRef.current && user?.id) {
            supabase.from('riders').update({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              last_active: new Date().toISOString(),
              is_online: true
            }).eq('id', user.id).then();
          }
        }
=======
    const seenOrders = new Set<string>();

    const handleNewOrder = async (order: any) => {
      if (seenOrders.has(order.id)) return;
      seenOrders.add(order.id);

      const isRequestedForOtherRider = order.rider_id && order.rider_id !== user.id;

      if (order.status === 'pending' && isOnline && !isRequestedForOtherRider) {
        const enrichedTrip = { ...order };
        const tripId = order.user_id || order.userId || order.customer_id;
        
        const existingName = order.customer_name || order.customerName || 
                         order.user_name || order.userName || 
                         order.full_name || order.fullName ||
                         order.client_name || order.clientName ||
                         (order.first_name ? (`${order.first_name} ${order.last_name || ''}`).trim() : null);

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
                .eq('id', order.id);
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
             const { data, error } = await supabase
               .from('orders')
               .update({ 
                 rider_id: user.id, 
                 status: 'accepted',
                 accepted_at: new Date().toISOString() 
               })
               .eq('id', order.id)
               .is('rider_id', null)
               .select();
             
             if (error) throw error;

             if (data && data.length > 0) {
               navigation.navigate('ActiveTrip' as never, { trip: enrichedTrip } as never);
               return;
             } else {
               console.log('Auto-accept skipped: order already taken.');
               return;
             }
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
    };

    // Primary Subscription: Realtime WebSocket (Fastest if enabled on server)
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
          handleNewOrder(payload.new);
        }
      )
      .subscribe();

    // Fallback Polling: Ensures we never miss an order even if Realtime is disabled on the server
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          for (const order of data) {
            handleNewOrder(order);
          }
        }
      } catch (err) {
        console.log('Polling error:', err);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(tripsSubscription);
      clearInterval(pollInterval);
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
      );
    };
    startWatching();
    return () => { if (locationSubRef.current) locationSubRef.current.remove(); };
  }, [isOnline, user?.id]);

  const handleToggleOnline = useCallback(async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    // FIX: Keep ref in sync so location watcher always has current online status
    isOnlineRef.current = nextStatus;
    if (user?.id) await toggleOnlineStatus(user.id, nextStatus);
  }, [isOnline, user?.id]);

  const handleAcceptJob = async () => {
    if (!newJob || isAccepting) return;
    setIsAccepting(true);
    try {
      await supabase.from('orders').update({ status: 'active', rider_id: user?.id }).eq('id', newJob.id);
      const tripToPass = newJob;
      setNewJob(null);
      navigation.navigate('ActiveTrip', { trip: tripToPass });
    } catch (error) {
      setNewJob(null);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
=======
      {/* Background Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }}
        onLongPress={(e) => {
          setLocation({
            ...location,
            coords: {
              ...location.coords,
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            }
          });
        }}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false} 
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
        
        <View style={styles.topNav}>
           <View style={styles.brandGroup}>
              <Image source={require('../../../assets/BorlaWuraLogo.png')} style={styles.navLogo} />
              <View style={styles.dividerV} />
              <View>
                 <Text style={styles.systemStatus}>UNIT ID: {profile?.id?.slice(0, 5).toUpperCase()}</Text>
                 <Text style={styles.userName} numberOfLines={1}>{profile?.full_name?.toUpperCase() || 'RIDER'}</Text>
              </View>
           </View>
           <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
              {/* FIX: Only render Image when URI is valid — undefined URI crashes on Android */}
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="person" size={24} color="#fff" />
                </View>
              )}
           </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           
           <View style={styles.statGrid}>
              <View style={[styles.statCard, { width: CARD_WIDTH }]}>
                 <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Ionicons name="radio" size={14} color="#10b981" />
                 </Animated.View>
                 <Text style={styles.statVal}>{otherRiders.length + 1}</Text>
                 <Text style={styles.statLab}>NETWORK PULSE</Text>
              </View>
              <View style={[styles.statCard, { width: CARD_WIDTH }]}>
                 <Ionicons name="shield-checkmark" size={14} color="#FBBF24" />
                 <Text style={styles.statVal}>4.9</Text>
                 <Text style={styles.statLab}>EFFICIENCY</Text>
              </View>
              <View style={[styles.statCard, { width: CARD_WIDTH }]}>
                 <Ionicons name="sync" size={14} color="#10b981" />
                 <Text style={[styles.statVal, { color: '#10b981' }]}>ACTIVE</Text>
                 <Text style={styles.statLab}>TELEMTRY</Text>
              </View>
           </View>

           <View style={styles.mapTerminal}>
              <View style={styles.terminalHeader}>
                 <View style={styles.locIndicator}>
                    <Ionicons name="navigate-circle" size={16} color="#10b981" />
                    <Text style={styles.terminalTitle} numberOfLines={1}>{riderAddress.toUpperCase()}</Text>
                 </View>
              </View>
              <View style={styles.mapWindow}>
                 <MapView ref={mapRef} style={styles.map} initialRegion={{ latitude: location?.coords.latitude || 5.6037, longitude: location?.coords.longitude || -0.1870, latitudeDelta: 0.01, longitudeDelta: 0.01 }} scrollEnabled={false} zoomEnabled={false}>
                   <UrlTile urlTemplate="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" maximumZ={19} zIndex={-1} />
                   {otherRiders.map(rider => (
                     <Marker key={rider.id} coordinate={{ latitude: Number(rider.latitude), longitude: Number(rider.longitude) }} tracksViewChanges={false}>
                        <View style={styles.otherRiderMarker}><MaterialCommunityIcons name="moped" size={12} color="#94A3B8" /></View>
                     </Marker>
                   ))}
                   {location && (
                     <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} tracksViewChanges={false}>
                        <View style={styles.riderMarker}><MaterialCommunityIcons name="moped" size={18} color="#fff" /></View>
                     </Marker>
                   )}
                 </MapView>
              </View>
           </View>

           <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Trips')}>
                 <View style={styles.iconCircle}><Ionicons name="list" size={22} color="#10b981" /></View>
                 <Text style={styles.actionLabel}>MISSION LOGS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Support')}>
                 <View style={styles.iconCircle}><Ionicons name="headset" size={22} color="#10b981" /></View>
                 <Text style={styles.actionLabel}>STRATEGIC SUPPORT</Text>
              </TouchableOpacity>
           </View>

           <TouchableOpacity style={[styles.mainBtn, { backgroundColor: isOnline ? '#EF4444' : '#10b981' }]} onPress={handleToggleOnline}>
              <Text style={styles.btnText}>{isOnline ? 'STANDBY MODE' : 'DEPLOY UNIT'}</Text>
              <Ionicons name={isOnline ? "power" : "flash"} size={26} color="#fff" />
           </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      <Modal visible={!!newJob} animationType="slide" transparent>
         <View style={styles.modalOverlay}>
            <View style={styles.jobSheet}>
               <View style={styles.sheetHeader}>
                  <View style={styles.logoPill}>
                     <Image source={require('../../../assets/BorlaWuraLogo.png')} style={styles.miniLogo} />
                     <Text style={styles.pillText}>MISSION INTERCEPT DETECTED</Text>
                  </View>
                  <TouchableOpacity onPress={() => setNewJob(null)} style={styles.dismissBtn}><Ionicons name="close" size={20} color="#9CA3AF" /></TouchableOpacity>
               </View>
               <View style={styles.customerBox}>
                  <View style={styles.avatarMini}><Ionicons name="person" size={24} color="#10b981" /></View>
                  <View>
                     <Text style={styles.label}>SUBSCRIBER IDENTITY</Text>
                     <Text style={styles.customerName}>{customerName.toUpperCase()}</Text>
                  </View>
               </View>
               <View style={styles.addressBox}>
                  <Text style={styles.label}>MISSION COORDINATES</Text>
                  <Text style={styles.addressText}>{newJob?.address || 'Sector Sector'}</Text>
               </View>
               <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptJob} disabled={isAccepting}>
                  {isAccepting ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.acceptBtnText}>AUTHORIZE MISSION</Text>
                      <Ionicons name="shield-checkmark" size={24} color="#fff" />
                    </>
                  )}
               </TouchableOpacity>
            </View>
         </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  safeArea: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loaderText: { marginTop: 20, fontSize: 10, fontFamily: 'Montserrat_900Black', color: '#10b981', letterSpacing: 2 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  brandGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  navLogo: { width: 44, height: 44, borderRadius: 12 },
  dividerV: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginHorizontal: 15 },
  systemStatus: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1.5 },
  userName: { fontSize: 14, fontFamily: 'Montserrat_900Black', color: '#0F172A', marginTop: 2 },
  profileBtn: { width: 48, height: 48, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  avatar: { width: '100%', height: '100%' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: '#fff', borderRadius: 24, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  statLab: { fontSize: 6, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 0.8, marginTop: 4, textAlign: 'center' },
  statVal: { fontSize: 18, fontFamily: 'Montserrat_900Black', color: '#0F172A', marginTop: 2 },
  mapTerminal: { backgroundColor: '#fff', borderRadius: 32, padding: 10, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', elevation: 10 },
  terminalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  locIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  terminalTitle: { fontSize: 9, fontFamily: 'Montserrat_900Black', color: '#10b981', letterSpacing: 0.5 },
  mapWindow: { height: 350, borderRadius: 24, overflow: 'hidden' },
  map: { flex: 1 },
  riderMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', elevation: 5 },
  otherRiderMarker: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 28, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 10, fontFamily: 'Montserrat_900Black', color: '#0F172A', letterSpacing: 1 },
  mainBtn: { height: 64, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, elevation: 10 },
  btnText: { color: '#fff', fontSize: 18, fontFamily: 'Montserrat_900Black', letterSpacing: 1.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  jobSheet: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 50, elevation: 25 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  logoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 8, paddingRight: 16, borderRadius: 20, gap: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  miniLogo: { width: 32, height: 32, borderRadius: 8 },
  pillText: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#10b981', letterSpacing: 1 },
  dismissBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  customerBox: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 25 },
  avatarMini: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#9CA3AF', letterSpacing: 1.5 },
  customerName: { fontSize: 20, fontFamily: 'Montserrat_900Black', color: '#0F172A' },
  addressBox: { marginBottom: 40 },
  addressText: { fontSize: 15, fontFamily: 'Montserrat_800ExtraBold', color: '#0F172A', marginTop: 4 },
  acceptBtn: { height: 74, backgroundColor: '#10b981', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, elevation: 10 },
  acceptBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat_900Black', letterSpacing: 1.5 }
=======
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
});
