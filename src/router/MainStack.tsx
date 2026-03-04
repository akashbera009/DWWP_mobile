// navigation/MainStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import BottomTabNavigator from './BottomTabNavigator';
import { MainStackParamList } from '@dwwp/utils/types';
import ViewProfileScreen from '@dwwp/modules/userProfile/ViewProfileScreen';
import SettingsScreen from '@dwwp/modules/userProfile/SettingsScreen';
import RaiseComplaintScreen from '@dwwp/modules/userProfile/RaiseComplaintScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BottomTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ViewProfileScreen" component={ViewProfileScreen}  options={{headerShown: false}}/>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="RaiseComplaintScreen" component={RaiseComplaintScreen} />
    </Stack.Navigator>
  );
}