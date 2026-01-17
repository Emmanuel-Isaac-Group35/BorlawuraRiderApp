import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';
import { fetchTrips } from '../../lib/api';

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterType = 'all' | 'today' | 'week' | 'month';

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
}

export default function TripsPage() {
  const navigation = useNavigation<NavigationProp>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await fetchTrips();
      // @ts-ignore - mismatch in status string literal type vs generic string
      setAllTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTrips = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let filtered = allTrips;

    if (activeFilter === 'today') {
      filtered = filtered.filter(trip => trip.date === todayStr);
    } else if (activeFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(trip => new Date(trip.date) >= weekAgo);
    } else if (activeFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(trip => new Date(trip.date) >= monthAgo);
    }

    if (searchQuery) {
      filtered = filtered.filter(trip =>
        trip.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.wasteType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTrips = filterTrips();

  const getTotalEarnings = () => {
    return filteredTrips.reduce((sum, trip) => sum + trip.fare, 0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const toggleTripExpansion = (tripId: string) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    const isExpanded = expandedTrip === item.id;

    return (
      <View style={styles.tripCard}>
        <TouchableOpacity
          onPress={() => toggleTripExpansion(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.tripHeader}>
            <View style={styles.tripHeaderLeft}>
              <View style={styles.customerIcon}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.tripInfo}>
                <Text style={styles.customerName}>{item.customerName}</Text>
                <Text style={styles.tripDate}>
                  {formatDate(item.date)} • {item.time}
                </Text>
              </View>
            </View>
            <View style={styles.tripHeaderRight}>
              <Text style={styles.tripFare}>GH₵ {item.fare.toFixed(2)}</Text>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < item.rating ? 'star' : 'star-outline'}
                    size={12}
                    color={i < item.rating ? '#facc15' : colors.gray[300]}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.pickupLocation}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.pickupLocation}
            </Text>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.dropLocation}>
                <Ionicons name="business-outline" size={16} color={colors.blue[600]} />
                <View style={styles.dropLocationText}>
                  <Text style={styles.dropLocationLabel}>Drop Location</Text>
                  <Text style={styles.dropLocationValue}>{item.dropLocation}</Text>
                </View>
              </View>
              <View style={styles.wasteTypeRow}>
                <Ionicons name="trash-outline" size={16} color={colors.amber[600]} />
                <Text style={styles.wasteTypeLabel}>Waste Type: </Text>
                <Text style={styles.wasteTypeValue}>{item.wasteType}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const filters: FilterType[] = ['all', 'today', 'week', 'month'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Trip History</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.homeButton}
          >
            <Ionicons name="home-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
          <TextInput
            placeholder="Search trips..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.summaryCard}
        >
          <View>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
            <Text style={styles.summaryAmount}>GH₵ {getTotalEarnings().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>Trips</Text>
            <Text style={styles.summaryAmount}>{filteredTrips.length}</Text>
          </View>
        </LinearGradient>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="file-tray-outline" size={48} color={colors.gray[400]} />
            </View>
            <Text style={styles.emptyTitle}>No trips found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or search query
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTrips}
            renderItem={renderTripItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLighter,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  homeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  tripHeaderRight: {
    alignItems: 'flex-end',
  },
  tripFare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  pickupLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    gap: 8,
  },
  dropLocation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dropLocationText: {
    flex: 1,
  },
  dropLocationLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  dropLocationValue: {
    fontSize: 12,
    color: colors.text.primary,
  },
  wasteTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wasteTypeLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  wasteTypeValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
  },
  separator: {
    height: 12,
  },
});







