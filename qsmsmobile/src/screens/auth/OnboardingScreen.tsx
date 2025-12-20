import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Extrapolation,
    FadeIn,
    FadeInDown,
    FadeInUp,
    interpolate,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  features: string[];
}

const onboardingData: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Bulk SMS',
    subtitle: 'Reach Thousands Instantly',
    description: 'Send personalized messages to thousands of recipients with just a few taps. Perfect for marketing campaigns, notifications, and announcements.',
    icon: 'chatbubbles',
    iconColor: '#667eea',
    features: ['Contact Management', 'Message Templates', 'Scheduled Sending'],
  },
  {
    id: '2',
    title: 'Voice SMS',
    subtitle: 'Your Message, Their Voice',
    description: 'Convert your text messages to voice calls. Reach people who prefer listening over reading. Perfect for urgent announcements.',
    icon: 'mic',
    iconColor: '#764ba2',
    features: ['Text-to-Speech', 'Multiple Languages', 'Voice Recording'],
  },
  {
    id: '3',
    title: 'Email Marketing',
    subtitle: 'Professional Campaigns',
    description: 'Create stunning email campaigns with our easy-to-use templates. Track opens, clicks, and engagement in real-time.',
    icon: 'mail',
    iconColor: '#6B73FF',
    features: ['Email Templates', 'Analytics Dashboard', 'A/B Testing'],
  },
  {
    id: '4',
    title: 'API Integration',
    subtitle: 'Connect Your Systems',
    description: 'Integrate QuickSMS into your existing applications with our powerful REST API. Send messages programmatically.',
    icon: 'code-slash',
    iconColor: '#667eea',
    features: ['REST API', 'Webhook Support', 'SDKs Available'],
  },
  {
    id: '5',
    title: 'Get Started',
    subtitle: "Let's Begin Your Journey",
    description: 'Create your free account and start sending messages today. No credit card required to get started.',
    icon: 'rocket',
    iconColor: '#764ba2',
    features: ['Free Credits', '24/7 Support', 'Instant Setup'],
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Welcome');
    } catch (error) {
      navigation.replace('Welcome');
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View style={styles.slide}>
      {/* Icon Container */}
      <Animated.View 
        entering={FadeIn.delay(200).duration(600)}
        style={styles.iconOuterContainer}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
          style={styles.iconGradient}
        >
          <View style={[styles.iconInner, { backgroundColor: item.iconColor + '30' }]}>
            <Ionicons name={item.icon} size={60} color={item.iconColor} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Text Content */}
      <Animated.View 
        entering={FadeInUp.delay(300).duration(600)}
        style={styles.textContainer}
      >
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </Animated.View>

      {/* Features */}
      <Animated.View 
        entering={FadeInDown.delay(400).duration(600)}
        style={styles.featuresContainer}
      >
        {item.features.map((feature, featureIndex) => (
          <View key={featureIndex} style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: item.iconColor + '20' }]}>
              <Ionicons name="checkmark" size={16} color={item.iconColor} />
            </View>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );

  const PaginationDot = ({ index }: { index: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
      const dotWidth = interpolate(
        scrollX.value,
        inputRange,
        [8, 24, 8],
        Extrapolation.CLAMP
      );
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.4, 1, 0.4],
        Extrapolation.CLAMP
      );
      return {
        width: dotWidth,
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.paginationDot, animatedStyle]} />
    );
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#6B73FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      {/* Skip Button */}
      <Animated.View 
        entering={FadeIn.delay(500).duration(600)}
        style={styles.skipContainer}
      >
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Logo */}
      <Animated.View 
        entering={FadeInDown.delay(100).duration(600)}
        style={styles.logoContainer}
      >
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.brandRow}>
          <Text style={styles.brandQuick}>Quick</Text>
          <Text style={styles.brandSMS}>SMS</Text>
        </View>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => (
            <PaginationDot key={index} index={index} />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ffffff', '#f0f0f0']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons 
                name={currentIndex === onboardingData.length - 1 ? 'arrow-forward' : 'chevron-forward'} 
                size={20} 
                color="#667eea" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <Text style={styles.progressText}>
          {currentIndex + 1} of {onboardingData.length}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.4,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 45,
    height: 45,
  },
  brandRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  brandQuick: {
    fontSize: 20,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  brandSMS: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  flatList: {
    flex: 1,
    marginTop: 20,
  },
  flatListContent: {
    alignItems: 'center',
  },
  slide: {
    width: width,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  iconOuterContainer: {
    marginBottom: 30,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
  navigationContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
    marginRight: 8,
  },
  progressText: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default OnboardingScreen;
