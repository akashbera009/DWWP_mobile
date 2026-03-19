// navigation/MainStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';
import { MainStackParamList } from '@dwwp/utils/types';
import ViewProfileScreen from '@dwwp/modules/userProfile/ViewProfileScreen';
import SettingsScreen from '@dwwp/modules/userProfile/SettingsScreen';
import RaiseComplaintScreen from '@dwwp/modules/userProfile/RaiseComplaintScreen';
import PaymentsIndexDashboard from '@dwwp/modules/paymentsDashboard/PaymentsIndexDashboard';
import FullPaymantHistory from '@dwwp/modules/paymentsDashboard/screens/FullPaymantHistory';
import PaymentSuccessScreen from '@dwwp/modules/paymentsDashboard/screens/PaymentSuccessScreen';
import ViewPaymentDetailsScreen from '@dwwp/modules/paymentsDashboard/screens/ViewPaymentDetailsScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BottomTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="PaymentsIndexDashboard" component={PaymentsIndexDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="FullPaymantHistory" component={FullPaymantHistory} options={{ headerShown: false }} />

      <Stack.Screen name="ViewProfileScreen" component={ViewProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="RaiseComplaintScreen" component={RaiseComplaintScreen}   options={{ headerShown: false }}/>

      <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen}   options={{ headerShown: false }}/>
      <Stack.Screen name="ViewPaymentDetailsScreen" component={ViewPaymentDetailsScreen}   options={{ headerShown: false }}/>


    </Stack.Navigator>
  );
}