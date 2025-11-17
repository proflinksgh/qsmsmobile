import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from "axios";
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

// ✅ Yup validation schema for registration
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Provide a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], "Passwords must match")
    .required("Confirm password is required"),
});

const RegisterScreen = () => {
  const { navigate: navigateAuth }: NavigationProp<any> = useNavigation();
  const animation = useRef(null);
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setLogin } = useContext(LoginContext);

  // Reset loader and visibility when screen refocuses
  useFocusEffect(
    React.useCallback(() => {
      setLoader(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, [])
  );

  const registerFunc = async (values: { name: string; email: string; password: string }) => {
    setLoader(true);
    try {
      const endpoint = "http://172.20.10.11:3001/api/users/register";
      const { data, status } = await axios.post(endpoint, values);

      if (status === 201 && data.status) {
        const { user, token } = data;
        if (!user || !token) throw new Error("Missing user or token.");

        await SecureStore.setItemAsync("id", user._id);
        await SecureStore.setItemAsync("token", token);
        setLogin(user);

        Alert.alert(
          "Registration Successful",
          "Welcome to Errand! Your account has been created successfully.",
          [{ text: "OK" }]
        );
      } else {
        throw new Error(data.message || "Unexpected response.");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed, please try again.";
      Alert.alert("Registration Failed", message);
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
              source={require("../../../../assets/anime/Registration.json")}
              style={{ width: "100%", height: SIZES.height / 3.2 }}
            />
          </Animated.View>

          <Formik
            initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={registerFunc}
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
              <View style={{ marginTop: 20 }}>
                {/* Name Field */}
                <Animated.View
                  style={styles.wrapper}
                  entering={FadeInDown.duration(1000).delay(300).springify()}
                >
                  <Text style={[styles.label, { fontFamily: 'PlusJakartaSans' }]}>
                    Full Name
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { borderColor: touched.name ? COLORS.secondary : COLORS.offwhite },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={20}
                      color={COLORS.gray}
                      style={styles.iconStyle}
                    />
                    <TextInput
                      placeholder="Enter your full name"
                      placeholderTextColor={COLORS.gray}
                      onFocus={() => setFieldTouched("name")}
                      onBlur={() => setFieldTouched("name", false)}
                      value={values.name}
                      onChangeText={handleChange("name")}
                      autoCapitalize="words"
                      style={{ 
                        flex: 1, 
                        fontFamily: 'PlusJakartaSans',
                        color: COLORS.black,
                      }}
                    />
                  </View>
                  {touched.name && errors.name && (
                    <Text style={[styles.errorMessage, { fontFamily: 'PlusJakartaSans' }]}>
                      {errors.name}
                    </Text>
                  )}
                </Animated.View>

                {/* Email Field */}
                <Animated.View
                  style={styles.wrapper}
                  entering={FadeInDown.duration(1000).delay(400).springify()}
                >
                  <Text style={[styles.label, { fontFamily: 'PlusJakartaSans' }]}>
                    Email
                  </Text>
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
                      style={{ 
                        flex: 1, 
                        fontFamily: 'PlusJakartaSans',
                        color: COLORS.black,
                      }}
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={[styles.errorMessage, { fontFamily: 'PlusJakartaSans' }]}>
                      {errors.email}
                    </Text>
                  )}
                </Animated.View>

                {/* Password Field */}
                <Animated.View
                  style={styles.wrapper}
                  entering={FadeInDown.duration(1000).delay(500).springify()}
                >
                  <Text style={[styles.label, { fontFamily: 'PlusJakartaSans' }]}>
                    Password
                  </Text>
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
                      style={{ 
                        flex: 1, 
                        fontFamily: 'PlusJakartaSans',
                        color: COLORS.black,
                      }}
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
                    <Text style={[styles.errorMessage, { fontFamily: 'PlusJakartaSans' }]}>
                      {errors.password}
                    </Text>
                  )}
                </Animated.View>

                {/* Confirm Password Field */}
                <Animated.View
                  style={styles.wrapper}
                  entering={FadeInDown.duration(1000).delay(600).springify()}
                >
                  <Text style={[styles.label, { fontFamily: 'PlusJakartaSans' }]}>
                    Confirm Password
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { borderColor: touched.confirmPassword ? COLORS.secondary : COLORS.offwhite },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="lock-check-outline"
                      size={20}
                      color={COLORS.gray}
                      style={styles.iconStyle}
                    />
                    <TextInput
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor={COLORS.gray}
                      onFocus={() => setFieldTouched("confirmPassword")}
                      onBlur={() => setFieldTouched("confirmPassword", false)}
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      autoCapitalize="none"
                      style={{ 
                        flex: 1, 
                        fontFamily: 'PlusJakartaSans',
                        color: COLORS.black,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ padding: 4 }}
                    >
                      <MaterialCommunityIcons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={COLORS.gray}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={[styles.errorMessage, { fontFamily: 'PlusJakartaSans' }]}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </Animated.View>

                {/* Register Button */}
                <Animated.View
                  entering={FadeInDown.duration(1000).delay(700).springify()}
                  style={{ marginTop: 20 }}
                >
                  <Button
                    loading={loader}
                    title="CREATE ACCOUNT"
                    action={
                      isValid && values.name && values.email && values.password && values.confirmPassword
                        ? handleSubmit
                        : () =>
                            Alert.alert(
                              "Invalid Form",
                              "Please fill all required fields correctly."
                            )
                    }
                    disabled={!(isValid && values.name && values.email && values.password && values.confirmPassword)}
                  />
                </Animated.View>

                {/* Login link */}
                <Animated.View
                  entering={FadeInDown.duration(1000).delay(800).springify()}
                  style={{ alignItems: 'center', marginTop: 20 }}
                >
                  <Text style={[styles.registration, { fontFamily: 'PlusJakartaSans' }]}>
                    Already have an account?{" "}
                    <Text
                      style={{ 
                        color: COLORS.secondary, 
                        fontFamily: 'PlusJakartaSansBold' 
                      }}
                      onPress={() => navigateAuth('Login')}
                    >
                      Sign In
                    </Text>
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

export default RegisterScreen;