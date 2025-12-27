import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { getAuth, sendEmailVerification, User } from "firebase/auth";
import { Formik } from "formik";
import React, { useContext, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Yup from "yup";
import { register } from "../../service/authService";

import GoogleAuthButton from "../../components/GoogleAuthButton";
import VerificationModal from "../../components/VerificationModal";
import { LoginContext } from "../../context";
import {
  registerUserInSystem
} from "../../service/apiClient";
import { getFirebaseErrorMessage, isFirebaseAuthError } from "../../utils/firebaseErrors";
import { getUserLocation } from "../../utils/locationService";

const { width, height } = Dimensions.get("window");

interface PendingFormValues {
  email: string;
  mobile: string;
  password: string;
  firebaseUser: User;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Provide a valid email address")
    .required("Email is required"),
  mobile: Yup.string()
    .matches(/^[0-9+\-()\\s]+$/, "Please enter a valid mobile number")
    .min(10, "Mobile number must be at least 10 digits")
    .required("Mobile number is required"),
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
  const { navigate: navigateAuth, goBack }: NavigationProp<any> = useNavigation();
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<"email" | "mobile">("email");
  const [pendingFormValues, setPendingFormValues] = useState<PendingFormValues | null>(null);
  const { setLogin } = useContext(LoginContext);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Reset loader and visibility when screen refocuses
  useFocusEffect(
    React.useCallback(() => {
      setLoader(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, [])
  );

  const registerFunc = async (values: { email: string; mobile: string; password: string }) => {
    setLoader(true);
    try {
      // Step 1: Create Firebase account
      const firebaseUser = await register(values.email, values.password);

      // Debug: Log Firebase registration response
      console.log("Firebase Registration Response:", JSON.stringify({
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        emailVerified: firebaseUser?.emailVerified,
        displayName: firebaseUser?.displayName,
        phoneNumber: firebaseUser?.phoneNumber,
        providerId: firebaseUser?.providerId,
        metadata: firebaseUser?.metadata,
      }, null, 2));

      if (firebaseUser) {
        // Step 2: Send Firebase email verification link
        try {
          await sendEmailVerification(firebaseUser);
        } catch (emailError: unknown) {
          console.log("Email verification send error:", emailError);
          // Continue anyway - user can resend from modal
        }

        // Step 3: Store form values and show verification modal
        setPendingFormValues({ ...values, firebaseUser });
        setVerificationType("email");
        setVerificationModal(true);
        
        Alert.alert(
          "Verify Your Email",
          `We've sent a verification link to ${values.email}. Please check your email and click the link to verify your account.`
        );
      }
    } catch (error: unknown) {
      // Use typed Firebase error handling
      const message = getFirebaseErrorMessage(error, "Failed to create account.");
      
      // Offer login if email already exists
      if (isFirebaseAuthError(error, "auth/email-already-in-use")) {
        Alert.alert(
          "Account Exists",
          message,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go to Login", onPress: () => navigateAuth("Login" as never) },
          ]
        );
      } else {
        Alert.alert("Registration Failed", message);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleVerificationSuccess = async (userId: string) => {
    if (!pendingFormValues) return;

    setLoader(true);
    try {
      const firebaseUser = pendingFormValues.firebaseUser;

      // For email verification, check Firebase auth state
      if (verificationType === "email") {
        const auth = getAuth();
        await auth.currentUser?.reload();

        if (!auth.currentUser?.emailVerified) {
          throw new Error(
            "Email not verified yet. Please click the verification link sent to your email."
          );
        }
      }
      // Step 4: Register user in backend system
      const systemRegistration = await registerUserInSystem(
        pendingFormValues.email,
        pendingFormValues.password,
        pendingFormValues.mobile
      );

      // Debug: Log the API response
      console.log("Registration API Response:", JSON.stringify(systemRegistration, null, 2));

      // Check for success - API may return { success: true } or { status: "success" }
      const isSuccess = systemRegistration.success === true || systemRegistration.status === "success";
      
      if (isSuccess) {
        // Store system userId and token for future use
        await AsyncStorage.setItem("firebaseUid", firebaseUser.uid);
        const sysUserId = systemRegistration.userId || systemRegistration.userid;
        if (sysUserId) {
          await AsyncStorage.setItem("systemUserId", sysUserId.toString());
        }
        if (systemRegistration.token) {
          await SecureStore.setItemAsync("authToken", systemRegistration.token);
        }

        // Capture user location on signup
        const location = await getUserLocation();
        console.log("User location captured:", location);

        setVerificationModal(false);
        
        // Redirect to login screen instead of home
        Alert.alert(
          "Registration Successful",
          "Your account has been created and verified successfully. Please login to continue.",
          [
            { 
              text: "Go to Login", 
              onPress: () => navigateAuth("Login" as never) 
            }
          ]
        );
      } else {
        // Check if email already exists in backend system
        const errorMessage = systemRegistration.message?.toLowerCase() || "";
        if (errorMessage.includes("email") && (errorMessage.includes("exist") || errorMessage.includes("already"))) {
          // Email exists in backend - user might already have an account
          setVerificationModal(false);
          Alert.alert(
            "Account Already Exists",
            "This email is already registered in our system. If you previously created an account, please login instead.",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Go to Login", 
                onPress: () => navigateAuth("Login" as never) 
              }
            ]
          );
          return;
        }
        throw new Error(systemRegistration.message || "Failed to complete registration");
      }
    } catch (error: unknown) {
      // Check if it's an axios error with response data
      let errorMessage = "Registration failed. Please try again.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const responseMessage = axiosError.response?.data?.message?.toLowerCase() || "";
        
        if (responseMessage.includes("email") && (responseMessage.includes("exist") || responseMessage.includes("already"))) {
          setVerificationModal(false);
          Alert.alert(
            "Account Already Exists",
            "This email is already registered in our system. If you previously created an account, please login instead.",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Go to Login", 
                onPress: () => navigateAuth("Login" as never) 
              }
            ]
          );
          return;
        }
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoader(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Back Button */}
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={styles.backButtonContainer}
        >
          <TouchableOpacity 
            onPress={() => goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Header Content */}
        <Animated.View 
          entering={FadeInUp.duration(800).delay(200)}
          style={styles.headerContent}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="account-plus-outline" size={40} color="#667eea" />
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            Join us and start your messaging journey
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Form Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            initialValues={{ email: "", mobile: "", password: "", confirmPassword: "" }}
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
              <View style={styles.formContent}>
                {/* Email Field */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(100)}
                  style={styles.inputGroup}
                >
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'email' && styles.inputWrapperFocused,
                    touched.email && errors.email && styles.inputWrapperError,
                  ]}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={focusedField === 'email' ? '#667eea' : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      onFocus={() => {
                        setFocusedField('email');
                        setFieldTouched("email");
                      }}
                      onBlur={() => {
                        setFocusedField(null);
                        setFieldTouched("email", true);
                      }}
                      value={values.email}
                      onChangeText={handleChange("email")}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </Animated.View>

                {/* Mobile Number Field */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(200)}
                  style={styles.inputGroup}
                >
                  <Text style={styles.label}>Mobile Number</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'mobile' && styles.inputWrapperFocused,
                    touched.mobile && errors.mobile && styles.inputWrapperError,
                  ]}>
                    <MaterialCommunityIcons
                      name="phone-outline"
                      size={20}
                      color={focusedField === 'mobile' ? '#667eea' : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Enter your mobile number"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      onFocus={() => {
                        setFocusedField('mobile');
                        setFieldTouched("mobile");
                      }}
                      onBlur={() => {
                        setFocusedField(null);
                        setFieldTouched("mobile", true);
                      }}
                      value={values.mobile}
                      onChangeText={handleChange("mobile")}
                      style={styles.input}
                    />
                  </View>
                  {touched.mobile && errors.mobile && (
                    <Text style={styles.errorText}>{errors.mobile}</Text>
                  )}
                </Animated.View>

                {/* Password Field */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(300)}
                  style={styles.inputGroup}
                >
                  <Text style={styles.label}>Password</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'password' && styles.inputWrapperFocused,
                    touched.password && errors.password && styles.inputWrapperError,
                  ]}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      color={focusedField === 'password' ? '#667eea' : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      secureTextEntry={!showPassword}
                      placeholder="Create a password"
                      placeholderTextColor="#9CA3AF"
                      onFocus={() => {
                        setFocusedField('password');
                        setFieldTouched("password");
                      }}
                      onBlur={() => {
                        setFocusedField(null);
                        setFieldTouched("password", true);
                      }}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </Animated.View>

                {/* Confirm Password Field */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(400)}
                  style={styles.inputGroup}
                >
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                    touched.confirmPassword && errors.confirmPassword && styles.inputWrapperError,
                  ]}>
                    <MaterialCommunityIcons
                      name="lock-check-outline"
                      size={20}
                      color={focusedField === 'confirmPassword' ? '#667eea' : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9CA3AF"
                      onFocus={() => {
                        setFocusedField('confirmPassword');
                        setFieldTouched("confirmPassword");
                      }}
                      onBlur={() => {
                        setFocusedField(null);
                        setFieldTouched("confirmPassword", true);
                      }}
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </Animated.View>

                {/* Create Account Button */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(500)}
                  style={styles.buttonContainer}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (isValid && values.email && values.mobile && values.password && values.confirmPassword) {
                        handleSubmit();
                      } else {
                        Alert.alert(
                          "Invalid Form",
                          "Please fill all required fields correctly."
                        );
                      }
                    }}
                    disabled={loader}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.signUpButton,
                        (!(isValid && values.email && values.mobile && values.password && values.confirmPassword) || loader) && styles.buttonDisabled
                      ]}
                    >
                      {loader ? (
                        <Text style={styles.buttonText}>Creating Account...</Text>
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Create Account</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(600)}
                  style={styles.dividerContainer}
                >
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </Animated.View>

                {/* Google Auth Button */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(700)}
                >
                  <GoogleAuthButton
                    email={values.email}
                    phone={values.mobile}
                    disabled={!values.email || !values.mobile}
                    onSuccess={() => {
                      Alert.alert(
                        "Authentication Successful",
                        "You have been signed in with your Google account."
                      );
                    }}
                    onError={(error) => {
                      console.error("Google auth error:", error);
                    }}
                  />
                </Animated.View>

                {/* Login Link */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(800)}
                  style={styles.loginLinkContainer}
                >
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                    <Text
                      style={styles.loginLink}
                      onPress={() => navigateAuth('Login')}
                    >
                      Sign In
                    </Text>
                  </Text>
                </Animated.View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Verification Modal */}
      <VerificationModal
        visible={verificationModal}
        onClose={() => {
          setVerificationModal(false);
          setPendingFormValues(null);
        }}
        onVerified={handleVerificationSuccess}
        type={verificationType === "email" ? "email" : "phone"}
        contact={verificationType === "email" 
          ? (pendingFormValues?.email || "") 
          : (pendingFormValues?.mobile || "")
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    height: height * 0.32,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSansBold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSansSemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  inputWrapperFocused: {
    borderColor: '#667eea',
    backgroundColor: '#F5F3FF',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans',
    color: '#1F2937',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans',
    color: '#EF4444',
    marginTop: 6,
  },
  buttonContainer: {
    marginTop: 8,
  },
  signUpButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSansBold',
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans',
    color: '#9CA3AF',
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans',
    color: '#6B7280',
  },
  loginLink: {
    color: '#667eea',
    fontFamily: 'PlusJakartaSansBold',
  },
});

export default RegisterScreen;
