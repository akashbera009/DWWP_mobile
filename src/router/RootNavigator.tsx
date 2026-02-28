import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//Import navigators
// import AuthNavigator from './AuthNavigator';
import { RootStackParamList } from '../utils/types';
//Custom Imports
import { screenNames } from '@dwwp/utils/screenNames';
import BottomTabNavigator from './BottomTabNavigator';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={screenNames.BottomTabNavigator}
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={screenNames.AuthNavigator}
        component={AuthNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};