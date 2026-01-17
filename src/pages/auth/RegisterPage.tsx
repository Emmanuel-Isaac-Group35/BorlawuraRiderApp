import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function RegisterPage() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('Accra');
    const [agreed, setAgreed] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register</Text>
                <TouchableOpacity style={styles.langButton}>
                    <Text style={styles.flag}>🇬🇭</Text>
                    <Text style={styles.langText}>EN</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.mainTitle}>Become a rider</Text>

                    {/* Email Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email address"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Phone Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone number</Text>
                        <View style={styles.phoneRow}>
                            <TouchableOpacity style={styles.countrySelector}>
                                <Text style={styles.flag}>🇬🇭</Text>
                                <Text style={styles.countryCode}>+233</Text>
                                <Ionicons name="chevron-down" size={16} color="#000" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Mobile number"
                                placeholderTextColor="#9ca3af"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* City Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <View style={styles.cityInputContainer}>
                            <Text style={styles.cityText}>{city}</Text>
                            <View style={styles.cityActions}>
                                <TouchableOpacity onPress={() => setCity('')}>
                                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                                <Ionicons name="chevron-down" size={20} color="#000" style={{ marginLeft: 8 }} />
                            </View>
                        </View>
                    </View>

                    {/* Terms Checkbox */}
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                            style={[styles.checkbox, agreed && styles.checkboxChecked]}
                            onPress={() => setAgreed(!agreed)}
                        >
                            {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </TouchableOpacity>
                        <Text style={styles.termsText}>
                            By registering, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy policy</Text>, commit to comply with obligations under the European Union and local legislation and provide only legal services and content on the Borla Wura Platform.
                        </Text>
                    </View>

                    <Text style={styles.disclaimerText}>
                        Once you've become a rider, we will occasionally send you offers and promotions related to our services. You can always unsubscribe by changing your communication preferences.
                    </Text>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, !agreed ? styles.submitButtonDisabled : null]}
                        disabled={!agreed}
                        onPress={() => navigation.navigate('PersonalInfo' as never)}
                    >
                        <Text style={styles.submitButtonText}>Register as a rider</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    langButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    flag: {
        fontSize: 16,
    },
    langText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 24,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#000',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1f2937',
    },
    input: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        color: '#000',
    },
    phoneRow: {
        flexDirection: 'row',
        gap: 12,
    },
    countrySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        height: 56,
    },
    countryCode: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    phoneInput: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
        height: 56,
    },
    cityInputContainer: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
    },
    cityText: {
        fontSize: 16,
        color: '#000',
    },
    cityActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
        marginTop: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    termsText: {
        flex: 1,
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 20,
    },
    linkText: {
        color: '#10b981',
    },
    disclaimerText: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 32,
    },
    submitButton: {
        backgroundColor: '#10b981',
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
