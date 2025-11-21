// src/components/StatsCards.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const StatsCards = () => {
  return (
    <View className="flex-row justify-between w-full gap-3 mt-2">

      {/* Sent Today */}
      <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="w-9 h-9 rounded-lg bg-blue-50 items-center justify-center">
            <MaterialIcons name="wallet" size={18} color="#2563EB" />
          </View>

          <View className="bg-emerald-50 px-2 py-0.5 rounded-md">
            <View className="flex-row items-center">
              <MaterialIcons name="trending-up" size={12} color="#16A34A" />
              <Text className="text-emerald-600 text-xs ml-1">+12%</Text>
            </View>
          </View>
        </View>

        <Text className="text-2xl font-bold">27,248</Text>
        <Text className="text-xs text-gray-500 mt-1 font-bold">Credits</Text>
      </View>

      {/* Active Now */}
      <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="w-9 h-9 rounded-lg bg-purple-50 items-center justify-center">
            <MaterialIcons name="balance" size={18} color="#7C3AED" />
          </View>
          <View className="w-2 h-2 bg-purple-500 rounded-full mt-1" />
        </View>

        <Text className="text-2xl font-bold">3,064</Text>
        <Text className="text-xs text-gray-500 mt-1 font-bold">Consumed</Text>
      </View>

    </View>
  );
};

export default StatsCards;
