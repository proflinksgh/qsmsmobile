import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CreditsCard = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative shapes */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />

        {/* Card Content */}
        <View style={styles.topRow}>
          <View style={styles.labelContainer}>
            <Ionicons name="wallet-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.label}>Available Credits</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        <Text style={styles.amount}>24,500</Text>
        <Text style={styles.subAmount}>≈ ₵245.00</Text>

        <View style={styles.bottomRow}>
          <View style={styles.expiryContainer}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.expiryText}>Expires in 28 days</Text>
          </View>

          <TouchableOpacity style={styles.topUpButton} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={18} color="#667eea" />
            <Text style={styles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>75% remaining</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decorCircle3: {
    position: 'absolute',
    top: 40,
    right: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans',
    color: 'rgba(255,255,255,0.8)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSansSemiBold',
    color: 'white',
  },
  amount: {
    fontSize: 40,
    fontFamily: 'PlusJakartaSansBold',
    color: 'white',
    marginTop: 4,
  },
  subAmount: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expiryText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans',
    color: 'rgba(255,255,255,0.6)',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topUpText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSansBold',
    color: '#667eea',
  },
  progressContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans',
    color: 'rgba(255,255,255,0.7)',
  },
});

export default CreditsCard;
