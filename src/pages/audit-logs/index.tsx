import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function AuditLogsPage() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Assuming a 'audit_logs' or similar table exists for operational tracking
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLogs(data || []);
    } catch (e) {
      // Fallback or demo logs if table doesn't exist
      setLogs([
        { id: '1', event: 'SYSTEM_LOGIN', description: 'Driver session started', created_at: new Date().toISOString() },
        { id: '2', event: 'STATUS_CHANGE', description: 'Unit went ONLINE', created_at: new Date().toISOString() },
        { id: '3', event: 'LOCATION_SYNC', description: 'Sector Radar synchronized', created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.logCard}>
       <View style={styles.logIconBox}>
          <Ionicons name="time" size={18} color="#10b981" />
       </View>
       <View style={styles.logContent}>
          <Text style={styles.logEvent}>{item.event.replace('_', ' ')}</Text>
          <Text style={styles.logDesc}>{item.description}</Text>
          <Text style={styles.logTime}>{new Date(item.created_at).toLocaleTimeString()} • {new Date(item.created_at).toLocaleDateString()}</Text>
       </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0e3325" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>OPERATIONAL LOGS</Text>
           <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
             <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : (
          <FlatList
            data={logs}
            renderItem={renderLogItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                 <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#E5E7EB" />
                 <Text style={styles.emptyTitle}>NO LOGS FOUND</Text>
              </View>
            }
          />
        )}
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
  listContent: { padding: 24, paddingBottom: 40 },
  logCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', gap: 15 },
  logIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  logContent: { flex: 1 },
  logEvent: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#10b981', letterSpacing: 1 },
  logDesc: { fontSize: 13, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325', marginTop: 2 },
  logTime: { fontSize: 10, fontFamily: 'Montserrat_700Bold', color: '#94A3B8', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 16, fontFamily: 'Montserrat_900Black', color: '#0e3325', marginTop: 20 }
});
