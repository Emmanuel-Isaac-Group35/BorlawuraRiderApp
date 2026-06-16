import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function SupportPage() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) {
      Alert.alert('Error', 'Please provide a subject and message.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user?.id,
        subject,
        message,
        status: 'open',
      });
      if (error) throw error;
      Alert.alert('Success', 'Your support ticket has been submitted.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not submit ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0e3325" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>HELP & SUPPORT</Text>
           <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           <View style={styles.heroBox}>
              <View style={styles.iconCircle}>
                 <MaterialCommunityIcons name="headset" size={40} color="#10b981" />
              </View>
              <Text style={styles.heroTitle}>How can we help?</Text>
              <Text style={styles.heroSub}>Submit a ticket and our team will get back to you shortly.</Text>
           </View>

           <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                 <Text style={styles.label}>SUBJECT</Text>
                 <TextInput 
                   style={styles.input} 
                   value={subject} 
                   onChangeText={setSubject} 
                   placeholder="e.g. App Issue, Job Inquiry" 
                   placeholderTextColor="#9CA3AF"
                 />
              </View>

              <View style={styles.inputGroup}>
                 <Text style={styles.label}>MESSAGE</Text>
                 <TextInput 
                   style={[styles.input, styles.textArea]} 
                   value={message} 
                   onChangeText={setMessage} 
                   placeholder="Describe your issue in detail..." 
                   placeholderTextColor="#9CA3AF"
                   multiline
                   numberOfLines={6}
                   textAlignVertical="top"
                 />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                 {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                   <>
                     <Text style={styles.submitText}>SUBMIT TICKET</Text>
                     <Ionicons name="send" size={20} color="#fff" />
                   </>
                 )}
              </TouchableOpacity>
           </View>

           <View style={styles.faqBox}>
              <Text style={styles.faqHeader}>FREQUENT QUESTIONS</Text>
              <TouchableOpacity style={styles.faqItem}>
                 <Text style={styles.faqText}>App connection issues</Text>
                 <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.faqItem}>
                 <Text style={styles.faqText}>Job tracking problems</Text>
                 <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
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
  heroBox: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 24, fontFamily: 'Montserrat_900Black', color: '#0e3325' },
  heroSub: { fontSize: 14, fontFamily: 'Montserrat_700Bold', color: '#9CA3AF', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  formSection: { gap: 25 },
  inputGroup: { gap: 10 },
  label: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#9CA3AF', letterSpacing: 1.5 },
  input: { backgroundColor: '#fff', borderRadius: 20, padding: 20, fontSize: 14, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325', borderWidth: 1, borderColor: '#F1F5F9' },
  textArea: { height: 150 },
  submitBtn: { height: 64, backgroundColor: '#10b981', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, elevation: 10 },
  submitText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat_900Black', letterSpacing: 1 },
  faqBox: { marginTop: 50, gap: 15 },
  faqHeader: { fontSize: 10, fontFamily: 'Montserrat_900Black', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 5 },
  faqItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  faqText: { fontSize: 12, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325' }
});
