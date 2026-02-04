import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Mock User Location (Destination) - e.g., Accra Mall
const USER_LOCATION = {
    latitude: 5.6227,
    longitude: -0.1733,
    address: 'Accra Mall, Accra',
};

export default function TrackingPage() {
    const mapRef = useRef<MapView>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    useEffect(() => {
        let subscription: Location.LocationSubscription;

        const startWatching = async () => {
            if (isTracking) {
                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 2000,
                        distanceInterval: 5,
                    },
                    (newLocation) => {
                        setLocation(newLocation);

                        // Animate map to new location
                        if (mapRef.current) {
                            mapRef.current.animateToRegion({
                                latitude: newLocation.coords.latitude,
                                longitude: newLocation.coords.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }, 1000);
                        }
                    }
                );
            }
        };

        startWatching();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [isTracking]);

    const toggleTracking = () => {
        setIsTracking(!isTracking);
    };

    if (errorMsg) {
        return (
            <View style={styles.centerContainer}>
                <Text>{errorMsg}</Text>
            </View>
        )
    }

    if (!location) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Fetching Location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={true}
            >
                {/* User/Destination Marker */}
                <Marker
                    coordinate={{
                        latitude: USER_LOCATION.latitude,
                        longitude: USER_LOCATION.longitude,
                    }}
                    title="User Location"
                    description={USER_LOCATION.address}
                >
                    <View style={styles.destinationMarker}>
                        <Ionicons name="person" size={20} color="white" />
                    </View>
                </Marker>

                {/* Directions Polyline */}
                <Polyline
                    coordinates={[
                        { latitude: location.coords.latitude, longitude: location.coords.longitude },
                        { latitude: USER_LOCATION.latitude, longitude: USER_LOCATION.longitude },
                    ]}
                    strokeColor={colors.primary}
                    strokeWidth={3}
                    lineDashPattern={[5, 5]}
                />
            </MapView>

            {/* Overlay UI */}
            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Live Tracking</Text>
                </View>

                <View style={styles.bottomCard}>
                    <View style={styles.tripInfo}>
                        <View style={styles.locationRow}>
                            <Ionicons name="radio-button-on" size={20} color={colors.primary} />
                            <View style={styles.locationTextContainer}>
                                <Text style={styles.locationLabel}>Current Location</Text>
                                <Text style={styles.locationValue}>Moving Rider</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={20} color={colors.blue[600]} />
                            <View style={styles.locationTextContainer}>
                                <Text style={styles.locationLabel}>Destination</Text>
                                <Text style={styles.locationValue}>{USER_LOCATION.address}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.trackButton, isTracking ? styles.stopButton : styles.startButton]}
                        onPress={toggleTracking}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={isTracking ? "stop-circle" : "navigate"} size={24} color="white" />
                        <Text style={styles.buttonText}>
                            {isTracking ? "Stop Live Tracking" : "Start Live Tracking"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: width,
        height: height,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: colors.text.secondary,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    header: {
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        alignSelf: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    bottomCard: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    tripInfo: {
        marginBottom: 20,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    locationTextContainer: {
        marginLeft: 12,
    },
    locationLabel: {
        fontSize: 12,
        color: colors.text.secondary,
    },
    locationValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginLeft: 32,
        marginVertical: 4,
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    startButton: {
        backgroundColor: colors.primary,
    },
    stopButton: {
        backgroundColor: colors.error,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    destinationMarker: {
        padding: 8,
        backgroundColor: colors.blue[600],
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
    },
});
