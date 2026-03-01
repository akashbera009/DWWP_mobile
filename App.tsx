import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PortalProvider, PortalHost } from '@gorhom/portal';
// External Dependencies
import store, { persister } from './src/store';
import { navigationRef } from '@dwwp/utils/navigationService';
import { RootNavigator } from "@dwwp/router";
import { ToastContainer } from "@dwwp/components/ToastContainer";
import SafeAreaContainer from "@dwwp/components/SafeAreaContainer";
function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PortalProvider>
          {/* <Provider store={store}> */}
          {/* <PersistGate loading={null} persistor={persister}> */}
          <NavigationContainer
            ref={navigationRef}
            // linking={deepLinkConfig}
            onReady={() => {
              console.log(' NavigationContainer is ready');
            }}
          >
            <SafeAreaContainer>
              <RootNavigator />
              <ToastContainer />
              <PortalHost name="safe" />
            </SafeAreaContainer>
          </NavigationContainer>
          {/* </PersistGate> */}
          {/* </Provider> */}
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