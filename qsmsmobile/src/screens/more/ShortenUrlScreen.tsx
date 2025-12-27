import ScreenHeader from "@/src/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ShortenedUrl {
  id: string;
  original: string;
  shortened: string;
  clicks: number;
  createdAt: string;
}

const mockUrls: ShortenedUrl[] = [
  { id: "1", original: "https://example.com/very-long-url-that-needs-shortening", shortened: "qsms.link/abc123", clicks: 245, createdAt: "Dec 15, 2024" },
  { id: "2", original: "https://mystore.com/products/sale-items-december", shortened: "qsms.link/sale24", clicks: 128, createdAt: "Dec 12, 2024" },
  { id: "3", original: "https://blog.example.com/article/how-to-use-sms-marketing", shortened: "qsms.link/guide", clicks: 89, createdAt: "Dec 10, 2024" },
];

const UrlItem: React.FC<{ item: ShortenedUrl; index: number }> = ({ item, index }) => {
  const copyUrl = async () => {
    await Clipboard.setStringAsync(`https://${item.shortened}`);
    Alert.alert("Copied!", "Link copied to clipboard");
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <View style={styles.urlCard}>
        <View style={styles.urlContent}>
          <Text style={styles.shortenedUrl}>{item.shortened}</Text>
          <Text style={styles.originalUrl} numberOfLines={1}>{item.original}</Text>
          <View style={styles.urlMeta}>
            <View style={styles.clickBadge}>
              <Ionicons name="bar-chart" size={12} color="#667eea" />
              <Text style={styles.clickCount}>{item.clicks} clicks</Text>
            </View>
            <Text style={styles.dateText}>{item.createdAt}</Text>
          </View>
        </View>
        <View style={styles.urlActions}>
          <TouchableOpacity style={styles.copyBtn} onPress={copyUrl}>
            <Ionicons name="copy-outline" size={18} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const ShortenUrlScreen = () => {
  const navigation = useNavigation();
  const [url, setUrl] = useState("");

  const handleShorten = () => {
    if (!url.trim()) {
      Alert.alert("Error", "Please enter a URL to shorten");
      return;
    }
    Alert.alert("Success", "URL shortened successfully!");
    setUrl("");
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Shorten URL" subtitle="Create short links" onBackPress={() => navigation.goBack()} />

      <FlatList
        data={mockUrls}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Create URL Card */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createCard}
              >
                <Text style={styles.createTitle}>Create Short Link</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="link" size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Paste your long URL here"
                    placeholderTextColor="#9CA3AF"
                    value={url}
                    onChangeText={setUrl}
                  />
                </View>
                <TouchableOpacity style={styles.shortenBtn} onPress={handleShorten}>
                  <Text style={styles.shortenBtnText}>Shorten URL</Text>
                  <Ionicons name="arrow-forward" size={18} color="#667eea" />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{mockUrls.length}</Text>
                  <Text style={styles.statLabel}>Total Links</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{mockUrls.reduce((sum, u) => sum + u.clicks, 0)}</Text>
                  <Text style={styles.statLabel}>Total Clicks</Text>
                </View>
              </View>
            </Animated.View>

            <Text style={styles.sectionTitle}>YOUR LINKS</Text>
          </>
        }
        renderItem={({ item, index }) => <UrlItem item={item} index={index} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
  },
  createCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  createTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "#1F2937",
    marginLeft: 10,
  },
  shortenBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  shortenBtnText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansBold",
    color: "#667eea",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "PlusJakartaSansBold",
    color: "#667eea",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  urlCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  urlContent: {
    flex: 1,
  },
  shortenedUrl: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansBold",
    color: "#667eea",
    marginBottom: 4,
  },
  originalUrl: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginBottom: 8,
  },
  urlMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clickBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EEFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clickCount: {
    fontSize: 11,
    fontFamily: "PlusJakartaSansMedium",
    color: "#667eea",
    marginLeft: 4,
  },
  dateText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans",
    color: "#9CA3AF",
  },
  urlActions: {
    justifyContent: "center",
    gap: 8,
    marginLeft: 12,
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0EEFF",
    justifyContent: "center",
    alignItems: "center",
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ShortenUrlScreen;
