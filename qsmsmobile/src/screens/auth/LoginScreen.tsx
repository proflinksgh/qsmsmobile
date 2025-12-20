import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import React, { useContext, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Yup from "yup";

import Button from "../../components/Button";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import { COLORS } from "../../constants/theme";
import { LoginContext } from "../../context";
import { customLogin, LoginParams } from "../../service/apiClient";
import { getDeviceString, getIpAddress } from "../../utils/deviceInfo";
import {
  getFirebaseErrorMessage,
  isFirebaseAuthError,
} from "../../utils/firebaseErrors";
import { getUserLocation } from "../../utils/locationService";



const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Provide a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const LoginScreen = () => {
  const { navigate: navigateAuth, goBack }: NavigationProp<any> =
    useNavigation();

  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setLogin } = useContext(LoginContext);

  useFocusEffect(
    React.useCallback(() => {
      setLoader(false);
      setShowPassword(false);
    }, [])
  );

  const loginFunc = async (values: { email: string; password: string }) => {
    setLoader(true);
    try {
      // Gather device info, IP address, and location for the API
      const [ipAddress, deviceString, location] = await Promise.all([
        getIpAddress(),
        Promise.resolve(getDeviceString()),
        getUserLocation(),
      ]);

      // Format location as "latitude,longitude"
      const locationString = location 
        ? `${location.latitude},${location.longitude}`
        : '0,0';

      // Build login params for transporter API
      const loginParams: LoginParams = {
        email: values.email,
        password: values.password,
        ipaddress: ipAddress,
        device: deviceString,
        location: locationString,
      };

      // Use transporter API login
      const loginResult = await customLogin(loginParams);

      // API returns: { status: "success", userid: 3544, message: "Login successfully" }
      if (loginResult.status === "success") {
        // Store auth token for API requests (if provided)
        if (loginResult.token) {
          await SecureStore.setItemAsync("authToken", loginResult.token);
        }

        // Store user data
        const userId = loginResult.userId || loginResult.userid;
        if (userId) {
          await AsyncStorage.setItem("systemUserId", userId.toString());
        }
        
        // Store user info from login form and API response
        const userData = {
          email: values.email,
          displayName: loginResult.user?.name || loginResult.user?.displayName || values.email.split("@")[0],
          photoURL: loginResult.user?.photoURL || loginResult.user?.avatar || null,
          userid: userId,
          ...loginResult.user,
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        setLogin(true);
      } else {
        throw new Error(loginResult.message || "Login failed");
      }
    } catch (error: unknown) {
      const message = getFirebaseErrorMessage(error, "Invalid credentials, please check and try again.");
      
      // Offer to register if user not found
      if (isFirebaseAuthError(error, "auth/user-not-found")) {
        Alert.alert(
          "Account Not Found",
          message,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Up", onPress: () => navigateAuth("Register" as never) },
          ]
        );
      } else if (isFirebaseAuthError(error, "auth/too-many-requests")) {
        Alert.alert("Too Many Attempts", message);
      } else {
        Alert.alert("Login Failed", message);
      }
    } finally {
      setLoader(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar style="light" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: Platform.OS === "ios" ? 60 : 40,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        {/* Back Button */}
        <Animated.View entering={FadeIn.duration(400)}>
          <TouchableOpacity
            onPress={() => goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>

        {/* Header Text */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200)}
          style={{ marginTop: 24 }}
        >
          <Text
            style={{
              fontSize: 32,
              color: COLORS.white,
              fontFamily: "PlusJakartaSansBold",
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.8)",
              fontFamily: "PlusJakartaSans",
              marginTop: 8,
            }}
          >
            Sign in to continue to your account
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Form Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={loginFunc}
            >
              {({
                handleChange,
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
                setFieldTouched,
              }) => (
                <View>
                  {/* Email Field */}
                  <Animated.View
                    entering={FadeInDown.duration(500).delay(300)}
                    style={{ marginBottom: 20 }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.gray,
                        fontFamily: "PlusJakartaSans",
                        marginBottom: 8,
                      }}
                    >
                      Email Address
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.offwhite,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: Platform.OS === "ios" ? 16 : 4,
                        borderWidth: 1.5,
                        borderColor: touched.email
                          ? errors.email
                            ? COLORS.red
                            : COLORS.primary
                          : COLORS.offwhite,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="email-outline"
                        size={20}
                        color={touched.email ? COLORS.primary : COLORS.gray}
                      />
                      <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="email-address"
                        onFocus={() => setFieldTouched("email")}
                        onBlur={() => setFieldTouched("email", false)}
                        value={values.email}
                        onChangeText={handleChange("email")}
                        autoCapitalize="none"
                        style={{
                          flex: 1,
                          marginLeft: 12,
                          fontSize: 15,
                          fontFamily: "PlusJakartaSans",
                          color: COLORS.black,
                        }}
                      />
                    </View>
                    {touched.email && errors.email && (
                      <Text
                        style={{
                          color: COLORS.red,
                          fontSize: 12,
                          fontFamily: "PlusJakartaSans",
                          marginTop: 6,
                          marginLeft: 4,
                        }}
                      >
                        {errors.email}
                      </Text>
                    )}
                  </Animated.View>

                  {/* Password Field */}
                  <Animated.View
                    entering={FadeInDown.duration(500).delay(400)}
                    style={{ marginBottom: 12 }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.gray,
                        fontFamily: "PlusJakartaSans",
                        marginBottom: 8,
                      }}
                    >
                      Password
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.offwhite,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: Platform.OS === "ios" ? 16 : 4,
                        borderWidth: 1.5,
                        borderColor: touched.password
                          ? errors.password
                            ? COLORS.red
                            : COLORS.primary
                          : COLORS.offwhite,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={20}
                        color={touched.password ? COLORS.primary : COLORS.gray}
                      />
                      <TextInput
                        secureTextEntry={!showPassword}
                        placeholder="Enter your password"
                        placeholderTextColor={COLORS.gray}
                        onFocus={() => setFieldTouched("password")}
                        onBlur={() => setFieldTouched("password", false)}
                        value={values.password}
                        onChangeText={handleChange("password")}
                        autoCapitalize="none"
                        style={{
                          flex: 1,
                          marginLeft: 12,
                          fontSize: 15,
                          fontFamily: "PlusJakartaSans",
                          color: COLORS.black,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <MaterialCommunityIcons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color={COLORS.gray}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <Text
                        style={{
                          color: COLORS.red,
                          fontSize: 12,
                          fontFamily: "PlusJakartaSans",
                          marginTop: 6,
                          marginLeft: 4,
                        }}
                      >
                        {errors.password}
                      </Text>
                    )}
                  </Animated.View>

                  {/* Forgot Password Link */}
                  <Animated.View
                    entering={FadeInDown.duration(500).delay(450)}
                    style={{ alignItems: "flex-end", marginBottom: 24 }}
                  >
                    <TouchableOpacity
                      onPress={() => navigateAuth("ForgotPassword" as never)}
                    >
                      <Text
                        style={{
                          color: COLORS.primary,
                          fontSize: 14,
                          fontFamily: "PlusJakartaSansBold",
                        }}
                      >
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Login Button */}
                  <Animated.View entering={FadeInDown.duration(500).delay(500)}>
                    <Button
                      loading={loader}
                      title="Sign In"
                      action={
                        isValid && values.email && values.password
                          ? handleSubmit
                          : () =>
                              Alert.alert(
                                "Invalid Form",
                                "Please fill all required fields correctly."
                              )
                      }
                      disabled={!(isValid && values.email && values.password)}
                    />
                  </Animated.View>

                  {/* Divider */}
                  <Animated.View
                    entering={FadeInDown.duration(500).delay(550)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginVertical: 24,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: COLORS.grayLight,
                      }}
                    />
                    <Text
                      style={{
                        marginHorizontal: 16,
                        color: COLORS.gray,
                        fontFamily: "PlusJakartaSans",
                        fontSize: 13,
                      }}
                    >
                      or continue with
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: COLORS.grayLight,
                      }}
                    />
                  </Animated.View>

                  {/* Google Auth Button */}
                  <Animated.View entering={FadeInDown.duration(500).delay(600)}>
                    <GoogleAuthButton
                      onSuccess={() => {
                        // Navigation handled by LoginContext
                      }}
                      onError={(error) => {
                        console.error("Google auth error:", error);
                      }}
                    />
                  </Animated.View>

                  {/* Register link */}
                  <Animated.View
                    entering={FadeInDown.duration(500).delay(650)}
                    style={{ alignItems: "center", marginTop: 28 }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.gray,
                        fontFamily: "PlusJakartaSans",
                      }}
                    >
                      Don't have an account?{" "}
                      <Text
                        style={{
                          color: COLORS.primary,
                          fontFamily: "PlusJakartaSansBold",
                        }}
                        onPress={() => navigateAuth("Register" as never)}
                      >
                        Sign Up
                      </Text>
                    </Text>
                  </Animated.View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
