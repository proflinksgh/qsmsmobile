import Button from "@/src/components/Button"; // your custom button
import React from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

const TemplateFormScreen = ({ title }: { title: string }) => {
  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">{title}</Text>

      <View className="mb-4">
        <Text className="font-semibold text-gray-700 mb-1">Recipient</Text>
        <TextInput
          placeholder="Enter phone number"
          className="border rounded-xl p-3 bg-white"
          keyboardType="phone-pad"
        />
      </View>

      <View className="mb-4">
        <Text className="font-semibold text-gray-700 mb-1">Message</Text>
        <TextInput
          placeholder="Type your message here"
          className="border rounded-xl p-3 bg-white"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <Button title="Send Message" />
    </ScrollView>
  );
};

export default TemplateFormScreen;
