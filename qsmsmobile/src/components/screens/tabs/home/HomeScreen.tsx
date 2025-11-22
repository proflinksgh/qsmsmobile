import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CreditsCard from "@/src/components/ui/CreditsCard";
import Header from "@/src/components/ui/Header";
import QuickActions from "@/src/components/ui/QuickActions";
import QuickOffers from "@/src/components/ui/QuickOffers";
import StatsCards from "@/src/components/ui/StatCards";

const HomeScreen = () => {
  const navigation = useNavigation<any>();

 const handleActionPress = (screen: string) => {
  navigation.navigate("QuickActions", { screen }); 
};

  return (
    <SafeAreaView className="flex-1 bg-[#FBFAF6]">
      <View className="flex-1">
        <Header />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Platform.OS === "ios" ? 120 : 100,
          }}
        >
          <View className="py-4 space-y-6">
            <Text className="text-lg font-semibold">Balances</Text>

            <StatsCards />
            <CreditsCard />

            <QuickActions onActionPress={handleActionPress} />

            <QuickOffers />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
