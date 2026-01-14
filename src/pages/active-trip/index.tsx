import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';
import { Toast } from '../../components/common/Toast';

type RootStackParamList = {
  MainTabs: undefined;
  TripComplete: undefined;
  Support: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

type TripStatus = 'driving_to_pickup' | 'arrived_at_pickup' | 'waste_collected' | 'driving_to_disposal' | 'arrived_at_disposal';

export default function ActiveTripPage() {
  const navigation = useNavigation<NavigationProp>();
  const [currentStatus, setCurrentStatus] = useState<TripStatus>('driving_to_pickup');
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showDisposalSites, setShowDisposalSites] = useState(false);
  const [showSiteNotification, setShowSiteNotification] = useState(false);
  const [selectedSite, setSelectedSite] = useState('');

  const tripData = {
    customerName: 'Kwame Mensah',
    pickupLocation: 'Osu Oxford Street, Accra',
    wasteType: 'General Waste',
    estimatedFare: 25.00,
    pickupCoordinates: { lat: 5.5557, lng: -0.1969 }
  };

  const disposalSites = [
    { name: 'Kpone Landfill Site', distance: 3.2, address: 'Kpone, Greater Accra' },
    { name: 'Tema Waste Transfer Station', distance: 5.8, address: 'Community 1, Tema' },
    { name: 'Accra Compost Plant', distance: 7.1, address: 'Adjen Kotoku, Accra' }
  ];

  const statusSteps = [
    { key: 'driving_to_pickup', label: 'Driving to Pickup', icon: 'car-outline' },
    { key: 'arrived_at_pickup', label: 'Arrived at Pickup', icon: 'location-outline' },
    { key: 'waste_collected', label: 'Waste Collected', icon: 'checkmark-circle-outline' },
    { key: 'driving_to_disposal', label: 'Driving to Disposal', icon: 'car-sport-outline' },
    { key: 'arrived_at_disposal', label: 'Arrived at Disposal', icon: 'business-outline' }
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === currentStatus);
  };

  const handleNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < statusSteps.length - 1) {
      setCurrentStatus(statusSteps[currentIndex + 1].key as TripStatus);
    } else {
      navigation.navigate('TripComplete');
    }
  };

  const getButtonText = () => {
    switch (currentStatus) {
      case 'driving_to_pickup':
        return 'Arrived at Pickup';
      case 'arrived_at_pickup':
        return 'Waste Collected';
      case 'waste_collected':
        return 'Driving to Disposal';
      case 'driving_to_disposal':
        return 'Arrived at Disposal';
      case 'arrived_at_disposal':
        return 'Complete Trip';
      default:
        return 'Next';
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:+233501234567');
    setShowContactMenu(false);
  };

  const handleMessage = () => {
    Linking.openURL('sms:+233501234567');
    setShowContactMenu(false);
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${tripData.pickupCoordinates.lat},${tripData.pickupCoordinates.lng}`;
    Linking.openURL(url);
  };

  const handleDisposalSiteSelect = (site: typeof disposalSites[0]) => {
    setShowDisposalSites(false);
    setSelectedSite(site.name);
    setShowSiteNotification(true);
    
    setTimeout(() => {
      setShowSiteNotification(false);
    }, 3000);
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
          <Text style={styles.headerTitle}>Active Trip</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>In Progress</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Steps */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontSize: 14 }]}>Trip Progress</Text>
          <View style={styles.stepsContainer}>
            {statusSteps.map((step, index) => {
              const isCompleted = index < getCurrentStepIndex();
              const isCurrent = index === getCurrentStepIndex();
              const isPending = index > getCurrentStepIndex();

              return (
                <View key={step.key} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepIcon,
                      isCompleted && styles.stepIconCompleted,
                      isCurrent && styles.stepIconCurrent,
                      isPending && styles.stepIconPending,
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={
                        isCompleted
                          ? '#ffffff'
                          : isCurrent
                          ? colors.primary
                          : colors.text.light
                      }
                    />
                  </View>
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        (isCompleted || isCurrent) && styles.stepLabelActive,
                        isPending && styles.stepLabelPending,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.stepStatus}>Current step</Text>
                    )}
                  </View>
                  {isCompleted && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <View style={styles.customerHeader}>
            <View style={styles.customerLeft}>
              <View style={styles.customerIcon}>
                <Ionicons name="person-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{tripData.customerName}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#facc15" />
                  <Text style={styles.rating}>4.8</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowContactMenu(!showContactMenu)}
              style={styles.contactButton}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={20} color={colors.blue[600]} />
            </TouchableOpacity>
          </View>

          {/* Contact Menu */}
          {showContactMenu && (
            <View style={styles.contactMenu}>
              <TouchableOpacity
                onPress={handleCall}
                style={styles.contactMenuItem}
                activeOpacity={0.7}
              >
                <View style={styles.contactMenuIcon}>
                  <Ionicons name="call" size={16} color={colors.blue[600]} />
                </View>
                <Text style={styles.contactMenuText}>Call Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMessage}
                style={styles.contactMenuItem}
                activeOpacity={0.7}
              >
                <View style={[styles.contactMenuIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="chatbubble" size={16} color={colors.primary} />
                </View>
                <Text style={styles.contactMenuText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Location Info */}
          <View style={styles.locationRow}>
            <View style={[styles.locationIcon, { backgroundColor: colors.blue[100] }]}>
              <Ionicons name="location-outline" size={20} color={colors.blue[600]} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationValue}>{tripData.pickupLocation}</Text>
            </View>
          </View>
        </View>

        {/* Waste Type & Fare */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: colors.amber[100] }]}>
              <Ionicons name="trash-outline" size={20} color={colors.amber[600]} />
            </View>
            <Text style={styles.infoLabel}>Waste Type</Text>
            <Text style={styles.infoValue}>{tripData.wasteType}</Text>
          </View>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={[styles.infoCard, styles.fareCard]}
          >
            <View style={styles.infoIconWhite}>
              <Ionicons name="cash-outline" size={20} color="#ffffff" />
            </View>
            <Text style={styles.infoLabelWhite}>Fare</Text>
            <Text style={styles.infoValueWhite}>
              GH₵ {tripData.estimatedFare.toFixed(2)}
            </Text>
          </LinearGradient>
        </View>

        {/* Navigation & Disposal Sites */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={handleNavigate}
            style={styles.navigateButton}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={20} color="#ffffff" />
            <Text style={styles.navigateButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>

          {(currentStatus === 'waste_collected' ||
            currentStatus === 'driving_to_disposal') && (
            <TouchableOpacity
              onPress={() => setShowDisposalSites(!showDisposalSites)}
              style={styles.disposalButton}
              activeOpacity={0.8}
            >
              <Ionicons name="business-outline" size={20} color={colors.primary} />
              <Text style={styles.disposalButtonText}>View Disposal Sites</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Disposal Sites List */}
        {showDisposalSites && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontSize: 14 }]}>
              Nearby Disposal Sites
            </Text>
            <View style={styles.sitesList}>
              {disposalSites.map((site, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDisposalSiteSelect(site)}
                  style={styles.siteItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.siteIcon}>
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.siteInfo}>
                    <Text style={styles.siteName}>{site.name}</Text>
                    <Text style={styles.siteAddress}>{site.address}</Text>
                  </View>
                  <Text style={styles.siteDistance}>{site.distance} km</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Help Alert */}
        <View style={styles.helpCard}>
          <View style={styles.helpIcon}>
            <Ionicons name="information-circle-outline" size={18} color={colors.amber[600]} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              Contact support if you encounter any issues during the trip.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Support')}
              activeOpacity={0.7}
            >
              <Text style={styles.helpLink}>Contact Support →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Site Selection Notification */}
      <Toast
        visible={showSiteNotification}
        message="Disposal Site Selected"
        subtitle={selectedSite}
        type="success"
        onHide={() => setShowSiteNotification(false)}
      />

      {/* Action Button */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={handleNextStep}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          <Text style={styles.nextButtonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  stepsContainer: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconCompleted: {
    backgroundColor: colors.primary,
  },
  stepIconCurrent: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  stepIconPending: {
    backgroundColor: colors.gray[100],
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  stepLabelActive: {
    color: colors.text.primary,
  },
  stepLabelPending: {
    color: colors.text.light,
  },
  stepStatus: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  customerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactMenu: {
    backgroundColor: colors.blue[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  contactMenuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactMenuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactMenuText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fareCard: {
    padding: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  infoLabelWhite: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  infoValueWhite: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionContainer: {
    gap: 12,
    marginBottom: 16,
  },
  navigateButton: {
    backgroundColor: colors.blue[600],
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disposalButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disposalButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  sitesList: {
    gap: 8,
  },
  siteItem: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  siteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  siteAddress: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  siteDistance: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  helpCard: {
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.amber[100],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  helpLink: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});







