import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//Import navigators
import { RootStackParamList } from '../utils/types';
//Custom Imports
import MainStackNavigator from './MainStack';
import AuthStackNavigator from './AuthStackNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false); // Replace with actual auth logic
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainStack" component={MainStackNavigator} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
};