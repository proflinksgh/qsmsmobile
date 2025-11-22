import { COLORS, SIZES } from "@/src/constants/theme";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ApiScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: SIZES.medium }}>
        <Text
          style={{
            fontSize: SIZES.xLarge,
            fontFamily: "PlusJakartaSansBold",
            color: COLORS.black,
            marginBottom: 10,
          }}
        >
          API
        </Text>

        <Text
          style={{
            fontSize: SIZES.medium,
            color: COLORS.gray,
            lineHeight: 22,
          }}
        >
          Access API keys, documentation, and integrations.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ApiScreen;
