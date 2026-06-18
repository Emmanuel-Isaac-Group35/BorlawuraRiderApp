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
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toggleOnlineStatus } from '../../lib/api';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = (width - (CARD_MARGIN * 4)) / 3;

export default function HomePage() {
  const navigation = useNavigation<any>();
  const { profile, user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<any>(null);
  
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [otherRiders, setOtherRiders] = useState<any[]>([]);
  const [riderAddress, setRiderAddress] = useState('SYNCING RADAR...');
  const [newJob, setNewJob] = useState<any>(null);
  const [customerName, setCustomerName] = useState('Subscriber');
  const [isAccepting, setIsAccepting] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  // FIX: Use a ref to avoid stale closure inside the location watcher useEffect
  const isOnlineRef = useRef(false);

  useEffect(() => {
    if (profile) {
      setStats(prev => ({ ...prev, rating: Number(profile.rating) }));
      if (profile.is_online !== undefined) {
        setIsOnline(profile.is_online);
        if (profile.is_online && !onlineSinceRef.current) {
          onlineSinceRef.current = new Date().toISOString();
        } else if (!profile.is_online) {
          onlineSinceRef.current = null;
        }
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchFleet = async () => {
      const { data } = await supabase.from('riders').select('*').eq('is_online', true).neq('id', user.id);
      if (data) setOtherRiders(data);
    };
    fetchFleet();

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
      onlineSinceRef.current = new Date().toISOString();
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 1500);
    } else {
      onlineSinceRef.current = null;
    }
    
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
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        
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
});
