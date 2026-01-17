import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Dimensions } from 'react-native';

const SplashPage = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0e3325" />
            <View style={styles.logoContainer}>
                <Animated.View style={{ opacity: fadeAnim, flexDirection: 'row' }}>
                    <Text style={styles.textWhite}>Borla Wura </Text>
                    <Text style={styles.textGreen}>Rider</Text>
                </Animated.View>
            </View>
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0e3325', // Dark Forest Green
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        paddingHorizontal: 20
    },
    textWhite: {
        color: '#ffffff',
        fontSize: width > 350 ? 32 : 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    textGreen: {
        color: '#34d399', // Bright distinctive green
        fontSize: width > 350 ? 32 : 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
});

export default SplashPage;
