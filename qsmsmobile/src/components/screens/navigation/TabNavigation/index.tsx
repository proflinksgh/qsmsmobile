import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { COLORS } from '../../../../constants/theme';
import BulkSms from './BulkSms';
import HomeNavigation from './HomeNavigation';
import Profile from './Profile';
import VoiceSms from './VoiceSms';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BulkSmsTab') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === 'VoiceSmsTab') {
            iconName = focused ? 'call' : 'call-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightWhite,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeNavigation}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="BulkSmsTab" 
        component={BulkSms}
        options={{ title: 'Bulk SMS' }}
      />
      <Tab.Screen 
        name="VoiceSmsTab" 
        component={VoiceSms}
        options={{ title: 'Voice SMS' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={Profile}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;