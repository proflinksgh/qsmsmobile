import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';

import { LoginScreen, RegisterScreen, SplashScreen, WelcomeScreen } from '../screens/auth';
import AppNavigation from './AppNavigation';

const Stack = createStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false, 
        ...TransitionPresets.SlideFromRightIOS, 
        gestureEnabled: true, 
        gestureDirection: 'horizontal'
         }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={AppNavigation} />
    </Stack.Navigator>
  )
}

export default AuthNavigation
