import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { supabase } from '../../lib/supabase';
import { fetchTrips } from '../../lib/api';

import { useAuth } from '../../contexts/AuthContext';

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DateFilterType = 'all' | 'today' | 'week' | 'month';
type PickupFilterType = 'all' | 'instant' | 'scheduled';

interface Trip {
  id: string;
  customerName: string;
  pickupLocation: string;
  dropLocation: string;
  wasteType: string;
  fare: number;
  date: string;
  time: string;
  rating: number;
  status: 'completed';
  pickupType?: 'Instant' | 'Scheduled';
  pickupTime?: string | null;
}

export default function TripsPage() {
  const navigation = useNavigation<NavigationProp>();
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilterType>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<PickupFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  React.useEffect(() => {
    if (user?.id) {
      loadTrips();
    }
  }, [user?.id]);

  const loadTrips = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchTrips(user.id);
      // @ts-ignore
      setAllTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!user?.id) return;
    const tripsChannel = supabase
      .channel('trips-history-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `rider_id=eq.${user.id}` }, () => {
          loadTrips();
      })
      .subscribe();

    return () => { supabase.removeChannel(tripsChannel); };
  }, [user?.id]);

  const filterTrips = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Ensure we only show trips with 'completed' status
    let filtered = allTrips.filter(trip => trip.status === 'completed');

    if (activeDateFilter === 'today') {
      filtered = filtered.filter(trip => trip.date === todayStr);
    } else if (activeDateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(trip => new Date(trip.date) >= weekAgo);
    } else if (activeDateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(trip => new Date(trip.date) >= monthAgo);
    }

    if (activeTypeFilter === 'instant') {
      filtered = filtered.filter(trip => trip.pickupType === 'Instant');
    } else if (activeTypeFilter === 'scheduled') {
      filtered = filtered.filter(trip => trip.pickupType === 'Scheduled');
    }

    if (searchQuery) {
      filtered = filtered.filter(trip =>
        (trip.customerName && trip.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trip.pickupLocation && trip.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trip.wasteType && trip.wasteType.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filtered;
  };

  const filteredTrips = filterTrips();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    return (
      <View style={styles.premiumCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
             <View style={styles.avatar}>
               <Text style={styles.avatarText}>{item.customerName.charAt(0).toUpperCase()}</Text>
             </View>
             <View>
               <Text style={styles.customerName}>{item.customerName}</Text>
               <Text style={styles.tripDate}>{formatDate(item.date)}, {item.time}</Text>
             </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={[styles.badgeWrapper, item.pickupType === 'Scheduled' && styles.scheduledBadge]}>
              <Text style={[styles.wasteBadgeText, item.pickupType === 'Scheduled' && styles.scheduledBadgeText]}>
                {item.pickupType === 'Scheduled' ? '📅 Scheduled' : '⚡ Instant'}
              </Text>
            </View>
            <View style={styles.badgeWrapper}>
              <Text style={styles.wasteBadgeText}>{item.wasteType}</Text>
            </View>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeLine}>
            <View style={styles.routeDotTop} />
            <View style={styles.routeConnector} />
            <View style={styles.routeDotBottom} />
          </View>
          
          <View style={styles.routeDetails}>
            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>Picked up from</Text>
              <Text style={styles.locationValue} numberOfLines={1}>{item.pickupLocation}</Text>
            </View>
            <View style={styles.locationBlockBottom}>
              <Text style={styles.locationLabel}>Dropped off at</Text>
              <Text style={styles.locationValue} numberOfLines={1}>{item.dropLocation}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const dateFilters: DateFilterType[] = ['all', 'today', 'week', 'month'];
  const typeFilters: { id: PickupFilterType; label: string }[] = [
    { id: 'all', label: 'All Pickups' },
    { id: 'instant', label: '⚡ Instant' },
    { id: 'scheduled', label: '📅 Scheduled' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips History</Text>
      </View>

      {/* Summary Widget */}
      <View style={styles.summaryContainer}>
        <View style={styles.totalTripsWidget}>
          <View>
            <Text style={styles.summaryLabel}>Total Completed</Text>
            <Text style={styles.summaryCount}>{filteredTrips.length}</Text>
          </View>
          <Ionicons name="checkmark-done-circle" size={48} color={colors.primary} style={{ opacity: 0.2 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            placeholder="Search locations or customers..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {/* Type Filter Pills */}
        <View style={styles.filterPills}>
          {typeFilters.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setActiveTypeFilter(f.id)}
              style={[styles.pillBtn, activeTypeFilter === f.id && styles.pillBtnActive]}
            >
              <Text style={[styles.pillText, activeTypeFilter === f.id && styles.pillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Filter Pills */}
        <View style={styles.filterPills}>
          {dateFilters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveDateFilter(f)}
              style={[styles.pillBtn, activeDateFilter === f && styles.pillBtnActive]}
            >
              <Text style={[styles.pillText, activeDateFilter === f && styles.pillTextActive]}>
                {f === 'all' ? 'All Time' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
             <Ionicons name="book-outline" size={64} color={colors.gray[300]} />
             <Text style={styles.emptyStateLabel}>No trips found</Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={filteredTrips}
            renderItem={renderTripItem}
            keyExtractor={(i) => i.id}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'sans-serif-medium',
    fontWeight: '800',
    color: '#111827',
  },
  summaryContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  totalTripsWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLighter,
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  scrollArea: {
    flex: 1,
  },
  filterPills: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  pillBtnActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.amber[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.amber[600],
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  tripDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeWrapper: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  wasteBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  scheduledBadge: {
    backgroundColor: '#EEF2FF', // light indigo
    borderColor: '#C7D2FE',
    borderWidth: 1,
  },
  scheduledBadgeText: {
    color: '#4F46E5', // indigo
  },
  routeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 16,
  },
  routeDotTop: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.blue[500],
    borderWidth: 3,
    borderColor: colors.blue[100],
  },
  routeConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  routeDotBottom: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  routeDetails: {
    flex: 1,
  },
  locationBlock: {
    marginBottom: 16,
  },
  locationBlockBottom: {},
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyStateLabel: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[400],
  }
});
