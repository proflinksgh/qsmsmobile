import ScreenHeader from "@/src/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface SmsReport {
  id: string;
  recipient: string;
  message: string;
  status: "delivered" | "sent" | "pending" | "failed";
  date: string;
  type: "bulk" | "personal" | "quick";
}

const mockReports: SmsReport[] = [
  { id: "1", recipient: "+234 812 345 6789", message: "Your OTP is 123456. Valid for 5 mins.", status: "delivered", date: "Dec 15, 2024 10:30 AM", type: "quick" },
  { id: "2", recipient: "+234 809 111 2222", message: "Thank you for your purchase at Store ABC...", status: "delivered", date: "Dec 15, 2024 09:15 AM", type: "personal" },
  { id: "3", recipient: "Marketing Campaign", message: "Flash Sale! 50% off all items this weekend...", status: "sent", date: "Dec 14, 2024 02:00 PM", type: "bulk" },
  { id: "4", recipient: "+234 701 333 4444", message: "Your appointment is confirmed for...", status: "pending", date: "Dec 14, 2024 11:45 AM", type: "personal" },
  { id: "5", recipient: "+234 805 555 6666", message: "Invalid recipient number format", status: "failed", date: "Dec 13, 2024 04:20 PM", type: "quick" },
  { id: "6", recipient: "Newsletter List", message: "Weekly update: New features released...", status: "delivered", date: "Dec 12, 2024 08:00 AM", type: "bulk" },
];

const ReportItem: React.FC<{ item: SmsReport; index: number }> = ({ item, index }) => {
  const statusConfig = {
    delivered: { icon: "checkmark-circle", color: "#059669", bg: "#D1FAE5" },
    sent: { icon: "checkmark", color: "#2563EB", bg: "#DBEAFE" },
    pending: { icon: "time", color: "#D97706", bg: "#FEF3C7" },
    failed: { icon: "close-circle", color: "#DC2626", bg: "#FEE2E2" },
  };

  const typeConfig = {
    bulk: { label: "Bulk", color: "#8B5CF6" },
    personal: { label: "Personal", color: "#0284C7" },
    quick: { label: "Quick", color: "#059669" },
  };

  const status = statusConfig[item.status];
  const type = typeConfig[item.type];

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <TouchableOpacity style={styles.reportItem} activeOpacity={0.7}>
        <View style={[styles.statusIcon, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon as any} size={20} color={status.color} />
        </View>
        <View style={styles.reportContent}>
          <View style={styles.reportHeader}>
            <Text style={styles.recipientText} numberOfLines={1}>
              {item.recipient}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: `${type.color}15` }]}>
              <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
            </View>
          </View>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.message}
          </Text>
          <View style={styles.reportFooter}>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={[styles.statusText, { color: status.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SmsReportScreen = () => {
  const [filter, setFilter] = useState<"all" | "delivered" | "pending" | "failed">("all");

  const filteredReports = mockReports.filter(
    (r) => filter === "all" || r.status === filter
  );

  // Stats calculation
  const stats = {
    total: mockReports.length,
    delivered: mockReports.filter((r) => r.status === "delivered").length,
    pending: mockReports.filter((r) => r.status === "pending").length,
    failed: mockReports.filter((r) => r.status === "failed").length,
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="SMS Reports"
        subtitle="Delivery status & history"
        rightAction={
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="white" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Stats Cards */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <View style={styles.statsContainer}>
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total Sent</Text>
                </LinearGradient>

                <View style={[styles.statCard, styles.statCardWhite]}>
                  <Text style={[styles.statValue, { color: "#059669" }]}>
                    {stats.delivered}
                  </Text>
                  <Text style={[styles.statLabel, { color: "#6B7280" }]}>
                    Delivered
                  </Text>
                </View>

                <View style={[styles.statCard, styles.statCardWhite]}>
                  <Text style={[styles.statValue, { color: "#D97706" }]}>
                    {stats.pending}
                  </Text>
                  <Text style={[styles.statLabel, { color: "#6B7280" }]}>
                    Pending
                  </Text>
                </View>

                <View style={[styles.statCard, styles.statCardWhite]}>
                  <Text style={[styles.statValue, { color: "#DC2626" }]}>
                    {stats.failed}
                  </Text>
                  <Text style={[styles.statLabel, { color: "#6B7280" }]}>
                    Failed
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Filter Tabs */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <View style={styles.filterContainer}>
                {(["all", "delivered", "pending", "failed"] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterTab, filter === f && styles.filterTabActive]}
                    onPress={() => setFilter(f)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        filter === f && styles.filterTabTextActive,
                      ]}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Text style={styles.sectionTitle}>RECENT MESSAGES</Text>
          </>
        }
        renderItem={({ item, index }) => (
          <ReportItem item={item} index={index} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        }
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
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statCardWhite: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: "#667eea",
  },
  filterTabText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSansMedium",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "white",
    fontFamily: "PlusJakartaSansBold",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  reportItem: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  reportContent: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  recipientText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontFamily: "PlusJakartaSansBold",
  },
  messageText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans",
    color: "#9CA3AF",
  },
  statusText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSansBold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "#9CA3AF",
    marginTop: 12,
  },
});

export default SmsReportScreen;
