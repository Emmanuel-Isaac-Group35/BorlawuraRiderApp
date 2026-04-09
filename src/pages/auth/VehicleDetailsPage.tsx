import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function VehicleDetailsPage() {
    const navigation = useNavigation();
    const { user, registrationData, updateRegistrationData } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSubmit = async () => {
        // Validation for missing critical data
        if (!registrationData.email || !registrationData.password) {
            Alert.alert("Error", "Missing registration data (email or password). Please restart the process.");
            return;
        }

        setLoading(true);
        const trimmedEmail = registrationData.email?.trim() || "";
        const trimmedPassword = registrationData.password?.trim() || "";

        try {
            let userId: string | undefined;

            // 1. Try to Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: trimmedEmail,
                password: trimmedPassword,
                options: {
                    data: {
                        first_name: registrationData.first_name,
                        last_name: registrationData.last_name,
                        phone: registrationData.phone,
                    }
                }
            });

            if (authError) {
                console.log("Signup error:", JSON.stringify(authError, null, 2));

                // status 422 = user already exists → try signing in with same credentials
                // status 400 = user exists (older Supabase versions)
                // status 500 = server-side error (often a broken DB trigger)
                if (authError.status === 422 || authError.status === 400 ||
                    authError.message?.toLowerCase().includes('already registered') ||
                    authError.message?.toLowerCase().includes('user already exists')) {

                    console.log("User may already exist, attempting sign-in...");
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email: trimmedEmail,
                        password: trimmedPassword,
                    });

                    if (signInError) {
                        console.log("Sign-in recovery failed:", JSON.stringify(signInError, null, 2));
                        throw new Error("An account with this email already exists but the password is incorrect. Please log in instead.");
                    }
                    userId = signInData.session?.user.id;

                } else if (authError.status === 500) {
                    // 500 = Supabase server-side failure, often a broken trigger on auth.users.
                    // The user account may or may not have been created on the auth side.
                    // Attempt a sign-in — if the account was created before the trigger failed, this succeeds.
                    console.log("500 error from Supabase, attempting sign-in as recovery...");
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email: trimmedEmail,
                        password: trimmedPassword,
                    });

                    if (signInError) {
                        // Account truly couldn't be created. Likely a DB trigger issue.
                        throw new Error(
                            "Registration failed due to a server configuration issue. " +
                            "Please contact support or try again later. (Code: AUTH_500)"
                        );
                    }
                    userId = signInData.session?.user.id;

                } else {
                    throw authError;
                }
            } else {
                // signUp succeeded — user may need to confirm email
                // If email confirmation is on, user.id is available but session may be null
                userId = authData.user?.id;
            }

            if (!userId) {
                throw new Error("Could not retrieve user ID after authentication. Please try again.");
            }

            // 2. Upsert Profile
            const finalProfile = {
                id: userId,
                email: trimmedEmail,
                phone: registrationData.phone,
                phone_number: registrationData.phone,
                first_name: registrationData.first_name,
                last_name: registrationData.last_name,
                full_name: `${registrationData.first_name || ''} ${registrationData.last_name || ''}`.trim(),
                language: registrationData.language,
                rider_license_number: registrationData.rider_license_number,
                avatar_url: registrationData.avatar_url,
                license_photo_url: registrationData.license_photo_url,
                ghana_card_photo_url: registrationData.ghana_card_photo_url,
                vehicle_photo_url: registrationData.vehicle_photo_url,
                updated_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase
                .from('riders')
                .upsert(finalProfile);

            if (profileError) {
                console.log("Profile upsert error:", JSON.stringify(profileError, null, 2));
                throw profileError;
            }

            Alert.alert(
                "Application Submitted",
                "Your registration has been submitted successfully. You can now sign in.",
                [
                    { text: "OK", onPress: () => navigation.navigate('Onboarding' as never) }
                ]
            );
        } catch (error: any) {
            console.error("Registration error:", error);
            if (error.message?.toLowerCase().includes('rate limit')) {
                Alert.alert("Too Many Attempts", "Please wait a moment before trying again.");
            } else {
                Alert.alert("Submission Failed", error.message || "An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (documentType: string) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                const fileExt = asset.uri.split('.').pop();
                const fileName = `${Date.now()}_${documentType}.${fileExt}`;
                const filePath = `${fileName}`;

                const formData = new FormData();
                formData.append('file', {
                    uri: asset.uri,
                    name: fileName,
                    type: asset.mimeType || 'image/jpeg',
                } as any);

                const { data, error } = await supabase.storage
                    .from('rider_documents')
                    .upload(filePath, formData, {
                        contentType: asset.mimeType || 'image/jpeg',
                    });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('rider_documents')
                    .getPublicUrl(filePath);

                updateRegistrationData({
                    vehicle_photo_url: publicUrl
                });
                Alert.alert("Success", "Vehicle photo uploaded successfully");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Upload Failed", error.message || "An error occurred while uploading");
        }
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
                    <View style={[styles.progressSegment, styles.progressFilled]} />
                    <View style={[styles.progressSegment, styles.progressFilled]} />
                    <View style={[styles.progressSegment, styles.progressFilled]} />
                    <View style={[styles.progressSegment, styles.progressActive]} />
                </View>

                <Text style={styles.mainTitle}>Vehicle Details</Text>
                <Text style={styles.subtitle}>
                    Please add your vehicle details to finish registration.
                </Text>

                {/* Tricycle Photo */}
                <View style={styles.documentItem}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Tricycle Photo</Text>
                        <Text style={styles.requiredStar}>*</Text>
                    </View>
                    <Text style={styles.description}>
                        Please upload a clear photo of your tricycle. Ensure the license plate is visible.
                    </Text>

                    {registrationData.vehicle_photo_url ? (
                        <View style={styles.previewRow}>
                            <View style={styles.smallPreviewContainer}>
                                <Image source={{ uri: registrationData.vehicle_photo_url }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removeImageSmall} onPress={() => updateRegistrationData({ vehicle_photo_url: '' })}>
                                    <Ionicons name="close" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.uploadStatus}>
                                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                <Text style={styles.uploadedText}>Uploaded</Text>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadButton} onPress={() => handleUpload('tricycle_photo')}>
                            <Ionicons name="add" size={20} color="#000" style={{ marginRight: 8 }} />
                            <Text style={styles.uploadButtonText}>Upload file</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Navigation Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitButton, !registrationData.vehicle_photo_url && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!registrationData.vehicle_photo_url || loading}
                    >
                        <Text style={styles.submitButtonText}>Submit Application</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
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
    progressFilled: {
        backgroundColor: '#10b981',
        opacity: 0.5,
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
        marginBottom: 16,
        lineHeight: 20,
    },
    documentItem: {
        marginBottom: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    requiredStar: {
        color: '#ef4444',
        marginLeft: 4,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 30, // Rounded pill shape
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignSelf: 'flex-start',
    },
    uploadButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    smallPreviewContainer: {
        position: 'relative',
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageSmall: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    uploadedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10b981',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 16,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    submitButton: {
        flex: 2, // Give more space to submit button
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
