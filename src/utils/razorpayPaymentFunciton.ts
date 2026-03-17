import RazorpayCheckout, { CheckoutOptions } from 'react-native-razorpay';
import Config from 'react-native-config';
import colors from './colors';
import { strings } from './strings';
import { useAppSelector } from '@dwwp/store/hooks';

type requestPayloadType = {
    amount?: number,
    type?: string
}
export const useRazorpayPayment = () => {
    let userData = {
        name: '',
        monileNo: '',
        emailId: ''
    }
    const userDetailsRes = useAppSelector(s => s.dashboard.userDetails)
    if (userDetailsRes) {
        userData = {
            name: userDetailsRes?.fullName,
            monileNo: userDetailsRes?.mobileNo,
            emailId: userDetailsRes?.emailId
        }
    }
    const handlePayment = async (amount: number) => {
        try {
            const options = {
                key: `${Config.RAZORPAY_KEY}`,
                amount: Math.round(amount * 100),
                currency: 'INR',
                // order_id: `order_${Date.now()}`,
                description: strings.dwwp,
                name: strings.dwwp,
                image: 'https://github.com/akashbera009/DWWP_2.0/blob/main/DWWP%20LOGO.png?raw=true',
                prefill: {
                    name: userData?.name,
                    email: userData?.emailId,
                    contact: userData?.monileNo,
                    method: 'upi'
                },
                theme: {
                    color: colors.primary
                }
            };

            const data = await RazorpayCheckout.open(options as any);
            
            if (!data?.razorpay_payment_id) {
                return {
                    success: false,
                    payment_id: ''
                }
            }
            return {
                success: true,
                payment_id: data.razorpay_payment_id
            };

        } catch (error) {
            return { success: false, error: error };
        }
    };

    return { handlePayment };
};