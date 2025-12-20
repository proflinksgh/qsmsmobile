import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { HomeScreen } from '../../screens/app/home';
import EditProfileScreen from '../../screens/app/profile/EditProfileScreen';
import UserProfileScreen from '../../screens/app/profile/UserProfileScreen';

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
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  )
}

export default HomeNavigation
