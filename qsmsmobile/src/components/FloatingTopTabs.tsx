import { BlurView } from "expo-blur";
import React from "react";
import {
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

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
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
  paddingHorizontal?: number;
  paddingTop?: number;
  showBadge?: { [key: string]: number };
}

const FloatingTopTabs = ({ 
  state, 
  descriptors, 
  navigation,
  activeColor = "#007AFF",
  inactiveColor = "#444",
  backgroundColor = "rgba(255,255,255,0.75)",
  paddingHorizontal = 16,
  paddingTop = 8,
  showBadge = {}
}: Props) => {
  const Container = Platform.OS === "ios" ? BlurView : View;

  return (
    <View 
      className="px-4 pt-2"
      style={{ paddingHorizontal, paddingTop }}
    >
      <Container 
        intensity={30} 
        tint="light" 
        className={`
          flex-row p-1.5 rounded-3xl overflow-hidden
          ${Platform.OS === "android" ? "bg-white elevation-5" : ""}
        `}
        style={[
          { 
            backgroundColor: Platform.OS === "ios" ? backgroundColor : "white" 
          },
          Platform.OS === "ios" ? {
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          } : {}
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === index;
            const badgeCount = showBadge[route.name];

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                className={`
                  py-2 px-4.5 rounded-xl flex-row items-center relative
                  ${isFocused ? "bg-white shadow-lg" : ""}
                `}
                style={isFocused ? Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                  },
                  android: {
                    elevation: 3,
                  }
                }) : {}}
              >
                <Text
                  className={`text-sm font-semibold ${isFocused ? "font-bold" : ""}`}
                  style={{
                    color: isFocused ? activeColor : inactiveColor,
                  }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                
                {badgeCount > 0 && (
                  <View 
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full justify-center items-center px-1"
                    style={{ backgroundColor: activeColor }}
                  >
                    <Text className="text-white text-xs font-bold">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Container>
    </View>
  );
};

export default FloatingTopTabs;