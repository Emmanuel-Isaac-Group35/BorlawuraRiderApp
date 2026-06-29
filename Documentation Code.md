# Documentation Code

This file contains the core user interface screens: Onboarding, Login, Home, Trip, and Profile.

## Onboarding Screen

File: `src/pages/onboarding/index.tsx`

```tsx
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

```

## Login Screen (Auth Index)

File: `src/pages/auth/index.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { colors } from '../../utils/colors';
import { useAuth } from '../../contexts/AuthContext';

import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function AuthPage({ route }: any) {
    const navigation = useNavigation<any>();
    const { hasRegisteredBefore } = useAuth();
    const { isLogin: initialIsLogin = true } = route.params || {};
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '1049845648210-teccdg7kfr47phs7aoerd3u9aqapsc6r.apps.googleusercontent.com',
        iosClientId: '1049845648210-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com', // TODO: Replace with your actual iOS Client ID from Google Cloud Console
        scopes: ['profile', 'email', 'openid'],
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.idToken) {
                setLoading(true);
                supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: authentication.idToken,
                }).then(({ error }) => {
                    setLoading(false);
                    if (error) Alert.alert('Google Login Error', error.message);
                });
            }
        }
    }, [response]);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password: trimmedPassword,
            });
            if (error) throw error;
            
            if (data?.user) {
                const { data: profile } = await supabase
                    .from('riders')
                    .select('status')
                    .eq('id', data.user.id)
                    .maybeSingle();
                    
                if (profile?.status === 'suspended') {
                    await supabase.auth.signOut();
                    throw new Error("Your account is suspended. Please contact support.");
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.formCard}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Login to continue</Text>



                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="rider@borlawura.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordInputWrapper}>
                            <TextInput
                                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off" : "eye"} 
                                    size={20} 
                                    color={colors.gray[400]} 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    {!hasRegisteredBefore && (
                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.switchText}>
                                Don't have an account? Sign Up
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={() => promptAsync()}
                        disabled={!request || loading}
                    >
                        <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: colors.text.primary,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.gray[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
        padding: 12,
        fontSize: 16,
        color: colors.text.primary,
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    eyeIcon: {
        padding: 12,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    switchText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.gray[200],
    },
    dividerText: {
        marginHorizontal: 10,
        color: colors.gray[500],
        fontSize: 14,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    googleButtonText: {
        color: colors.text.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

```

## Login Screen (Phone)

File: `src/pages/auth/PhoneLogin.tsx`

```tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

export default function PhoneLoginPage() {
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleClose = () => {
        navigation.navigate('Auth' as never);
    };

    const handleLogin = async () => {
        if (!phoneNumber || !password) {
            Alert.alert('Error', 'Please enter your phone number and password');
            return;
        }

        setLoading(true);
        try {
            // 1. Clean up phone number
            const cleanPhone = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber.trim();
            const fullPhone = `+233${cleanPhone}`;

            // 2. Fallback strategy: Since "Phone logins are disabled" in Supabase project settings,
            // we look up the email associated with this phone in our 'riders' table.
            let loginEmail: string | undefined;

            // Normalize input phone: strip non-numeric
            let rawPhone = phoneNumber.replace(/\D/g, '');

            // Remove 233 if exists at start (since we are handling Ghana numbers)
            if (rawPhone.startsWith('233')) {
                rawPhone = rawPhone.substring(3);
            }
            // Remove leading zero if exists
            if (rawPhone.startsWith('0')) {
                rawPhone = rawPhone.substring(1);
            }

            const withoutLeadingZero = rawPhone;
            const withLeadingZero = `0${rawPhone}`;
            const fullPlus233 = `+233${rawPhone}`;
            const simple233 = `233${rawPhone}`;

            const phoneVariations = [withLeadingZero, withoutLeadingZero, fullPlus233, simple233];
            
            let { data: riderData, error: riderError } = await supabase
                .from('riders')
                .select('email, status')
                .in('phone', phoneVariations)
                .limit(1)
                .maybeSingle();

            if (riderError) {
                console.error("Supabase riders query error:", riderError);
            }

            if (!riderError && riderData?.email) {
                if (riderData.status === 'suspended') {
                    throw new Error("Your account is suspended. Please contact support.");
                }
                loginEmail = riderData.email;
            }

            // Fallback to profiles table if not found in riders
            if (!loginEmail) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('email, status')
                    .in('phone', phoneVariations)
                    .limit(1)
                    .maybeSingle();
                
                if (profileError) {
                    console.error("Supabase profiles query error:", profileError);
                }
                
                if (!profileError && profileData?.email) {
                    if (profileData.status === 'suspended') {
                        throw new Error("Your account is suspended. Please contact support.");
                    }
                    loginEmail = profileData.email;
                }
            }

            if (!loginEmail) {
                throw new Error("Phone number not recognized. Please check your number or sign up if you haven't yet.");
            }

            // 3. Sign in using the found email
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: loginEmail.trim(),
                password: password.trim(),
            });

            if (signInError) throw signInError;

            // Success is handled by AuthContext state change
        } catch (error: any) {
            console.error("Phone Login Fallback Error:", error);
            Alert.alert('Login Failed', error.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = phoneNumber.length >= 9 && password.length >= 6;

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Login with Phone</Text>

                    {/* Input Section */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputRow}>
                            {/* Country Code Selector */}
                            <TouchableOpacity style={styles.countrySelector}>
                                <Text style={styles.flag}>🇬🇭</Text>
                                <Text style={styles.countryCode}>+233</Text>
                                <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                            </TouchableOpacity>

                            {/* Phone Input */}
                            <View style={[
                                styles.phoneInputContainer,
                                isFocused && styles.phoneInputFocused
                            ]}>
                                <Text style={styles.inputLabel}>Phone number</Text>
                                <TextInput
                                    style={styles.phoneInput}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholderTextColor="#9ca3af"
                                    selectionColor="#10b981"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={[
                            styles.passwordInputContainer,
                            isPasswordFocused && styles.phoneInputFocused
                        ]}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.passwordInputWrapper}>
                                <TextInput
                                    style={[styles.phoneInput, { flex: 1 }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    placeholderTextColor="#9ca3af"
                                    selectionColor="#10b981"
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIconContainer}
                                >
                                    <Ionicons 
                                        name={showPassword ? "eye-off" : "eye"} 
                                        size={20} 
                                        color="#9ca3af" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        onPress={() => navigation.navigate('ForgotPassword' as never)}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Disclaimer */}
                    <Text style={styles.disclaimer}>
                        Enter the phone number and password used during registration to access your account.
                    </Text>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            isFormValid ? styles.continueButtonActive : styles.continueButtonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={[
                                styles.continueButtonText,
                                isFormValid ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
                            ]}>
                                Login
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1f2937', // Matching the dark theme
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
    },
    iconButton: {
        padding: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 30,
    },
    formContainer: {
        gap: 16,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        height: 56,
    },
    countrySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#374151', // Slightly lighter gray
        paddingHorizontal: 12,
        borderRadius: 12,
        gap: 6,
        height: '100%',
    },
    flag: {
        fontSize: 20,
    },
    countryCode: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
    phoneInputContainer: {
        flex: 1,
        backgroundColor: '#374151',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingHorizontal: 16,
        justifyContent: 'center',
        height: '100%',
    },
    passwordInputContainer: {
        backgroundColor: '#374151',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingHorizontal: 16,
        justifyContent: 'center',
        height: 56,
    },
    phoneInputFocused: {
        borderColor: '#10b981',
    },
    inputLabel: {
        fontSize: 12,
        color: '#9ca3af',
        position: 'absolute',
        top: 8,
        left: 16,
    },
    phoneInput: {
        color: '#ffffff',
        fontSize: 16,
        paddingTop: 16, // Space for label
        paddingBottom: 4,
        height: '100%',
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    eyeIconContainer: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    forgotPasswordText: {
        color: '#10b981', // green matching the theme
        fontSize: 14,
        fontWeight: '600',
    },
    disclaimer: {
        color: '#9ca3af',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 30,
    },
    continueButton: {
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    continueButtonDisabled: {
        backgroundColor: '#374151',
    },
    continueButtonActive: {
        backgroundColor: '#10b981',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueButtonTextDisabled: {
        color: '#6b7280',
    },
    continueButtonTextActive: {
        color: '#ffffff',
    },
});

```

## Home Screen

File: `src/pages/home/index.tsx`

```tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { colors } from '../../utils/colors';
import { Toast } from '../../components/common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { fetchStats, toggleOnlineStatus } from '../../lib/api';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  MainTabs: undefined;
  Request: { trip?: any };
  Profile: undefined;
  Tracking: { trip?: any };
  Trips: undefined;
  Support: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomePage() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, user, settings } = useAuth();
  const [stats, setStats] = useState({
    todayTrips: 0,
    rating: 5.0,
    totalTrips: 0,
    acceptanceRate: 100,
  });
  const [isOnline, setIsOnline] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [activeRiders, setActiveRiders] = useState<{id: string, lat: number, lng: number}[]>([]);

  // Update rider's location in Supabase when moving and online
  useEffect(() => {
    if (user && isOnline && location) {
      supabase
        .from('riders')
        .update({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) Alert.alert('DB Location Update Failed', typeof error === 'object' ? JSON.stringify(error, null, 2) : error);
        });
    }
  }, [location, isOnline, user]);

  // Fetch real-time active riders globally
  useEffect(() => {
    if (!isOnline || !user) {
      setActiveRiders([]);
      return;
    }

    const fetchOtherRiders = async () => {
      const { data, error } = await supabase
        .from('riders')
        .select('id, latitude, longitude')
        .eq('is_online', true)
        .neq('id', user.id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (data && !error) {
        setActiveRiders(data.map(r => ({ id: r.id, lat: r.latitude!, lng: r.longitude! })));
      }
    };

    fetchOtherRiders();
    
    // Subscribe to realtime updates for other riders
    const channel = supabase
      .channel('active-riders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'riders', filter: 'is_online=eq.true' },
        (payload) => {
          if (payload.new.id !== user.id && payload.new.latitude && payload.new.longitude) {
            setActiveRiders(prev => {
              const exists = prev.find(r => r.id === payload.new.id);
              if (exists) {
                return prev.map(r => r.id === payload.new.id ? { id: r.id, lat: payload.new.latitude, lng: payload.new.longitude } : r);
              }
              return [...prev, { id: payload.new.id, lat: payload.new.latitude, lng: payload.new.longitude }];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'riders', filter: 'is_online=eq.false' },
        (payload) => {
          setActiveRiders(prev => prev.filter(r => r.id !== payload.new.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, user]);

  // Network Connectivity Monitoring
  useEffect(() => {
    let wasConnected = true;

    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected;

      if (isConnected === false && isOnline && user) {
        wasConnected = false;
        // Network connection lost
        setIsOnline(false);
        Alert.alert(
          'Network Connection Lost',
          'You have been automatically taken offline because your device lost internet connection.'
        );
        // Try updating DB immediately (may fail if completely disconnected)
        toggleOnlineStatus(user.id, false).catch(e => console.log('Failed to update DB offline state', e));
      } else if (isConnected === true && !wasConnected && user) {
        wasConnected = true;
        // Upon reconnection, sync the offline state clearly to the backend if they remained offline
        if (!isOnline) {
          toggleOnlineStatus(user.id, false).catch(e => console.log('Sync offline status failed', e));
        }
      }
    });

    return () => unsubscribe();
  }, [isOnline, user]);

  // Focus effect to load stats and check for active trips (Crash Recovery)
  useFocusEffect(
    useCallback(() => {
      const checkActiveTrip = async () => {
        if (!user) return;
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('rider_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
            
          if (data && !error) {
             navigation.navigate('ActiveTrip', { trip: data });
          }
        } catch (err) {
          console.log('Crash recovery check failed:', err);
        }
      };

      if (user) {
        loadStats();
        checkActiveTrip();
      }
    }, [user, navigation])
  );

  useEffect(() => {
    if (profile) {
      setStats(prev => ({ ...prev, rating: Number(profile.rating) }));
      if (profile.is_online !== undefined) {
        setIsOnline(profile.is_online);
      }
    }
  }, [profile]);

  // Initialize and Watch Maps Location
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    
    const startLocationTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        // Get initial location to render map quickly
        let loc = await Location.getLastKnownPositionAsync({});
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
        }
        setLocation(loc);

        // Subscribe to live location updates so the car marker actually moves
        locationSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.Highest,
                distanceInterval: 2,   // Update every 2 meters of movement
                timeInterval: 2000,     // OR every 2 seconds
            },
            (newLocation) => {
                setLocation(newLocation);
                // Animate map to follow the rider as they move or get a better GPS fix
                mapRef.current?.animateToRegion({
                    latitude: newLocation.coords.latitude,
                    longitude: newLocation.coords.longitude,
                    latitudeDelta: 0.01, // zoom in closer
                    longitudeDelta: 0.01,
                }, 1000);
            }
        );

      } catch (err) {
        console.log('Location fetching error:', err);
        // Fallback to center of Accra if completely failed
        setLocation(prev => prev || {
          coords: {
            latitude: 5.6037,
            longitude: -0.1870,
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0,
          },
          timestamp: Date.now(),
        });
      }
    };

    startLocationTracking();

    return () => {
        if (locationSubscription) {
            locationSubscription.remove();
        }
    };
  }, []);

  // Listen for realtime orders with a robust fallback
  useEffect(() => {
    if (!user || !isOnline) return;

    const seenOrders = new Set<string>();

    const handleNewOrder = async (order: any) => {
      if (seenOrders.has(order.id)) return;
      seenOrders.add(order.id);

      const isRequestedForOtherRider = order.rider_id && order.rider_id !== user.id;

      if (order.status === 'pending' && isOnline && !isRequestedForOtherRider) {
        const enrichedTrip = { ...order };
        const tripId = order.user_id || order.userId || order.customer_id;
        
        const existingName = order.customer_name || order.customerName || 
                         order.user_name || order.userName || 
                         order.full_name || order.fullName ||
                         order.client_name || order.clientName ||
                         (order.first_name ? (`${order.first_name} ${order.last_name || ''}`).trim() : null);

        if (tripId && (!existingName || existingName === 'Customer')) {
          try {
            let { data: profile_data, error: profile_error } = await supabase
              .from('profiles')
              .select('full_name, first_name, last_name, email')
              .eq('id', tripId)
              .maybeSingle();
            
            if (!profile_data || profile_error?.code === '42P01') {
               const { data: riderProfile } = await supabase
                .from('riders')
                .select('first_name, last_name, email')
                .eq('id', tripId)
                .maybeSingle();
               if (riderProfile) profile_data = { ...riderProfile, full_name: null } as any;
            }

            if (profile_data) {
              const resolvedName = (profile_data as any).full_name || 
                                          ((profile_data as any).first_name ? (`${(profile_data as any).first_name} ${(profile_data as any).last_name || ''}`).trim() : 
                                          ((profile_data as any).email?.split('@')[0] || 'Customer'));
              enrichedTrip.customer_name = resolvedName;

              await supabase
                .from('orders')
                .update({ customer_name: resolvedName })
                .eq('id', order.id);
            }
          } catch (err) {
            console.error('Error fetching/updating customer profile:', err);
          }
        } else if (existingName && existingName !== 'Customer') {
           enrichedTrip.customer_name = existingName;
        }

        // Auto-Accept Logic
        if (settings.autoAccept) {
           try {
             const { data, error } = await supabase
               .from('orders')
               .update({ 
                 rider_id: user.id, 
                 status: 'accepted',
                 accepted_at: new Date().toISOString() 
               })
               .eq('id', order.id)
               .is('rider_id', null)
               .select();
             
             if (error) throw error;

             if (data && data.length > 0) {
               navigation.navigate('ActiveTrip' as never, { trip: enrichedTrip } as never);
               return;
             } else {
               console.log('Auto-accept skipped: order already taken.');
               return;
             }
           } catch (e) {
             console.error('Auto-accept failed:', e);
           }
        }

        if (settings.pushNotifications) {
          setShowNotification(true);
          setTimeout(() => {
            navigation.navigate('Request', { trip: enrichedTrip });
          }, 1000);
        }
      }
    };

    // Primary Subscription: Realtime WebSocket (Fastest if enabled on server)
    const tripsSubscription = supabase
      .channel('new-trip-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload: any) => {
          handleNewOrder(payload.new);
        }
      )
      .subscribe();

    // Fallback Polling: Ensures we never miss an order even if Realtime is disabled on the server
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          for (const order of data) {
            handleNewOrder(order);
          }
        }
      } catch (err) {
        console.log('Polling error:', err);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(tripsSubscription);
      clearInterval(pollInterval);
    };
  }, [user, isOnline]);

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
      // Security Check: Ensure rider is verified with documents
      const isVerified = !!profile?.license_photo_url && 
                         !!profile?.ghana_card_photo_url && 
                         !!profile?.vehicle_photo_url;

      if (!isVerified) {
        Alert.alert(
          'Verification Required',
          'Please upload your Rider License, Ghana Card, and Tricycle Registration in the Profile section to start receiving orders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Update Profile', onPress: () => navigation.navigate('Profile' as any) }
          ]
        );
        return;
      }

      Alert.alert(
        'Go Online',
        'Are you ready to start receiving ride requests?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Go Online', onPress: () => updateOnlineStatus(true) }
        ]
      );
    } else {
      updateOnlineStatus(false);
    }
  };

  const updateOnlineStatus = async (status: boolean) => {
    if (!user) return;
    
    // Always update visual local state safely
    setIsOnline(status);
    if (status) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 1500);
    }
    
    try {
      await toggleOnlineStatus(user.id, status);
    } catch (error: any) {
      Alert.alert('DB Online Setup Failed', typeof error === 'object' ? JSON.stringify(error, null, 2) : error?.message || String(error));
      // Soft fail, user may be offline
    }
  };

  const recenterMap = () => {
    if (location && mapRef.current) {
        mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }}
        onLongPress={(e) => {
          setLocation({
            ...location,
            coords: {
              ...location.coords,
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            }
          });
        }}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true} 
        showsMyLocationButton={true}
        showsCompass={true}
        toolbarEnabled={false}
      >
          {/* Custom car marker (The Rider) */}
          <Marker
             coordinate={{
                 latitude: location.coords.latitude,
                 longitude: location.coords.longitude,
             }}
             zIndex={10}
          >
             <View style={styles.markerContainer}>
                 <View style={styles.markerHighlight} />
                 <View style={styles.carIconWrapper}>
                    <Ionicons name="car" size={24} color="#333" />
                 </View>
             </View>
          </Marker>

          {/* Real-time active riders */}
          {isOnline && activeRiders.map((rider) => (
             <Marker
                key={rider.id}
                coordinate={{
                    latitude: rider.lat,
                    longitude: rider.lng,
                }}
                zIndex={1}
             >
                <View style={[styles.markerContainer, { opacity: 0.85 }]}>
                    <View style={[styles.carIconWrapper, { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.gray[100] }]}>
                        <Ionicons name="car" size={18} color={colors.primary} />
                    </View>
                </View>
             </Marker>
          ))}
      </MapView>

      {/* Foreground UI Components */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        
        {/* Top Action Toggle Button */}
        <View style={[styles.actionToggleWrapper, { paddingTop: 16, paddingBottom: 0, transform: [] }]} pointerEvents="box-none">
          <TouchableOpacity 
            style={[
              styles.goOnlineButton, 
              { backgroundColor: isOnline ? colors.error : colors.primary }
            ]}
            onPress={handleToggleOnline}
            activeOpacity={0.9}
          >
              <Text style={styles.goOnlineText}>
                 {isOnline ? 'Go offline' : 'Go online'}
              </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Tools & Actions Sheet Spacer - takes up middle space */}
        <View style={{ flex: 1 }} pointerEvents="none" />

        {/* Bottom Controls Area */}
        <View style={styles.controlsArea} pointerEvents="box-none">
           {/* Floating Action Buttons */}
           <View style={styles.floatingControlsBlock} pointerEvents="box-none">
              <TouchableOpacity style={styles.floatingActionButton} onPress={recenterMap}>
                  <Ionicons name="locate" size={22} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatingActionButton}>
                  <Ionicons name="options-outline" size={22} color="#000" />
              </TouchableOpacity>
           </View>
           
           {/* Performance Card */}
           <View style={styles.performanceCardWrapper}>
             <View style={styles.performanceCard}>
               <Text style={styles.performanceCardTitle}>Performance</Text>
               <View style={styles.performanceGrid}>
                 <View style={styles.performanceItem}>
                   <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                     <Ionicons name="star" size={20} color="#facc15" />
                   </View>
                   <Text style={styles.performanceValue}>{stats.rating}</Text>
                   <Text style={styles.performanceLabel}>Rating</Text>
                 </View>
                 <View style={styles.performanceItem}>
                   <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
                     <Ionicons name="location" size={20} color="#0284c7" />
                   </View>
                   <Text style={styles.performanceValue}>{stats.totalTrips}</Text>
                   <Text style={styles.performanceLabel}>Total Trips</Text>
                 </View>
                 <View style={styles.performanceItem}>
                   <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                     <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                   </View>
                   <Text style={styles.performanceValue}>{stats.acceptanceRate}%</Text>
                   <Text style={styles.performanceLabel}>Acceptance</Text>
                 </View>
               </View>
             </View>
           </View>
        </View>

      </SafeAreaView>

      <Toast
        visible={showNotification}
        message={isOnline ? "You're Now Online!" : "You're Now Offline"}
        subtitle={isOnline ? "Waiting for pickup requests..." : "Stop driving for now."}
        type={isOnline ? "success" : "info"}
        onHide={() => setShowNotification(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#daedd4',
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  controlsArea: {
    justifyContent: 'flex-end',
  },
  floatingControlsBlock: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: -20, 
    zIndex: 10,
  },
  floatingActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionToggleWrapper: {
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
    transform: [{ translateY: 24 }],  
  },
  goOnlineButton: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  goOnlineText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 36, 
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    minHeight: 180,
  },
  sheetHandleWrapper: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  alertOuterIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeaea',
    marginRight: 12,
  },
  alertInnerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error,
  },
  alertTextContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  promoCard: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerHighlight: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  carIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  performanceCardWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
  },
  performanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
  }
});

```

## Trip Screen

File: `src/pages/trips/index.tsx`

```tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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
  const [overallRating, setOverallRating] = useState('0.0');
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

      // Fetch overall rating from all orders directly from database
      const { data: ratingData } = await supabase
        .from('orders')
        .select('rating')
        .eq('rider_id', user.id)
        .not('rating', 'is', null)
        .gt('rating', 0);
        
      if (ratingData && ratingData.length > 0) {
        const avg = ratingData.reduce((sum, order) => sum + Number(order.rating), 0) / ratingData.length;
        setOverallRating(avg.toFixed(1));
      } else {
        setOverallRating('0.0');
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const totalEarnings = filteredTrips
    .filter(t => t.status === 'completed')
    .reduce((sum, trip) => sum + (trip.fare || 0), 0);

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
                <div class="detail-item full-width">
                  <div class="detail-label">Amount Earned</div>
                  <div class="detail-value" style="color: #059669; font-size: 24px;">₵${trip.fare ? trip.fare.toFixed(2) : '0.00'}</div>
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
             </View>
          </View>
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

             <View style={styles.detailItem}>
               <View style={[styles.detailIconWrapper, {backgroundColor: '#DCFCE7', borderColor: '#BBF7D0'}]}>
                 <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#166534' }}>₵</Text>
               </View>
               <View style={styles.detailTextContent}>
                 <Text style={styles.detailLabel}>Earnings</Text>
                 <Text style={styles.detailValue}>₵{item.fare ? item.fare.toFixed(2) : '0.00'}</Text>
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
            <Text style={styles.statLabel}>Pickups</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.4)' }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
              <Ionicons name="wallet-outline" size={24} color={colors.primaryDark} />
            </View>
            <Text style={styles.statValue}>₵{totalEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.4)' }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
              <Ionicons name="star-outline" size={24} color={colors.amber[600]} />
            </View>
            <Text style={styles.statValue}>{overallRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
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

                 <View style={styles.modalDetailRow}>
                   <View style={styles.modalDetailIconWrapper}>
                     <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>₵</Text>
                   </View>
                   <View style={styles.modalDetailTextContent}>
                     <Text style={styles.modalDetailLabel}>Amount Earned</Text>
                     <Text style={[styles.modalDetailValue, { color: colors.primary, fontWeight: '800' }]}>₵{selectedTrip.fare ? selectedTrip.fare.toFixed(2) : '0.00'}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});

```

## Profile Screen

File: `src/pages/profile/index.tsx`

```tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Switch,
  Alert,
  Linking,
  ActivityIndicator as RNActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { Modal } from '../../components/common/Modal';
import { riderProfile } from '../../mocks/rider';
import { useAuth } from '../../contexts/AuthContext';
import { fetchStats } from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Support: undefined;
  AuditLogs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfilePage() {
  const navigation = useNavigation<NavigationProp>();
  const { signOut, profile, user, refreshProfile, settings, updateSettings } = useAuth();
  const [stats, setStats] = useState({ totalTrips: 0, rating: 5.0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
         loadRiderStats();
      }
    }, [user?.id, profile?.rating])
  );

  const handleTogglePush = async (value: boolean) => {
    await updateSettings('pushNotifications', value);
    if (value) {
      Alert.alert('Notifications Enabled', 'You will now receive alerts for new pickup requests.');
    }
  };

  const handleToggleAutoAccept = async (value: boolean) => {
    await updateSettings('autoAccept', value);
    if (value) {
      Alert.alert('Auto-Accept Active', 'The app will now automatically accept requests within 2km.');
    }
  };

  const loadRiderStats = async () => {
     try {
       if (user?.id) {
          const data = await fetchStats(user.id);
          // @ts-ignore
          setStats({
            totalTrips: data.totalTrips,
            rating: profile?.rating || 5.0
          });
       }
     } catch (e) {
       console.error('Error loading profile stats:', e);
     } finally {
       setLoading(false);
     }
  };

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Sync edit form with profile data when modal opens
  const handleOpenEditModal = () => {
    setEditForm({
      name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '',
      phone: profile?.phone || '',
      email: profile?.email || ''
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name || editForm.name.trim().length < 2) {
      Alert.alert('Error', 'Please enter a valid name (at least 2 characters)');
      return;
    }
    if (!editForm.phone || editForm.phone.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (editForm.email && editForm.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
    }

    setSaving(true);
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const nameParts = editForm.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const { error } = await supabase
        .from('riders')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Update Failed', error.message || 'An error occurred while saving your profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try { await signOut(); } 
            catch (error) { Alert.alert('Error', 'Failed to logout'); }
          },
        },
      ]
    );
  };

  const handleDocumentUpdate = async (type: 'license' | 'ghana_card' | 'vehicle' | 'avatar') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && user?.id) {
        setUploading(type);
        const asset = result.assets[0];
        const fileExt = asset.uri.split('.').pop();
        const fileName = `${user.id}_${type}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || 'image/jpeg',
        } as any);

        const { error: uploadError } = await supabase.storage
          .from('rider_documents')
          .upload(filePath, formData, {
            contentType: asset.mimeType || 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('rider_documents')
          .getPublicUrl(filePath);

        const columnMap = {
          license: 'license_photo_url',
          ghana_card: 'ghana_card_photo_url',
          vehicle: 'vehicle_photo_url',
          avatar: 'avatar_url'
        };

        const { error: dbError } = await supabase
          .from('riders')
          .update({ [columnMap[type]]: publicUrl })
          .eq('id', user.id);

        if (dbError) throw dbError;

        // Force an immediate refresh of the local profile data to update UI to 'Verified'
        await refreshProfile();

        Alert.alert('Success', `${type === 'avatar' ? 'Profile photo' : 'Document'} updated successfully`);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Upload Failed', error.message || 'An error occurred during upload');
    } finally {
      setUploading(null);
    }
  };

  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : riderProfile.name;
  const displayPhone = profile?.phone || riderProfile.phone;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profile?.avatar_url || riderProfile.profilePhoto }} style={styles.avatar} />
          </View>
          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroPhone}>{displayPhone}</Text>
          
          <TouchableOpacity onPress={handleOpenEditModal} style={styles.editInfoBtn}>
             <Ionicons name="create-outline" size={14} color={colors.primary} />
             <Text style={styles.editInfoBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Ionicons name="star" size={16} color="#facc15" />
              <Text style={styles.statText}>{stats.rating.toFixed(1)} Rating</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.primaryLighter }]}>
              <Ionicons name="car-sport" size={16} color={colors.primaryDark} />
              <Text style={[styles.statText, { color: colors.primaryDark }]}>{stats.totalTrips} Trips</Text>
            </View>
          </View>
        </View>

        {/* Modular Sections */}
        <Text style={styles.sectionHeader}>VERIFICATION</Text>
        <View style={styles.moduleBlock}>
          {[
            { label: 'Rider License', icon: 'card', verified: !!profile?.license_photo_url, type: 'license' },
            { label: 'National ID (Ghana Card)', icon: 'id-card', verified: !!profile?.ghana_card_photo_url, type: 'ghana_card' },
            { label: 'Tricycle Registration', icon: 'car', verified: !!profile?.vehicle_photo_url, type: 'vehicle' },
          ].map((item, index, arr) => (
            <View 
              key={index} 
              style={[styles.moduleRow, index === arr.length - 1 && styles.noBorder]}
            >
              <View style={styles.moduleRowLeft}>
                <View style={styles.moduleIconBox}>
                  <Ionicons name={item.icon as any} size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.moduleLabel}>{item.label}</Text>
              </View>
              <View style={styles.moduleRowRight}>
                 {item.verified ? (
                   <>
                     <Text style={styles.verifiedText}>Verified</Text>
                     <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                   </>
                 ) : (
                   <>
                     <Text style={[styles.verifiedText, { color: colors.error }]}>Pending</Text>
                     <Ionicons name="time-outline" size={20} color={colors.error} />
                   </>
                 )}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.moduleBlock}>
          <View style={styles.moduleRow}>
            <View style={styles.moduleRowLeft}>
              <View style={[styles.moduleIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="notifications" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.moduleLabel}>Push Notifications</Text>
                <Text style={styles.moduleSubLabel}>Alerts for new bookings</Text>
              </View>
            </View>
            <Switch value={settings.pushNotifications} onValueChange={handleTogglePush} trackColor={{ false: colors.gray[200], true: colors.primary }} />
          </View>
 
          <View style={styles.moduleRow}>
            <View style={styles.moduleRowLeft}>
              <View style={[styles.moduleIconBox, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="volume-high" size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.moduleLabel}>Sound Alerts</Text>
                <Text style={styles.moduleSubLabel}>Chimes during requests</Text>
              </View>
            </View>
            <Switch value={settings.soundAlerts} onValueChange={(v) => updateSettings('soundAlerts', v)} trackColor={{ false: colors.gray[200], true: colors.primary }} />
          </View>
          
          <View style={[styles.moduleRow, styles.noBorder]}>
            <View style={styles.moduleRowLeft}>
              <View style={[styles.moduleIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="flash" size={20} color="#D97706" />
              </View>
              <View>
                <Text style={styles.moduleLabel}>Auto-Accept Mode</Text>
                <Text style={styles.moduleSubLabel}>Automatically accept near trips</Text>
              </View>
            </View>
            <Switch value={settings.autoAccept} onValueChange={handleToggleAutoAccept} trackColor={{ false: colors.gray[200], true: colors.primary }} />
          </View>
        </View>

        <Text style={styles.sectionHeader}>SUPPORT & SECURITY</Text>
        <View style={[styles.moduleBlock, { paddingVertical: 8 }]}>
           <TouchableOpacity 
             style={styles.simpleRow}
             onPress={() => navigation.navigate('Support')}
             activeOpacity={0.7}
           >
              <Text style={styles.simpleRowLabel}>Help Center</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
           </TouchableOpacity>
           <View style={styles.divider} />
           <TouchableOpacity 
             style={styles.simpleRow}
             onPress={() => setShowTermsModal(true)}
             activeOpacity={0.7}
           >
              <Text style={styles.simpleRowLabel}>Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
           </TouchableOpacity>
           <View style={styles.divider} />
           <TouchableOpacity 
             style={styles.simpleRow}
             onPress={() => setShowPrivacyModal(true)}
             activeOpacity={0.7}
           >
              <Text style={styles.simpleRowLabel}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
           </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
           <Ionicons name="log-out-outline" size={20} color="#EF4444" />
           <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Borlawura Rider App v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View>
            <Text style={styles.modalTitle}>Update Profile</Text>
            <View style={styles.modalFormWrapper}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput style={styles.inputField} value={editForm.name} onChangeText={t => setEditForm({...editForm, name: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput style={styles.inputField} value={editForm.phone} keyboardType="phone-pad" onChangeText={t => setEditForm({...editForm, phone: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput style={styles.inputField} value={editForm.email || ''} keyboardType="email-address" onChangeText={t => setEditForm({...editForm, email: t})} />
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <RNActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal visible={showTermsModal} onClose={() => setShowTermsModal(false)}>
        <Text style={styles.modalTitle}>Terms & Conditions</Text>
        <ScrollView style={styles.policyScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.policyText}>
            Welcome to the Borlawura Rider App. By accessing or using this platform, you agree to be bound by the following terms:{"\n\n"}
            <Text style={{fontWeight: '700'}}>1. Service Obligations:</Text> As a verified rider, you commit to completing all accepted waste collection requests safely and efficiently. Punctuality and professional conduct are strictly required.{"\n\n"}
            <Text style={{fontWeight: '700'}}>2. Vehicle Eligibility:</Text> You are required to keep your registered tricycle well-maintained, insured, and thoroughly inspected. You are fully responsible for all direct operational and maintenance costs.{"\n\n"}
            <Text style={{fontWeight: '700'}}>3. Fair Usage & Platform Safety:</Text> Do not manipulate the Borlawura system or forge completion certificates. Any misrepresentation will result in immediate suspension or total account termination.{"\n\n"}
            <Text style={{fontWeight: '700'}}>4. Financial Transactions:</Text> All fares are calculated based on distance and type of waste. A standard platform commission applies to all completed trips, and payouts are securely executed to your provided Mobile Money account.{"\n\n"}
            By continuing to access the Borlawura network, you signify that you consent to all present and future modifications made to these terms.
          </Text>
        </ScrollView>
        <TouchableOpacity style={styles.saveBtn} onPress={() => setShowTermsModal(false)}>
          <Text style={styles.saveBtnText}>Understood</Text>
        </TouchableOpacity>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)}>
        <Text style={styles.modalTitle}>Privacy Policy</Text>
        <ScrollView style={styles.policyScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.policyText}>
            Your privacy is our priority. This document outlines how Borlawura collects and secures your rider data:{"\n\n"}
            <Text style={{fontWeight: '700'}}>1. Location Tracking:</Text> This app tracks your precise geographical location strictly to connect you with nearby customers and display live routes. We only access this data while you are actively toggled "Online".{"\n\n"}
            <Text style={{fontWeight: '700'}}>2. Data Security:</Text> All personal identification documents (such as your Driver's License or Tricycle Registration) are encrypted at rest. We never sell your data to third-party institutions.{"\n\n"}
            <Text style={{fontWeight: '700'}}>3. Communications:</Text> To facilitate pickups, customers are temporarily granted access to your registered phone number once a trip is active. This connection ends when the job is completed or cancelled.{"\n\n"}
            Please contact the Support center if you have any pressing concerns regarding your data retention limits or you wish to process an account deletion.
          </Text>
        </ScrollView>
        <TouchableOpacity style={styles.saveBtn} onPress={() => setShowPrivacyModal(false)}>
          <Text style={styles.saveBtnText}>Close</Text>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Off-white modern background
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: colors.primaryLighter,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editInfoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  heroPhone: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3', // subtle yellow
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A16207',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 8,
    marginLeft: 8,
    letterSpacing: 0.8,
  },
  moduleBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  moduleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  moduleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  moduleSubLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  moduleRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  simpleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  simpleRowLabel: {
     fontSize: 15,
     fontWeight: '500',
     color: '#4B5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalFormWrapper: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  inputField: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  policyScroll: {
    maxHeight: 400,
    marginBottom: 20,
  },
  policyText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  }
});

```

