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
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleClose = () => {
        navigation.navigate('Onboarding' as never);
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

            // Normalize input phone: if starts with 0, keep it AND version without it
            const rawPhoneTrimmed = phoneNumber.trim();
            const withLeadingZero = rawPhoneTrimmed.startsWith('0') ? rawPhoneTrimmed : `0${rawPhoneTrimmed}`;
            const withoutLeadingZero = rawPhoneTrimmed.startsWith('0') ? rawPhoneTrimmed.substring(1) : rawPhoneTrimmed;
            const fullPlus233 = `+233${withoutLeadingZero}`;
            const simple233 = `233${withoutLeadingZero}`;

            const { data: riderData, error: riderError } = await supabase
                .from('riders')
                .select('email')
                .or(`phone.eq.${withLeadingZero},phone.eq.${withoutLeadingZero},phone.eq.${fullPlus233},phone.eq.${simple233}`)
                .maybeSingle();

            if (!riderError && riderData?.email) {
                loginEmail = riderData.email;
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
                            <TextInput
                                style={styles.phoneInput}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                placeholderTextColor="#9ca3af"
                                selectionColor="#10b981"
                            />
                        </View>
                    </View>

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
