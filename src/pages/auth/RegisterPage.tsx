import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const navigation = useNavigation<any>();
  const { updateRegistrationData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!email || !password || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    
    updateRegistrationData({ email, password, phone: phoneNumber });
    navigation.navigate('PersonalInfo');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0e3325" />
           </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           <View style={styles.heroBox}>
              <Image source={require('../../../assets/BorlaWuraLogo.png')} style={styles.logo} />
              <Text style={styles.title}>JOIN THE FLEET</Text>
              <Text style={styles.subTitle}>Create your driver credentials to begin.</Text>
           </View>

           <View style={styles.form}>
              <View style={styles.inputGroup}>
                 <Text style={styles.label}>EMAIL ADDRESS</Text>
                 <TextInput 
                   style={styles.input} 
                   value={email} 
                   onChangeText={setEmail} 
                   placeholder="driver@borlawura.com" 
                   autoCapitalize="none"
                   keyboardType="email-address"
                 />
              </View>

              <View style={styles.inputGroup}>
                 <Text style={styles.label}>PHONE NUMBER</Text>
                 <TextInput 
                   style={styles.input} 
                   value={phoneNumber} 
                   onChangeText={setPhoneNumber} 
                   placeholder="024XXXXXXX" 
                   keyboardType="phone-pad"
                 />
              </View>

              <View style={styles.inputGroup}>
                 <Text style={styles.label}>PASSWORD</Text>
                 <TextInput 
                   style={styles.input} 
                   value={password} 
                   onChangeText={setPassword} 
                   placeholder="••••••••" 
                   secureTextEntry
                 />
              </View>

              <TouchableOpacity style={styles.mainBtn} onPress={handleNext} disabled={isLoading}>
                 {isLoading ? <ActivityIndicator color="#fff" /> : (
                   <>
                     <Text style={styles.btnText}>CONTINUE REGISTRATION</Text>
                     <Ionicons name="arrow-forward" size={24} color="#fff" />
                   </>
                 )}
              </TouchableOpacity>
           </View>

           <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PhoneLogin')}>
                 <Text style={styles.loginLink}>LOG IN</Text>
              </TouchableOpacity>
           </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12 },
  scrollContent: { padding: 30, paddingBottom: 50 },
  heroBox: { alignItems: 'center', marginBottom: 50 },
  logo: { width: 100, height: 100, borderRadius: 25, marginBottom: 25 },
  title: { fontSize: 24, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 1 },
  subTitle: { fontSize: 14, fontFamily: 'Montserrat_700Bold', color: '#94A3B8', textAlign: 'center', marginTop: 10 },
  form: { gap: 25 },
  inputGroup: { gap: 10 },
  label: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1.5 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 20, padding: 20, fontSize: 14, fontFamily: 'Montserrat_800ExtraBold', color: '#0e3325', borderWidth: 1, borderColor: '#F1F5F9' },
  mainBtn: { height: 74, backgroundColor: '#10b981', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, marginTop: 20, elevation: 10 },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat_900Black', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 40 },
  footerText: { fontSize: 13, fontFamily: 'Montserrat_700Bold', color: '#94A3B8' },
  loginLink: { fontSize: 13, fontFamily: 'Montserrat_900Black', color: '#10b981' }
});
