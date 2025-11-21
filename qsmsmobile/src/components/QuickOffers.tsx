import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const QuickOffer = () => {
  const offers = [
    { title: "STARTER", price: "GH₵50", expiry: "No expiry", units: "1052 units", status: "Activate", badge: "starter" },
    { title: "PREMIUM", price: "GH₵120", expiry: "No expiry", units: "3000 units", status: "Activate", badge: "premium" },
    { title: "ADVANCE", price: "GH₵250", expiry: "No expiry", units: "12534 units", status: "Activate", badge: "advance" },
    { title: "VIP", price: "GH₵500", expiry: "No expiry", units: "647283 units", status: "Activate", badge: "vip" },
  ];

  const badgeStyles: any = {
    starter: {
      iconBg: "#ECFDF5",
      iconColor: "#16A34A",
      statusBg: "#DCFCE7",
      statusColor: "#16A34A",
      icon: "checkmark-circle",
    },
    premium: {
      iconBg: "#FFFBEB",
      iconColor: "#D97706",
      statusBg: "#FFEDD5",
      statusColor: "#D97706",
      icon: "pricetag",
    },
    advance: {
      iconBg: "#FEE2E2",
      iconColor: "#DC2626",
      statusBg: "#FECACA",
      statusColor: "#DC2626",
      icon: "bookmark",
    },
    vip: {
        iconBg: "#E0F2FF",       
        iconColor: "#0066CC",   
        statusBg: "#CCE5FF",     
        statusColor: "#0066CC", 
        icon: "gift",            
},

  };

  return (
    <View className="mt-6">

      {/* Header Row */}
      <View className="flex-row items-center justify-between px-1 mb-3">
        <Text className="text-lg font-semibold">Quick Offers</Text>
        <Text className="text-[#005CFF] text-sm font-medium">View all</Text>
      </View>

      {/* Offers List */}
      <View>
        {offers.map((offer, index) => {
          const s = badgeStyles[offer.badge];

          return (
            <View
              key={index}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between mb-3"
            >
              {/* Left Section */}
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: s.iconBg,
                  }}
                  className="items-center justify-center mr-3"
                >
                  <Ionicons name={s.icon as any} size={20} color={s.iconColor} />
                </View>

                <View>
                  <Text className="font-semibold text-sm">{offer.title}</Text>
                  <Text className="text-xs text-gray-500">
                    {offer.price} / {offer.expiry}
                  </Text>
                </View>
              </View>

              {/* Right Section */}
              <View className="items-end">
                <View
                  style={{
                    backgroundColor: s.statusBg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: s.statusColor }} className="text-xs font-medium">
                    {offer.status}
                  </Text>
                </View>

                <Text className="text-[10px] text-gray-500 mt-1">{offer.units}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default QuickOffer;
