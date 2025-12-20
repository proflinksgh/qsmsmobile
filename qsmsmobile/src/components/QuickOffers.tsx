import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QuickOffer = () => {
  const offers = [
    { 
      title: "STARTER", 
      price: "GH₵50", 
      units: "1,052 units", 
      badge: "starter",
      popular: false
    },
    { 
      title: "PREMIUM", 
      price: "GH₵120", 
      units: "3,000 units", 
      badge: "premium",
      popular: true
    },
    { 
      title: "ADVANCE", 
      price: "GH₵250", 
      units: "7,500 units", 
      badge: "advance",
      popular: false
    },
  ];

  const badgeStyles: Record<string, {
    iconBg: string;
    iconColor: string;
    gradientStart: string;
    gradientEnd: string;
    icon: string;
  }> = {
    starter: {
      iconBg: "#ECFDF5",
      iconColor: "#16A34A",
      gradientStart: "#16A34A",
      gradientEnd: "#059669",
      icon: "leaf",
    },
    premium: {
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
      gradientStart: "#F59E0B",
      gradientEnd: "#D97706",
      icon: "star",
    },
    advance: {
      iconBg: "#F0EEFF",
      iconColor: "#667eea",
      gradientStart: "#667eea",
      gradientEnd: "#764ba2",
      icon: "diamond",
    },
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Credit Packages</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* Offers List */}
      <View style={styles.offersList}>
        {offers.map((offer, index) => {
          const s = badgeStyles[offer.badge];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.offerCard,
                offer.popular && styles.offerCardPopular
              ]}
              activeOpacity={0.7}
            >
              {offer.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              )}
              
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: s.iconBg }]}>
                <Ionicons name={s.icon as any} size={20} color={s.iconColor} />
              </View>

              {/* Content */}
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerUnits}>{offer.units}</Text>
              </View>

              {/* Price & Action */}
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>{offer.price}</Text>
                <View style={[
                  styles.activateButton,
                  { backgroundColor: s.iconBg }
                ]}>
                  <Text style={[styles.activateText, { color: s.iconColor }]}>
                    Buy
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSansBold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSansSemiBold',
    color: '#667eea',
  },
  offersList: {
    gap: 12,
  },
  offerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  offerCardPopular: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#667eea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  popularText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSansBold',
    color: 'white',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSansBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  offerUnits: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans',
    color: '#6B7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSansBold',
    color: '#1F2937',
  },
  activateButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activateText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSansBold',
  },
});

export default QuickOffer;
