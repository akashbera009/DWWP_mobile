// Desc: Screen names used in navigation
export const screenNames = {
    MainStack: 'MainStack',
    AuthStack: 'AuthStack',
    BottomTabNavigator: 'BottomTabNavigator',
    AuthNavigator : 'AuthNavigator',
    
    LoginScreen:'LoginScreen',
    SignUpScreen:'SignUpScreen',
    
    AuthScreen: 'AuthScreen',
    DashBoard: 'DashBoard',
    ServoControl: 'ServoControl',
    PaymentDashBoard: 'PaymentDashBoard',
    AnalyticsPage: 'AnalyticsPage',

    ViewProfileScreen:'ViewProfileScreen',
    SelectAddress : 'SelectAddress',
    RaiseComplaintScreen : 'RaiseComplaintScreen',

    FullPaymantHistory : 'FullPaymantHistory',
    AddonRechargesScreen : 'AddonRechargesScreen',
    PaymentSuccessScreen : 'PaymentSuccessScreen',
    ViewPaymentDetailsScreen:'ViewPaymentDetailsScreen',
} as const;

export type ScreenNames = keyof typeof screenNames;