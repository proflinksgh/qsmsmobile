import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';

import QuickActionsNavigator from './QuickActionsNavigation/QuickActionNavigator';
import TabNavigation from './TabNavigation';
import MoreStackNavigator from './TabNavigation/MoreNavigation/MoreNavigator';

const Stack = createStackNavigator();

const AppNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false, 
        ...TransitionPresets.SlideFromRightIOS, 
        gestureEnabled: true, 
        gestureDirection: 'horizontal'
         }}>
      <Stack.Screen name="index" component={TabNavigation} />
      
      <Stack.Screen
        name="QuickActions"
        component={QuickActionsNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="MoreTab" component={MoreStackNavigator} />
    </Stack.Navigator>
  )
}


export default AppNavigation
