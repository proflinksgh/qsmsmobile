// src/screens/BulkSms/tabs/ContactlessSms.tsx
import React from "react";
import { Text, View } from "react-native";

const ContactlessSms = () => {
  return (
    <View className="flex-1 p-4 items-center justify-center">
      <Text className="font-bold text-lg">Contactless SMS</Text>
      <Text className="text-gray-500 mt-2">Send SMS without uploading contacts.</Text>
    </View>
  );
};

export default ContactlessSms;
