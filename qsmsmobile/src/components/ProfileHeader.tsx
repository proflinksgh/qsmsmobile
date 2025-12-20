import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

interface Props {
  name: string;
  referenceId: string;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  accountType?: string | null;
  location?: string | null;
  onEditPress?: () => void;
  onNotificationPress?: () => void;
  loading?: boolean;
}

const ProfileHeader = ({ 
  name, 
  referenceId, 
  avatar, 
  email, 
  phone,
  accountType,
  location,
  onEditPress,
  onNotificationPress,
  loading = false,
}: Props) => {
  const getInitials = (fullName: string) => {
    const names = fullName.split(" ");
    return names.length > 1
      ? names[0][0].toUpperCase() + names[1][0].toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative Shapes */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      {/* Settings Button */}
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.settingsContainer}
      >
        <TouchableOpacity style={styles.settingsButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={22} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Profile Content */}
      <Animated.View 
        entering={FadeInUp.duration(600).delay(100)}
        style={styles.profileContent}
      >
        {/* Avatar */}
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={onEditPress}
          activeOpacity={0.8}
        >
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={["#f093fb", "#f5576c"]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
            </LinearGradient>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={12} color="white" />
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <Text style={styles.userName}>{name}</Text>
        {email && <Text style={styles.userEmail}>{email}</Text>}
        
        {/* Account Type & ID Badges */}
        <View style={styles.badgeRow}>
          {accountType && (
            <View style={styles.accountTypeBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.accountTypeText}>{accountType}</Text>
            </View>
          )}
          <View style={styles.refBadge}>
            <Text style={styles.refText}>ID: {referenceId}</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={12} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location & Phone */}
        {(location || phone) && (
          <View style={styles.infoRow}>
            {location && (
              <View style={styles.infoItem}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoText}>{location}</Text>
              </View>
            )}
            {phone && (
              <View style={styles.infoItem}>
                <Ionicons name="call" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoText}>{phone}</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorCircle3: {
    position: "absolute",
    top: 60,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  settingsContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    right: 20,
    zIndex: 10,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContent: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarInitials: {
    fontSize: 28,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 22,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  accountTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  accountTypeText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSansBold",
    color: "#FFD700",
  },
  refBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  refText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "rgba(255,255,255,0.9)",
  },
  copyButton: {
    padding: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

export default ProfileHeader;
