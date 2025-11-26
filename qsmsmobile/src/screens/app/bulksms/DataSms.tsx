// src/screens/BulkSms/tabs/DataSms.tsx
import React from "react";
import { Text, View } from "react-native";

const DataSms = () => {
  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="font-bold text-lg">Data SMS</Text>
      <Text className="text-gray-500 mt-2">Upload CSV/Excel and send mapped messages.</Text>
    </View>
  );
};

export default DataSms;
