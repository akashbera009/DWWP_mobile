import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// custom imports
import { BottomTabParamList } from '@dwwp/utils/types';
import { localImages } from '@dwwp/utils/localimages';
import colors from '@dwwp/utils/colors';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import fonts from '@dwwp/utils/fonts';
import { screenNames } from '@dwwp/utils/screenNames';

import AnalyticsPage from '@dwwp/modules/analytics/screens/AnalyticsPage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashIndexScreen from '@dwwp/modules/dashboard/screens/DashIndexScreen';
import PaymentsDashboard from '@dwwp/modules/paymentsDashboard/PaymentsIndexDashboard';

// Tab Navigator
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Define props type for icon components
interface TabIconProps {
  size?: number;
  focused?: boolean;
  routeName?: string;
}

const TabIcon = ({ routeName, focused }: TabIconProps) => {
  const getIcon = () => {
    switch (routeName) {
      case 'Home':
        return (
          <Image
            source={focused ? localImages.homeTabSelected : localImages.homeTab}
            style={[styles.iconImage]}
          />
        );
      case 'Payment':
        return (
          <View style={styles.iconContainer}>
            <Image
              source={
                focused ? localImages.orderTabSelected : localImages.orderTab
              }
              style={[styles.iconImage]}
            />
          </View>
        );
      case 'Analytics':
        return (
          <Image
            source={
              focused ? localImages.analytics_fill : localImages.analytics_blank
            }
            style={[styles.iconImage]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.iconWrapper}>
      {getIcon()}
      <Text
        style={[
          styles.tabBarLabel,
          focused ? styles.activeLabel : styles.inactiveLabel,
        ]}
      >
        {routeName}
      </Text>
      {/* <View
        style={[
          styles.dot,
          { backgroundColor: focused ? colors.primary : colors.white },
        ]}
      /> */}
    </View>
  );
};

// Home tab icon component
const HomeTabIcon = (props: TabIconProps) => (
  <TabIcon {...props} routeName="Home" />
);
// PaymentTabIcon tab icon component
const PaymentTabIcon = (props: TabIconProps) => (
  <TabIcon {...props} routeName="Payment" />
);

// Profile tab icon component
const AccountTabIcon = (props: TabIconProps) => (
  <TabIcon {...props} routeName="Analytics" />
);

const BottomTabNavigator = () => {
  const { bottom } = useSafeAreaInsets()
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        animation: 'shift',
        tabBarStyle: {
          height: vh(55) + bottom,
          backgroundColor: colors.white,
          shadowColor: colors.black,
          shadowOpacity: 1,
          elevation: 10
        }
      }}
      // initialRouteName={screenNames.PaymentDashBoard}
    >
      <Tab.Screen
        name={screenNames.DashBoard}
        component={DashIndexScreen}
        options={{
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name={screenNames.PaymentDashBoard}
        component={PaymentsDashboard}
        options={{
          tabBarIcon: PaymentTabIcon,
        }}
      />
      <Tab.Screen
        name={screenNames.AnalyticsPage}
        component={AnalyticsPage}
        options={{
          tabBarIcon: AccountTabIcon,
        }}
      />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({

  tabBarLabel: {
    fontSize: normalize(11),
    marginTop: vh(1),
    textAlign: 'center',
    textTransform: 'capitalize',
    width: vw(120),
  },
  activeLabel: {
    fontFamily: fonts.Bold,
    color: colors.primary,
    fontSize: normalize(12),
  },
  inactiveLabel: {
    fontFamily: fonts.Regular,
    color: colors.primaryBlack,
    fontSize: normalize(11),
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vh(20),
    width: vw(25),
  },
  iconContainer: {
    position: 'relative',
  },
  iconImage: {
    width: normalize(24),
    height: normalize(24),
    resizeMode: 'contain',
  },
  dot: {
    paddingTop: vh(10),
    width: '100%',
    height: normalize(6),
    borderRadius: normalize(3),
  },
});

export default BottomTabNavigator;