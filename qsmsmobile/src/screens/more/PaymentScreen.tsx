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

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

const mockTransactions: Transaction[] = [
  { id: "1", type: "credit", amount: 5000, description: "SMS Credit Purchase", date: "Dec 15, 2024", status: "completed" },
  { id: "2", type: "debit", amount: 150, description: "Bulk SMS - 500 messages", date: "Dec 14, 2024", status: "completed" },
  { id: "3", type: "credit", amount: 2000, description: "Voice Credit Purchase", date: "Dec 12, 2024", status: "completed" },
  { id: "4", type: "debit", amount: 300, description: "Voice SMS - 30 calls", date: "Dec 10, 2024", status: "completed" },
  { id: "5", type: "credit", amount: 10000, description: "Premium Plan Subscription", date: "Dec 5, 2024", status: "pending" },
  { id: "6", type: "debit", amount: 50, description: "Personal SMS - 25 messages", date: "Dec 3, 2024", status: "completed" },
];

const TransactionItem: React.FC<{ item: Transaction; index: number }> = ({ item, index }) => {
  const statusColors = {
    completed: { bg: "#D1FAE5", text: "#059669" },
    pending: { bg: "#FEF3C7", text: "#D97706" },
    failed: { bg: "#FEE2E2", text: "#DC2626" },
  };

  const colors = statusColors[item.status];

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: item.type === "credit" ? "#D1FAE5" : "#FEE2E2" },
          ]}
        >
          <Ionicons
            name={item.type === "credit" ? "arrow-down" : "arrow-up"}
            size={20}
            color={item.type === "credit" ? "#059669" : "#DC2626"}
          />
        </View>
        <View style={styles.transactionContent}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>{item.date}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.statusText, { color: colors.text }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.type === "credit" ? "#059669" : "#DC2626" },
          ]}
        >
          {item.type === "credit" ? "+" : "-"}₦{item.amount.toLocaleString()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PaymentsScreen = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const filteredTransactions = mockTransactions.filter(
    (t) => filter === "all" || t.type === filter
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Payments"
        subtitle="Transaction history"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Balance Card */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
              >
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>₦45,750.00</Text>
                <View style={styles.balanceStats}>
                  <View style={styles.balanceStat}>
                    <Ionicons name="trending-up" size={16} color="#4ADE80" />
                    <Text style={styles.balanceStatText}>+₦17,000 this month</Text>
                  </View>
                </View>

                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionIcon}>
                      <Ionicons name="add" size={20} color="#667eea" />
                    </View>
                    <Text style={styles.quickActionText}>Top Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionIcon}>
                      <Ionicons name="download-outline" size={20} color="#667eea" />
                    </View>
                    <Text style={styles.quickActionText}>Export</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Filter Tabs */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <View style={styles.filterContainer}>
                {(["all", "credit", "debit"] as const).map((f) => (
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

            <Text style={styles.sectionTitle}>TRANSACTIONS</Text>
          </>
        }
        renderItem={({ item, index }) => (
          <TransactionItem item={item} index={index} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No transactions found</Text>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
    marginTop: 4,
  },
  balanceStats: {
    flexDirection: "row",
    marginTop: 12,
  },
  balanceStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceStatText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansMedium",
    color: "rgba(255,255,255,0.9)",
    marginLeft: 6,
  },
  quickActions: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSansMedium",
    color: "white",
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
    fontSize: 14,
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
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
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
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "PlusJakartaSansBold",
    textTransform: "capitalize",
  },
  transactionAmount: {
    fontSize: 16,
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

export default PaymentsScreen;
