import { MaterialIcons } from "@expo/vector-icons";
import { User as FirebaseUser, onIdTokenChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase/auth";

type HeaderUser = {
  displayName: string;
  photoURL: string | null;
  email: string | null;
} | null;

const Header = () => {
  const [user, setUser] = useState<HeaderUser>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  useEffect(() => {

    const unsubscribe = onIdTokenChanged(auth, (currentUser: FirebaseUser | null) => {
      if (currentUser) {
        const userData = {
          displayName: currentUser.displayName || "User",
          photoURL: currentUser.photoURL || null,
          email: currentUser.email || null,
        };

        setUser(userData);
        setLoadingAvatar(false);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);


  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.length > 1
      ? names[0][0].toUpperCase() + names[1][0].toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <View className="w-full bg-white border-b border-gray-200">
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center space-x-3">
          {/* LOGO */}
          <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center shadow-sm" />

          <View>
            <Text className="text-lg font-semibold">QuickSms</Text>
            {user && <Text className="text-sm text-gray-500">Hello, {user.displayName}</Text>}
          </View>
        </View>

        <View className="flex-row items-center space-x-3">
          <TouchableOpacity className="w-10 h-10 rounded-full border border-gray-200 bg-white items-center justify-center relative">
            <MaterialIcons name="notifications-none" size={20} color="#6b7280" />
            <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </TouchableOpacity>

          <View className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 items-center justify-center">
            {loadingAvatar ? (
              <ActivityIndicator size="small" color="#9ca3af" />
            ) : user ? (
              user.photoURL ? (
                <Image source={{ uri: user.photoURL }} className="w-full h-full" />
              ) : (
                <Text className="text-gray-700 font-semibold">{getInitials(user.displayName)}</Text>
              )
            ) : (
              <MaterialIcons name="person" size={24} color="#6b7280" />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Header;
