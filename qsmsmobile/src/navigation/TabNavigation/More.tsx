import ProfileHeader from "@/src/components/ProfileHeader";
import Section, { SectionItem } from "@/src/components/Section";
import { fetchUserProfile } from "@/src/service/apiClient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LoginContext } from "../../context";

interface UserProfile {
  displayName: string;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  userid: string | number | null;
  accountType: string | null;
  reference: string | null;
  location: string | null;
}

const MoreScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { setLogin } = useContext(LoginContext);
  const [user, setUser] = useState<UserProfile>({
    displayName: "User",
    email: null,
    phone: null,
    photoURL: null,
    userid: null,
    accountType: null,
    reference: null,
    location: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
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

      // Try to fetch profile from API
      if (userId && token) {
        try {
          const profileResponse = await fetchUserProfile(userId, token);
          if (profileResponse.status === "success" && profileResponse.data) {
            const profile = profileResponse.data;
            const location = [profile.city, profile.region, profile.country]
              .filter(Boolean)
              .join(", ");
            
            setUser({
              displayName: profile.email?.split("@")[0] || "User",
              email: profile.email || null,
              phone: profile.phone || null,
              photoURL: profile.image || null,
              userid: profile.id,
              accountType: profile.account_type || null,
              reference: profile.reference || null,
              location: location || null,
            });
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
        const location = [parsed.city, parsed.region, parsed.country]
          .filter(Boolean)
          .join(", ");
        
        setUser({
          displayName: parsed.displayName || parsed.email?.split("@")[0] || "User",
          email: parsed.email || null,
          phone: parsed.phone || null,
          photoURL: parsed.photoURL || parsed.image || null,
          userid: parsed.userid || parsed.id || userId || null,
          accountType: parsed.accountType || parsed.account_type || null,
          reference: parsed.reference || null,
          location: location || null,
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setLogin(false);
  };

 
  const sections = [
    {
      title: "MESSAGING",
      items: [
        { label: "Bulk Email", icon: "mail", screen: "BulkEmailScreen" },
        { label: "WhatsApp", icon: "logo-whatsapp", screen: "BulkWhatsappScreen" },
      ],
    },
    {
      title: "CONTACTS",
      items: [
        { label: "Contact Group", icon: "people", screen: "ContactGroupScreen" },
        { label: "Custom Group", icon: "albums", screen: "CustomGroupScreen" },
        { label: "Email Group", icon: "mail-open", screen: "EmailGroupScreen" },
      ],
    },
    {
      title: "TOOLS",
      items: [
        { label: "Shorten URL", icon: "link", screen: "ShortenUrlScreen" },
        { label: "SMS Report", icon: "document-text", screen: "SmsReportScreen" },
        { label: "Voice Report", icon: "mic", screen: "VoiceReportScreen" },
        { label: "Repeat List", icon: "repeat", screen: "RepeatListScreen" },
      ],
    },
    {
      title: "DEVELOPER",
      items: [
        { label: "API Keys", icon: "key", screen: "ApiIntegrationScreen" },
        { label: "Generate Key", icon: "key-outline", screen: "GenerateKeyScreen" },
        { label: "SMS API", icon: "paper-plane", screen: "SmsApiScreen" },
        { label: "Voice API", icon: "mic-circle", screen: "VoiceSmsApiScreen" },
        { label: "OTP API", icon: "lock-closed", screen: "OtpApiScreen" },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[0]}
      >
        <ProfileHeader 
          name={user.displayName}
          referenceId={user.reference || user.userid?.toString() || "N/A"}
          email={user.email}
          phone={user.phone}
          avatar={user.photoURL}
          accountType={user.accountType}
          location={user.location}
          loading={loading}
        />

        <View style={styles.content}>
          {sections.map((section, idx) => {
            const items: SectionItem[] = section.items.map((item) => ({
              label: item.label,
              icon: item.icon,
              onPress: () => navigation.navigate(item.screen as never),
            }));

            return (
              <Animated.View
                key={idx}
                entering={FadeInDown.duration(400).delay(100 * idx)}
              >
                <Section title={section.title} items={items} />
              </Animated.View>
            );
          })}

          {/* Quick Links */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(500)}
            style={styles.quickLinksSection}
          >
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            
            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => navigation.navigate("PaymentsScreen" as never)}
            >
              <View style={[styles.listIcon, { backgroundColor: "#F0EEFF" }]}>
                <Ionicons name="wallet" size={20} color="#667eea" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>Payment History</Text>
                <Text style={styles.listSubtitle}>View all transactions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => navigation.navigate("SettingsScreen" as never)}
            >
              <View style={[styles.listIcon, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="settings" size={20} color="#6B7280" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>Settings</Text>
                <Text style={styles.listSubtitle}>Account preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => {}}
            >
              <View style={[styles.listIcon, { backgroundColor: "#E0F2FE" }]}>
                <Ionicons name="help-circle" size={20} color="#0284C7" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>Help & Support</Text>
                <Text style={styles.listSubtitle}>Get assistance</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </Animated.View>

          {/* Sign Out Button */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(600)}
            style={styles.signOutContainer}
          >
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
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
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickLinksSection: {
    marginBottom: 24,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
  },
  listSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 2,
  },
  signOutContainer: {
    marginTop: 8,
  },
  signOutButton: {
    borderRadius: 16,
    overflow: "hidden",
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
    marginTop: 24,
  },
});

export default MoreScreen;
