// FloatingTopTabsBulk.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FloatingTopTabsBulk = ({ activeTab, setActiveTab, onOpenTemplate }: any) => {
  const [open, setOpen] = useState(false);

  const visibleTabs = [
    { key: "normal", label: "Normal SMS" },
    { key: "personalised", label: "Personalised" },
    { key: "contactless", label: "Contactless" },
  ];

  const hiddenTabs = [
    { key: "data", label: "Data SMS" },
    { key: "template", label: "Template Centre" },
  ];

  return (
    <View className="bg-white rounded-2xl shadow-md mx-3 mt-3 p-2 flex-row items-center">
      
      {visibleTabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key)}
          className={`px-3 py-2 mx-1 rounded-xl ${
            activeTab === tab.key ? "bg-violet-200" : "bg-gray-100"
          }`}
        >
          <Text
            className={
              activeTab === tab.key
                ? "text-violet-700 font-semibold"
                : "text-gray-600"
            }
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Hamburger */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="ml-auto bg-gray-100 px-3 py-2 rounded-xl"
      >
        <MaterialIcons name="menu" size={22} color="gray" />
      </TouchableOpacity>

      {/* Dropdown */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)}>
          <View className="absolute right-5 top-20 bg-white p-4 rounded-2xl w-[60%] shadow-lg">

            {/* Data SMS */}
            <TouchableOpacity
              className="py-3"
              onPress={() => {
                setOpen(false);
                setActiveTab("data");
              }}
            >
              <Text className="text-gray-700">Data SMS</Text>
            </TouchableOpacity>

            {/* Template Centre (Expands) */}
            <TouchableOpacity
              className="py-3"
              onPress={() => {
                setOpen(false);
                onOpenTemplate(); // opens template dropdown
              }}
            >
              <Text className="text-gray-700">Template Centre ▼</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default FloatingTopTabsBulk;
