import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/colors'; // Assuming colors are defined here
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function OnboardingPage() {
    const navigation = useNavigation();
    const [showLoginOptions, setShowLoginOptions] = useState(false);

    const handleSignIn = () => {
        setShowLoginOptions(true);
    };

    const handleEmailLogin = () => {
        setShowLoginOptions(false);
        navigation.navigate('Auth', { isLogin: true });
    };

    const handlePhoneLogin = () => {
        setShowLoginOptions(false);
        navigation.navigate('PhoneLogin' as never);
    };

    const handleRegister = () => {
        navigation.navigate('Register' as never);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <ImageBackground
                source={require('../../../assets/tricycle_onboarding.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay} />

                <View style={styles.contentContainer}>
                    <View style={styles.bottomSheet}>
                        {showLoginOptions ? (
                            <>
                                <View style={styles.headerRow}>
                                    {/* Empty View to balance flex if needed, or absolute positioning for close button */}
                                    <View style={{ flex: 1 }} />
                                    <TouchableOpacity
                                        onPress={() => setShowLoginOptions(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.title}>Welcome back</Text>
                                <Text style={styles.subtitle2}>Sign in with one of the options below</Text>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.signInButton} onPress={handlePhoneLogin}>
                                        <Text style={styles.signInButtonText}>Continue with phone number</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.registerButton} onPress={handleEmailLogin}>
                                        <Text style={styles.registerButtonText}>Continue with email/username</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.logoContainer}>
                                    <Text style={styles.logoTextGreen}>Borla Wura </Text>
                                    <Text style={styles.logoTextWhite}>Rider</Text>
                                </View>

                                <Text style={styles.subtitle}>
                                    Drive with Borla Wura.
                                </Text>
                                <Text style={styles.subtitle2}>
                                    Earn extra money driving.
                                </Text>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                                        <Text style={styles.signInButtonText}>Sign in</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                                        <Text style={styles.registerButtonText}>Register</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)', // Slight overlay for image pop
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#1f2937', // Dark gray/blue similar to image
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        alignItems: 'center',
        width: '100%',
    },
    logoContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        marginTop: 8,
    },
    logoTextGreen: {
        color: '#34d399', // Bright green
        fontSize: 32,
        fontWeight: 'bold',
    },
    logoTextWhite: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle2: {
        color: '#d1d5db', // Light gray
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    signInButton: {
        backgroundColor: '#10b981', // Key Green
        paddingVertical: 16,
        borderRadius: 30, // Pill shape
        alignItems: 'center',
        width: '100%',
    },
    signInButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerButton: {
        backgroundColor: 'rgba(255,255,255,0.15)', // Transparent/Glassy for Register or Outline
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)', // Slight border for outline feel
    },
    registerButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // New styles for Welcome Back state
    headerRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 0,
    },
    closeButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 4,
        marginBottom: 8,
    },
    title: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
});
