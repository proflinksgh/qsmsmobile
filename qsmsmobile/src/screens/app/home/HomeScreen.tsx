import CreditsCard from "@/src/components/CreditsCard";
import Header from "@/src/components/Header";
import QuickActions from "@/src/components/QuickActions";
import QuickOffers from "@/src/components/QuickOffers";
import StatsCards from "@/src/components/StatCards";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



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
