import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export default function DocumentsPage() {
    const navigation = useNavigation();
    const { updateRegistrationData } = useAuth();
    // Local state for 'uploaded' UI feedback could be added here

    const handleBack = () => {
        navigation.goBack();
    };

    const handleNext = () => {
        navigation.navigate('VehicleDetails' as never);
    };

    const handleUpload = async (documentType: string) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], // Updated from deprecated MediaTypeOptions
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                const fileExt = asset.uri.split('.').pop();
                const fileName = `${Date.now()}_${documentType}.${fileExt}`;
                const filePath = `${fileName}`;

                // Read the file as base64 (since React Native Expo filesystem access is limited for standard File objects in FormData on some versions, but Supabase supports base64 or ArrayBuffer)
                // However, standard fetch with FormData works well in Expo modern versions.
                // Let's use FormData which is the standard way.

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

                if (error) {
                    // Fallback for some Expo environments where direct FormData fails - try base64 (advanced) 
                    // OR just alert for now. Usually standard form data works in Expo Go.
                    throw error;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('rider_documents')
                    .getPublicUrl(filePath);

                // Update context
                let update: any = {};
                if (documentType === 'profile_photo') update.avatar_url = publicUrl;
                if (documentType === 'license_front') update.license_photo_url = publicUrl;
                if (documentType === 'ghana_card') update.ghana_card_photo_url = publicUrl;

                updateRegistrationData(update);
                Alert.alert("Success", "Document uploaded successfully");
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
                    <View style={[styles.progressSegment, styles.progressActive]} />
                    <View style={styles.progressSegment} />
                </View>

                <Text style={styles.mainTitle}>Documents</Text>
                <Text style={styles.subtitle}>
                    We're legally required to ask you for some documents to sign you up as a rider. Documents scans and quality photos are accepted.
                </Text>

                <View style={styles.helpLinkContainer}>
                    <Text style={styles.helpLinkText}>Need help getting documents? </Text>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Click here</Text>
                    </TouchableOpacity>
                </View>

                {/* Document Items */}

                {/* Profile Photo */}
                <View style={styles.documentItem}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Rider's profile photo</Text>
                        <Text style={styles.requiredStar}>*</Text>
                    </View>
                    <Text style={styles.description}>
                        Please provide a clear portrait picture (not a full body picture) of yourself. It should show your full face, front view, with eyes open. Full body pictures or images with masks or dark-glasses will not accepted
                    </Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handleUpload('profile_photo')}>
                        <Ionicons name="add" size={20} color="#000" style={{ marginRight: 8 }} />
                        <Text style={styles.uploadButtonText}>Upload file</Text>
                    </TouchableOpacity>
                </View>

                {/* License Front */}
                <View style={styles.documentItem}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Rider's License Front</Text>
                        <Text style={styles.requiredStar}>*</Text>
                    </View>
                    <Text style={styles.description}>
                        Valid driver license issued by the Driver and Vehicle Licence Authority (DVLA). Borla Wura accepts both temporary and full-term licenses. Include a picture of the back of your temporary license if it has an extended expiration date
                    </Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handleUpload('license_front')}>
                        <Ionicons name="add" size={20} color="#000" style={{ marginRight: 8 }} />
                        <Text style={styles.uploadButtonText}>Upload file</Text>
                    </TouchableOpacity>
                </View>

                {/* Ghana Card */}
                <View style={styles.documentItem}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Ghana Card</Text>
                    </View>
                    <Text style={styles.description}>
                        Please upload a front view of your Ghana Card
                    </Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handleUpload('ghana_card')}>
                        <Ionicons name="add" size={20} color="#000" style={{ marginRight: 8 }} />
                        <Text style={styles.uploadButtonText}>Upload file</Text>
                    </TouchableOpacity>
                </View>

                {/* Navigation Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>Next</Text>
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
    helpLinkContainer: {
        flexDirection: 'row',
        marginBottom: 32,
        flexWrap: 'wrap',
    },
    helpLinkText: {
        fontSize: 14,
        color: '#000',
    },
    linkText: {
        fontSize: 14,
        color: '#10b981',
        textDecorationLine: 'underline',
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
    nextButton: {
        flex: 1,
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
