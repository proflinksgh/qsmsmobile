// src/components/SmsStats.tsx
// Reusable SMS Statistics Components for Bulk SMS App

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLORS } from "../constants/theme";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface MainStat {
  value: string | number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  cardBg?: string;
}

interface SubStat {
  value: string | number;
  label: string;
  color: string;
}

interface SmsStatsProps {
  credits?: number;
  consumed?: number;
  remaining?: number;
  sent?: number;
  delivered?: number;
  failed?: number;
  scheduled?: number;
}

// ─────────────────────────────────────────────────────────────
// Main Stat Card Component
// ─────────────────────────────────────────────────────────────
interface MainStatCardProps {
  stat: MainStat;
  delay?: number;
}

export const MainStatCard: React.FC<MainStatCardProps> = ({ stat, delay = 0 }) => (
  <Animated.View 
    entering={FadeInDown.duration(400).delay(delay)}
    style={[styles.mainStatCard, stat.cardBg ? { backgroundColor: stat.cardBg } : null]}
  >
    <View style={[styles.mainStatIconContainer, { backgroundColor: stat.bgColor }]}> 
      <Ionicons name={stat.icon} size={16} color={stat.iconColor} />
    </View>
    <Text style={[styles.mainStatValue, { color: COLORS.white }]}>
      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
    </Text>
    <Text style={[styles.mainStatLabel, { color: COLORS.gray2 }]}>{stat.label}</Text>
  </Animated.View>
);

// ─────────────────────────────────────────────────────────────
// Sub Stat Item Component
// ─────────────────────────────────────────────────────────────
interface SubStatItemProps {
  stat: SubStat;
}

export const SubStatItem: React.FC<SubStatItemProps> = ({ stat }) => (
  <View style={styles.subStatItem}>
    <View style={[styles.subStatDot, { backgroundColor: stat.color }]} />
    <Text style={styles.subStatValue}>
      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
    </Text>
    <Text style={styles.subStatLabel}>{stat.label}</Text>
  </View>
);

// ─────────────────────────────────────────────────────────────
// Main Stats Row Component
// ─────────────────────────────────────────────────────────────
interface MainStatsRowProps {
  credits: number;
  consumed: number;
  remaining: number;
}

export const MainStatsRow: React.FC<MainStatsRowProps> = ({ 
  credits, 
  consumed, 
  remaining 
}) => {
  const mainStats: MainStat[] = [
    {
      value: credits,
      label: "Credits",
      icon: "wallet",
      iconColor: COLORS.gradientPurple1,
      bgColor: COLORS.violetLight,
      cardBg: COLORS.gray6, // dark grey
    },
    {
      value: consumed,
      label: "Consumed",
      icon: "flame",
      iconColor: COLORS.gradientPurple2,
      bgColor: COLORS.violetLight,
      cardBg: COLORS.gray5, // silvery dark
    },
    {
      value: remaining,
      label: "Remaining",
      icon: "sparkles",
      iconColor: COLORS.success,
      bgColor: COLORS.successLight,
      cardBg: COLORS.gray7, // silvery
    },
  ];

  return (
    <View style={styles.mainStatsRow}>
      {mainStats.map((stat, index) => (
        <MainStatCard key={stat.label} stat={stat} delay={50 + index * 50} />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Sub Stats Row Component
// ─────────────────────────────────────────────────────────────
interface SubStatsRowProps {
  sent: number;
  delivered: number;
  failed: number;
  scheduled: number;
}

export const SubStatsRow: React.FC<SubStatsRowProps> = ({ 
  sent, 
  delivered, 
  failed, 
  scheduled 
}) => {
  const subStats: SubStat[] = [
    { value: sent, label: "Sent", color: COLORS.gradientPurple1 },
    { value: delivered, label: "Delivered", color: COLORS.success },
    { value: failed, label: "Failed", color: COLORS.error },
    { value: scheduled, label: "Scheduled", color: COLORS.warning },
  ];

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(200)}
      style={styles.subStatsRow}
    >
      {subStats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <SubStatItem stat={stat} />
          {index < subStats.length - 1 && <View style={styles.subStatDivider} />}
        </React.Fragment>
      ))}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────
// Complete SMS Stats Component
// ─────────────────────────────────────────────────────────────
export const SmsStats: React.FC<SmsStatsProps> = ({
  credits = 0,
  consumed = 0,
  remaining = 0,
  sent = 0,
  delivered = 0,
  failed = 0,
  scheduled = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Animated.View 
        entering={FadeInDown.duration(300)}
        style={styles.titleRow}
      >
        <View style={styles.titleLeft}>
          <View style={styles.titleIcon}>
            <Ionicons name="stats-chart" size={14} color={COLORS.gradientPurple1} />
          </View>
          <Text style={styles.title}>SMS Overview</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </Animated.View>

      {/* Main Stats */}
      <MainStatsRow 
        credits={credits} 
        consumed={consumed} 
        remaining={remaining} 
      />

      {/* Sub Stats */}
      <SubStatsRow 
        sent={sent} 
        delivered={delivered} 
        failed={failed} 
        scheduled={scheduled} 
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  // Title Row
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.violetLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSansBold',
    color: COLORS.textSecondary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSansBold',
    color: COLORS.textMuted,
  },
  // Main Stats Row
  mainStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  mainStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.gradientPurple1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mainStatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainStatValue: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSansBold',
    color: COLORS.textPrimary,
  },
  mainStatLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Sub Stats Row
  subStatsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  subStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  subStatValue: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSansBold',
    color: COLORS.textSecondary,
  },
  subStatLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans',
    color: COLORS.textLight,
    marginTop: 2,
  },
  subStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
  },
});

export default SmsStats;
