<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState, useCallback } from 'react';
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
<<<<<<< HEAD
  ActivityIndicator,
  ScrollView, // VERIFIED IMPORT
=======
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Image
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

<<<<<<< HEAD
type SortOrder = 'desc' | 'asc';
type FilterType = 'all' | 'completed' | 'pending' | 'active';

export default function TripsPage() {
  const navigation = useNavigation<any>();
=======
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
  wasteType: string;
  fare: number;
  date: string;
  time: string;
  rating: number;
  status: 'completed';
  pickupType?: 'Instant' | 'Scheduled';
  pickupTime?: string | null;
  customerAvatarUrl?: string | null;
}

export default function TripsPage() {
  const navigation = useNavigation<NavigationProp>();
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilterType>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<PickupFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const openTripDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setDetailsModalVisible(true);
  };

  React.useEffect(() => {
    if (selectedTrip) {
      const updated = allTrips.find(t => t.id === selectedTrip.id);
      if (updated) {
        setSelectedTrip(updated);
      }
    }
  }, [allTrips]);

>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<FilterType>('all');

<<<<<<< HEAD
  useEffect(() => {
    fetchTrips();
  }, [sortOrder, filter]);
=======

  React.useEffect(() => {
    if (user?.id) {
      loadTrips();
    }
  }, [user?.id]);
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c

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

<<<<<<< HEAD
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
=======
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }, [user?.id]);

  React.useEffect(() => {
    if (!user?.id) return;
    const tripsChannel = supabase
      .channel('trips-history-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `rider_id=eq.${user.id}` }, () => {
          loadTrips();
      })
      .subscribe();

    // Listen for customer profile changes (like avatar uploads)
    const profilesChannel = supabase
      .channel('trips-profiles-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
          loadTrips();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(tripsChannel); 
      supabase.removeChannel(profilesChannel);
    };
  }, [user?.id]);

  const filteredTrips = React.useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Ensure we only show trips with 'completed' status, EXCEPT for active Scheduled trips which are Upcoming
    let filtered = allTrips.filter(trip => 
      trip.status === 'completed' || 
      (trip.status === 'active' && trip.pickupType === 'Scheduled') ||
      (trip.status === 'accepted' && trip.pickupType === 'Scheduled')
    );

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
  }, [allTrips, activeDateFilter, activeTypeFilter, searchQuery]);

  const ratedTrips = filteredTrips.filter(t => t.rating > 0);
  const averageRating = ratedTrips.length > 0
    ? (ratedTrips.reduce((sum, trip) => sum + trip.rating, 0) / ratedTrips.length).toFixed(1)
    : '0.0';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const groupedTrips = React.useMemo(() => {
    const groups: { [key: string]: Trip[] } = {};
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    filteredTrips.forEach(trip => {
      let groupTitle = trip.date;
      if (trip.date === today) {
        groupTitle = 'Today';
      } else if (trip.date === yesterday) {
        groupTitle = 'Yesterday';
      } else {
        groupTitle = new Date(trip.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      }

      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(trip);
    });

    return Object.keys(groups).map(title => ({
      title,
      data: groups[title]
    }));
  }, [filteredTrips]);

  const generateReceipt = async (trip: Trip) => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Inter', -apple-system, sans-serif;
                background-color: #f3f4f6;
                padding: 40px;
                color: #111827;
                margin: 0;
                line-height: 1.5;
                -webkit-font-smoothing: antialiased;
              }
              .receipt-card {
                background: #ffffff;
                border-radius: 16px;
                padding: 48px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                max-width: 600px;
                margin: 0 auto;
                border-top: 8px solid #059669;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #f3f4f6;
                padding-bottom: 32px;
                margin-bottom: 32px;
              }
              .brand h1 { margin: 0; font-size: 32px; color: #059669; font-weight: 800; letter-spacing: -0.5px; }
              .brand p { margin: 6px 0 0; font-size: 15px; color: #4b5563; font-weight: 500; }
              .receipt-title { text-align: right; }
              .receipt-title h2 { margin: 0; font-size: 26px; color: #111827; font-weight: 800; letter-spacing: 1px; }
              .receipt-title p { margin: 6px 0 0; font-size: 15px; color: #6b7280; font-weight: 600; letter-spacing: 0.5px; }
              .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; font-weight: 800; margin-bottom: 20px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
              .detail-item { padding: 8px 0; }
              .detail-label { font-size: 13px; color: #6b7280; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
              .detail-value { font-size: 18px; color: #111827; font-weight: 700; word-break: break-word; }
              .full-width { grid-column: span 2; }
              .footer { margin-top: 48px; text-align: center; color: #6b7280; font-size: 15px; border-top: 2px solid #f3f4f6; padding-top: 32px; }
              .footer p { margin: 8px 0; }
            </style>
          </head>
          <body>
            <div class="receipt-card">
              <div class="header">
                <div class="brand">
                  <h1>Borlawura</h1>
                  <p>Waste Management Services</p>
                </div>
                <div class="receipt-title">
                  <h2>RECEIPT</h2>
                  <p>#${trip.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div class="section-title">Trip Details</div>
              <div class="grid">
                <div class="detail-item">
                  <div class="detail-label">Date & Time</div>
                  <div class="detail-value">${formatDate(trip.date)} &bull; ${trip.time}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Customer</div>
                  <div class="detail-value">${trip.customerName}</div>
                </div>
                <div class="detail-item full-width">
                  <div class="detail-label">Pickup Location</div>
                  <div class="detail-value">${trip.pickupLocation}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Waste Type</div>
                  <div class="detail-value">${trip.wasteType}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Service Type</div>
                  <div class="detail-value">${trip.pickupType || 'Instant'}</div>
                </div>
              </div>

              <div class="footer">
                <p><strong>Thank you for choosing Borlawura!</strong></p>
                <p>If you have any questions about this receipt, please contact support.</p>
              </div>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error("Error generating receipt", error);
      alert("Could not generate receipt.");
    }
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    return (
      <View style={[styles.premiumCard, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
             {item.customerAvatarUrl ? (
               <Image source={{ uri: item.customerAvatarUrl }} style={styles.customerAvatarImage} />
             ) : (
               <View style={styles.avatar}>
                 <Text style={styles.avatarText}>{item.customerName?.charAt(0).toUpperCase() || '?'}</Text>
               </View>
             )}
             <View>
               <Text style={styles.customerName}>{item.customerName || 'Unknown Customer'}</Text>
               <Text style={styles.tripDate}>{formatDate(item.date)} • {item.time}</Text>
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
             </View>
             <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </View>
<<<<<<< HEAD
       </View>
    </TouchableOpacity>
  );
=======
          <View style={[styles.statusBadge, (item.status === 'active' || item.status === 'accepted') ? { backgroundColor: '#DBEAFE' } : {}]}>
            <Ionicons 
              name={(item.status === 'active' || item.status === 'accepted') ? 'time' : 'checkmark-circle'} 
              size={14} 
              color={(item.status === 'active' || item.status === 'accepted') ? '#2563EB' : colors.primary} 
            />
            <Text style={[styles.statusText, (item.status === 'active' || item.status === 'accepted') ? { color: '#1E40AF' } : {}]}>
              {(item.status === 'active' || item.status === 'accepted') ? 'Upcoming' : 'Completed'}
            </Text>
          </View>
        </View>

        {/* Pickup Details Card */}
        <View style={styles.detailsContainer}>
          <View style={styles.locationRow}>
            <View style={styles.locationIconBox}>
              <Ionicons name="location" size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationValue} numberOfLines={2}>{item.pickupLocation}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsGrid}>
             <View style={styles.detailItem}>
               <View style={[styles.detailIconWrapper, {backgroundColor: '#FEF3C7', borderColor: '#FDE68A'}]}>
                 <Ionicons name="trash-bin" size={16} color="#B45309" />
               </View>
               <View style={styles.detailTextContent}>
                 <Text style={styles.detailLabel}>Waste Type</Text>
                 <Text style={styles.detailValue} numberOfLines={1}>{item.wasteType}</Text>
               </View>
             </View>
             
             <View style={styles.detailItem}>
               <View style={[styles.detailIconWrapper, {backgroundColor: '#EEF2FF', borderColor: '#E0E7FF'}]}>
                 <Ionicons name={item.pickupType === 'Scheduled' ? 'calendar' : 'flash'} size={16} color="#4338CA" />
               </View>
               <View style={styles.detailTextContent}>
                 <Text style={styles.detailLabel}>Service</Text>
                 <Text style={styles.detailValue}>{item.pickupType || 'Instant'}</Text>
               </View>
             </View>

             <View style={styles.detailItem}>
               <View style={[styles.detailIconWrapper, {backgroundColor: '#ECFDF5', borderColor: '#D1FAE5'}]}>
                 <Ionicons name="star" size={16} color={item.rating ? "#059669" : colors.text.light} />
               </View>
               <View style={styles.detailTextContent}>
                 <Text style={styles.detailLabel}>Rating</Text>
                 <Text style={styles.detailValue}>{item.rating ? item.rating.toFixed(1) : 'Unrated'}</Text>
               </View>
             </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
           <TouchableOpacity style={styles.primaryActionButton} onPress={() => openTripDetails(item)}>
             <Ionicons name="document-text-outline" size={18} color={colors.primaryDark} />
             <Text style={styles.primaryActionText}>Trip Details</Text>
           </TouchableOpacity>
           
           {(item.status === 'active' || item.status === 'accepted') ? (
             <TouchableOpacity 
               style={[styles.secondaryActionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]} 
               onPress={() => navigation.navigate('ActiveTrip' as never, { trip: { id: item.id } } as never)}
             >
               <Ionicons name="navigate" size={18} color="#fff" />
               <Text style={[styles.secondaryActionText, { color: '#fff' }]}>Start Trip</Text>
             </TouchableOpacity>
           ) : (
             <TouchableOpacity style={styles.secondaryActionButton} onPress={() => generateReceipt(item)}>
               <Ionicons name="share-outline" size={18} color={colors.text.secondary} />
               <Text style={styles.secondaryActionText}>Share Receipt</Text>
             </TouchableOpacity>
           )}
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c

  if (loading && !refreshing && allTrips.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={[colors.primary, '#064E3B', colors.backgroundGray]}
          locations={[0, 0.4, 0.7]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTopRow}>
              <Text style={styles.headerTitle}>My Trips</Text>
            </View>
          </SafeAreaView>
        </View>
        <ScrollView style={styles.scrollArea}>
          <View style={{marginTop: 32}}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.skeletonCard, { opacity: 1 - (i * 0.2) }]} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
<<<<<<< HEAD
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
=======
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[colors.primary, '#064E3B', colors.backgroundGray]}
        locations={[0, 0.4, 0.7]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>My Trips</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Glassmorphism Summary Widget */}
      <BlurView intensity={70} tint="light" style={styles.summaryContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.4)' }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
              <Ionicons name="leaf-outline" size={24} color={colors.primaryDark} />
            </View>
            <Text style={styles.statValue}>{filteredTrips.length}</Text>
            <Text style={styles.statLabel}>Completed Pickups</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.4)' }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
              <Ionicons name="star-outline" size={24} color={colors.amber[600]} />
            </View>
            <Text style={styles.statValue}>{averageRating}</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.4)', borderWidth: 1 }]}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            placeholder="Search locations or customers..."
            placeholderTextColor={colors.gray[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </BlurView>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Type Filter Pills */}
        <View style={styles.filterPills}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8}}>
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
          </ScrollView>
        </View>

        {/* Date Filter Pills */}
        <View style={styles.filterPills}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8}}>
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
          </ScrollView>
        </View>



        {filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
             <Ionicons name="receipt-outline" size={64} color={colors.gray[300]} />
             <Text style={styles.emptyStateLabel}>No trips found</Text>
             <Text style={styles.emptyStateSub}>Try adjusting your filters or search query.</Text>
          </View>
        ) : (
          groupedTrips.map(section => (
            <View key={section.title} style={styles.sectionContainer}>
               <Text style={styles.sectionTitle}>{section.title}</Text>
               {section.data.map(trip => <React.Fragment key={trip.id}>{renderTripItem({item: trip})}</React.Fragment>)}
            </View>
          ))
        )}
      </ScrollView>

      {/* Trip Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Trip Summary</Text>
               <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={styles.closeButton}>
                 <Ionicons name="close" size={24} color={colors.text.secondary} />
               </TouchableOpacity>
             </View>
             
             {selectedTrip && (
               <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                 <View style={styles.modalTripIdBlock}>
                   <Text style={styles.modalTripIdLabel}>TRIP ID</Text>
                   <Text style={styles.modalTripIdValue}>#{selectedTrip.id.substring(0, 8).toUpperCase()}</Text>
                 </View>

                 <View style={styles.modalCustomerBlock}>
                    {selectedTrip.customerAvatarUrl ? (
                      <Image source={{ uri: selectedTrip.customerAvatarUrl }} style={styles.modalAvatarLargeImage} />
                    ) : (
                      <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>{selectedTrip.customerName?.charAt(0).toUpperCase() || '?'}</Text>
                      </View>
                    )}
                    <View style={{flex: 1}}>
                      <Text style={styles.modalCustomerName}>{selectedTrip.customerName || 'Unknown Customer'}</Text>
                      <Text style={styles.modalDate}>{formatDate(selectedTrip.date)} at {selectedTrip.time}</Text>
                    </View>
                    <View style={[styles.statusBadge, (selectedTrip.status === 'active' || selectedTrip.status === 'accepted') ? { backgroundColor: '#DBEAFE' } : {}]}>
                      <Ionicons 
                        name={(selectedTrip.status === 'active' || selectedTrip.status === 'accepted') ? 'time' : 'checkmark-circle'} 
                        size={14} 
                        color={(selectedTrip.status === 'active' || selectedTrip.status === 'accepted') ? '#2563EB' : colors.primary} 
                      />
                      <Text style={[styles.statusText, (selectedTrip.status === 'active' || selectedTrip.status === 'accepted') ? { color: '#1E40AF' } : {}]}>
                        {(selectedTrip.status === 'active' || selectedTrip.status === 'accepted') ? 'Upcoming' : 'Completed'}
                      </Text>
                    </View>
                 </View>

                 <View style={styles.modalDivider} />

                 <Text style={styles.modalSectionTitle}>Pickup Information</Text>

                 <View style={styles.modalDetailRow}>
                   <View style={styles.modalDetailIconWrapper}>
                     <Ionicons name="location" size={20} color={colors.primary} />
                   </View>
                   <View style={styles.modalDetailTextContent}>
                     <Text style={styles.modalDetailLabel}>Address</Text>
                     <Text style={styles.modalDetailValue}>{selectedTrip.pickupLocation}</Text>
                   </View>
                 </View>

                 <View style={styles.modalDetailRow}>
                   <View style={styles.modalDetailIconWrapper}>
                     <Ionicons name="trash-bin" size={20} color={colors.text.secondary} />
                   </View>
                   <View style={styles.modalDetailTextContent}>
                     <Text style={styles.modalDetailLabel}>Waste Type</Text>
                     <Text style={styles.modalDetailValue}>{selectedTrip.wasteType}</Text>
                   </View>
                 </View>
                 
                 <View style={styles.modalDetailRow}>
                   <View style={styles.modalDetailIconWrapper}>
                     <Ionicons name="calendar" size={20} color={colors.text.secondary} />
                   </View>
                   <View style={styles.modalDetailTextContent}>
                     <Text style={styles.modalDetailLabel}>Service Type</Text>
                     <Text style={styles.modalDetailValue}>{selectedTrip.pickupType || 'Instant'}</Text>
                   </View>
                 </View>

                 <View style={styles.modalDetailRow}>
                   <View style={styles.modalDetailIconWrapper}>
                     <Ionicons name="star" size={20} color={selectedTrip.rating ? colors.warning : colors.gray[300]} />
                   </View>
                   <View style={styles.modalDetailTextContent}>
                     <Text style={styles.modalDetailLabel}>Customer Rating</Text>
                     <Text style={styles.modalDetailValue}>{selectedTrip.rating ? `${selectedTrip.rating.toFixed(1)} / 5.0` : 'No rating given'}</Text>
                   </View>
                 </View>

               </ScrollView>
             )}
             
             <View style={styles.modalFooter}>
               <TouchableOpacity style={styles.modalPrimaryButton} onPress={() => setDetailsModalVisible(false)}>
                 <Text style={styles.modalPrimaryButtonText}>Close Details</Text>
               </TouchableOpacity>
               
               {selectedTrip && (
                 (selectedTrip.status === 'active' || selectedTrip.status === 'accepted') ? (
                   <TouchableOpacity 
                     style={[styles.secondaryActionButton, { marginTop: 12, backgroundColor: colors.primary, borderColor: colors.primary }]} 
                     onPress={() => {
                       setDetailsModalVisible(false);
                       navigation.navigate('ActiveTrip' as never, { trip: { id: selectedTrip.id } } as never);
                     }}
                   >
                     <Ionicons name="navigate" size={18} color="#fff" />
                     <Text style={[styles.secondaryActionText, { color: '#fff' }]}>Start Trip Tracking</Text>
                   </TouchableOpacity>
                 ) : (
                   <TouchableOpacity style={[styles.secondaryActionButton, { marginTop: 12 }]} onPress={() => generateReceipt(selectedTrip)}>
                     <Ionicons name="print-outline" size={18} color={colors.text.secondary} />
                     <Text style={styles.secondaryActionText}>Print Receipt</Text>
                   </TouchableOpacity>
                 )
               )}
             </View>
          </View>
        </BlurView>
      </Modal>
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'sans-serif-medium',
    fontWeight: '800',
    color: '#ffffff',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerProfileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  headerProfileImage: {
    width: '100%',
    height: '100%',
  },
  headerProfileInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  summaryContainer: {
    marginHorizontal: 24,
    marginTop: -24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    marginBottom: 16,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  pillBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  skeletonCard: {
    backgroundColor: '#E5E7EB',
    height: 140,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 24,
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.emerald[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.emerald[700],
  },
  customerAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
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
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 6,
  },
  detailsContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.emerald[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  detailIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginRight: 8,
  },
  detailTextContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 16,
    gap: 12,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald[50],
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryActionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryActionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    paddingHorizontal: 24,
  },
  emptyStateLabel: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyStateSub: {
    marginTop: 8,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
    backgroundColor: colors.gray[100],
    borderRadius: 16,
  },
  modalBody: {
    padding: 24,
  },
  modalTripIdBlock: {
    backgroundColor: colors.gray[50],
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalTripIdLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.light,
    marginBottom: 2,
  },
  modalTripIdValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 1,
  },
  modalCustomerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.emerald[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.emerald[700],
  },
  modalAvatarLargeImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  modalCustomerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  modalDetailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  modalDetailTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  modalDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  modalDetailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 22,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  modalPrimaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  }
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
});
