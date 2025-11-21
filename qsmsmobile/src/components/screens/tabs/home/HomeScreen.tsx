// src/screens/HomeScreen.tsx
import CreditsCard from "@/src/components/CreditsCard";
import Header from "@/src/components/Header";
import QuickActions from "@/src/components/QuickActions";
import QuickOffers from "@/src/components/QuickOffers";
import StatsCards from "@/src/components/StatCards";
import React from "react";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



export const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#FBFAF6]">
      <View className="flex-1">
        <Header />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Platform.OS === "ios" ? 120 : 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="py-4 space-y-6">
            <View>
              <View>
                {/* Title */}
              </View>
            </View>

            <StatsCards />

             <CreditsCard />

            <QuickActions />

            <QuickOffers /> 
          </View>
        </ScrollView>

        {}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
