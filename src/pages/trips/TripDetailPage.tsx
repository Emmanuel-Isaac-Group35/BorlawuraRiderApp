import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

export default function TripDetailPage() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<any, any>>();
  const trip = route.params?.trip;
  const [customerName, setCustomerName] = useState('Customer');

  useEffect(() => {
    async function fetchCustomer() {
      if (trip?.user_id) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', trip.user_id).single();
        if (data) setCustomerName(data.full_name || 'Customer');
      }
    }
    fetchCustomer();
  }, [trip?.id]);

  if (!trip) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0e3325" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>MISSION SUMMARY</Text>
           <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           
           <View style={styles.mapTerminal}>
              <View style={styles.mapWindow}>
                 <MapView 
                   style={styles.map}
                   initialRegion={{
                     latitude: Number(trip.pickup_latitude || 5.6037),
                     longitude: Number(trip.longitude || -0.1870),
                     latitudeDelta: 0.005,
                     longitudeDelta: 0.005,
                   }}
                   scrollEnabled={false}
                   zoomEnabled={false}
                 >
                   <UrlTile urlTemplate={TILE_URL} maximumZ={19} zIndex={-1} />
                   
                   {/* RIDER POSITION (ESTIMATED FROM JOB START) */}
                   <Marker coordinate={{ latitude: Number(trip.pickup_latitude || 5.6037), longitude: Number(trip.longitude || -0.1870) }}>
                      <View style={styles.riderUnit}>
                         <MaterialCommunityIcons name="moped" size={18} color="#fff" />
                      </View>
                   </Marker>
                 </MapView>
              </View>
              <View style={styles.terminalFooter}>
                 <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                 <Text style={styles.terminalText}>MISSION COMPLETED SUCCESSFULLY</Text>
              </View>
           </View>

           <View style={styles.detailsSection}>
              <View style={styles.infoCard}>
                 <View style={styles.infoRow}>
                    <View style={styles.infoIcon}><Ionicons name="person" size={22} color="#10b981" /></View>
                    <View>
                       <Text style={styles.infoLabel}>CUSTOMER</Text>
                       <Text style={styles.infoValue}>{customerName.toUpperCase()}</Text>
                    </View>
                 </View>
                 <View style={styles.divider} />
                 <View style={styles.infoRow}>
                    <View style={styles.infoIcon}><Ionicons name="location" size={22} color="#10b981" /></View>
                    <View style={{ flex: 1 }}>
                       <Text style={styles.infoLabel}>PICKUP ADDRESS</Text>
                       <Text style={styles.infoValue}>{trip.address || 'Pickup Point'}</Text>
                    </View>
                 </View>
              </View>

              <View style={styles.metricGrid}>
                 <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>DATE</Text>
                    <Text style={styles.metricValue}>{new Date(trip.created_at).toLocaleDateString()}</Text>
                 </View>
                 <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>STATUS</Text>
                    <Text style={[styles.metricValue, { color: '#10b981' }]}>{trip.status.toUpperCase()}</Text>
                 </View>
              </View>

              <View style={styles.idBox}>
                 <Text style={styles.idLabel}>MISSION LOG ID</Text>
                 <Text style={styles.idText}>{trip.id.toUpperCase()}</Text>
              </View>

              <TouchableOpacity style={styles.supportBtn} onPress={() => navigation.navigate('Support')}>
                 <Text style={styles.supportText}>REPORT AN ISSUE</Text>
                 <Ionicons name="help-buoy-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
           </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 1.5 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  mapTerminal: { backgroundColor: '#fff', borderRadius: 32, padding: 12, marginBottom: 24, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
  mapWindow: { height: 250, borderRadius: 24, overflow: 'hidden' },
  map: { flex: 1 },
  riderUnit: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  terminalFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 15, paddingBottom: 5 },
  terminalText: { fontSize: 9, fontFamily: 'Montserrat_900Black', color: '#10b981', letterSpacing: 1 },
  detailsSection: { gap: 20 },
  infoCard: { backgroundColor: '#fff', borderRadius: 28, padding: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  infoIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1.5 },
  infoValue: { fontSize: 15, fontFamily: 'Montserrat_900Black', color: '#0e3325', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  metricGrid: { flexDirection: 'row', gap: 16 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 5 },
  metricLabel: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1 },
  metricValue: { fontSize: 13, fontFamily: 'Montserrat_900Black', color: '#0e3325', marginTop: 4 },
  idBox: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 15, alignItems: 'center' },
  idLabel: { fontSize: 7, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1 },
  idText: { fontSize: 9, fontFamily: 'Montserrat_700Bold', color: '#94A3B8', marginTop: 2 },
  supportBtn: { height: 64, borderRadius: 24, backgroundColor: '#FEF2F2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10 },
  supportText: { fontSize: 14, fontFamily: 'Montserrat_900Black', color: '#EF4444' }
});
