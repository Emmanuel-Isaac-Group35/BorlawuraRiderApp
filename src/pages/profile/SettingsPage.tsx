import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsPage() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const renderSettingRow = (icon: string, label: string, value: boolean, onToggle: (v: boolean) => void) => (
    <View style={styles.settingRow}>
       <View style={styles.iconBox}>
          <Ionicons name={icon as any} size={20} color="#10b981" />
       </View>
       <Text style={styles.settingLabel}>{label}</Text>
       <Switch 
         value={value} 
         onValueChange={onToggle} 
         trackColor={{ false: '#E5E7EB', true: '#10b981' }}
         thumbColor="#fff"
       />
    </View>
  );

  const renderLinkRow = (icon: string, label: string, sub: string, onPress: () => void) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
       <View style={styles.iconBox}>
          <Ionicons name={icon as any} size={20} color="#10b981" />
       </View>
       <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>{label}</Text>
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
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0e3325" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>APP SETTINGS</Text>
           <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           <Text style={styles.sectionHeader}>PREFERENCES</Text>
           <View style={styles.sectionCard}>
              {renderSettingRow('notifications', 'Push Notifications', notifications, setNotifications)}
              <View style={styles.divider} />
              {renderSettingRow('volume-high', 'System Sounds', sounds, setSounds)}
              <View style={styles.divider} />
              {renderSettingRow('moon', 'Dark Interface', darkMode, setDarkMode)}
           </View>

           <Text style={[styles.sectionHeader, { marginTop: 30 }]}>SECURITY & LOGS</Text>
           <View style={styles.sectionCard}>
              {renderLinkRow('shield-lock', 'Security Settings', 'Manage your password and pin', () => {})}
              <View style={styles.divider} />
              {renderLinkRow('list', 'Activity Audit Logs', 'View your operational history', () => navigation.navigate('AuditLogs'))}
           </View>

           <Text style={[styles.sectionHeader, { marginTop: 30 }]}>LEGAL</Text>
           <View style={styles.sectionCard}>
              {renderLinkRow('document-text', 'Privacy Policy', 'How we handle your data', () => {})}
              <View style={styles.divider} />
              {renderLinkRow('information-circle', 'App Version', 'Build 5.0.2 Zenith', () => {})}
           </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 1.5 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  sectionHeader: { fontSize: 9, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 15 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 28, padding: 10, elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 15 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 14, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325' },
  settingSub: { fontSize: 10, fontFamily: 'Montserrat_700Bold', color: '#94A3B8', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 15 }
});
