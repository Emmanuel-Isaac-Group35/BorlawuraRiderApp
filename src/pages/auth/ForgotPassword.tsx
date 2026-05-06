import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordPage() {
    const navigation = useNavigation<any>();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!input) {
            Alert.alert('Error', 'Please enter your email or phone number');
            return;
        }

        setLoading(true);
        const trimmedInput = input.trim();
        let targetEmail = trimmedInput;

        try {
            // Check if input is a phone number (mostly digits)
            const isPhone = /^[0-9+\s]+$/.test(trimmedInput);

            if (isPhone) {
                // Look up email by phone
                let rawPhone = trimmedInput.replace(/\D/g, '');
                if (rawPhone.startsWith('233')) rawPhone = rawPhone.substring(3);
                if (rawPhone.startsWith('0')) rawPhone = rawPhone.substring(1);

                const withoutLeadingZero = rawPhone;
                const withLeadingZero = `0${rawPhone}`;
                const fullPlus233 = `+233${rawPhone}`;
                const simple233 = `233${rawPhone}`;

                const { data: riderData, error: riderError } = await supabase
                    .from('riders')
                    .select('email')
                    .or(`phone.eq.${withLeadingZero},phone.eq.${withoutLeadingZero},phone.eq.${fullPlus233},phone.eq.${simple233}`)
                    .maybeSingle();

                if (riderError || !riderData?.email) {
                    throw new Error("No account found with this phone number.");
                }
                targetEmail = riderData.email;
            }

            const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
                redirectTo: 'borlawurarider://reset-password'
            });
            if (error) throw error;
            Alert.alert(
                'Success',
                `Password reset instructions have been sent to ${isPhone ? 'the email associated with this phone' : 'your email'}.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
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
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your email or phone number to receive a reset link
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email or Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="rider@borlawura.com or 024..."
                            value={input}
                            onChangeText={setInput}
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Send Reset Link</Text>
                        )}
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
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 24,
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
});
