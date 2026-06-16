import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', title: 'ELITE LOGISTICS', description: 'Join the most professional waste management network in West Africa.', image: 'https://readdy.ai/api/search-image?query=professional%20truck&width=500&height=500', icon: 'shield-checkmark' },
  { id: '2', title: 'SURGICAL PRECISION', description: 'Real-time GPS tracking and intelligent mission routing at your fingertips.', image: 'https://readdy.ai/api/search-image?query=digital%20map&width=500&height=500', icon: 'navigate' },
  { id: '3', title: 'COMMAND CONTROL', description: 'Manage your jobs, fleet awareness, and earnings in one elite terminal.', image: 'https://readdy.ai/api/search-image?query=dashboard%20interface&width=500&height=500', icon: 'terminal' }
];

export default function OnboardingPage() {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Register');
    }
  };

  const renderSlide = ({ item }: { item: any }) => (
    <View style={styles.slide}>
       <Image source={{ uri: item.image }} style={styles.slideImage} />
       <LinearGradient colors={['transparent', 'rgba(14, 51, 37, 0.8)', '#0e3325']} style={styles.gradient} />
       <View style={styles.textContainer}>
          <View style={styles.iconBox}><Ionicons name={item.icon} size={30} color="#10b981" /></View>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDesc}>{item.description}</Text>
       </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <FlatList
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      <View style={styles.footer}>
         <View style={styles.indicatorContainer}>
            {SLIDES.map((_, i) => {
              const dotWidth = scrollX.interpolate({ inputRange: [(i - 1) * width, i * width, (i + 1) * width], outputRange: [8, 24, 8], extrapolate: 'clamp' });
              return <Animated.View key={i} style={[styles.dot, { width: dotWidth }]} />;
            })}
         </View>
         <TouchableOpacity style={styles.nextBtn} onPress={scrollToNext}>
            <Text style={styles.nextText}>{currentIndex === SLIDES.length - 1 ? 'GET STARTED' : 'CONTINUE'}</Text>
            <Ionicons name="arrow-forward" size={24} color="#0e3325" />
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e3325' },
  slide: { width, height: '100%' },
  slideImage: { width: '100%', height: '70%', resizeMode: 'cover' },
  gradient: { position: 'absolute', bottom: 0, width: '100%', height: '60%' },
  textContainer: { position: 'absolute', bottom: 180, width: '100%', paddingHorizontal: 30 },
  iconBox: { width: 64, height: 64, borderRadius: 24, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  slideTitle: { fontSize: 32, fontFamily: 'Montserrat_900Black', color: '#fff', letterSpacing: 2 },
  slideDesc: { fontSize: 16, fontFamily: 'Montserrat_700Bold', color: '#10b981', marginTop: 15, lineHeight: 24 },
  footer: { position: 'absolute', bottom: 60, width: '100%', paddingHorizontal: 30, alignItems: 'center' },
  indicatorContainer: { flexDirection: 'row', height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#10b981', marginHorizontal: 4 },
  nextBtn: { height: 74, width: '100%', backgroundColor: '#fff', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, elevation: 20 },
  nextText: { fontSize: 18, fontFamily: 'Montserrat_900Black', color: '#0e3325', letterSpacing: 1 }
});
