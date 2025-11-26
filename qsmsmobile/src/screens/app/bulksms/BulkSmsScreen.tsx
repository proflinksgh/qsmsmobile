import FloatingTopTabs from "@/src/components/FloatingTopTabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import ContactlessSms from "./ContactlessSms";
import DataSms from "./DataSms";
import NormalSms from "./NormalSms";
import PersonalisedSms from "./PersonalisedSms";

const Tab = createMaterialTopTabNavigator();

const BulkSmsScreen = () => {
 

  return (
    <Tab.Navigator 
      tabBar={(props) => (
        <FloatingTopTabs 
          {...props} 
          activeColor="#FF6B35"
          inactiveColor="#666"
          backgroundColor="rgba(255,255,255,0.9)"
          paddingHorizontal={20}
          paddingTop={12}
         
        />
      )}
    >
      <Tab.Screen name="Normal SMS" component={NormalSms} />
      <Tab.Screen name="Personalised SMS" component={PersonalisedSms} />
      <Tab.Screen name="Contactless SMS" component={ContactlessSms} />
      <Tab.Screen name="Data SMS" component={DataSms} />
    </Tab.Navigator>
  );
};

export default BulkSmsScreen;