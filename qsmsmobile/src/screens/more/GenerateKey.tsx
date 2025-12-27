import ScreenHeader from "@/src/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const GenerateKeyScreen = () => {
  const navigation = useNavigation();
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateKey = () => {
    setIsGenerating(true);
    // Simulate API key generation
    setTimeout(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let key = "sk_live_";
      for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setGeneratedKey(key);
      setIsGenerating(false);
    }, 1500);
  };

  const copyKey = async () => {
    if (generatedKey) {
      await Clipboard.setStringAsync(generatedKey);
      Alert.alert("Copied!", "API key copied to clipboard");
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Generate API Key" subtitle="Create new credentials" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="information-circle" size={24} color="#667eea" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>About API Keys</Text>
              <Text style={styles.infoText}>
                API keys allow external applications to access your QuickSMS account. Keep them secure and never share publicly.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Key Types */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionTitle}>KEY TYPE</Text>
          <View style={styles.keyTypesRow}>
            <TouchableOpacity style={[styles.keyTypeCard, styles.keyTypeActive]}>
              <View style={[styles.keyTypeIcon, { backgroundColor: "#D1FAE5" }]}>
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
              </View>
              <Text style={styles.keyTypeName}>Production</Text>
              <Text style={styles.keyTypeDesc}>Live environment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyTypeCard}>
              <View style={[styles.keyTypeIcon, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="flask" size={20} color="#D97706" />
              </View>
              <Text style={styles.keyTypeName}>Sandbox</Text>
              <Text style={styles.keyTypeDesc}>Test environment</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Permissions */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={styles.sectionTitle}>PERMISSIONS</Text>
          <View style={styles.permissionsCard}>
            {[
              { name: "Send SMS", icon: "chatbubble", enabled: true },
              { name: "Send Voice", icon: "mic", enabled: true },
              { name: "Read Reports", icon: "document-text", enabled: true },
              { name: "Manage Contacts", icon: "people", enabled: false },
            ].map((perm, idx) => (
              <TouchableOpacity key={idx} style={styles.permItem}>
                <View style={[styles.permIcon, { backgroundColor: perm.enabled ? "#D1FAE5" : "#F3F4F6" }]}>
                  <Ionicons name={perm.icon as any} size={18} color={perm.enabled ? "#059669" : "#9CA3AF"} />
                </View>
                <Text style={styles.permName}>{perm.name}</Text>
                <Ionicons
                  name={perm.enabled ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={perm.enabled ? "#059669" : "#D1D5DB"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Generated Key Display */}
        {generatedKey && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.sectionTitle}>YOUR NEW API KEY</Text>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.keyCard}
            >
              <View style={styles.keyHeader}>
                <Ionicons name="key" size={24} color="white" />
                <Text style={styles.keyLabel}>Production Key</Text>
              </View>
              <View style={styles.keyContainer}>
                <Text style={styles.keyText} numberOfLines={1}>{generatedKey}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={copyKey}>
                  <Ionicons name="copy-outline" size={18} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.keyWarning}>
                ⚠️ Copy this key now. You won't be able to see it again!
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Generate Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={generateKey}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isGenerating ? ["#9CA3AF", "#6B7280"] : ["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGradient}
            >
              {isGenerating ? (
                <Text style={styles.generateText}>Generating...</Text>
              ) : (
                <>
                  <Ionicons name="key" size={20} color="white" />
                  <Text style={styles.generateText}>Generate New Key</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Warning */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color="#D97706" />
            <Text style={styles.warningText}>
              Generating a new key will invalidate your previous production key. Update your applications accordingly.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F0EEFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  keyTypesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  keyTypeCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  keyTypeActive: {
    borderColor: "#667eea",
  },
  keyTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  keyTypeName: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
  },
  keyTypeDesc: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 2,
  },
  permissionsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  permItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  permIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  permName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSansMedium",
    color: "#1F2937",
  },
  keyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  keyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  keyLabel: {
    fontSize: 16,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
    marginLeft: 10,
  },
  keyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  keyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "PlusJakartaSansMedium",
    color: "white",
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  keyWarning: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#FEF3C7",
  },
  generateBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  generateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  generateText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "#92400E",
    marginLeft: 10,
    lineHeight: 20,
  },
});

export default GenerateKeyScreen;
