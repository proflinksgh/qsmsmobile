import { NavigationProp, useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../../constants/theme";

import ProfileHeader from "@/src/components/ui/ProfileHeader";
import Section, { SectionItem } from "@/src/components/ui/Section";

const MoreScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // Define sections
  const sections = [
    {
      title: "EMAIL",
      items: [{ label: "Bulk Email", icon: "mail", screen: "BulkEmailScreen" }],
    },
    {
      title: "WHATSAPP",
      items: [{ label: "Bulk WhatsApp", icon: "logo-whatsapp", screen: "BulkWhatsappScreen" }],
    },
    {
      title: "GROUPS",
      items: [
        { label: "Contact Group", icon: "people", screen: "ContactGroupScreen" },
        { label: "Custom Group", icon: "albums", screen: "CustomGroupScreen" },
        { label: "Email Group", icon: "mail-open", screen: "EmailGroupScreen" },
      ],
    },
    {
      title: "TOOLS",
      items: [
        { label: "Shorten URL", icon: "link", screen: "ShortenUrlScreen" },
        { label: "SMS Report", icon: "document-text", screen: "SmsReportScreen" },
        { label: "Voice Report", icon: "mic", screen: "VoiceReportScreen" },
        { label: "Repeat List", icon: "repeat", screen: "RepeatListScreen" },
      ],
    },
    {
      title: "INTEGRATION",
      items: [
        { label: "API Integration", icon: "key", screen: "ApiIntegrationScreen" },
        { label: "Generate Key", icon: "key-outline", screen: "GenerateKeyScreen" },
        { label: "SMS API", icon: "paper-plane", screen: "SmsApiScreen" },
        { label: "Voice SMS API", icon: "mic-circle", screen: "VoiceSmsApiScreen" },
        { label: "OTP API", icon: "lock-closed", screen: "OtpApiScreen" },
      ],
    },
    {
      title: "MY PAYMENTS",
      items: [{ label: "All Payments", icon: "wallet", screen: "PaymentsScreen" }],
    },
    {
      title: "SETTINGS",
      items: [{ label: "All Settings", icon: "settings", screen: "SettingsScreen" }],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} stickyHeaderIndices={[0]}>
        <ProfileHeader name="Jhaygrand" referenceId="923842457438374" />

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {sections.map((section, idx) => {
            const items: SectionItem[] = section.items.map((item) => ({
              label: item.label,
              icon: item.icon,
              onPress: () => navigation.navigate(item.screen as never),
            }));

            return <Section key={idx} title={section.title} items={items} />;
          })}

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
