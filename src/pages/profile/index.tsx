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
          <TouchableOpacity onPress={() => handleDocumentUpdate('avatar')} style={styles.avatarContainer} activeOpacity={0.8} disabled={uploading === 'avatar'}>
            <Image source={{ uri: profile?.avatar_url || riderProfile.profilePhoto }} style={styles.avatar} />
            {uploading === 'avatar' ? (
              <View style={[styles.avatar, styles.avatarOverlay]}>
                <RNActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
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
            <TouchableOpacity 
              key={index} 
              style={[styles.moduleRow, index === arr.length - 1 && styles.noBorder]}
              onPress={() => handleDocumentUpdate(item.type as any)}
              disabled={uploading !== null}
            >
              <View style={styles.moduleRowLeft}>
                <View style={styles.moduleIconBox}>
                  <Ionicons name={item.icon as any} size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.moduleLabel}>{item.label}</Text>
              </View>
              <View style={styles.moduleRowRight}>
                 {uploading === item.type ? (
                   <RNActivityIndicator size="small" color={colors.primary} />
                 ) : item.verified ? (
                   <>
                     <Text style={styles.verifiedText}>Verified</Text>
                     <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                   </>
                 ) : (
                   <>
                     <Text style={[styles.verifiedText, { color: colors.error }]}>Update</Text>
                     <Ionicons name="cloud-upload-outline" size={20} color={colors.error} />
                   </>
                 )}
              </View>
            </TouchableOpacity>
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
