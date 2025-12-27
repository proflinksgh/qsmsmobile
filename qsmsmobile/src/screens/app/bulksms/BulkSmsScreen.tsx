import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { Suspense, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

// Lazy load the SMS components to avoid navigation context issues during module initialization
const NormalSms = React.lazy(() => import("./NormalSms"));
const PersonalisedSms = React.lazy(() => import("./PersonalisedSms"));
const ContactlessSms = React.lazy(() => import("./ContactlessSms"));
const DataSms = React.lazy(() => import("./DataSms"));
const TemplateCategoryDropdown = React.lazy(() => import("./Templates/TemplateCategoryDropdown"));
const TemplateFormScreen = React.lazy(() => import("./Templates/TemplateFormScreens"));

const tabs = [
  { key: "normal", label: "Normal", icon: "chatbubble-outline" },
  { key: "personalised", label: "Personal", icon: "person-outline" },
  { key: "contactless", label: "Quick", icon: "flash-outline" },
  { key: "data", label: "Data", icon: "document-text-outline" },
];

const BulkSmsScreen = () => {
  const [activeTab, setActiveTab] = useState("normal");
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Top Row */}
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={styles.headerTop}
        >
          <View style={styles.headerIconContainer}>
            <Ionicons name="chatbubbles" size={22} color="white" />
          </View>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Bulk SMS</Text>
            <Text style={styles.headerSubtitle}>Send messages to multiple recipients</Text>
          </View>

          <TouchableOpacity 
            style={styles.templateButton}
            onPress={() => setShowTemplateDropdown(true)}
          >
            <Ionicons name="layers-outline" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Tab Bar */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.tabBar}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive
              ]}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.key ? '#667eea' : 'rgba(255,255,255,0.7)'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </LinearGradient>

      {/* Template Categories Dropdown */}
      <Suspense fallback={<View />}>
        <TemplateCategoryDropdown
          visible={showTemplateDropdown}
          onClose={() => setShowTemplateDropdown(false)}
          onSelect={(cat: string) => {
            setSelectedTemplate(cat);
            setActiveTab("template");
          }}
        />
      </Suspense>

      {/* Main Content */}
      <View style={styles.content}>
        <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>}>
          {activeTab === "normal" && <NormalSms />}
          {activeTab === "personalised" && <PersonalisedSms />}
          {activeTab === "contactless" && <ContactlessSms />}
          {activeTab === "data" && <DataSms />}
          {activeTab === "template" && selectedTemplate && (
            <TemplateFormScreen title={selectedTemplate} />
          )}
        </Suspense>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSansBold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  templateButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSansSemiBold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabTextActive: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
});

export default BulkSmsScreen;
