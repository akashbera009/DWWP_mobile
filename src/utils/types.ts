import { AddonRecord, PaymentRecord } from '@dwwp/modals';
import { NavigatorScreenParams } from '@react-navigation/native';

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

    ViewProfileScreen: undefined;
    EditProfileScreen: undefined
    SettingsScreen: undefined;
    RaiseComplaintScreen: undefined;
    AllNotifications:undefined ; 

    PaymentSuccessScreen: {
        payment_id: string,
        amount: number,
        qty?: number,
        refill?: number,
        type: string,
        usage?:string 
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
export interface payAddonBillType {
    amount: number,
    refill: number
    qty: number
    type: 'regular' | 'addon'
}
export interface payCurrentBillType {
    amount: number,
    usage: number,
    type: 'regular'
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
    refill?: number,
    usage?: number,
    qty?: number,
    type: 'regular' | 'addon'
}
export interface PaymentRecordNav extends PaymentRecord {
    type: 'payment'
}

export interface AddonRecordNav extends AddonRecord {
    type: 'addon'
}

export type TransactionForNav = PaymentRecordNav | AddonRecordNav
