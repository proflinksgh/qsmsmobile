import ScreenHeader from "@/src/components/ScreenHeader";
import { LoginContext } from "@/src/context";
import { fetchUserProfile } from "@/src/service/apiClient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface UserData {
  displayName: string;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  userid: string | number | null;
  accountType: string | null;
  reference: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
  createdAt: string | null;
}

interface MenuItemProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={20} color={iconColor} />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuTitle, danger && { color: "#DC2626" }]}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
  </TouchableOpacity>
);

const UserProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { setLogin } = useContext(LoginContext);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
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
            const userData: UserData = {
              displayName: profile.email?.split("@")[0] || "User",
              email: profile.email || null,
              phone: profile.phone || null,
              photoURL: profile.image || null,
              userid: profile.id,
              accountType: profile.account_type || null,
              reference: profile.reference || null,
              city: profile.city || null,
              country: profile.country || null,
              region: profile.region || null,
              createdAt: profile.created_at || null,
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
        const parsed = JSON.parse(userData);
        setUser({
          displayName: parsed.displayName || parsed.email?.split("@")[0] || "User",
          email: parsed.email || null,
          phone: parsed.phone || null,
          photoURL: parsed.photoURL || parsed.image || null,
          userid: parsed.userid || parsed.id || userId || null,
          accountType: parsed.accountType || parsed.account_type || null,
          reference: parsed.reference || null,
          city: parsed.city || null,
          country: parsed.country || null,
          region: parsed.region || null,
          createdAt: parsed.createdAt || parsed.created_at || null,
        });
      } else if (userId) {
        setUser({
          displayName: "User",
          email: null,
          phone: null,
          photoURL: null,
          userid: userId,
          accountType: null,
          reference: null,
          city: null,
          country: null,
          region: null,
          createdAt: null,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.length > 1
      ? names[0][0].toUpperCase() + names[1][0].toUpperCase()
      : names[0][0].toUpperCase();
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            setLogin(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Profile" subtitle="Manage your account" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" subtitle="Manage your account" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={["#f093fb", "#f5576c"]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarInitials}>
                    {user ? getInitials(user.displayName) : "U"}
                  </Text>
                </LinearGradient>
              )}
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={14} color="white" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <Text style={styles.userName}>{user?.displayName || "User"}</Text>
            {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
            
            {/* Account Type & Reference Badges */}
            <View style={styles.badgeRow}>
              {user?.accountType && (
                <View style={styles.accountTypeBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.accountTypeText}>{user.accountType}</Text>
                </View>
              )}
              {user?.userid && (
                <View style={styles.userIdBadge}>
                  <Text style={styles.userIdText}>ID: {user.userid}</Text>
                </View>
              )}
            </View>

            {/* Location Info */}
            {(user?.city || user?.region || user?.country) && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.locationText}>
                  {[user?.city, user?.region, user?.country].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Account Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              iconColor="#667eea"
              iconBg="#F0EEFF"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => navigation.navigate("EditProfile")}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="mail-outline"
              iconColor="#0284C7"
              iconBg="#E0F2FE"
              title="Email"
              subtitle={user?.email || "Not set"}
              showArrow={false}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="call-outline"
              iconColor="#059669"
              iconBg="#D1FAE5"
              title="Phone"
              subtitle={user?.phone || "Not set"}
              showArrow={false}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="document-text-outline"
              iconColor="#8B5CF6"
              iconBg="#EDE9FE"
              title="Reference Number"
              subtitle={user?.reference || "Not available"}
              showArrow={false}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="location-outline"
              iconColor="#D97706"
              iconBg="#FEF3C7"
              title="Location"
              subtitle={[user?.city, user?.region, user?.country].filter(Boolean).join(", ") || "Not set"}
              showArrow={false}
            />
            {user?.createdAt && (
              <>
                <View style={styles.menuDivider} />
                <MenuItem
                  icon="calendar-outline"
                  iconColor="#DC2626"
                  iconBg="#FEE2E2"
                  title="Member Since"
                  subtitle={new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  showArrow={false}
                />
              </>
            )}
          </View>
        </Animated.View>

        {/* Security Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="lock-closed-outline"
              iconColor="#8B5CF6"
              iconBg="#EDE9FE"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => navigation.navigate("EditProfile")}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="shield-checkmark-outline"
              iconColor="#059669"
              iconBg="#D1FAE5"
              title="Two-Factor Authentication"
              subtitle="Add extra security"
            />
          </View>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              iconColor="#D97706"
              iconBg="#FEF3C7"
              title="Notifications"
              subtitle="Manage alerts & sounds"
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="language-outline"
              iconColor="#0284C7"
              iconBg="#E0F2FE"
              title="Language"
              subtitle="English (US)"
            />
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <LinearGradient
              colors={["#f5576c", "#f093fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signOutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* App Version */}
        <Text style={styles.versionText}>QuickSMS v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarInitials: {
    fontSize: 36,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  accountTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  accountTypeText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSansBold",
    color: "#FFD700",
  },
  userIdBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userIdText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSansMedium",
    color: "white",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 70,
  },
  signOutBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  signOutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#9CA3AF",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "#9CA3AF",
  },
});

export default UserProfileScreen;
