import React from "react";
import { Text, View } from "react-native";

const TemplateList = ({ route }: any) => {
  return (
    <View className="flex-1 p-4 items-center justify-center items-center">
      <Text className="text-xl font-bold">{route.params.category}</Text>
      <Text className="text-gray-500 mt-2">Templates will be displayed here.</Text>
    </View>
  );
};

export default TemplateList;
