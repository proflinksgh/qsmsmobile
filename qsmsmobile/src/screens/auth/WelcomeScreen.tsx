import GoogleAuthButton from "@/src/components/GoogleAuthButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import ButtonOutline from "../../components/ButtonOutline";
import { COLORS } from "../../constants/theme";

const WelcomeScreen = () => {
  const { navigate: navigateAuth }: NavigationProp<AuthNavigationType> =
    useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar style="light" />

      {/* Top Section with Gradient Background */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 0.55,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          paddingTop: 60,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Logo */}
        <Animated.View
          entering={FadeIn.duration(800).delay(200)}
          style={{
            width: 100,
            height: 100,
            backgroundColor: COLORS.white,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 15,
          }}
        >
          <Image
            source={require("../../../assets/images/logo.png")}
            contentFit="contain"
            style={{ width: 70, height: 70 }}
          />
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          entering={FadeInUp.duration(600).delay(400)}
          style={{
            fontSize: 32,
            color: COLORS.white,
            fontFamily: "PlusJakartaSansBold",
            marginTop: 20,
            letterSpacing: 1,
          }}
        >
          QuickSMS
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          entering={FadeInUp.duration(600).delay(500)}
          style={{
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.8)",
            fontFamily: "PlusJakartaSans",
            marginTop: 8,
            textAlign: "center",
            paddingHorizontal: 40,
          }}
        >
          Fast, reliable messaging for your business
        </Animated.Text>

        {/* Feature Pills */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(600)}
          style={{
            flexDirection: "row",
            marginTop: 24,
            gap: 12,
          }}
        >
          <FeaturePill icon="message-text-fast" text="Bulk SMS" />
          <FeaturePill icon="phone-voip" text="Voice SMS" />
          <FeaturePill icon="api" text="API" />
        </Animated.View>
      </LinearGradient>

      {/* Bottom Section */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          flex: 0.45,
          paddingHorizontal: 24,
          paddingTop: 32,
          justifyContent: "space-between",
        }}
      >
        {/* Welcome Text */}
        <View>
          <Animated.Text
            entering={FadeInDown.duration(500).delay(700)}
            style={{
              fontSize: 28,
              color: COLORS.black,
              fontFamily: "PlusJakartaSansBold",
              textAlign: "center",
            }}
          >
            Get Started
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(500).delay(800)}
            style={{
              fontSize: 15,
              color: COLORS.gray,
              fontFamily: "PlusJakartaSans",
              textAlign: "center",
              marginTop: 8,
              lineHeight: 22,
            }}
          >
            Sign in to access your account or create a new one to start sending
            messages today
          </Animated.Text>
        </View>

        {/* Buttons */}
        <View style={{ gap: 12 }}>
          <Animated.View entering={FadeInDown.duration(500).delay(900)}>
            <Button title="Login" action={() => navigateAuth("Login")} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(1000)}>
            <ButtonOutline
              title="Create Account"
              action={() => navigateAuth("Register")}
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(1100)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 8,
            }}
          >
            <View
              style={{ flex: 1, height: 1, backgroundColor: COLORS.grayLight }}
            />
            <Text
              style={{
                marginHorizontal: 16,
                color: COLORS.gray,
                fontFamily: "PlusJakartaSans",
                fontSize: 13,
              }}
            >
              or continue with
            </Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: COLORS.grayLight }}
            />
          </Animated.View>

          {/* Google Auth Button */}
          <Animated.View entering={FadeInDown.duration(500).delay(1200)}>
            <GoogleAuthButton
              onSuccess={() => {
                // Navigation will be handled by LoginContext state change
              }}
              onError={(error) => {
                console.error("Google auth error:", error);
              }}
            />
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.Text
          entering={FadeInDown.duration(500).delay(1300)}
          style={{
            fontSize: 12,
            color: COLORS.gray,
            fontFamily: "PlusJakartaSans",
            textAlign: "center",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          By continuing, you agree to our{" "}
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            Privacy Policy
          </Text>
        </Animated.Text>
      </SafeAreaView>
    </View>
  );
};

// Feature Pill Component
const FeaturePill = ({
  icon,
  text,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    }}
  >
    <MaterialCommunityIcons name={icon} size={14} color={COLORS.white} />
    <Text
      style={{
        fontSize: 12,
        color: COLORS.white,
        fontFamily: "PlusJakartaSans",
      }}
    >
      {text}
    </Text>
  </View>
);

export default WelcomeScreen;
