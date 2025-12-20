import { OtpType, sendOtp, verifyOtp } from "@/src/service/otpService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth, sendEmailVerification } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated";

interface VerificationModalProps {
  visible: boolean;
  contact: string; // phone number or email
  type: OtpType; // "email" | "phone"
  onVerified: (userId: string) => void; // callback when verification succeeds
  onClose: () => void;
}

const OTP_LENGTH = 6;

const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  contact,
  type,
  onVerified,
  onClose,
}) => {
  // OTP state (for phone)
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Email verification state
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useSharedValue(0);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, OTP_LENGTH);
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setOtp(new Array(OTP_LENGTH).fill(""));
      setTimeLeft(60);
      setOtpSent(false);
      setOtpId(null);
      setLoading(false);
      setCheckingEmail(false);

      // For phone, auto-send OTP when modal opens
      if (type === "phone") {
        handleSendOtp();
      }
    }
  }, [visible, type]);

  // Countdown timer (for phone OTP)
  useEffect(() => {
    if (!visible || timeLeft <= 0 || type === "email") return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [visible, timeLeft, type]);

  // Auto-verify when all digits are entered (phone only)
  useEffect(() => {
    const code = otp.join("");
    if (type === "phone" && code.length === OTP_LENGTH && !loading) {
      handleVerifyPhoneOtp();
    }
  }, [otp, type]);

  // ============== PHONE OTP HANDLERS ==============

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const response = await sendOtp(type, contact);

      if (response.status === "success") {
        setOtpSent(true);
        setTimeLeft(response.expiresIn || 60);
        if (response.otpId) {
          setOtpId(response.otpId);
        }
        // Focus first input after sending
        setTimeout(() => inputRefs.current[0]?.focus(), 300);
      } else {
        Alert.alert("Error", response.message || "Failed to send verification code");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send verification code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;

    setOtp(new Array(OTP_LENGTH).fill(""));
    await handleSendOtp();
  };

  const handleVerifyPhoneOtp = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      Alert.alert("Invalid Code", `Please enter the ${OTP_LENGTH}-digit verification code`);
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await verifyOtp(type, contact, code, otpId || undefined);

      if (response.status === "success" && response.verified) {
        onVerified(contact);
      } else {
        triggerShake();
        setOtp(new Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        Alert.alert("Verification Failed", response.message || "Invalid code. Please try again.");
      }
    } catch (error: any) {
      triggerShake();
      Alert.alert("Error", error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ============== EMAIL LINK HANDLERS ==============

  const handleCheckEmailVerification = async () => {
    setCheckingEmail(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        await user.reload();
        
        if (user.emailVerified) {
          onVerified(contact);
        } else {
          Alert.alert(
            "Not Verified Yet",
            "Your email hasn't been verified. Please click the verification link in your email, then try again."
          );
        }
      } else {
        Alert.alert("Error", "No user found. Please try again.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to check verification status");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleResendEmailLink = async () => {
    setResendingEmail(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        await sendEmailVerification(user);
        Alert.alert("Email Sent", "A new verification email has been sent. Please check your inbox.");
      } else {
        Alert.alert("Error", "No user found. Please try again.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to resend verification email");
    } finally {
      setResendingEmail(false);
    }
  };

  // ============== SHARED HELPERS ==============

  const triggerShake = () => {
    shakeAnimation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;

    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const maskContact = () => {
    if (type === "email") {
      const [local, domain] = contact.split("@");
      if (!local || local.length <= 2) return contact;
      return `${local.substring(0, 2)}${"*".repeat(Math.min(local.length - 2, 5))}@${domain}`;
    } else {
      if (contact.length <= 4) return contact;
      return `${"*".repeat(contact.length - 4)}${contact.slice(-4)}`;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ============== RENDER ==============

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View
            entering={FadeInDown.springify().damping(15)}
            style={styles.modalContainer}
          >
            {/* Header with gradient */}
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={type === "email" ? "email-check-outline" : "cellphone-check"}
                  size={36}
                  color="#fff"
                />
              </View>
              <Text style={styles.headerTitle}>
                Verify Your {type === "email" ? "Email" : "Phone"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {type === "email"
                  ? "Click the verification link sent to"
                  : `Enter the ${OTP_LENGTH}-digit code sent to`}
              </Text>
              <Text style={styles.contactText}>{maskContact()}</Text>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
              {type === "email" ? (
                /* ============== EMAIL LINK VERIFICATION UI ============== */
                <>
                  <View style={styles.emailInfoBox}>
                    <MaterialCommunityIcons name="email-outline" size={24} color="#667eea" />
                    <Text style={styles.emailInfoText}>
                      We've sent a verification link to your email. Please click the link in the email,
                      then come back and tap the button below.
                    </Text>
                  </View>

                  <View style={styles.emailSteps}>
                    <View style={styles.stepRow}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                      </View>
                      <Text style={styles.stepText}>Check your email inbox (and spam folder)</Text>
                    </View>
                    <View style={styles.stepRow}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                      </View>
                      <Text style={styles.stepText}>Click the verification link in the email</Text>
                    </View>
                    <View style={styles.stepRow}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>3</Text>
                      </View>
                      <Text style={styles.stepText}>Come back here and tap "I've Verified"</Text>
                    </View>
                  </View>

                  {/* Verify Button */}
                  <TouchableOpacity
                    onPress={handleCheckEmailVerification}
                    disabled={checkingEmail}
                    style={styles.verifyButton}
                  >
                    <LinearGradient
                      colors={checkingEmail ? ["#d1d5db", "#d1d5db"] : ["#667eea", "#764ba2"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.verifyGradient}
                    >
                      <MaterialCommunityIcons
                        name="check-circle-outline"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.verifyText}>
                        {checkingEmail ? "Checking..." : "I've Verified My Email"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Resend Email */}
                  <TouchableOpacity
                    onPress={handleResendEmailLink}
                    disabled={resendingEmail}
                    style={styles.resendButton}
                  >
                    <Text style={styles.resendText}>
                      {resendingEmail ? "Sending..." : "Didn't receive email? Resend"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                /* ============== PHONE OTP VERIFICATION UI ============== */
                <>
                  {/* OTP Input Boxes */}
                  <Animated.View style={[styles.otpContainer, shakeStyle]}>
                    {otp.map((digit, index) => (
                      <Animated.View
                        key={index}
                        entering={FadeIn.delay(index * 50)}
                        style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                      >
                        <TextInput
                          ref={(ref) => {
                            inputRefs.current[index] = ref;
                          }}
                          style={styles.otpInput}
                          value={digit}
                          onChangeText={(value) => handleOtpChange(value, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus
                          editable={!loading}
                        />
                      </Animated.View>
                    ))}
                  </Animated.View>

                  {/* Timer and Resend */}
                  <View style={styles.timerContainer}>
                    {timeLeft > 0 ? (
                      <View style={styles.timerRow}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#6b7280" />
                        <Text style={styles.timerText}>
                          Code expires in <Text style={styles.timerBold}>{formatTime(timeLeft)}</Text>
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.expiredText}>Code expired</Text>
                    )}
                  </View>

                  {/* Resend Button */}
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={timeLeft > 0 || sendingOtp}
                    style={styles.resendButton}
                  >
                    <Text
                      style={[styles.resendText, timeLeft > 0 && styles.resendTextDisabled]}
                    >
                      {sendingOtp ? "Sending..." : "Didn't receive code? Resend"}
                    </Text>
                  </TouchableOpacity>

                  {/* Verify Button */}
                  <TouchableOpacity
                    onPress={handleVerifyPhoneOtp}
                    disabled={loading || otp.join("").length < OTP_LENGTH}
                    style={[
                      styles.verifyButton,
                      (loading || otp.join("").length < OTP_LENGTH) && styles.verifyButtonDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        loading || otp.join("").length < OTP_LENGTH
                          ? ["#d1d5db", "#d1d5db"]
                          : ["#667eea", "#764ba2"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.verifyGradient}
                    >
                      <Text style={styles.verifyText}>
                        {loading ? "Verifying..." : "Verify Code"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* Cancel Button */}
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    width: "90%",
    maxWidth: 380,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginTop: 8,
  },
  contactText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginTop: 4,
  },
  content: {
    padding: 24,
  },
  // Email verification styles
  emailInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0f1ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  emailInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  emailSteps: {
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  // OTP input styles
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  otpBoxFilled: {
    borderColor: "#667eea",
    backgroundColor: "#f0f1ff",
  },
  otpInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  timerBold: {
    fontWeight: "600",
    color: "#667eea",
  },
  expiredText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500",
  },
  resendButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  resendTextDisabled: {
    color: "#9ca3af",
  },
  verifyButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyGradient: {
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  verifyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
});

export default VerificationModal;
