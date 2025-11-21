import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const RecentActivity = () => {
  const items = [
    { title: "Holiday Promo", time: "Today, 10:23 AM", status: "Sent", badge: "green", meta: "450/450" },
    { title: "Weekly Update", time: "Scheduled: 2:00 PM", status: "Pending", badge: "amber", meta: "0/1200" },
    { title: "Flash Sale Alert", time: "Yesterday, 4:15 PM", status: "Failed", badge: "red", meta: "23 errors" },
  ];

  const badgeStyles: any = {
    green: {
      iconBg: "#ECFDF5",
      iconColor: "#16A34A",
      statusBg: "#DCFCE7",
      statusColor: "#16A34A",
      icon: "check-circle",
    },
    amber: {
      iconBg: "#FFFBEB",
      iconColor: "#D97706",
      statusBg: "#FFEDD5",
      statusColor: "#D97706",
      icon: "schedule",
    },
    red: {
      iconBg: "#FEE2E2",
      iconColor: "#DC2626",
      statusBg: "#FECACA",
      statusColor: "#DC2626",
      icon: "error",
    },
  };

  return (
    <View className="mt-6 space-y-3">

      {/* Header Row */}
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-lg font-semibold">Recent Activity</Text>
        <Text className="text-[#005CFF] text-sm font-medium">View all</Text>
      </View>

      {/* Activity List */}
      <View className="space-y-3">
        {items.map((item, index) => {
          const s = badgeStyles[item.badge];

          return (
            <View
              key={index}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between"
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
                  <MaterialIcons name={s.icon} size={20} color={s.iconColor} />
                </View>

                <View>
                  <Text className="font-semibold text-sm">{item.title}</Text>
                  <Text className="text-xs text-gray-500">{item.time}</Text>
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
                    {item.status}
                  </Text>
                </View>

                <Text className="text-[10px] text-gray-500 mt-1">{item.meta}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default RecentActivity;
