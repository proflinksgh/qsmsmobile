import ScreenHeader from "@/src/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface SettingItemProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  isSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  showArrow = true,
}) => (
  <TouchableOpacity 
    style={styles.settingItem}
    onPress={onPress}
    disabled={isSwitch}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={20} color={iconColor} />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {isSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onSwitchChange}
        trackColor={{ false: "#E5E7EB", true: "#B8A5FF" }}
        thumbColor={switchValue ? "#667eea" : "#f4f3f4"}
        ios_backgroundColor="#E5E7EB"
      />
    ) : showArrow ? (
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    ) : null}
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Settings" 
        subtitle="Manage your preferences"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      
        {/* Notifications Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="notifications"
              iconColor="#667eea"
              iconBg="#F0EEFF"
              title="Push Notifications"
              subtitle="Receive push notifications"
              isSwitch
              switchValue={notifications}
              onSwitchChange={setNotifications}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="mail"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title="Email Alerts"
              subtitle="Receive email notifications"
              isSwitch
              switchValue={emailAlerts}
              onSwitchChange={setEmailAlerts}
            />
          </View>
        </Animated.View>

        {/* Security Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="finger-print"
              iconColor="#8B5CF6"
              iconBg="#EDE9FE"
              title="Biometric Login"
              subtitle="Use fingerprint or Face ID"
              isSwitch
              switchValue={biometric}
              onSwitchChange={setBiometric}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark"
              iconColor="#10B981"
              iconBg="#D1FAE5"
              title="Two-Factor Auth"
              subtitle="Add extra security layer"
            />
          </View>
        </Animated.View>

        {/* Appearance Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="moon"
              iconColor="#6366F1"
              iconBg="#E0E7FF"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              isSwitch
              switchValue={darkMode}
              onSwitchChange={setDarkMode}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="language"
              iconColor="#0284C7"
              iconBg="#E0F2FE"
              title="Language"
              subtitle="English (US)"
            />
          </View>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="information-circle"
              iconColor="#6B7280"
              iconBg="#F3F4F6"
              title="App Version"
              subtitle="1.0.0"
              showArrow={false}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text"
              iconColor="#6B7280"
              iconBg="#F3F4F6"
              title="Terms of Service"
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield"
              iconColor="#6B7280"
              iconBg="#F3F4F6"
              title="Privacy Policy"
            />
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.duration(400).delay(600)}>
          <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>DANGER ZONE</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.dangerItem}>
              <View style={[styles.iconContainer, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: "#EF4444" }]}>
                  Delete Account
                </Text>
                <Text style={styles.settingSubtitle}>
                  Permanently delete your account
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 70,
  },
  dangerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
});

export default SettingsScreen;
