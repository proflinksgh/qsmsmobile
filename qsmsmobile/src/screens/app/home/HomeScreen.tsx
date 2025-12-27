
import CreditsCard from "@/src/components/CreditsCard";
import Header from "@/src/components/Header";
import QuickActions from "@/src/components/QuickActions";
import QuickOffers from "@/src/components/QuickOffers";
import { SmsStats } from "@/src/components/SmsStats";
import { COLORS } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const handleActionPress = (screen: string) => {
    navigation.navigate("QuickActions", { screen }); 
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header with gradient */}
      <Header onProfilePress={() => navigation.navigate("UserProfile")} />

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* SMS Overview Stats */}
        <SmsStats
          credits={24500}
          consumed={18750}
          remaining={5750}
          sent={12450}
          delivered={12180}
          failed={270}
          scheduled={128}
        />

        {/* Balance Card Section */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(250)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Balance</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Top Up</Text>
              <Ionicons name="add-circle" size={14} color={COLORS.gradientPurple1} />
            </TouchableOpacity>
          </View>
          <CreditsCard />
        </Animated.View>

        {/* Quick Actions Section */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <QuickActions onActionPress={handleActionPress} />
        </Animated.View>

        {/* Services Grid */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.gradientPurple1} />
            </TouchableOpacity>
          </View>
          <View style={styles.servicesGrid}>
            <ServiceCard 
              icon="chatbubbles-outline" 
              title="Bulk SMS" 
              subtitle="Send messages"
              color={COLORS.gradientPurple1}
              bgColor={COLORS.violetLight}
              onPress={() => handleActionPress("BulkSms")}
            />
            <ServiceCard 
              icon="volume-high-outline" 
              title="Voice SMS" 
              subtitle="Audio messages"
              color={COLORS.gradientPurple2}
              bgColor={COLORS.violetLight}
              onPress={() => handleActionPress("VoiceSms")}
            />
            <ServiceCard 
              icon="mail-outline" 
              title="Email" 
              subtitle="Bulk email"
              color={COLORS.success}
              bgColor={COLORS.successLight}
              onPress={() => handleActionPress("EmailMarketingScreen")}
            />
            <ServiceCard 
              icon="code-slash-outline" 
              title="API" 
              subtitle="Integration"
              color={COLORS.warning}
              bgColor={COLORS.warningLight}
              onPress={() => handleActionPress("ApiScreen")}
            />
          </View>
        </Animated.View>

        {/* Quick Offers Section */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.section}
        >
          <QuickOffers />
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(500)}
          style={[styles.section, styles.lastSection]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.gradientPurple1} />
            </TouchableOpacity>
          </View>
          <View style={styles.activityCard}>
            <ActivityItem 
              icon="checkmark-circle"
              iconColor={COLORS.success}
              iconBg={COLORS.successLight}
              title="SMS Delivered"
              subtitle="500 messages sent successfully"
              time="2 min ago"
            />
            <View style={styles.activityDivider} />
            <ActivityItem 
              icon="wallet"
              iconColor={COLORS.gradientPurple1}
              iconBg={COLORS.violetLight}
              title="Credits Added"
              subtitle="₵100.00 top-up completed"
              time="1 hour ago"
            />
            <View style={styles.activityDivider} />
            <ActivityItem 
              icon="people"
              iconColor={COLORS.warning}
              iconBg={COLORS.warningLight}
              title="New Contacts"
              subtitle="25 contacts imported"
              time="3 hours ago"
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Service Card Component
interface ServiceCardProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

const ServiceCard = ({ icon, title, subtitle, color, bgColor, onPress }: ServiceCardProps) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.serviceIconContainer, { backgroundColor: bgColor }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
    <Text style={styles.serviceSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

// Activity Item Component
interface ActivityItemProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
}

const ActivityItem = ({ icon, iconColor, iconBg, title, subtitle, time }: ActivityItemProps) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.activityTime}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    marginTop: -15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSansBold',
    color: COLORS.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSansSemiBold',
    color: COLORS.textMuted,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSansBold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans',
    color: COLORS.textMuted,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSansSemiBold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans',
    color: COLORS.textMuted,
  },
  activityTime: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans',
    color: COLORS.textLight,
  },
  activityDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 52,
  },
});

export default HomeScreen;
