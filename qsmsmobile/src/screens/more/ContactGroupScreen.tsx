import ScreenHeader from "@/src/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ContactGroup {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  color: string;
  icon: string;
  lastUsed: string;
}

const mockGroups: ContactGroup[] = [
  { id: "1", name: "Marketing Team", description: "Internal marketing contacts", contactCount: 45, color: "#667eea", icon: "megaphone", lastUsed: "Today" },
  { id: "2", name: "VIP Customers", description: "Premium tier customers", contactCount: 128, color: "#059669", icon: "star", lastUsed: "Yesterday" },
  { id: "3", name: "Newsletter Subscribers", description: "Weekly newsletter list", contactCount: 1250, color: "#DC2626", icon: "mail", lastUsed: "Dec 12" },
  { id: "4", name: "Event Attendees", description: "Conference 2024 participants", contactCount: 320, color: "#D97706", icon: "people", lastUsed: "Dec 10" },
  { id: "5", name: "Partner Vendors", description: "Business partners & suppliers", contactCount: 67, color: "#8B5CF6", icon: "business", lastUsed: "Dec 8" },
];

const GroupItem: React.FC<{ item: ContactGroup; index: number }> = ({ item, index }) => {
  return (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <TouchableOpacity style={styles.groupItem} activeOpacity={0.7}>
        <View style={[styles.groupIcon, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        </View>
        <View style={styles.groupContent}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription}>{item.description}</Text>
          <View style={styles.groupMeta}>
            <View style={styles.contactBadge}>
              <Ionicons name="person" size={12} color="#6B7280" />
              <Text style={styles.contactCount}>{item.contactCount} contacts</Text>
            </View>
            <Text style={styles.lastUsed}>Used {item.lastUsed}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ContactGroupScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = mockGroups.filter(
    (g) => g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalContacts = mockGroups.reduce((sum, g) => sum + g.contactCount, 0);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Contact Groups"
        subtitle="Manage your groups"
        rightAction={
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Stats Card */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statsCard}
              >
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{mockGroups.length}</Text>
                    <Text style={styles.statLabel}>Total Groups</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{totalContacts.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Total Contacts</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Search Bar */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search groups..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInDown.duration(400).delay(300)}>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction}>
                  <View style={[styles.quickActionIcon, { backgroundColor: "#D1FAE5" }]}>
                    <Ionicons name="cloud-upload" size={18} color="#059669" />
                  </View>
                  <Text style={styles.quickActionText}>Import</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
                    <Ionicons name="download" size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.quickActionText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <View style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}>
                    <Ionicons name="git-merge" size={18} color="#D97706" />
                  </View>
                  <Text style={styles.quickActionText}>Merge</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Text style={styles.sectionTitle}>YOUR GROUPS</Text>
          </>
        }
        renderItem={({ item, index }) => (
          <GroupItem item={item} index={index} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No groups found</Text>
            <Text style={styles.emptySubtext}>Create a new group to get started</Text>
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
  statsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontFamily: "PlusJakartaSansBold",
    color: "white",
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSans",
    color: "#1F2937",
    marginLeft: 12,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSansMedium",
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSansBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  groupItem: {
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
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  groupContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#1F2937",
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactCount: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans",
    color: "#6B7280",
    marginLeft: 4,
  },
  lastUsed: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans",
    color: "#9CA3AF",
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSansSemiBold",
    color: "#6B7280",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "#9CA3AF",
    marginTop: 4,
  },
});

export default ContactGroupScreen;
