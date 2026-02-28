import React from 'react';
import { StyleSheet, Text, View, Platform, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// custom imports
import { BottomTabParamList } from '@dwwp/utils/types';
import { localImages } from '@dwwp/utils/localimages';
import colors from '@dwwp/utils/colors';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import fonts from '@dwwp/utils/fonts';

import DashBoardPage from '@dwwp/modules/dashboard/DashBoardPage';
import ServoControlPage from '@dwwp/modules/servoControl/ServoCOntrolPage';
import PasymentsDashboard from '@dwwp/modules/paymentsDashboard/PaymentsDashboard';
import Analytics from '@dwwp/modules/analytics/Analytics';
import { screenNames } from '@dwwp/utils/screenNames';

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
      case 'Servo':
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
      case 'Profile':
        return (
          <Image
            source={
              focused ? localImages.profileTabSelected : localImages.profileTab
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
      <View
        style={[
          styles.dot,
          { backgroundColor: focused ? colors.primary : colors.white },
        ]}
      />
    </View>
  );
};

// Extract TabBarBackground component
const TabBarBackground = () => (
  <View style={styles.tabBarWrapper}>
    <View style={styles.tabBarBackground1} />
  </View>
);

// Home tab icon component
const HomeTabIcon = (props: TabIconProps) => (
  <TabIcon {...props} routeName="Home" />
);

// Home tab icon component
const OrdersTabIcon = (props: TabIconProps) => (
  <TabIcon {...props} routeName="Orders" />
);

// Profile tab icon component
const AccountTabIcon = (props: TabIconProps) => (
  <TabIcon {...props} routeName="Profile" />
);

const BottomTabNavigator = () => {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.primaryBlack,
        // tabBarStyle: hideBottomTab(route)
        //   ? [styles.tabBar]
        //   : { display: 'none' },
        headerShown: false,
        tabBarShowLabel: false,
        // tabBarHideOnKeyboard: true,
        tabBarBackground: TabBarBackground,
      })}
    >
      <Tab.Screen
        name={screenNames.DashBoard}
        component={DashBoardPage}
        options={{
          tabBarIcon: HomeTabIcon,
        }}
      />
      {/* <Tab.Screen
        name={screenNames.ServoControl}
        component={ServoControlPage}
        options={{
          tabBarIcon: OrdersTabIcon,
        }}
      /> */}
      <Tab.Screen
        name={screenNames.PaymentDashBoard}
        component={PasymentsDashboard}
        options={{
          tabBarIcon: AccountTabIcon,
        }}
      />
      <Tab.Screen
        name={screenNames.Analytics}
        component={Analytics}
        options={{
          tabBarIcon: AccountTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? vh(84) : vh(69),
    borderTopWidth: 0,
    elevation: 10, // Android shadow
    backgroundColor: colors.white,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Platform.OS === 'ios' ? vh(19) : vh(14),
    paddingBottom: vh(0),
    shadowColor: colors.black, // iOS shadow
    shadowOffset: { width: 2, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },

  tabBarWrapper: {
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? vh(84) : vh(69),
  },

  tabBarBackground1: {
    backgroundColor: colors.white,
    flex: 1,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    height: '100%',
  },
  tabBarLabel: {
    fontSize: normalize(11),
    marginTop: vh(3),
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
    paddingTop: vh(5),
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
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
  },
});

export default BottomTabNavigator;