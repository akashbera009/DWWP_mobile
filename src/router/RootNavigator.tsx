import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//Import navigators
import { RootStackParamList } from '../utils/types';
//Custom Imports
import MainStackNavigator from './MainStack';
import AuthStackNavigator from './AuthStackNavigator';
import DWWPSplash from '@dwwp/modules/splashScreen/DWWPSplash';
import mmkvStorage from '@dwwp/utils/mmkvStorage';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  // user = 'ab@gmail.com' , 123456
  // useEffect(() => {
  //   const checkUser = async () => {
  //     const userEmail = await mmkvStorage.getItem("USER_EMAIL");

  //     console.log("root navigator user email:", userEmail);

  //     if (userEmail !== null) {
  //       setIsAuthenticated(true);
  //     } else {
  //       setIsAuthenticated(false);
  //     }
  //   };

  //   checkUser();
  // }, []);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authCheck = (async () => {
        const userEmail = await mmkvStorage.getItem("USER_EMAIL");
        console.log("root navigator user email:", userEmail);

        return userEmail !== null;
      })();

      const splashDelay = new Promise<boolean>(resolve =>
        setTimeout(() => resolve(true), 2500)
      );

      const [isUserAuthenticated] = await Promise.all([authCheck, splashDelay]);

      setIsAuthenticated(isUserAuthenticated);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <DWWPSplash duration={2500} />;
  }
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    // initialRouteName={isAuthenticated ? 'MainStack' : 'AuthStack'}
    >
      {/* <Stack.Screen name="SplashScreen">
        {props => (
          <DWWPSplash
            {...props}
            duration={2500}
            onDone={() => {
              if (isAuthenticated === null) return;
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
      <Stack.Screen name="MainStack" component={MainStackNavigator} />*/}
      {isAuthenticated ? (
        <Stack.Screen name="MainStack" component={MainStackNavigator} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
};