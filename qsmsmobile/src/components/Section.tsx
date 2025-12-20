import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface SectionItem {
  label: string;
  icon: string;
  onPress?: () => void;
  badge?: string;
  color?: string;
}

interface SectionProps {
  title: string;
  items: SectionItem[];
}

const iconColors: Record<string, { bg: string; icon: string }> = {
  mail: { bg: "#F0EEFF", icon: "#667eea" },
  "mail-open": { bg: "#ECFDF5", icon: "#059669" },
  "logo-whatsapp": { bg: "#DCFCE7", icon: "#16A34A" },
  people: { bg: "#FEF3C7", icon: "#D97706" },
  albums: { bg: "#FFF0F2", icon: "#f5576c" },
  link: { bg: "#E0F2FE", icon: "#0284C7" },
  "document-text": { bg: "#F0EEFF", icon: "#667eea" },
  mic: { bg: "#FEE2E2", icon: "#DC2626" },
  repeat: { bg: "#ECFDF5", icon: "#059669" },
  key: { bg: "#FEF3C7", icon: "#D97706" },
  "key-outline": { bg: "#F0EEFF", icon: "#667eea" },
  "paper-plane": { bg: "#E0F2FE", icon: "#0284C7" },
  "mic-circle": { bg: "#FFF0F2", icon: "#f5576c" },
  "lock-closed": { bg: "#ECFDF5", icon: "#059669" },
  wallet: { bg: "#F0EEFF", icon: "#667eea" },
  settings: { bg: "#F3F4F6", icon: "#6B7280" },
};

const Section = ({ title, items }: SectionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.itemsContainer}>
        {items.map((item, index) => {
          const colors = iconColors[item.icon] || { bg: "#F3F4F6", icon: "#6B7280" };

          return (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={styles.itemCard}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
                <Ionicons name={item.icon as any} size={22} color={colors.icon} />
              </View>
              <Text style={styles.itemLabel} numberOfLines={2}>
                {item.label}
              </Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  itemCard: {
    width: "22%",
    backgroundColor: "white",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 11,
    fontFamily: "PlusJakartaSansSemiBold",
    textAlign: "center",
    color: "#374151",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#f5576c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
});

export default Section;
