import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const CreditsCard = () => {
  return (
    <View className="w-full mt-3">

      <LinearGradient
        colors={["#005CFF", "#003BB6"]}   // your gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 22,
          padding: 20,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Decorative shapes */}
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(255,255,255,0.09)",
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

        {/* Card Content */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/80 text-sm font-medium">
              Remaining Credits
            </Text>

            <Text className="text-white text-3xl font-bold mt-1">
              24,500
            </Text>

            <Text className="text-white/60 text-xs mt-1">
              Expires in 28 days
            </Text>
          </View>

          <TouchableOpacity className="bg-white rounded-xl flex-row items-center px-4 py-2.5">
            <MaterialIcons
              name="account-balance-wallet"
              size={18}
              color="#005CFF"
            />
            <Text className="ml-2 text-[#005CFF] font-bold">Top Up</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

    </View>
  );
};

export default CreditsCard;
