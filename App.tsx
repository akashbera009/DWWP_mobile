import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PortalProvider, PortalHost } from '@gorhom/portal';
// External Dependencies
// import store, { persister } from './src/store/oldindex';
import { navigationRef } from '@dwwp/utils/navigationService';
import { RootNavigator } from "@dwwp/router";
import { ToastContainer } from "@dwwp/components/ToastContainer";
import SafeAreaContainer from "@dwwp/components/SafeAreaContainer";

import notifee, { EventType } from '@notifee/react-native';
import { store } from "@dwwp/store";
import { persistor } from "@dwwp/store/index";
function App() {
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          break;
      }
    });
    return unsubscribe
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PortalProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                  console.log(' NavigationContainer is ready');
                }}
              >
                {/* <SafeAreaContainer> */}
                <RootNavigator />
                <ToastContainer />
                <PortalHost name="safe" />
                {/* </SafeAreaContainer> */}
              </NavigationContainer>
            </PersistGate>
          </Provider>
        </PortalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});