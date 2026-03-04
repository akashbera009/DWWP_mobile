import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//Import navigators
import { RootStackParamList } from '../utils/types';
//Custom Imports
import MainStackNavigator from './MainStack';
import AuthStackNavigator from './AuthStackNavigator';
import DWWPSplash from '@dwwp/modules/splashScreen/DWWPSplash';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false); // Replace with actual auth logic
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
           initialRouteName="SplashScreen"
      // initialRouteName={isAuthenticated ? 'MainStack' : 'AuthStack'}
    >
      <Stack.Screen name="SplashScreen">
        {props => (
          <DWWPSplash
            {...props}
            duration={2500}
            onDone={() => {
              if (isAuthenticated) {
                props.navigation.replace('MainStack');
              } else {
                props.navigation.replace('AuthStack');
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      <Stack.Screen name="MainStack" component={MainStackNavigator} />
    </Stack.Navigator>
  );
};