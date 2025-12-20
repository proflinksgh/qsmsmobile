import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import {
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  icon,
  showBack = true,
  rightAction,
}) => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* Header Content */}
      <View style={styles.content}>
        {/* Left - Back Button */}
        {showBack ? (
          <Animated.View entering={FadeIn.duration(400)}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Center - Title & Subtitle */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(100)}
          style={styles.titleContainer}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon as any} size={24} color="#667eea" />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </Animated.View>

        {/* Right - Action Button */}
        {rightAction ? (
          <Animated.View entering={FadeIn.duration(400)}>
            {rightAction}
          </Animated.View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
});

export default ScreenHeader;
