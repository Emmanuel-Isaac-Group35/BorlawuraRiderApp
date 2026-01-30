import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

export default function PersonalInfoPage() {
    const navigation = useNavigation();
    const { updateRegistrationData } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [languages, setLanguages] = useState<string[]>(['English']);
    const [showLangModal, setShowLangModal] = useState(false);

    const AVAILABLE_LANGUAGES = ['English', 'Twi', 'Ga', 'Ewe'];

    const toggleLanguage = (lang: string) => {
        if (languages.includes(lang)) {
            setLanguages(languages.filter(l => l !== lang));
        } else {
            setLanguages([...languages, lang]);
        }
    };


    const handleBack = () => {
        navigation.goBack();
    };

    const handleNext = () => {
        if (!firstName || !lastName || !password) {
            Alert.alert("Missing Information", "Please fill in all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters.");
            return;
        }

        updateRegistrationData({
            first_name: firstName,
            last_name: lastName,
            password: password,
            language: languages.join(', ') // Save as comma separated string for now as per schema
        });
        navigation.navigate('DriverLicense' as never);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Brand & Lang */}
                    <View style={styles.brandRow}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoTextGreen}>Borla Wura </Text>
                            <Text style={styles.logoTextBlack}>Rider</Text>
                        </View>
                        <TouchableOpacity style={styles.langButton}>
                            <Ionicons name="globe-outline" size={16} color="#000" />
                            <Text style={styles.langText}>English</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressSegment, styles.progressActive]} />
                        <View style={styles.progressSegment} />
                        <View style={styles.progressSegment} />
                        <View style={styles.progressSegment} />
                    </View>

                    <Text style={styles.mainTitle}>Personal information</Text>
                    <Text style={styles.subtitle}>
                        Only your first name and vehicle details are visible to clients during the booking
                    </Text>

                    {/* First Name */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>First name</Text>
                            <Text style={styles.requiredStar}>*</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.inputError]} // Simulating error state from image
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <Text style={styles.errorText}>This field is required</Text>
                    </View>

                    {/* Last Name */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Last name</Text>
                            <Text style={styles.requiredStar}>*</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.inputError]}
                            value={lastName}
                            onChangeText={setLastName}
                        />
                        <Text style={styles.errorText}>This field is required</Text>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Password</Text>
                            <Text style={styles.requiredStar}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Min. 6 characters"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                        />
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <Text style={styles.requiredStar}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Re-enter password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                        />
                    </View>

                    {/* Language */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Language</Text>
                            <Text style={styles.requiredStar}>*</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.dropdownInput}
                            onPress={() => setShowLangModal(true)}
                        >
                            <Text style={styles.inputText} numberOfLines={1}>
                                {languages.length > 0 ? languages.join(', ') : 'Select language'}
                            </Text>
                            <View style={styles.dropdownIcons}>
                                {languages.length > 0 && (
                                    <TouchableOpacity onPress={() => setLanguages([])} style={{ marginRight: 8 }}>
                                        <Ionicons name="close" size={16} color="#9ca3af" />
                                    </TouchableOpacity>
                                )}
                                <View style={styles.verticalDivider} />
                                <Ionicons name="chevron-down" size={20} color="#000" />
                            </View>
                        </TouchableOpacity>
                    </View>






                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Ionicons name="arrow-forward" size={24} color="#fff" />
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Language Selection Modal */}
            <Modal
                visible={showLangModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLangModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Languages</Text>
                            <TouchableOpacity onPress={() => setShowLangModal(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {AVAILABLE_LANGUAGES.map(lang => (
                                <TouchableOpacity
                                    key={lang}
                                    style={styles.langOption}
                                    onPress={() => toggleLanguage(lang)}
                                >
                                    <View style={[styles.checkbox, languages.includes(lang) && styles.checkboxSelected]}>
                                        {languages.includes(lang) && (
                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                        )}
                                    </View>
                                    <Text style={styles.langOptionText}>{lang}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalDoneButton}
                            onPress={() => setShowLangModal(false)}
                        >
                            <Text style={styles.modalDoneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
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
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    brandRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        flexDirection: 'row',
    },
    logoTextGreen: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10b981',
    },
    logoTextBlack: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    langButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    langText: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
    },
    progressSegment: {
        flex: 1,
        height: 4,
        backgroundColor: '#f3f4f6',
        borderRadius: 2,
    },
    progressActive: {
        backgroundColor: '#10b981',
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 32,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    requiredStar: {
        color: '#ef4444',
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#000',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 12,
        height: 50,
    },
    inputText: {
        fontSize: 16,
        color: '#000',
    },
    dropdownIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    verticalDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#d1d5db',
    },
    helperText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    fleetContainer: {
        marginTop: 8,
        marginBottom: 40,
    },
    fleetLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    fleetLink: {
        fontSize: 16,
        color: '#10b981',
        textDecorationLine: 'underline',
    },
    nextButton: {
        backgroundColor: '#10b981',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    langOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    langOptionText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: { // Helper style if needed, logic is inline however
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    modalDoneButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    modalDoneText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
