import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Dimensions, Image, Animated as RNAnimated, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, SlideInUp, ZoomIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation<any>();
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for logo
    const pulse = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Rotate animation for decorative circles
    const rotate = RNAnimated.loop(
      RNAnimated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    rotate.start();

    // Check if onboarding has been completed
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const timer = setTimeout(() => {
          if (hasSeenOnboarding === 'true') {
            navigation.replace('Welcome');
          } else {
            navigation.replace('Onboarding');
          }
        }, 5000);
        return () => clearTimeout(timer);
      } catch (error) {
        setTimeout(() => navigation.replace('Onboarding'), 5000);
      }
    };

    checkOnboarding();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#6B73FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Decorative animated circles */}
      <RNAnimated.View 
        style={[
          styles.decorativeCircle1, 
          { transform: [{ rotate: spin }] }
        ]} 
      />
      <RNAnimated.View 
        style={[
          styles.decorativeCircle2, 
          { transform: [{ rotate: spin }] }
        ]} 
      />
      <RNAnimated.View 
        style={[
          styles.decorativeCircle3, 
          { transform: [{ rotate: spin }] }
        ]} 
      />

      {/* Floating particles */}
      <Animated.View 
        entering={FadeIn.delay(500).duration(1000)} 
        style={styles.particle1} 
      />
      <Animated.View 
        entering={FadeIn.delay(700).duration(1000)} 
        style={styles.particle2} 
      />
      <Animated.View 
        entering={FadeIn.delay(900).duration(1000)} 
        style={styles.particle3} 
      />
      <Animated.View 
        entering={FadeIn.delay(1100).duration(1000)} 
        style={styles.particle4} 
      />

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo with pulse animation */}
        <Animated.View entering={ZoomIn.duration(800).springify()}>
          <RNAnimated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow} />
              <Image 
                source={require('../../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </RNAnimated.View>
        </Animated.View>

        {/* Brand name */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(800).springify()}
          style={styles.brandContainer}
        >
          <Text style={styles.brandPrefix}>Quick</Text>
          <Text style={styles.brandSuffix}>SMS</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View entering={FadeInUp.delay(600).duration(800)}>
          <Text style={styles.tagline}>
            Fast. Reliable. Instant Messaging.
          </Text>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View 
          entering={SlideInUp.delay(1000).duration(600)}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingBar}>
            <RNAnimated.View 
              style={[
                styles.loadingProgress,
                {
                  transform: [{
                    scaleX: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.3, 1],
                    })
                  }]
                }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </Animated.View>
      </View>

      {/* Bottom branding */}
      <Animated.View 
        entering={FadeIn.delay(1200).duration(800)}
        style={styles.bottomBranding}
      >
        <Text style={styles.poweredBy}>Powered by</Text>
        <Text style={styles.companyName}>Links Engineering</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.3,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  particle1: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  particle2: {
    position: 'absolute',
    top: '25%',
    right: '15%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  particle3: {
    position: 'absolute',
    bottom: '30%',
    left: '10%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  particle4: {
    position: 'absolute',
    bottom: '20%',
    right: '25%',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  brandPrefix: {
    fontSize: 42,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2,
  },
  brandSuffix: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
    letterSpacing: 1,
    fontWeight: '300',
  },
  loadingContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  loadingBar: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  bottomBranding: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  companyName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 1,
  },
});

export default SplashScreen;
