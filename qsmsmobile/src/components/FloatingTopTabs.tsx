import { BlurView } from "expo-blur";
import React from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface RouteType {
  key: string;
  name: string;
}

interface StateType {
  routes: RouteType[];
  index: number;
}

interface Props {
  state: StateType;
  descriptors: { [key: string]: any };
  navigation: { navigate: (name: string) => void };
}

const FloatingTopTabs = ({ state, descriptors, navigation }: Props) => {
  const Container = Platform.OS === "ios" ? BlurView : View;

  return (
    <View className="px-4 pt-8 items-center z-10">
      <Container
        intensity={25}
        tint="light"
        style={{ flexDirection: "row", borderRadius: 30, padding: 6, backgroundColor: Platform.OS === "android" ? "white" : "rgba(255,255,255,0.85)", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          {state.routes.map((route, index) => {
            const label =
              descriptors[route.key].options.tabBarLabel ??
              descriptors[route.key].options.title ??
              route.name;

            const focused = state.index === index;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: focused ? "white" : "transparent",
                  shadowColor: focused ? "#000" : undefined,
                  shadowOpacity: focused ? 0.08 : 0,
                  shadowRadius: focused ? 4 : 0,
                  elevation: focused ? 2 : 0,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: focused ? "#0066FF" : "#444" }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Container>
    </View>
  );
};

export default FloatingTopTabs;
