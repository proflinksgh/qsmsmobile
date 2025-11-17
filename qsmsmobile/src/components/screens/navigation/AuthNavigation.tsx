import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React from 'react';

import LoginScreen from '../auth/LoginScreen';
import RegisterScreen from '../auth/RegisterScreen';
import SplashScreen from '../auth/SplashScreen';
import WelcomeScreen from '../auth/WelcomeScreen';
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