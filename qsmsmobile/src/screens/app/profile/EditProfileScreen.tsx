import ScreenHeader from "@/src/components/ScreenHeader";
import { fetchUserProfile, UserProfileData } from "@/src/service/apiClient";
import {
    ProfileUpdateData,
    updateProfileData,
    updateUserEmail,
    updateUserPassword,
} from "@/src/service/profileService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface EditableField {
  key: keyof ProfileUpdateData | "email" | "password";
  label: string;
  value: string;
  icon: string;
  editable: boolean;
  sensitive?: boolean;
}

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  
  // Editable fields
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Email change modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("systemUserId");
      const tokenRaw = await SecureStore.getItemAsync("authToken");
      
      let token: string | null = null;
      if (tokenRaw) {
        try {
          const parsed = JSON.parse(tokenRaw);
          token = parsed?.token ?? tokenRaw;
        } catch {
          token = tokenRaw;
        }
      }

      if (userId && token) {
        const response = await fetchUserProfile(userId, token);
        if (response.status === "success" && response.data) {
          setProfile(response.data);
          setPhone(response.data.phone || "");
          setCity(response.data.city || "");
          setCountry(response.data.country || "");
          setRegion(response.data.region || "");
          // Display name might come from reference or a displayName field
          setDisplayName(response.data.reference || "");
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updateData: ProfileUpdateData = {};
      
      // Only include changed fields
      if (phone !== profile?.phone) updateData.phone = phone;
      if (city !== profile?.city) updateData.city = city;
      if (country !== profile?.country) updateData.country = country;
      if (region !== profile?.region) updateData.region = region;
      if (displayName !== profile?.reference) updateData.displayName = displayName;
      
      // Check if anything changed
      if (Object.keys(updateData).length === 0) {
        Alert.alert("No Changes", "No changes were made to your profile.");
        return;
      }
      
      const result = await updateProfileData(updateData);
      
      if (result.status === "success") {
        Alert.alert("Success", "Profile updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }
    
    setSaving(true);
    try {
      const result = await updateUserPassword({
        currentPassword,
        newPassword,
      });
      
      if (result.status === "success") {
        Alert.alert("Success", result.message);
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !emailPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    if (!newEmail.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    setSaving(true);
    try {
      const result = await updateUserEmail({
        newEmail,
        currentPassword: emailPassword,
      });
      
      if (result.status === "success") {
        Alert.alert("Success", result.message);
        setShowEmailModal(false);
        setNewEmail("");
        setEmailPassword("");
        loadProfile(); // Reload profile to show new email
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change email");
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow access to your photo library to change your profile picture.");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      // TODO: Implement image upload when backend endpoint is ready
      Alert.alert("Coming Soon", "Profile image upload will be available soon.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Profile" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Edit Profile" onBackPress={() => navigation.goBack()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.imageSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.imageContainer}>
              {profile?.image ? (
                <Image source={{ uri: profile.image }} style={styles.profileImage} />
              ) : (
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.profileImagePlaceholder}
                >
                  <Text style={styles.profileInitials}>
                    {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </Animated.View>

          {/* Basic Info Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </Animated.View>

          {/* Location Section */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter city"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Region</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="map-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={region}
                  onChangeText={setRegion}
                  placeholder="Enter region"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="globe-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Enter country"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </Animated.View>

          {/* Account Security Section */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>
            
            <TouchableOpacity
              style={styles.securityItem}
              onPress={() => setShowEmailModal(true)}
            >
              <View style={[styles.securityIcon, { backgroundColor: "#EEF2FF" }]}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#667eea" />
              </View>
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>Change Email</Text>
                <Text style={styles.securitySubtitle}>{profile?.email || "Not set"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.securityItem}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={[styles.securityIcon, { backgroundColor: "#FEF3C7" }]}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>Change Password</Text>
                <Text style={styles.securitySubtitle}>Update your password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </Animated.View>

          {/* Save Button */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              <LinearGradient
                colors={saving ? ["#9CA3AF", "#9CA3AF"] : ["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <Ionicons
                      name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleChangePassword}
                disabled={saving}
              >
                <LinearGradient
                  colors={saving ? ["#9CA3AF", "#9CA3AF"] : ["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Update Password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Email Change Modal */}
      <Modal
        visible={showEmailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Email</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.modalInfo}>
                <Ionicons name="information-circle-outline" size={20} color="#667eea" />
                <Text style={styles.modalInfoText}>
                  Changing your email will require re-verification of the new email address.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="Enter new email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={emailPassword}
                    onChangeText={setEmailPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleChangeEmail}
                disabled={saving}
              >
                <LinearGradient
                  colors={saving ? ["#9CA3AF", "#9CA3AF"] : ["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Update Email</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  securitySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  saveButtonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  saveButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalContent: {
    padding: 20,
  },
  modalInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  modalButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  modalButtonGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

export default EditProfileScreen;
