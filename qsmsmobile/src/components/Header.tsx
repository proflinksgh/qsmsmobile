import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";
import { fetchUserProfile } from "../service/apiClient";

type HeaderUser = {
  displayName: string;
  photoURL: string | null;
  email: string | null;
  userid?: string | number;
  phone?: string | null;
  accountType?: string | null;
  city?: string | null;
  country?: string | null;
  region?: string | null;
  reference?: string | null;
} | null;

const Header = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<HeaderUser>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoadingAvatar(true);
        const userId = await AsyncStorage.getItem("systemUserId");
        const tokenRaw = await SecureStore.getItemAsync("authToken");
        
        let token: string | null = null;
        if (tokenRaw) {
          try {
            const parsed = JSON.parse(tokenRaw);
            token = parsed?.token ?? tokenRaw;
          } catch {
            token = tokenRaw;
          }
        }

        // Try to fetch profile from API if we have userId and token
        if (userId && token) {
          try {
            const profileResponse = await fetchUserProfile(userId, token);
            if (profileResponse.status === "success" && profileResponse.data) {
              const profile = profileResponse.data;
              const userData = {
                displayName: profile.email?.split("@")[0] || "User",
                photoURL: profile.image || null,
                email: profile.email || null,
                userid: profile.id,
                phone: profile.phone || null,
                accountType: profile.account_type || null,
                city: profile.city || null,
                country: profile.country || null,
                region: profile.region || null,
                reference: profile.reference || null,
              };
              setUser(userData);
              // Cache the profile data
              await AsyncStorage.setItem("user", JSON.stringify(userData));
              return;
            }
          } catch (apiError) {
            console.log("API fetch failed, falling back to cached data:", apiError);
          }
        }

        // Fallback to cached data
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser({
            displayName: parsedUser.displayName || parsedUser.email?.split("@")[0] || "User",
            photoURL: parsedUser.photoURL || parsedUser.image || null,
            email: parsedUser.email || null,
            userid: parsedUser.userid || parsedUser.id || userId || null,
            phone: parsedUser.phone || null,
            accountType: parsedUser.accountType || parsedUser.account_type || null,
          });
        } else if (userId) {
          setUser({
            displayName: "User",
            photoURL: null,
            email: null,
            userid: userId,
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoadingAvatar(false);
      }
    };

    loadUserData();
  }, []);

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.length > 1
      ? names[0][0].toUpperCase() + names[1][0].toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#6B8DD6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Decorative Elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />
      
      {/* Top Row - Logo & Actions */}
      <View style={styles.topRow}>
        {/* Logo */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>Q</Text>
            </LinearGradient>
          </View>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>QuickSMS</Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInRight.duration(500).delay(100)} style={styles.actionsRow}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.avatarContainer} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate("UserProfile")}
          >
            {loadingAvatar ? (
              <ActivityIndicator size="small" color="#667eea" />
            ) : user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarInitials}>
                  {user ? getInitials(user.displayName) : "U"}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Quick Stats Bar */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.statsBar}>
        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <View style={styles.statIconContainer}>
            <Ionicons name="chatbubbles" size={16} color="#667eea" />
          </View>
          <View>
            <Text style={styles.statValue}>2,450</Text>
            <Text style={styles.statLabel}>SMS Sent</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="wallet" size={16} color="#D97706" />
          </View>
          <View>
            <Text style={styles.statValue}>5,000</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <View style={[styles.statIconContainer, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="trending-up" size={16} color="#059669" />
          </View>
          <View>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Delivery</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 55 : StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 45,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 60,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorCircle3: {
    position: 'absolute',
    bottom: 20,
    right: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 10,
  },
  logoGradient: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  logoText: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSansBold',
    color: '#667eea',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSansBold',
    color: 'white',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSansBold',
    color: '#4ADE80',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f5576c',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#764ba2',
  },
  badgeText: {
    fontSize: 8,
    fontFamily: 'PlusJakartaSansBold',
    color: 'white',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSansBold',
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#764ba2',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSansBold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans',
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
});

export default Header;
