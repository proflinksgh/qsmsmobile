import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";

interface QuickActionsProps {
  onActionPress: (screen: string) => void;
}

const actions = [
  { 
    icon: "call", 
    label: "USSD", 
    screen: "UssdScreen", 
    color: COLORS.gradientPurple1,
    bgColor: COLORS.violetLight
  },
  { 
    icon: "cloud", 
    label: "API", 
    screen: "ApiScreen", 
    color: COLORS.gradientPurple2,
    bgColor: COLORS.violetLight
  },
  { 
    icon: "mail", 
    label: "Email", 
    screen: "EmailMarketingScreen", 
    color: COLORS.success,
    bgColor: COLORS.successLight
  },
  { 
    icon: "cart", 
    label: "POS", 
    screen: "PosScreen", 
    color: COLORS.warning,
    bgColor: COLORS.warningLight
  },
];

const QuickActions = ({ onActionPress }: QuickActionsProps) => {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={styles.actionButton}
          onPress={() => onActionPress(action.screen)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
            <Ionicons name={action.icon as any} size={24} color={action.color} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSansSemiBold',
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default QuickActions;
