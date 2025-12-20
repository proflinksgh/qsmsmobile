import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuickActionsProps {
  onActionPress: (screen: string) => void;
}

const actions = [
  { 
    icon: "call", 
    label: "USSD", 
    screen: "UssdScreen", 
    color: "#667eea",
    bgColor: "#F0EEFF"
  },
  { 
    icon: "cloud", 
    label: "API", 
    screen: "ApiScreen", 
    color: "#059669",
    bgColor: "#ECFDF5"
  },
  { 
    icon: "mail", 
    label: "Email", 
    screen: "EmailMarketingScreen", 
    color: "#D97706",
    bgColor: "#FFFBEB"
  },
  { 
    icon: "cart", 
    label: "POS", 
    screen: "PosScreen", 
    color: "#f5576c",
    bgColor: "#FFF0F2"
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSansSemiBold',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default QuickActions;
