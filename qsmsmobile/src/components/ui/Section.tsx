import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";

interface SectionItem {
  label: string;
  icon: string;
  onPress?: () => void;
}

interface SectionProps {
  title: string;
  items: SectionItem[];
}

const Section = ({ title, items }: SectionProps) => {
  return (
    <View style={{ marginBottom: 25 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 10,
          color: "#111827", // slightly darker than before for readability
        }}
      >
        {title}
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          gap: 12,
        }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={{
              width: "22%", 
              aspectRatio: 1,
              backgroundColor: COLORS.lightWhite,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              borderWidth: 1,
              borderColor: COLORS.gray2,
              marginBottom: 12, 
            }}
          >
            <Ionicons name={item.icon as any} size={26} color={COLORS.primary1} />
            <Text
              style={{
                marginTop: 6,
                fontSize: 10,
                textAlign: "center",
                fontWeight: "500",
                color: "#111827",
              }}
              numberOfLines={2} // prevent overflow for long labels
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Section;
