import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeScreen from '../../tabs/home/HomeScreen';

const Stack = createStackNavigator();

const HomeNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      
    </Stack.Navigator>
  )
}

export default HomeNavigation