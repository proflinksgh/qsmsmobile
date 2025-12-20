import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import React, { useContext, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/theme";
import { LoginContext } from "../context";
import { getFreshIdToken, signInWithGoogleCredential } from "../service/authService";
import { handleGoogleSignIn } from "../service/googleAuthService";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  phone?: string;
  email?: string;
  disabled?: boolean;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  onSuccess, 
  onError, 
  phone,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const { setLogin } = useContext(LoginContext);


  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "501826195740-bftfvghflgrfmmrqmurueabkb1t73ea7.apps.googleusercontent.com", 
    iosClientId: "501826195740-e7pik91mh2ksnnup22evbltbkum8cvgk.apps.googleusercontent.com",
  });

  // Handle Google response
  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token, access_token } = response.params;
      handleGoogleLogin(id_token, access_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken?: string, accessToken?: string) => {
    if (!idToken) {
      Alert.alert("Error", "No ID token received from Google");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Sign in to Firebase with Google credentials
      const firebaseUser = await signInWithGoogleCredential(idToken, accessToken);
      
      if (!firebaseUser.email) {
        throw new Error("Google account has no email");
      }

      // Step 2: Get fresh Firebase ID token for backend auth
      const firebaseIdToken = await getFreshIdToken(true);

      // Step 3: Register/login with your backend API
      const systemResponse = await handleGoogleSignIn(idToken, accessToken);

      // Step 4: Save user data to storage
      await AsyncStorage.multiSet([
        ["systemUserId", String(systemResponse?.userid || firebaseUser.uid)],
        ["userEmail", firebaseUser.email],
        ["user", JSON.stringify({ 
          email: firebaseUser.email, 
          phone: phone ?? firebaseUser.phoneNumber ?? "", 
          userid: systemResponse?.userid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        })],
      ]);

      // Step 5: Store auth token if provided
      if (systemResponse?.token) {
        await SecureStore.setItemAsync("authToken", systemResponse.token);
      }

      // Step 6: Update login state
      setLogin(true);
      onSuccess?.();
    } catch (error: unknown) {
      const message = getFirebaseErrorMessage(error, "Google sign-in failed. Please try again.");
      Alert.alert("Authentication Failed", message);
      if (error instanceof Error) {
        onError?.(error);
      } else {
        onError?.(new Error(message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => promptAsync()}
      disabled={loading || disabled}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        backgroundColor: COLORS.white,
        opacity: loading || disabled ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.secondary} />
      ) : (
        <>
          <MaterialCommunityIcons
            name="google"
            size={20}
            color={COLORS.secondary}
            style={{ marginRight: 8 }}
          />
          <Text style={{ fontSize: 16, fontFamily: "PlusJakartaSansBold", color: COLORS.black }}>
            Sign in with Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default GoogleAuthButton;
