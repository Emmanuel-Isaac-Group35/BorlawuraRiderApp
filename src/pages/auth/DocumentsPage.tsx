import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

type DocType = 'license' | 'insurance' | 'permit';

export default function DocumentsPage() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  const [docs, setDocs] = useState({
    license: { uri: null, status: 'verified' },
    insurance: { uri: null, status: 'pending' },
    permit: { uri: null, status: 'none' },
  });

  const pickImage = async (type: DocType) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to upload documents.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDocs({
        ...docs,
        [type]: { uri: result.assets[0].uri, status: 'uploading' }
      });
      
      // Simulate Upload
      setTimeout(() => {
        setDocs(prev => ({
          ...prev,
          [type]: { ...prev[type], status: 'pending' }
        }));
      }, 2000);
    }
  };

  const renderUploader = (type: DocType, title: string, subtitle: string) => {
    const doc = docs[type];
    const isVerified = doc.status === 'verified';
    const isPending = doc.status === 'pending';
    const isUploading = doc.status === 'uploading';

    return (
      <View style={styles.uploaderCard}>
         <View style={styles.cardHeader}>
            <View>
               <Text style={styles.cardTitle}>{title.toUpperCase()}</Text>
               <Text style={styles.cardSub}>{subtitle}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isVerified ? '#f0fdf4' : isPending ? '#eff6ff' : '#f9fafb' }]}>
               <Text style={[styles.statusText, { color: isVerified ? '#10b981' : isPending ? '#3B82F6' : '#9CA3AF' }]}>
                  {doc.status.toUpperCase()}
               </Text>
            </View>
         </View>

         <TouchableOpacity 
           style={[styles.uploadBox, isVerified && styles.verifiedBox]} 
           onPress={() => !isVerified && pickImage(type)}
           disabled={isVerified || isUploading}
         >
            {isUploading ? (
              <ActivityIndicator color="#10b981" />
            ) : doc.uri ? (
              <Image source={{ uri: doc.uri }} style={styles.preview} />
            ) : isVerified ? (
              <View style={styles.verifiedContent}>
                 <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                 <Text style={styles.verifiedLabel}>DOCUMENT VERIFIED</Text>
              </View>
            ) : (
              <>
                 <Ionicons name="camera-outline" size={32} color="#10b981" />
                 <Text style={styles.uploadLabel}>TAP TO CAPTURE</Text>
              </>
            )}
         </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0e3325" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>VERIFICATION VAULT</Text>
           <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
           <View style={styles.infoBanner}>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
              <View style={styles.infoTextContainer}>
                 <Text style={styles.infoTitle}>SECURE DOCUMENTS</Text>
                 <Text style={styles.infoSub}>Your data is encrypted and used only for fleet verification purposes.</Text>
              </View>
           </View>

           {renderUploader('license', "Driver's License", "Front view of your valid driving license")}
           {renderUploader('insurance', "Vehicle Insurance", "Official insurance policy document")}
           {renderUploader('permit', "Operational Permit", "Business or waste collection permit")}

           <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.navigate('VehicleDetails' as never)}>
              <Text style={styles.saveBtnText}>NEXT: VEHICLE DETAILS</Text>
           </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 15, backgroundColor: '#fff' },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 12, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 2 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  infoBanner: { flexDirection: 'row', backgroundColor: '#0e3325', borderRadius: 24, padding: 20, marginBottom: 30, alignItems: 'center', gap: 16 },
  infoTextContainer: { flex: 1 },
  infoTitle: { color: '#10b981', fontSize: 10, fontFamily: 'Montserrat_900Black', letterSpacing: 1 },
  infoSub: { color: 'rgba(255,255,255,0.6)', fontSize: 8, fontFamily: 'Montserrat_800ExtraBold', marginTop: 2 },
  uploaderCard: { backgroundColor: '#fff', borderRadius: 32, padding: 24, marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardTitle: { fontSize: 12, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 0.5 },
  cardSub: { fontSize: 8, fontFamily: 'Montserrat_800ExtraBold', color: '#9CA3AF', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 7, fontFamily: 'Montserrat_900Black', letterSpacing: 1 },
  uploadBox: { height: 160, borderRadius: 24, backgroundColor: '#f9fafb', borderStyle: 'dashed', borderWidth: 2, borderColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  verifiedBox: { borderStyle: 'solid', borderColor: '#f0fdf4', backgroundColor: '#f0fdf4' },
  preview: { width: '100%', height: '100%' },
  uploadLabel: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#10b981', marginTop: 10, letterSpacing: 1 },
  verifiedContent: { alignItems: 'center' },
  verifiedLabel: { fontSize: 9, fontFamily: 'Montserrat_900Black', color: '#10b981', marginTop: 10 },
  saveBtn: { height: 64, backgroundColor: '#10b981', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat_900Black', letterSpacing: 1 }
});
