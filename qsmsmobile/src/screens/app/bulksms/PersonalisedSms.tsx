// src/screens/BulkSms/tabs/PersonalisedSms.tsx
import React from "react";
import { Text, View } from "react-native";

const PersonalisedSms = () => {
  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="font-bold text-lg">Personalised SMS</Text>
      <Text className="text-gray-500 mt-2">Send unique messages using variables.</Text>
    </View>
  );
};

export default PersonalisedSms;
