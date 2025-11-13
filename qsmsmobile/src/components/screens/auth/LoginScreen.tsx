import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import axios from "axios";
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { Formik } from "formik";
import LottieView from "lottie-react-native";
import React, { useContext, useRef, useState } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Yup from "yup";

import { LoginContext } from "../../../../context/LoginContext";
import { COLORS, SIZES } from "../../../constants/theme";
import styles from "../../../utils/login.style";
import Button from "../../Button";


// ✅ Yup validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Provide a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const LoginScreen = () => {
  const router = useRouter();
  const animation = useRef(null);
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setLogin } = useContext(LoginContext);


  // Reset loader and visibility when screen refocuses
  useFocusEffect(
    React.useCallback(() => {
      setLoader(false);
      setShowPassword(false);
    }, [])
  );

  const loginFunc = async (values: { email: string; password: string }) => {
    setLoader(true);
    try {
      const endpoint = "http://172.20.10.11:3001/api/users/login";
      const { data, status } = await axios.post(endpoint, values);

      if (status === 200 && data.status) {
        const { user, token } = data;
        if (!user || !token) throw new Error("Missing user or token.");

        await SecureStore.setItemAsync("id", user._id);
        await SecureStore.setItemAsync("token", token);
        setLogin(user);

        
  (router as any).replace("/");
      } else {
        throw new Error(data.message || "Unexpected response.");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid credentials, please check and try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.white }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginHorizontal: 20, marginTop: 50 }}>

          

          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
          >
            <LottieView
              ref={animation}
              autoPlay
              loop
              source={require("../../../../assets/anime/Login.json")}
              style={{ width: "100%", height: SIZES.height / 3.2 }}
            />
          </Animated.View>

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
              <View style={{ marginTop: 30 }}>
                {/* Email Field */}
                <Animated.View
                  style={styles.wrapper}
                  entering={FadeInDown.duration(1000).delay(300).springify()}
                >
                  <Text style={styles.label}>Email</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { borderColor: touched.email ? COLORS.secondary : COLORS.offwhite },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={COLORS.gray}
                      style={styles.iconStyle}
                    />
                    <TextInput
                      placeholder="Enter email"
                      placeholderTextColor={COLORS.gray}
                      keyboardType="email-address"
                      onFocus={() => setFieldTouched("email")}
                      onBlur={() => setFieldTouched("email", false)}
                      value={values.email}
                      onChangeText={handleChange("email")}
                      autoCapitalize="none"
                      style={{ flex: 1, fontFamily: 'PlusJakartaSans' }}
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={styles.errorMessage}>{errors.email}</Text>
                  )}
                </Animated.View>

                {/* Password Field */}
                <Animated.View
                  style={styles.wrapper}
                  entering={FadeInDown.duration(1000).delay(400).springify()}
                >
                  <Text style={styles.label}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { borderColor: touched.password ? COLORS.secondary : COLORS.offwhite },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      color={COLORS.gray}
                      style={styles.iconStyle}
                    />
                    <TextInput
                      secureTextEntry={!showPassword}
                      placeholder="Enter password"
                      placeholderTextColor={COLORS.gray}
                      onFocus={() => setFieldTouched("password")}
                      onBlur={() => setFieldTouched("password", false)}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      autoCapitalize="none"
                      style={{ flex: 1, fontFamily: 'PlusJakartaSans' }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ padding: 4 }}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={COLORS.gray}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorMessage}>{errors.password}</Text>
                  )}
                </Animated.View>

                {/* Login Button */}
                <Animated.View
                  entering={FadeInDown.duration(1000).delay(500).springify()}
                  style={{ marginTop: 20 }}
                >
                  <Button
                    loading={loader}
                    title="LOGIN"
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

                {/* Register link */}
                <Animated.View
                  entering={FadeInDown.duration(1000).delay(600).springify()}
                  style={{ alignItems: 'center', marginTop: 20 }}
                >
                  <Text style={styles.registration}>
                    Don't have an account?{" "}
                    <Text
                      style={{ color: COLORS.secondary, fontWeight: 'bold' }}
                      onPress={() => (router as any).push("/Register")}
                    >
                      Sign Up
                    </Text>
                  </Text>
                </Animated.View>

                {/* Forgot Password */}
                <Animated.View
                  entering={FadeInDown.duration(1000).delay(700).springify()}
                  style={{ alignItems: 'center', marginTop: 15 }}
                >
                  <Text
                    style={[styles.registration, { color: COLORS.secondary }]}
                    onPress={() => (router as any).push("/ForgotPassword")}
                  >
                    Forgot Password?
                  </Text>
                </Animated.View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;