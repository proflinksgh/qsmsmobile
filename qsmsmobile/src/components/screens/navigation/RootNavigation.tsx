import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { LoginContext } from '../../../../context/LoginContext';
import AppNavigation from './AppNavigation';
import AuthNavigation from './AuthNavigation';

const Stack = createStackNavigator();

const RootNavigation = () => {
  const { login } = useContext(LoginContext);

  return (
    <NavigationContainer>
      <Stack.Navigator  screenOptions={{ 
              headerShown: false, 
              ...TransitionPresets.SlideFromRightIOS, 
              gestureEnabled: true, 
              gestureDirection: 'horizontal'
               }}>
        {login ? (
          <Stack.Screen 
            name="TabNavigation"
            component={AppNavigation} 
          />
        ) : (
          <Stack.Screen
            name="AuthNavigation"
            component={AuthNavigation}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;