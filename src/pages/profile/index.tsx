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

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Support: undefined;
  AuditLogs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfilePage() {
  const navigation = useNavigation<NavigationProp>();
  const { signOut, profile, user } = useAuth();
  const [stats, setStats] = useState({ totalTrips: 0, rating: 5.0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
         loadRiderStats();
      }
    }, [user?.id, profile?.rating])
  );

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
    name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : riderProfile.name,
    phone: profile?.phone || riderProfile.phone,
    email: profile?.email || riderProfile.email
  });

  const handleSaveProfile = () => {
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
    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
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
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.avatarContainer} activeOpacity={0.8}>
            <Image source={{ uri: profile?.avatar_url || riderProfile.profilePhoto }} style={styles.avatar} />
            <View style={styles.editAvatarBadge}>
               <Ionicons name="pencil" size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroPhone}>{displayPhone}</Text>
          
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
            { label: "Rider's License", icon: 'id-card' },
            { label: 'Tricycle Registration', icon: 'car' },
            { label: 'Insurance', icon: 'shield-checkmark' },
            { label: 'Background Check', icon: 'search' }
          ].map((item, index, arr) => (
            <View key={index} style={[styles.moduleRow, index === arr.length - 1 && styles.noBorder]}>
              <View style={styles.moduleRowLeft}>
                <View style={styles.moduleIconBox}>
                  <Ionicons name={item.icon as any} size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.moduleLabel}>{item.label}</Text>
              </View>
              <View style={styles.moduleRowRight}>
                 <Text style={styles.verifiedText}>Verified</Text>
                 <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
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
            <Switch value={pushNotifications} onValueChange={setPushNotifications} trackColor={{ false: colors.gray[200], true: colors.primary }} />
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
            <Switch value={soundAlerts} onValueChange={setSoundAlerts} trackColor={{ false: colors.gray[200], true: colors.primary }} />
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
            <Switch value={autoAccept} onValueChange={setAutoAccept} trackColor={{ false: colors.gray[200], true: colors.primary }} />
          </View>
        </View>

        <Text style={styles.sectionHeader}>SUPPORT & SECURITY</Text>
        <View style={[styles.moduleBlock, { paddingVertical: 8 }]}>
           <TouchableOpacity 
             style={styles.simpleRow}
             onPress={() => navigation.navigate('AuditLogs')}
             activeOpacity={0.7}
           >
              <Text style={styles.simpleRowLabel}>Audit Logs</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
           </TouchableOpacity>
           <View style={styles.divider} />
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
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
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
