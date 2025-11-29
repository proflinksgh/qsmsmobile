import FloatingTopTabs from "@/src/components/FloatingTopTabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import TemplateList from "./Templates/Templates";

const Tab = createMaterialTopTabNavigator();

const templateScreens = [
  "All",
  "Festive Greetings",
  "Promotion",
  "Transaction",
  "Customer Service",
  "Birthday",
  "Reminders",
  "Feedback & Survey",
];

const TemplateCentre = () => {
  return (
        <Tab.Navigator tabBar={(props) => <FloatingTopTabs {...props} />}>
            {templateScreens.map((name) => (
                <Tab.Screen
                key={name}
                name={name}
                component={TemplateList}
                initialParams={{ category: name }}
                />
            ))}
    </Tab.Navigator>

  );
};

export default TemplateCentre;
