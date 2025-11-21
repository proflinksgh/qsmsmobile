import ProfileHeader from "@/src/components/ProfileHeader";
import Section from "@/src/components/Section";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../../constants/theme";

const MoreScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickyHeaderIndices={[0]} // makes the header sticky
      >
        {/* Sticky Header */}
        <ProfileHeader
          name="Jhaygrand"
          referenceId="923842457438374"
          avatar="https://randomuser.me/api/portraits/men/32.jpg"
        />

        {/* Sections */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Section title="EMAIL" items={[{ label: "Bulk Email", icon: "mail" }]} />
          <Section title="WHATSAPP" items={[{ label: "Bulk WhatsApp", icon: "logo-whatsapp" }]} />
          <Section
            title="GROUPS"
            items={[
              { label: "Contact Group", icon: "people" },
              { label: "Custom Group", icon: "albums" },
              { label: "Email Group", icon: "mail-open" },
            ]}
          />
          <Section
            title="TOOLS"
            items={[
              { label: "Shorten URL", icon: "link" },
              { label: "SMS Report", icon: "document-text" },
              { label: "Voice Report", icon: "mic" },
              { label: "Repeat List", icon: "repeat" },
            ]}
          />
          <Section
            title="INTEGRATION"
            items={[
              { label: "API Integration", icon: "key" },
              { label: "Generate Key", icon: "key-outline" },
              { label: "SMS API", icon: "paper-plane" },
              { label: "Voice SMS API", icon: "mic-circle" },
              { label: "OTP API", icon: "lock-closed" },
            ]}
          />
          <Section title="MY PAYMENTS" items={[{ label: "All Payments", icon: "wallet" }]} />
          <Section title="SETTINGS" items={[{ label: "All Settings", icon: "settings" }]} />

          {/* Sign Out Button */}
          <View style={{ marginTop: 20, marginBottom: 30 }}>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: "700" }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MoreScreen;
