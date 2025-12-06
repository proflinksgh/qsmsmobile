// TemplateCategoryDropdown.tsx
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

const templateCategories = [
  "Festive Greetings",
  "Promotion",
  "Transaction",
  "Customer Service",
  "Birthday",
  "Reminders",
  "Feedback & Survey",
];

const TemplateCategoryDropdown = ({ visible, onClose, onSelect }: any) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <View className="absolute right-5 top-24 bg-white p-4 rounded-2xl w-[65%] shadow-lg">
          {templateCategories.map((cat) => (
            <TouchableOpacity
              key={cat}
              className="py-3"
              onPress={() => {
                onSelect(cat);
                onClose();
              }}
            >
              <Text className="text-gray-700">{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

export default TemplateCategoryDropdown;
