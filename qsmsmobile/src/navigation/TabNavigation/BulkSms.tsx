import { BulkSmsScreen } from '@/src/screens/app/bulksms';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import React from 'react';

const Stack = createStackNavigator();


const BulkSms = () => {
  return (
       <Stack.Navigator
      screenOptions={{ 
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        
      }}
    >
      <Stack.Screen name="BulkSmsScreen" component={BulkSmsScreen} />
      
    </Stack.Navigator>
  )
}

export default BulkSms
