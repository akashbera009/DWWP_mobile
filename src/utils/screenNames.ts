// Desc: Screen names used in navigation
export const screenNames = {
    BottomTabNavigator: 'BottomTabNavigator',
    AuthNavigator : 'AuthNavigator',
    
    LoginScreen:'LoginScreen',
    
    AuthScreen: 'AuthScreen',
    DashBoard: 'DashBoard',
    ServoControl: 'ServoControl',
    PaymentDashBoard: 'PaymentDashBoard',
    Analytics: 'Analytics',

    SelectAddress : 'SelectAddress' 
} as const;

export type ScreenNames = keyof typeof screenNames;