import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function TripCompletePage() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<any, any>>();
  const trip = route.params?.trip;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0e3325', '#1a4d3a', '#0e3325']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
           <Animated.View style={[styles.successIconBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.outerCircle}>
                 <View style={styles.innerCircle}>
                    <Ionicons name="checkmark-done" size={60} color="#fff" />
                 </View>
              </View>
           </Animated.View>

           <Animated.View style={[styles.textGroup, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.title}>MISSION COMPLETE</Text>
              <Text style={styles.subTitle}>High-quality service delivered.</Text>
           </Animated.View>

           <Animated.View style={[styles.statsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.statItem}>
                 <Text style={styles.statLabel}>SERVICE</Text>
                 <Text style={styles.statValue}>PICKUP</Text>
              </View>
              <View style={styles.dividerV} />
              <View style={styles.statItem}>
                 <Text style={styles.statLabel}>RATING</Text>
                 <View style={styles.ratingRow}>
                    <Text style={styles.statValue}>5.0</Text>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                 </View>
              </View>
              <View style={styles.dividerV} />
              <View style={styles.statItem}>
                 <Text style={styles.statLabel}>POINTS</Text>
                 <Text style={styles.statValue}>+25</Text>
              </View>
           </Animated.View>

           <View style={styles.footer}>
              <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.replace('MainTabs')}>
                 <Text style={styles.doneText}>BACK TO COMMAND</Text>
                 <Ionicons name="arrow-forward" size={24} color="#0e3325" />
              </TouchableOpacity>
           </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  successIconBox: { marginBottom: 40 },
  outerCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
  innerCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 20 },
  textGroup: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 28, fontFamily: 'Montserrat_900Black', color: '#fff', letterSpacing: 2 },
  subTitle: { fontSize: 14, fontFamily: 'Montserrat_700Bold', color: '#10b981', marginTop: 10 },
  statsCard: { backgroundColor: '#fff', width: '100%', borderRadius: 32, padding: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 15 },
  statItem: { alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 8, fontFamily: 'Montserrat_900Black', color: '#94A3B8', letterSpacing: 1.5 },
  statValue: { fontSize: 18, fontFamily: 'Montserrat_900Black', color: '#0e3325' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dividerV: { width: 1, height: 40, backgroundColor: '#F1F5F9' },
  footer: { position: 'absolute', bottom: 60, width: width - 60 },
  doneBtn: { height: 74, backgroundColor: '#fff', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, elevation: 20 },
  doneText: { fontSize: 18, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 1 }
});
