import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickActionsProps {
  onActionPress: (screen: string) => void;
}

const actions = [
  { icon: "call", label: "USSD", screen: "UssdScreen", bg: "bg-blue-100", color: "#005CFF" },
  { icon: "cloud", label: "API", screen: "ApiScreen", bg: "bg-emerald-100", color: "#059669" },
  { icon: "mail", label: "Email Marketing", screen: "EmailMarketingScreen", bg: "bg-amber-100", color: "#D97706" },
  { icon: "cart", label: "POS", screen: "PosScreen", bg: "bg-indigo-100", color: "#4F46E5" },
];

const QuickActions = ({ onActionPress }: QuickActionsProps) => {
  return (
    <View className="mt-6">
      <Text className="text-gray-600 mb-2 font-medium">Quick Actions</Text>

      <View className="flex-row justify-between">
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            className="flex-1 items-center"
            onPress={() => onActionPress(action.screen)}
          >
            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${action.bg}`}>
              <Ionicons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text className="text-xs mt-2 font-medium text-center">{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickActions;
