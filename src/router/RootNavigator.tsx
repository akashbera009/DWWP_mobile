import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//Import navigators
import { RootStackParamList } from '../utils/types';
import { useAppSelector } from '@dwwp/store/hooks';
//Custom Imports
import MainStackNavigator from './MainStack';
import AuthStackNavigator from './AuthStackNavigator';
import DWWPSplash from '@dwwp/assets/DWWPSplash';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, error } = useAppSelector(state => state.auth)
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFinished(true);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  if (!splashFinished) {
    return <DWWPSplash duration={1300} />;
  }
  if (error) {
    console.error(error);
  }
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="MainStack" component={MainStackNavigator} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
};