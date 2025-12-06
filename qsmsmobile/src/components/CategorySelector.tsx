
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const CategorySelector = ({ categories, selected, onChange }: any) => (
  <View style={{ paddingVertical: 12 }}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}
    >
      {categories.map((cat: string) => {
        const active = selected === cat;

        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onChange(cat)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: active ? "#0066FF" : "#f2f2f2",
            }}
          >
            <Text style={{ color: active ? "white" : "#333", fontWeight: "600" }}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

export default CategorySelector;
