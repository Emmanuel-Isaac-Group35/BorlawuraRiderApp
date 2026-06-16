import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  TextInput,
<<<<<<< HEAD
  Modal,
  ActivityIndicator,
=======
  Image,
  Switch,
  Alert,
  Linking,
  ActivityIndicator as RNActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const navigation = useNavigation<any>();
  const { profile, user, refreshProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.full_name || '');
  const [newPhone, setNewPhone] = useState(profile?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Session Termination', 'Authorize active session termination?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'TERMINATE', style: 'destructive', onPress: async () => await supabase.auth.signOut() },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!newName || !newPhone) { Alert.alert('Error', 'Incomplete data detected.'); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: newName, phone: newPhone }).eq('id', user?.id);
      if (error) throw error;
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Unit credentials modified successfully.');
    } catch (error) {
      Alert.alert('Error', 'Protocol failure during credential modification.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingItem = (icon: string, title: string, sub: string, onPress: () => void) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
       <View style={styles.settingIconBox}><Ionicons name={icon as any} size={22} color="#10b981" /></View>
       <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSub}>{sub}</Text>
       </View>
       <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
           <Text style={styles.headerTitle}>UNIT PROFILE & CREDENTIALS</Text>
           <TouchableOpacity onPress={() => navigation.navigate('Support')} style={styles.supportPill}>
              <Text style={styles.supportText}>SUPPORT PROTOCOL</Text>
           </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           <View style={styles.profileCard}>
              <View style={styles.avatarBox}>
                 <Image source={{ uri: profile?.avatar_url || 'https://readdy.ai/api/search-image?query=Portrait&width=200&height=200' }} style={styles.avatar} />
                 <TouchableOpacity style={styles.cameraBtn}><Ionicons name="camera" size={16} color="#fff" /></TouchableOpacity>
              </View>
              <Text style={styles.nameText}>{profile?.full_name?.toUpperCase() || 'RIDER UNIT'}</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                 <Text style={styles.editBtnText}>MODIFY UNIT CREDENTIALS</Text>
              </TouchableOpacity>
           </View>

<<<<<<< HEAD
           <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>ACCOUNT AUTHENTICATION</Text>
              {renderSettingItem('shield-checkmark-outline', 'Security Protocol', 'Encryption and access keys', () => {})}
              {renderSettingItem('document-lock-outline', 'Operational Docs', 'ID and license verification', () => {})}
              
              <Text style={[styles.sectionTitle, { marginTop: 32 }]}>SYSTEM GOVERNANCE</Text>
              {renderSettingItem('list-outline', 'Audit Logs', 'Activity telemetry journal', () => navigation.navigate('AuditLogs'))}
              {renderSettingItem('settings-outline', 'System Config', 'App parameters and telemetry', () => navigation.navigate('Settings'))}
              
              <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                 <Text style={styles.logoutText}>TERMINATE ACTIVE SESSION</Text>
                 <Ionicons name="power-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
           </View>
=======
        <Text style={styles.versionText}>Borlawura Rider App v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View>
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
          </View>
        </TouchableWithoutFeedback>
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
>>>>>>> 3fa97034ddd6b5cb3a310cb147955c8c0527fc9c
        </ScrollView>
      </SafeAreaView>

      <Modal visible={isEditing} animationType="slide" transparent>
         <View style={styles.modalOverlay}>
            <View style={styles.editCard}>
               <Text style={styles.modalTitle}>MODIFY UNIT CREDENTIALS</Text>
               <View style={styles.inputGroup}>
                  <Text style={styles.label}>LEGAL NAME</Text>
                  <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Identity string" />
               </View>
               <View style={styles.inputGroup}>
                  <Text style={styles.label}>TELEMETRY CONTACT</Text>
                  <TextInput style={styles.input} value={newPhone} onChangeText={setNewPhone} placeholder="Comm string" keyboardType="phone-pad" />
               </View>
               <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#F3F4F6' }]} onPress={() => setIsEditing(false)}>
                     <Text style={[styles.modalBtnText, { color: '#0e3325' }]}>ABORT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#10b981' }]} onPress={handleSaveProfile} disabled={isSaving}>
                     {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>EXECUTE MODIFICATION</Text>}
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  headerTitle: { fontSize: 10, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 1 },
  supportPill: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  supportText: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#10b981' },
  scrollContent: { paddingBottom: 40 },
  profileCard: { backgroundColor: '#fff', paddingVertical: 40, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, elevation: 10 },
  avatarBox: { width: 120, height: 120, borderRadius: 30, backgroundColor: '#f0fdf4', marginBottom: 20 },
  avatar: { width: '100%', height: '100%', borderRadius: 25 },
  cameraBtn: { position: 'absolute', bottom: -5, right: -5, width: 36, height: 36, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  nameText: { fontSize: 24, fontFamily: 'Montserrat_900Black', color: '#0e3325' },
  editBtn: { marginTop: 15, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f9fafb' },
  editBtnText: { fontSize: 9, fontFamily: 'Montserrat_900Black', color: '#10b981' },
  settingsSection: { padding: 24 },
  sectionTitle: { fontSize: 9, fontFamily: 'Montserrat_900Black', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 15 },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  settingIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  settingInfo: { flex: 1, marginLeft: 16 },
  settingTitle: { fontSize: 14, fontFamily: 'Montserrat_900Black', color: '#0e3325' },
  settingSub: { fontSize: 10, fontFamily: 'Montserrat_700Bold', color: '#94A3B8', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', height: 64, borderRadius: 24, marginTop: 40, gap: 12, elevation: 5 },
  logoutText: { color: '#EF4444', fontSize: 14, fontFamily: 'Montserrat_900Black', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  editCard: { backgroundColor: '#fff', borderRadius: 32, padding: 30 },
  modalTitle: { fontSize: 18, fontFamily: 'Montserrat_900Black', color: '#0e3325', marginBottom: 25 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#9CA3AF', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, fontSize: 14, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325', borderWidth: 1, borderColor: '#F1F5F9' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  modalBtn: { flex: 1, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { fontSize: 14, fontFamily: 'Montserrat_900Black', color: '#fff' }
});
