import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashPage() {
  const navigation = useNavigation<any>();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // ENTRANCE SEQUENCE
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    // PERSISTENT PULSE
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    return () => {};
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient colors={['#0e3325', '#1a4d3a', '#0e3325']} style={StyleSheet.absoluteFill} />
      
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
         <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image 
              source={require('../../../assets/BorlaWuraLogo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
         </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
         <View style={styles.loaderBar}>
            <Animated.View style={[styles.loaderFill, { width: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
         </View>
         <View style={styles.textGroup}>
            <View style={styles.dot} />
            <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
            <View style={styles.dot} />
         </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center' },
  logo: { width: '100%', height: '100%', borderRadius: 40 },
  footer: { position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' },
  loaderBar: { width: width * 0.4, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  loaderFill: { height: '100%', backgroundColor: '#10b981' },
  textGroup: { flexDirection: 'row', gap: 10, marginTop: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' }
});
