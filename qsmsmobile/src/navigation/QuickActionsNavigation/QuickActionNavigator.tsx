import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ApiScreen from '../../screens/quickactions/ApiScreen';
import EmailMarketingScreen from '../../screens/quickactions/EmailMarketingScreen';
import PosScreen from '../../screens/quickactions/PosScreen';
import UssdScreen from '../../screens/quickactions/UssdScreen';

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
