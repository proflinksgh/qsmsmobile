import React, { useState } from "react";
import { View } from "react-native";

import FloatingTopTabsBulk from "@/src/components/FloatingTopTabs";
import ContactlessSms from "./ContactlessSms";
import DataSms from "./DataSms";
import NormalSms from "./NormalSms";
import PersonalisedSms from "./PersonalisedSms";
import TemplateCategoryDropdown from "./Templates/TemplateCategoryDropdown";
import TemplateFormScreen from "./Templates/TemplateFormScreens";

const BulkSmsScreen = () => {
  const [activeTab, setActiveTab] = useState("normal");

  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-white">
      <FloatingTopTabsBulk
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTemplate={() => setShowTemplateDropdown(true)}
      />

      {/* Template Categories Dropdown */}
      <TemplateCategoryDropdown
        visible={showTemplateDropdown}
        onClose={() => setShowTemplateDropdown(false)}
        onSelect={(cat: string) => {
          setSelectedTemplate(cat);
          setActiveTab("template");
        }}
      />

      {/* MAIN CONTENT */}
      {activeTab === "normal" && <NormalSms />}
      {activeTab === "personalised" && <PersonalisedSms />}
      {activeTab === "contactless" && <ContactlessSms />}
      {activeTab === "data" && <DataSms />}

      {activeTab === "template" && selectedTemplate && (
        <TemplateFormScreen title={selectedTemplate} />
      )}
    </View>
  );
};

export default BulkSmsScreen;
