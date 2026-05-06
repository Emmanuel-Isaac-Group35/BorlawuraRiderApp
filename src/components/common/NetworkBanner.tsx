import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NetworkBanner = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const slideAnim = useState(new Animated.Value(-100))[0];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      
      Animated.spring(slideAnim, {
        toValue: connected ? -100 : insets.top,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();
    });

    return () => unsubscribe();
  }, [insets.top]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.banner}>
        <Ionicons name="wifi" size={20} color="#fff" />
        <Text style={styles.text}>No Internet Connection - Offline</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  banner: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
