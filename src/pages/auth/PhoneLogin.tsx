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
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PhoneLoginPage() {
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleClose = () => {
        navigation.navigate('Onboarding' as never);
    };

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
                    <Text style={styles.title}>Enter your phone number</Text>

                    {/* Input Section */}
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

                    {/* Disclaimer */}
                    <Text style={styles.disclaimer}>
                        We'll send a code to verify this number. Data will never be shared with third parties without your consent.
                    </Text>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            phoneNumber.length > 0 ? styles.continueButtonActive : styles.continueButtonDisabled
                        ]}
                        disabled={phoneNumber.length === 0}
                    >
                        <Text style={[
                            styles.continueButtonText,
                            phoneNumber.length > 0 ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
                        ]}>
                            Continue
                        </Text>
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
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
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
    phoneInputFocused: {
        borderColor: '#10b981', // Green border when focused
        backgroundColor: '#1f2937', // Darker background when focused as per design, or keep same? Design shows dark background inside green border maybe.
        // Actually often inputs clear up or stay same. Let's keep background but add border.
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
