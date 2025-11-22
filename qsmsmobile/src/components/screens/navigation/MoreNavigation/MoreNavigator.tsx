import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import React from "react";
import ApiIntegrationScreen from "../../MoreComponentScreen/APIIntegration";
import BulkEmailScreen from "../../MoreComponentScreen/BulkEmailScreen";
import BulkWhatsappScreen from "../../MoreComponentScreen/BulkWhatsappScreen";
import ContactGroupScreen from "../../MoreComponentScreen/ContactGroupScreen";
import CustomGroupScreen from "../../MoreComponentScreen/CustomGroupScreen";
import EmailGroupScreen from "../../MoreComponentScreen/EmailGroupScreen";
import GenerateKeyScreen from "../../MoreComponentScreen/GenerateKey";
import OtpApiScreen from "../../MoreComponentScreen/OtpApiScreen";
import PaymentsScreen from "../../MoreComponentScreen/PaymentScreen";
import RepeatListScreen from "../../MoreComponentScreen/RepeatListScreen";
import SettingsScreen from "../../MoreComponentScreen/SettingScreen";
import ShortenUrlScreen from "../../MoreComponentScreen/ShortenUrlScreen";
import SmsApiScreen from "../../MoreComponentScreen/SmsApiScreen";
import SmsReportScreen from "../../MoreComponentScreen/SmsReportScreen";
import VoiceReportScreen from "../../MoreComponentScreen/VoiceReportScreen";
import VoiceSmsApiScreen from "../../MoreComponentScreen/VoiceSmsApiScreen";
import MoreScreen from "../TabNavigation/More";



const Stack = createStackNavigator();

const MoreStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="MoreScreen" component={MoreScreen} />
      <Stack.Screen name="BulkEmailScreen" component={BulkEmailScreen} />
      <Stack.Screen name="BulkWhatsappScreen" component={BulkWhatsappScreen} />
      <Stack.Screen name="ContactGroupScreen" component={ContactGroupScreen} />
      <Stack.Screen name="CustomGroupScreen" component={CustomGroupScreen} />
      <Stack.Screen name="EmailGroupScreen" component={EmailGroupScreen} />
      <Stack.Screen name="ShortenUrlScreen" component={ShortenUrlScreen} />
      <Stack.Screen name="SmsReportScreen" component={SmsReportScreen} />
      <Stack.Screen name="VoiceReportScreen" component={VoiceReportScreen} />
      <Stack.Screen name="RepeatListScreen" component={RepeatListScreen} />
      <Stack.Screen name="ApiIntegrationScreen" component={ApiIntegrationScreen} />
      <Stack.Screen name="GenerateKeyScreen" component={GenerateKeyScreen} />
      <Stack.Screen name="SmsApiScreen" component={SmsApiScreen} />
      <Stack.Screen name="VoiceSmsApiScreen" component={VoiceSmsApiScreen} />
      <Stack.Screen name="OtpApiScreen" component={OtpApiScreen} />
      <Stack.Screen name="PaymentsScreen" component={PaymentsScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MoreStackNavigator;
