import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView, // VERIFIED IMPORT
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type SortOrder = 'desc' | 'asc';
type FilterType = 'all' | 'completed' | 'pending' | 'active';

export default function TripsPage() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchTrips();
  }, [sortOrder, filter]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('rider_id', user?.id)
        .order('created_at', { ascending: sortOrder === 'asc' });
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query;
      if (error) throw error;
      setTrips(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const renderFilterPill = (label: string, value: FilterType) => (
    <TouchableOpacity style={[styles.filterPill, filter === value && styles.filterPillActive]} onPress={() => setFilter(value)}>
       <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  const renderTripItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.tripCard} onPress={() => navigation.navigate('TripDetail', { trip: item })}>
       <View style={styles.cardHeader}>
          <View style={styles.statusBadge}>
             <View style={[styles.statusDot, { backgroundColor: item.status === 'completed' ? '#10b981' : '#FBBF24' }]} />
             <Text style={styles.statusText}>{item.status === 'completed' ? 'SUCCESS' : 'PENDING'}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
       </View>
       <View style={styles.cardBody}>
          <View style={styles.locRow}>
             <Ionicons name="location" size={18} color="#10b981" />
             <Text style={styles.addressText} numberOfLines={1}>{item.address || 'Sector Coordinates'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
             <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>SERVICE CLASS</Text>
                <Text style={styles.metaValue}>PICKUP_UNIT</Text>
             </View>
             <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>MISSION_ID</Text>
                <Text style={styles.metaValue}>#{item.id.slice(0, 8).toUpperCase()}</Text>
             </View>
             <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </View>
       </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color="#0e3325" /></TouchableOpacity>
           <Text style={styles.headerTitle}>OPERATIONAL MISSION LOGS</Text>
           <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} style={styles.sortBtn}>
              <Ionicons name={sortOrder === 'desc' ? "arrow-down" : "arrow-up"} size={16} color="#10b981" />
              <Text style={styles.sortBtnText}>{sortOrder === 'desc' ? 'LATEST' : 'CHRONO'}</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {renderFilterPill('All Logs', 'all')}
              {renderFilterPill('Executed', 'completed')}
              {renderFilterPill('Active', 'active')}
           </ScrollView>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>
        ) : (
          <FlatList data={trips} renderItem={renderTripItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyTitle}>NO LOG ENTRIES DETECTED</Text></View>} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 11, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 1.5 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 5 },
  sortBtnText: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#10b981' },
  filterBar: { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F1F5F9' },
  filterPillActive: { backgroundColor: '#0e3325', borderColor: '#0e3325' },
  filterText: { fontSize: 9, fontFamily: 'Montserrat_800ExtraBold', color: '#94A3B8' },
  filterTextActive: { color: '#fff' },
  listContent: { padding: 20, paddingBottom: 40 },
  tripCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#0e3325' },
  dateText: { fontSize: 9, fontFamily: 'Montserrat_800ExtraBold', color: '#9CA3AF' },
  cardBody: { gap: 15 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addressText: { flex: 1, fontSize: 14, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325' },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaItem: { gap: 2 },
  metaLabel: { fontSize: 7, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1 },
  metaValue: { fontSize: 10, fontFamily: 'Montserrat_900Black', color: '#0e3325' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 14, fontFamily: 'Montserrat_900Black', color: '#0e3325' }
});
