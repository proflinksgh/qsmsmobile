import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';

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
    </Stack.Navigator>
  )
}

export default AppNavigation
