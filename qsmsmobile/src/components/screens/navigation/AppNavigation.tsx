import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';

import QuickActionsNavigator from './QuickActionsNavigation/QuickActionNavigator';
import TabNavigation from './TabNavigation';

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
    </Stack.Navigator>
  )
}


export default AppNavigation
