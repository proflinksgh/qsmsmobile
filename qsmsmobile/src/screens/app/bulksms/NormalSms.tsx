// src/screens/BulkSms/tabs/NormalSms.tsx
import React from "react";
import { Text, View } from "react-native";

const NormalSms = () => {
  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="font-bold text-lg">Normal SMS</Text>
      <Text className="text-gray-500 mt-2">Compose a standard SMS message.</Text>
    </View>
  );
};

export default NormalSms;
