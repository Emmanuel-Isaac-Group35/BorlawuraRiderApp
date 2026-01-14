import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../../utils/colors';
import Svg, { Circle } from 'react-native-svg';

type RootStackParamList = {
  MainTabs: undefined;
  ActiveTrip: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function RequestPage() {
  const navigation = useNavigation<NavigationProp>();
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAccepting, setIsAccepting] = useState(false);
  const hasDeclinedRef = useRef(false);

  const request = {
    customerName: 'Kwame Mensah',
    pickupLocation: 'Osu Oxford Street, Accra',
    wasteType: 'General Waste',
    estimatedFare: 25.00,
    distance: 2.3,
    coordinates: { lat: 5.5557, lng: -0.1969 }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasDeclinedRef.current) {
      hasDeclinedRef.current = true;
      handleDecline();
    }
  }, [timeLeft]);

  const handleAccept = () => {
    setIsAccepting(true);
    setTimeout(() => {
      navigation.navigate('ActiveTrip');
    }, 800);
  };

  const handleDecline = () => {
    if (!hasDeclinedRef.current) {
      hasDeclinedRef.current = true;
    }
    navigation.goBack();
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${request.coordinates.lat},${request.coordinates.lng}`;
    Linking.openURL(url);
  };

  const progress = (15 - timeLeft) / 15;
  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>New Pickup Request</Text>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={18} color="#ffffff" />
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Ring */}
        <View style={styles.timerContainer}>
          <View style={styles.timerRing}>
            <Svg width={128} height={128}>
              <Circle
                cx={64}
                cy={64}
                r={56}
                stroke={colors.gray[200]}
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx={64}
                cy={64}
                r={56}
                stroke={colors.primary}
                strokeWidth={8}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 64 64)`}
              />
            </Svg>
            <View style={styles.timerContent}>
              <Text style={styles.timerValue}>{timeLeft}</Text>
              <Text style={styles.timerLabel}>seconds</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <View style={styles.customerHeader}>
            <View style={styles.customerIcon}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{request.customerName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#facc15" />
                <Text style={styles.rating}>4.8</Text>
              </View>
            </View>
          </View>

          {/* Pickup Location */}
          <View style={styles.locationRow}>
            <View style={[styles.locationIcon, { backgroundColor: colors.blue[100] }]}>
              <Ionicons name="location-outline" size={20} color={colors.blue[600]} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationValue}>{request.pickupLocation}</Text>
              <Text style={styles.distance}>{request.distance} km away</Text>
            </View>
          </View>

          {/* Waste Type */}
          <View style={styles.locationRow}>
            <View style={[styles.locationIcon, { backgroundColor: colors.amber[100] }]}>
              <Ionicons name="trash-outline" size={20} color={colors.amber[600]} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Waste Type</Text>
              <Text style={styles.locationValue}>{request.wasteType}</Text>
            </View>
          </View>
        </View>

        {/* Fare Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.fareCard}
        >
          <Text style={styles.fareLabel}>Estimated Fare</Text>
          <View style={styles.fareRow}>
            <Text style={styles.fareAmount}>
              GH₵ {request.estimatedFare.toFixed(2)}
            </Text>
            <View style={styles.fareRight}>
              <Text style={styles.fareSubLabel}>Distance</Text>
              <Text style={styles.fareDistance}>{request.distance} km</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Map Preview */}
        <View style={styles.card}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: request.coordinates.lat,
                longitude: request.coordinates.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: request.coordinates.lat,
                  longitude: request.coordinates.lng,
                }}
              />
            </MapView>
            <TouchableOpacity
              onPress={handleNavigate}
              style={styles.navigateButton}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={18} color={colors.primary} />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Alert */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle-outline" size={18} color={colors.blue[600]} />
          </View>
          <Text style={styles.infoText}>
            Accepting this request means you commit to picking up the waste
            within 30 minutes.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={handleDecline}
          disabled={isAccepting}
          style={[styles.actionButton, styles.declineButton]}
          activeOpacity={0.8}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAccept}
          disabled={isAccepting}
          style={[styles.actionButton, styles.acceptButton, isAccepting && styles.acceptButtonDisabled]}
          activeOpacity={0.8}
        >
          {isAccepting ? (
            <>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.acceptButtonText}>Accepting...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </>
          )}
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
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  timerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  timerRing: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timerLabel: {
    fontSize: 12,
    color: colors.text.secondary,
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
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  locationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: colors.primary,
  },
  fareCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fareLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  fareRight: {
    alignItems: 'flex-end',
  },
  fareSubLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  fareDistance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  mapContainer: {
    height: 192,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  navigateButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[100],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue[100],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
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
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  declineButton: {
    backgroundColor: colors.gray[200],
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  acceptButtonDisabled: {
    opacity: 0.5,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});







