import FloatingTopTabs from "@/src/components/FloatingTopTabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import ContactlessSms from "./ContactlessSms";
import DataSms from "./DataSms";
import NormalSms from "./NormalSms";
import PersonalisedSms from "./PersonalisedSms";
import TemplateCentre from "./TemplateCentre";

const Tab = createMaterialTopTabNavigator();

const BulkSmsScreen = () => {
  return (
    
    <Tab.Navigator
      screenOptions={{
        swipeEnabled: false,
        tabBarStyle: { height: 0 }, // hide default height space
      }}
      tabBar={(props) => <FloatingTopTabs {...props} />}
    >
      <Tab.Screen name="Normal SMS" component={NormalSms} />
      <Tab.Screen name="Personalised SMS" component={PersonalisedSms} />
      <Tab.Screen name="Contactless SMS" component={ContactlessSms} />
      <Tab.Screen name="Data SMS" component={DataSms} />
      <Tab.Screen name="Template Centre" component={TemplateCentre} />
    </Tab.Navigator>
  );
};

export default BulkSmsScreen;
