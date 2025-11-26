import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";


        const Header = () => {
        return (
            <View className="w-full bg-white border-b border-gray-200">
            <View className="flex-row items-center justify-between px-5 py-4">
                <View className="flex-row items-center space-x-3">

                    {/* LOGO */}
                <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center shadow-sm">
                    {/* <Image source={require("../../../assets/images/logo.png")} className="w-10 h-10" /> */}
                </View>

                <View>
                    <Text className="text-lg font-semibold">QuickSms</Text>
                </View>
                </View>

                <View className="flex-row items-center space-x-3">
                <TouchableOpacity className="w-10 h-10 rounded-full border border-gray-200 bg-white items-center justify-center relative">
                    <MaterialIcons name="notifications-none" size={20} color="#6b7280" />
                    <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </TouchableOpacity>

                <View className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                    {/* <Image source={require("../../../assets/images/avatar.jpg")} className="w-full h-full" /> */}
                </View>
                </View>
            </View>
            </View>
        );
        };

        export default Header;
