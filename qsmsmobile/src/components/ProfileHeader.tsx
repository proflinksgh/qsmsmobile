import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, View } from "react-native";

interface Props {
  name: string;
  referenceId: string;
  avatar?: string;
}

const ProfileHeader = ({ name, referenceId, avatar }: Props) => {
  return (
    <LinearGradient
      colors={["#005CFF", "#003BB6"]} // gradient colors
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: "100%",
        alignItems: "center",
        paddingVertical: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: "hidden",
      }}
    >
      {/* Decorative Shapes (optional) */}
      <View
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -20,
          left: -20,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      />

      {/* Avatar */}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#E5E7EB",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        {avatar ? (
          <Image
            source={require("../../assets/images/avatar.jpg")}            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="person" size={32} color="#9CA3AF" />
        )}
      </View>

      {/* User Info */}
      <Text style={{ fontSize: 18, fontWeight: "600", color: "#FFFFFF" }}>{name}</Text>
      <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
        Ref ID: {referenceId}
      </Text>
    </LinearGradient>
  );
};

export default ProfileHeader;
