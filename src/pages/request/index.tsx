import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const { width } = Dimensions.get('window');
const TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

export default function RequestPage() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<any, any>>();
  const trip = route.params?.trip;
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await supabase.from('orders').update({ status: 'active', rider_id: (await supabase.auth.getUser()).data.user?.id }).eq('id', trip.id);
      navigation.replace('ActiveTrip', { trip });
    } catch (error) {
      Alert.alert('Error', 'Could not accept mission.');
      navigation.goBack();
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async (penalize: boolean = true) => {
    if (!hasDeclinedRef.current) {
      hasDeclinedRef.current = true;
      if (user?.id && penalize) {
         // Silently log decline for accurate acceptance rate calculation
         try {
           await supabase.from('audit_logs').insert({
               user_id: user.id,
               action: 'request_declined',
               details: { trip_id: trip?.id }
           });
         } catch {
           // Fire-and-forget: don't block navigation on logging failure
         }
      }
    }
    navigation.goBack();
  };

  const handleNavigate = () => {
    // Navigatr Map natively guides rider from ActiveTrip tracking interface
  };

  const progress = (25 - timeLeft) / 25;
  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <MapView
        style={styles.map}
        initialRegion={{ latitude: Number(trip.pickup_latitude || 5.6037), longitude: Number(trip.longitude || -0.1870), latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      >
        <UrlTile urlTemplate={TILE_URL} maximumZ={19} zIndex={-1} />
        <Marker coordinate={{ latitude: Number(trip.pickup_latitude || 5.6037), longitude: Number(trip.longitude || -0.1870) }}>
           <View style={styles.radarDot} />
        </Marker>
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
           <View style={styles.logoPill}>
              <Image source={require('../../../assets/BorlaWuraLogo.png')} style={styles.miniLogo} />
              <Text style={styles.headerTitle}>MISSION SIGNAL</Text>
           </View>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#fff" />
           </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} pointerEvents="none" />

        <View style={styles.requestCard}>
           <View style={styles.detailsRow}>
              <View>
                 <Text style={styles.label}>CATEGORY</Text>
                 <Text style={styles.value}>{trip.waste_type?.toUpperCase() || 'GENERAL'}</Text>
              </View>
              <View style={styles.distBadge}>
                 <Text style={styles.distText}>NEARBY</Text>
              </View>
           </View>
           <View style={styles.divider} />
           <View style={styles.addrBox}>
              <Ionicons name="location" size={18} color="#10b981" />
              <View style={styles.addrContent}>
                 <Text style={styles.label}>PICKUP POINT</Text>
                 <Text style={styles.addrValue} numberOfLines={2}>{trip.address || 'Accra, Ghana'}</Text>
              </View>
           </View>
           <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} disabled={isAccepting}>
              {isAccepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.acceptText}>ACCEPT MISSION</Text>}
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e3325' },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  logoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14, 51, 37, 0.9)', padding: 6, paddingRight: 16, borderRadius: 20, gap: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  miniLogo: { width: 28, height: 28, borderRadius: 8 },
  headerTitle: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#fff', letterSpacing: 2 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  requestCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, paddingBottom: 32, marginBottom: 8, elevation: 20 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 7, fontFamily: 'Montserrat_900Black', color: '#9CA3AF', letterSpacing: 1 },
  value: { fontSize: 16, fontFamily: 'Montserrat_900Black', color: '#0e3325', marginTop: 2 },
  distBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  distText: { fontSize: 7, fontFamily: 'Montserrat_900Black', color: '#10b981' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 16 },
  addrBox: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  addrContent: { flex: 1 },
  addrValue: { fontSize: 12, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325', marginTop: 2 },
  acceptBtn: { height: 54, backgroundColor: '#10b981', borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  acceptText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_900Black', letterSpacing: 1 },
  radarDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' }
});
