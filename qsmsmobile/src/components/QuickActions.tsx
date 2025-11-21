// src/components/QuickActions.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const actions = [
  { icon: "edit", label: "New SMS", bg: "bg-blue-50", color: "#005CFF" },
  { icon: "group", label: "Contacts", bg: "bg-emerald-50", color: "#059669" },
  { icon: "history", label: "History", bg: "bg-amber-50", color: "#D97706" },
  { icon: "bar-chart", label: "Reports", bg: "bg-indigo-50", color: "#4F46E5" },
];

const QuickActions = () => {
  return (
    <View className="mt-6">
      <Text className="text-gray-600 mb-2 font-medium">Quick Actions</Text>

      <View className="flex-row justify-between">
        {actions.map((action) => (
          <TouchableOpacity key={action.label} className="flex-1 items-center">
            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${action.bg}`}>
              <MaterialIcons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text className="text-xs mt-2 font-medium text-center">{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickActions;
