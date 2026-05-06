import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

const { width } = Dimensions.get('window');

interface SwipeButtonProps {
  title: string;
  onSwipeComplete: () => void;
  containerStyle?: object;
}

export const SwipeButton = ({ title, onSwipeComplete, containerStyle }: SwipeButtonProps) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [completed, setCompleted] = useState(false);
  const completedRef = useRef(false);
  const onSwipeCompleteRef = useRef(onSwipeComplete);

  // Keep refs updated
  React.useEffect(() => {
    onSwipeCompleteRef.current = onSwipeComplete;
  }, [onSwipeComplete]);

  React.useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  const [containerWidth, setContainerWidth] = useState(width - 48);

  const thumbWidth = 60;
  const maxSwipeRef = useRef(Math.max(0, containerWidth - thumbWidth - 10));

  // Keep maxSwipeRef updated whenever containerWidth changes
  React.useEffect(() => {
    maxSwipeRef.current = Math.max(0, containerWidth - thumbWidth - 10);
  }, [containerWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (!completedRef.current && gestureState.dx > 0 && gestureState.dx <= maxSwipeRef.current) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!completedRef.current) {
          if (gestureState.dx > maxSwipeRef.current * 0.7) {
            // Success swipe
            Animated.timing(pan, {
              toValue: maxSwipeRef.current,
              duration: 150,
              useNativeDriver: false,
            }).start(() => {
              setCompleted(true);
              onSwipeCompleteRef.current();
              
              // Reset after a moment in case it stays mounted
              setTimeout(() => {
                setCompleted(false);
                pan.setValue(0);
              }, 1000);
            });
          } else {
            // Snap back
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              bounciness: 10,
            }).start();
          }
        }
      },
    })
  ).current;

  return (
    <View 
      style={[styles.container, containerStyle]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{completed ? 'Done!' : title}</Text>
      </View>
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: pan }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons name="arrow-forward" size={24} color="#000" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    backgroundColor: '#000',
    borderRadius: 30,
    justifyContent: 'center',
    paddingHorizontal: 5,
    overflow: 'hidden',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  thumb: {
    width: 60,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
