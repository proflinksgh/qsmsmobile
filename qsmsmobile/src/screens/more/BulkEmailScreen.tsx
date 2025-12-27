import ScreenHeader from "@/src/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const BulkEmailScreen = () => {
  const navigation = useNavigation();
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Bulk Email"
        subtitle="Send email campaigns"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.historyButton}>
            <Ionicons name="time-outline" size={20} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Credits Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.creditsCard}
          >
            <View style={styles.creditsRow}>
              <View>
                <Text style={styles.creditsLabel}>Email Credits</Text>
                <Text style={styles.creditsValue}>2,450</Text>
              </View>
              <TouchableOpacity style={styles.buyButton}>
                <Text style={styles.buyButtonText}>Buy More</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Recipient Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionTitle}>RECIPIENTS</Text>
          <View style={styles.inputCard}>
            <TouchableOpacity style={styles.groupSelector}>
              <View style={styles.groupIcon}>
                <Ionicons name="people" size={20} color="#667eea" />
              </View>
              <View style={styles.groupContent}>
                <Text style={styles.groupLabel}>Select Email Group</Text>
                <Text style={styles.groupHint}>Choose from your contact groups</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.manualInput}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.textInput}
                placeholder="Or enter emails (comma separated)"
                placeholderTextColor="#9CA3AF"
                value={recipients}
                onChangeText={setRecipients}
                multiline
              />
            </View>
          </View>
        </Animated.View>

        {/* Subject Input */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={styles.sectionTitle}>SUBJECT</Text>
          <View style={styles.inputCard}>
            <View style={styles.subjectInput}>
              <Ionicons name="text" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.textInput}
                placeholder="Enter email subject"
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
              />
            </View>
          </View>
        </Animated.View>

        {/* Message Input */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Text style={styles.sectionTitle}>MESSAGE</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.messageInput}
              placeholder="Compose your email message..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.messageFooter}>
              <View style={styles.attachmentActions}>
                <TouchableOpacity style={styles.attachButton}>
                  <Ionicons name="attach" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachButton}>
                  <Ionicons name="image-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachButton}>
                  <Ionicons name="link-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.charCount}>{message.length} characters</Text>
            </View>
          </View>
        </Animated.View>

        {/* Template Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <Text style={styles.sectionTitle}>QUICK TEMPLATES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.templatesRow}>
              {["Welcome", "Newsletter", "Promo", "Update", "Custom"].map((template, idx) => (
                <TouchableOpacity key={idx} style={styles.templateCard}>
                  <View style={[styles.templateIcon, { backgroundColor: `hsl(${idx * 60}, 70%, 95%)` }]}>
                    <Ionicons 
                      name={["hand-right", "newspaper", "pricetag", "refresh", "create"][idx] as any} 
                      size={20} 
                      color={`hsl(${idx * 60}, 70%, 50%)`} 
                    />
                  </View>
                  <Text style={styles.templateText}>{template}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Schedule Option */}
        <Animated.View entering={FadeInDown.duration(400).delay(600)}>
          <TouchableOpacity style={styles.scheduleCard}>
            <View style={styles.scheduleIcon}>
              <Ionicons name="calendar-outline" size={22} color="#667eea" />
            </View>
            <View style={styles.scheduleContent}>
              <Text style={styles.scheduleTitle}>Schedule Send</Text>
              <Text style={styles.scheduleSubtitle}>Send at a specific date & time</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Send Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(700)}>
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.8}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendGradient}
            >
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.sendText}>Send Email Campaign</Text>
            </LinearGradient>
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
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  creditsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  creditsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditsLabel: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
  },
  creditsValue: {
    fontSize: 32,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buyButtonText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  inputCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  groupSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0EEFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  groupContent: {
    flex: 1,
  },
  groupLabel: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
  },
  groupHint: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  manualInput: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  subjectInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSans",
    color: "#1F2937",
    marginLeft: 12,
  },
  messageInput: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans",
    color: "#1F2937",
    padding: 16,
    minHeight: 150,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  attachmentActions: {
    flexDirection: "row",
    gap: 16,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  charCount: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#9CA3AF",
  },
  templatesRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 24,
  },
  templateCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    width: 85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  templateText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSansMedium",
    color: "#1F2937",
  },
  scheduleCard: {
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
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F0EEFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
  },
  scheduleSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginTop: 2,
  },
  sendButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  sendGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  sendText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
});

export default BulkEmailScreen;
