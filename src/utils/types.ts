import { AddonRecord, PaymentRecord } from '@dwwp/modals';
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
    };
    ViewPaymentDetailsScreen: {
        transaction: TransactionForNav
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


// paymenst 
export interface payCurrentBillType {
    amount: number,
    refill: number
    qty: number
}
export type billObjectType = {
    amount: string,
    usage: number,
    dueDate: number,
    isPaid: boolean
}
export interface successPayload {
    payment_id: string,
    amount: number,
    refill: number,
    qty: number,
    addon?: 'regular' | 'addon'
}
export interface PaymentRecordNav extends PaymentRecord {
    type: 'payment'
}

export interface AddonRecordNav extends AddonRecord {
    type: 'addon'
}

export type TransactionForNav = PaymentRecordNav | AddonRecordNav
