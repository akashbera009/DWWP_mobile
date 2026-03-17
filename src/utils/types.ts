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

    PaymentsIndexDashboard: undefined
    FullPaymantHistory: undefined
    AddonRechargesScreen: undefined
    IndividualPaymentHistory: undefined // be a transaction data 

    ViewProfileScreen: undefined;
    SettingsScreen: undefined;
    RaiseComplaintScreen: undefined;

    PaymentSuccessScreen: {
        payment_id: string,
        amount: number,
        qty: number,
        refill: number,
        addon: string,
    }
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