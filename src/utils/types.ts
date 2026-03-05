import { NavigatorScreenParams } from '@react-navigation/native';

// export type RootStackParamList = {
//     BottomTabNavigator: undefined;

//     // Global screens (outside tabs)
//     LoginScreen: undefined;
//     ViewProfileScreen: undefined;

// };

// export type BottomTabParamList = {
//     DashBoard: undefined;
//     ServoControl: undefined;
//     PaymentDashBoard: undefined;
//     Analytics: undefined;
//     Profile: undefined
// };


export type AuthStackParamList = {
    LoginScreen: undefined;
    SignUpScreen: undefined;
};
export type BottomTabParamList = {
    DashBoard: undefined;
    PaymentDashBoard: undefined;
    AnalyticsPage: undefined;
};

export type MainStackParamList = {
    BottomTabs: NavigatorScreenParams<BottomTabParamList>;

    ViewProfileScreen: undefined;
    SettingsScreen: undefined;
    RaiseComplaintScreen: undefined;
};
export type RootStackParamList = {
    SplashScreen: undefined;
    AuthStack: NavigatorScreenParams<AuthStackParamList>;
    MainStack: NavigatorScreenParams<MainStackParamList>;
};


export type StoredUser = {
    uid: string;
    email: string;
};