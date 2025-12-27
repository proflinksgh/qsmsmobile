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

interface ApiEndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  description: string;
  delay: number;
}

const ApiEndpoint: React.FC<ApiEndpointProps> = ({
  method,
  endpoint,
  description,
  delay,
}) => {
  const methodColors = {
    GET: { bg: "#D1FAE5", text: "#059669" },
    POST: { bg: "#DBEAFE", text: "#2563EB" },
    PUT: { bg: "#FEF3C7", text: "#D97706" },
    DELETE: { bg: "#FEE2E2", text: "#DC2626" },
  };

  const colors = methodColors[method];

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <TouchableOpacity style={styles.endpointCard} activeOpacity={0.7}>
        <View style={styles.endpointHeader}>
          <View style={[styles.methodBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.methodText, { color: colors.text }]}>{method}</Text>
          </View>
          <Text style={styles.endpointPath} numberOfLines={1}>
            {endpoint}
          </Text>
        </View>
        <Text style={styles.endpointDescription}>{description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ApiIntegrationScreen = () => {
  const navigation = useNavigation();
  const [apiKey] = useState("sk_live_xxxxxxxxxxxxxxxxxxxx");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(apiKey);
    setCopied(true);
    Alert.alert("Copied!", "API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    { method: "POST" as const, endpoint: "/api/sms/send", description: "Send a single SMS message" },
    { method: "POST" as const, endpoint: "/api/sms/bulk", description: "Send bulk SMS messages" },
    { method: "GET" as const, endpoint: "/api/sms/status/:id", description: "Check SMS delivery status" },
    { method: "POST" as const, endpoint: "/api/voice/send", description: "Send voice message" },
    { method: "GET" as const, endpoint: "/api/balance", description: "Check account balance" },
    { method: "GET" as const, endpoint: "/api/reports", description: "Get delivery reports" },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="API Integration"
        subtitle="Developer documentation"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.docsButton}>
            <Ionicons name="document-text-outline" size={20} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* API Key Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.apiKeyCard}
          >
            <View style={styles.apiKeyHeader}>
              <Ionicons name="key" size={24} color="white" />
              <Text style={styles.apiKeyTitle}>Your API Key</Text>
            </View>
            <View style={styles.apiKeyContainer}>
              <Text style={styles.apiKeyText} numberOfLines={1}>
                {apiKey}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyToClipboard}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.apiKeyNote}>
              Keep your API key secure. Don't share it publicly.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Start */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionTitle}>QUICK START</Text>
          <View style={styles.quickStartCard}>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {`curl -X POST https://api.quicksms.com/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d "to=+234812345678" \\
  -d "message=Hello World"`}
              </Text>
            </View>
            <TouchableOpacity style={styles.copyCodeButton} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color="#667eea" />
              <Text style={styles.copyCodeText}>Copy Code</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Endpoints */}
        <Text style={styles.sectionTitle}>API ENDPOINTS</Text>
        {endpoints.map((endpoint, index) => (
          <ApiEndpoint
            key={index}
            method={endpoint.method}
            endpoint={endpoint.endpoint}
            description={endpoint.description}
            delay={300 + index * 50}
          />
        ))}

        {/* Rate Limits */}
        <Animated.View entering={FadeInDown.duration(400).delay(600)}>
          <Text style={styles.sectionTitle}>RATE LIMITS</Text>
          <View style={styles.rateLimitCard}>
            <View style={styles.rateLimitRow}>
              <View style={styles.rateLimitItem}>
                <Text style={styles.rateLimitValue}>100</Text>
                <Text style={styles.rateLimitLabel}>Requests/min</Text>
              </View>
              <View style={styles.rateLimitDivider} />
              <View style={styles.rateLimitItem}>
                <Text style={styles.rateLimitValue}>10,000</Text>
                <Text style={styles.rateLimitLabel}>SMS/day</Text>
              </View>
              <View style={styles.rateLimitDivider} />
              <View style={styles.rateLimitItem}>
                <Text style={styles.rateLimitValue}>1,000</Text>
                <Text style={styles.rateLimitLabel}>Voice/day</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Help Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(700)}>
          <TouchableOpacity style={styles.helpCard} activeOpacity={0.8}>
            <View style={styles.helpIcon}>
              <Ionicons name="help-circle" size={24} color="#667eea" />
            </View>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>
                Check our documentation or contact support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
  docsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  apiKeyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  apiKeyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  apiKeyTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
    marginLeft: 10,
  },
  apiKeyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  apiKeyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "PlusJakartaSansMedium",
    color: "white",
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  apiKeyNote: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  quickStartCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  codeBlock: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  codeText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#10B981",
    lineHeight: 20,
  },
  copyCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  copyCodeText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSansMedium",
    color: "#667eea",
    marginLeft: 6,
  },
  endpointCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  endpointHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  methodText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSansBold",
  },
  endpointPath: {
    flex: 1,
    fontSize: 14,
    fontFamily: "PlusJakartaSansMedium",
    color: "#1F2937",
  },
  endpointDescription: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
  },
  rateLimitCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  rateLimitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateLimitItem: {
    flex: 1,
    alignItems: "center",
  },
  rateLimitValue: {
    fontSize: 22,
    fontFamily: "PlusJakartaSansBold",
    color: "#667eea",
  },
  rateLimitLabel: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 4,
  },
  rateLimitDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0EEFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
  },
  helpText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 2,
  },
});

export default ApiIntegrationScreen;
