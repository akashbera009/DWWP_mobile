// navigation/MainStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import BottomTabNavigator from './BottomTabNavigator';
import { MainStackParamList } from '@dwwp/utils/types';
import ViewProfileScreen from '@dwwp/modules/userProfile/ViewProfileScreen';
import SettingsScreen from '@dwwp/modules/userProfile/SettingsScreen';
import RaiseComplaintScreen from '@dwwp/modules/userProfile/RaiseComplaintScreen';
import PaymentsIndexDashboard from '@dwwp/modules/paymentsDashboard/PaymentsIndexDashboard';
import IndividualPaymentHistory from '@dwwp/modules/paymentsDashboard/screens/IndividualPaymentHistory';
import FullPaymantHistory from '@dwwp/modules/paymentsDashboard/screens/FullPaymantHistory';
import AddonRechargesScreen from '@dwwp/modules/paymentsDashboard/screens/AddonRechargesScreen';
import ConfirmationPayMpdal from '@dwwp/modules/paymentsDashboard/components/ConfirmationPayMpdal';

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
      <Stack.Screen name="AddonRechargesScreen" component={AddonRechargesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IndividualPaymentHistory" component={IndividualPaymentHistory} options={{ headerShown: false }} />

      <Stack.Screen name="ViewProfileScreen" component={ViewProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="RaiseComplaintScreen" component={RaiseComplaintScreen}   options={{ headerShown: false }}/>


    </Stack.Navigator>
  );
}