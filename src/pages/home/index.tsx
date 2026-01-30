import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';
import { Modal } from '../../components/common/Modal';
import { Toast } from '../../components/common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { fetchStats, toggleOnlineStatus } from '../../lib/api';
import { useEffect } from 'react';
import { Alert } from 'react-native';

type RootStackParamList = {
  MainTabs: undefined;
  Request: undefined;
  Profile: undefined;
  Earnings: undefined;
  Trips: undefined;
  Support: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomePage() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weeklyEarnings: 0,
    todayTrips: 0,
    rating: 5.0,
  });
  const [isOnline, setIsOnline] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setIsOnline(profile.is_online);
      setStats(prev => ({ ...prev, rating: Number(profile.rating) }));
    }
  }, [profile]);

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
      setShowConfirmModal(true);
    } else {
      updateOnlineStatus(false);
    }
  };

  const updateOnlineStatus = async (status: boolean) => {
    if (!user) return;
    try {
      await toggleOnlineStatus(user.id, status);
      setIsOnline(status);
      if (status) {
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
          navigation.navigate('Request');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating online status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const confirmGoOnline = () => {
    setShowConfirmModal(false);
    updateOnlineStatus(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerSubtitle}>Welcome back,</Text>
            <Text style={styles.headerTitle}>Kwame Owusu</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileButton}
          >
            <Ionicons name="person-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Online/Offline Toggle */}
        <View style={styles.card}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Work Status</Text>
            <Text
              style={[
                styles.statusText,
                { color: isOnline ? colors.primary : colors.text.light },
              ]}
            >
              {isOnline ? "You're Online" : "You're Offline"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleToggleOnline}
            style={[
              styles.toggleButton,
              {
                backgroundColor: isOnline ? colors.gray[200] : colors.primary,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isOnline ? 'pause-circle-outline' : 'play-circle-outline'}
              size={20}
              color={isOnline ? colors.text.primary : '#ffffff'}
            />
            <Text
              style={[
                styles.toggleButtonText,
                { color: isOnline ? colors.text.primary : '#ffffff' },
              ]}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>

          {isOnline && (
            <View style={styles.waitingContainer}>
              <View style={styles.pulseDot} />
              <Text style={styles.waitingText}>
                Waiting for pickup requests...
              </Text>
            </View>
          )}
        </View>

        {/* Earnings Summary */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.earningsCard}
        >
          <Text style={styles.earningsLabel}>Today's Earnings</Text>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsAmount}>
              GH₵ {stats.todayEarnings.toFixed(2)}
            </Text>
            <View style={styles.earningsRight}>
              <Text style={styles.earningsSubLabel}>Trips</Text>
              <Text style={styles.earningsTrips}>{stats.todayTrips}</Text>
            </View>
          </View>
          <View style={styles.weeklyContainer}>
            <View>
              <Text style={styles.weeklyLabel}>This Week</Text>
              <Text style={styles.weeklyAmount}>
                GH₵ {stats.weeklyEarnings.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Earnings')}
              style={styles.viewDetailsButton}
              activeOpacity={0.8}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Performance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="star" size={20} color="#facc15" />
              </View>
              <Text style={styles.performanceValue}>{stats.rating}</Text>
              <Text style={styles.performanceLabel}>Rating</Text>
            </View>
            <View style={styles.performanceItem}>
              <View style={[styles.iconCircle, { backgroundColor: colors.blue[100] }]}>
                <Ionicons name="location" size={20} color={colors.blue[600]} />
              </View>
              <Text style={styles.performanceValue}>156</Text>
              <Text style={styles.performanceLabel}>Total Trips</Text>
            </View>
            <View style={styles.performanceItem}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              </View>
              <Text style={styles.performanceValue}>98%</Text>
              <Text style={styles.performanceLabel}>Acceptance</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontSize: 14 }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Trips')}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.blue[100] }]}>
                <Ionicons name="time-outline" size={20} color={colors.blue[600]} />
              </View>
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Trips')}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="map-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Routes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Support')}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.amber[100] }]}>
                <Ionicons name="help-circle-outline" size={20} color={colors.amber[600]} />
              </View>
              <Text style={styles.actionLabel}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb-outline" size={20} color="#ffffff" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Peak hours are 7-9 AM and 5-7 PM. Go online during these times to
              earn bonus payments!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Online Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        showCloseButton={false}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalIcon}>
            <Ionicons name="play-circle" size={48} color={colors.primary} />
          </View>
          <Text style={styles.modalTitle}>Go Online?</Text>
          <Text style={styles.modalText}>
            You'll start receiving pickup requests. Make sure you're ready to
            accept trips.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={() => setShowConfirmModal(false)}
              style={[styles.modalButton, styles.modalButtonCancel]}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmGoOnline}
              style={[styles.modalButton, styles.modalButtonConfirm]}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Online Notification */}
      <Toast
        visible={showNotification}
        message="You're Now Online!"
        subtitle="Waiting for pickup requests..."
        type="success"
        onHide={() => setShowNotification(false)}
      />
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  waitingContainer: {
    marginTop: 16,
    backgroundColor: colors.primaryLighter,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  waitingText: {
    fontSize: 14,
    color: colors.primaryDark,
  },
  earningsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  earningsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  earningsRight: {
    alignItems: 'flex-end',
  },
  earningsSubLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  earningsTrips: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  weeklyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  weeklyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  viewDetailsButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    minWidth: 90,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
  tipCard: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[100],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue[600],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.gray[200],
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});







