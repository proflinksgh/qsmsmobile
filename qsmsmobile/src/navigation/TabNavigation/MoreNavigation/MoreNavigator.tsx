import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import React from "react";
import ApiIntegrationScreen from "../../../screens/more/APIIntegration";
import BulkEmailScreen from "../../../screens/more/BulkEmailScreen";
import BulkWhatsappScreen from "../../../screens/more/BulkWhatsappScreen";
import ContactGroupScreen from "../../../screens/more/ContactGroupScreen";
import CustomGroupScreen from "../../../screens/more/CustomGroupScreen";
import EmailGroupScreen from "../../../screens/more/EmailGroupScreen";
import GenerateKeyScreen from "../../../screens/more/GenerateKey";
import OtpApiScreen from "../../../screens/more/OtpApiScreen";
import PaymentsScreen from "../../../screens/more/PaymentScreen";
import RepeatListScreen from "../../../screens/more/RepeatListScreen";
import SettingsScreen from "../../../screens/more/SettingScreen";
import ShortenUrlScreen from "../../../screens/more/ShortenUrlScreen";
import SmsApiScreen from "../../../screens/more/SmsApiScreen";
import SmsReportScreen from "../../../screens/more/SmsReportScreen";
import VoiceReportScreen from "../../../screens/more/VoiceReportScreen";
import VoiceSmsApiScreen from "../../../screens/more/VoiceSmsApiScreen";
import MoreScreen from "../More";



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
