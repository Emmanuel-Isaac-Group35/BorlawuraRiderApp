import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';
import { Modal } from '../../components/common/Modal';
import { riderProfile } from '../../mocks/rider';

type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Support: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfilePage() {
  const navigation = useNavigation<NavigationProp>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  const [editForm, setEditForm] = useState({
    name: riderProfile.name,
    phone: riderProfile.phone,
    email: riderProfile.email
  });

  const [bankForm, setBankForm] = useState({
    momoProvider: 'MTN',
    momoNumber: '0501234567'
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

  const handleSaveBank = () => {
    if (!bankForm.momoNumber || bankForm.momoNumber.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid Mobile Money number');
      return;
    }

    if (!bankForm.momoProvider) {
      Alert.alert('Error', 'Please select a Mobile Money provider');
      return;
    }

    setShowBankModal(false);
    Alert.alert('Success', 'Payment details updated successfully!');
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
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.homeButton}
          >
            <Ionicons name="home-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: riderProfile.profilePhoto }}
                style={styles.profileImage}
              />
              <TouchableOpacity
                onPress={() => setShowEditModal(true)}
                style={styles.cameraButton}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{riderProfile.name}</Text>
              <Text style={styles.profilePhone}>{riderProfile.phone}</Text>
              <View style={styles.profileBadges}>
                <View style={styles.badge}>
                  <Ionicons name="star" size={14} color="#facc15" />
                  <Text style={styles.badgeText}>{riderProfile.rating}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.blue[100] }]}>
                  <Text style={[styles.badgeText, { color: colors.blue[600] }]}>
                    {riderProfile.totalTrips} trips
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            style={styles.editButton}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color="#ffffff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Verification Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verification Status</Text>
          {[
            { label: "Driver's License", status: 'verified', icon: 'id-card-outline' },
            { label: 'Tricycle Registration', status: 'verified', icon: 'car-outline' },
            { label: 'Insurance', status: 'verified', icon: 'shield-checkmark-outline' },
            { label: 'Background Check', status: 'verified', icon: 'search-outline' }
          ].map((item, index) => (
            <View key={index} style={styles.verificationItem}>
              <View style={styles.verificationLeft}>
                <View style={styles.verificationIcon}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={styles.verificationLabel}>{item.label}</Text>
              </View>
              <View style={styles.verificationRight}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.verificationStatus}>Verified</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.blue[100] }]}>
                <Ionicons name="notifications-outline" size={20} color={colors.blue[600]} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive trip alerts</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.amber[100] }]}>
                <Ionicons name="volume-high-outline" size={20} color={colors.amber[600]} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Sound Alerts</Text>
                <Text style={styles.settingDescription}>Audio for new requests</Text>
              </View>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#e9d5ff' }]}>
                <Ionicons name="flash-outline" size={20} color="#9333ea" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Auto-Accept</Text>
                <Text style={styles.settingDescription}>Automatically accept trips</Text>
              </View>
            </View>
            <Switch
              value={autoAccept}
              onValueChange={setAutoAccept}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <View style={styles.paymentHeader}>
            <Text style={styles.cardTitle}>Payment Details</Text>
            <TouchableOpacity
              onPress={() => setShowBankModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.momoCard}>
            <View style={styles.momoIcon}>
              <Ionicons name="phone-portrait-outline" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.momoProvider}>
                {bankForm.momoProvider} Mobile Money
              </Text>
              <Text style={styles.momoNumber}>{bankForm.momoNumber}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Support')}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.blue[100] }]}>
              <Ionicons name="help-circle-outline" size={20} color={colors.blue[600]} />
            </View>
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Borla Wura Partner v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        <Text style={styles.modalTitle}>Edit Profile</Text>
        <View style={styles.modalForm}>
          <View style={styles.modalInputContainer}>
            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              style={styles.modalInput}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.modalInputContainer}>
            <Text style={styles.modalLabel}>Phone Number</Text>
            <TextInput
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              style={styles.modalInput}
              placeholder="0501234567"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.modalInputContainer}>
            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              style={styles.modalInput}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSaveProfile}
          style={styles.modalSaveButton}
          activeOpacity={0.8}
        >
          <Text style={styles.modalSaveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </Modal>

      {/* Bank Details Modal */}
      <Modal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
      >
        <Text style={styles.modalTitle}>Payment Details</Text>
        <View style={styles.modalForm}>
          <View style={styles.modalInputContainer}>
            <Text style={styles.modalLabel}>Mobile Money Provider</Text>
            <View style={styles.modalSelect}>
              <Text style={styles.modalSelectText}>{bankForm.momoProvider} Mobile Money</Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </View>
          </View>

          <View style={styles.modalInputContainer}>
            <Text style={styles.modalLabel}>Mobile Money Number</Text>
            <TextInput
              value={bankForm.momoNumber}
              onChangeText={(text) => setBankForm({ ...bankForm, momoNumber: text })}
              style={styles.modalInput}
              placeholder="0501234567"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSaveBank}
          style={styles.modalSaveButton}
          activeOpacity={0.8}
        >
          <Text style={styles.modalSaveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLighter,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  homeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.primaryLight,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  verificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  verificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verificationStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  momoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  momoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  momoProvider: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  momoNumber: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  versionText: {
    fontSize: 12,
    color: colors.text.light,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalForm: {
    gap: 16,
    marginBottom: 24,
  },
  modalInputContainer: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  modalInput: {
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  modalSelect: {
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSelectText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalSaveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});







