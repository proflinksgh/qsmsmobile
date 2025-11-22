import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ApiScreen from '../../QuickActionScreen/ApiScreen';
import EmailMarketingScreen from '../../QuickActionScreen/EmailMarketingScreen';
import PosScreen from '../../QuickActionScreen/PosScreen';
import UssdScreen from '../../QuickActionScreen/UssdScreen';

const Stack = createStackNavigator();

const QuickActionsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UssdScreen" component={UssdScreen} />
      <Stack.Screen name="ApiScreen" component={ApiScreen} />
      <Stack.Screen name="EmailMarketingScreen" component={EmailMarketingScreen} />
      <Stack.Screen name="PosScreen" component={PosScreen} />
    </Stack.Navigator>
  );
};

export default QuickActionsNavigator;
