// import RazorpayCheckout from 'react-native-razorpay';
// import Config from 'react-native-config'; 

// export const useRazorpayPayment = () => {
//     const Colors = useThemeColors();
//     const Strings = useStrings();
//     const handlePayment = async (amount: number) => {
//         try {
//             const options = {
//                 description: Strings.KFC_restaurant,
//                 image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWp9hoNV1qp1p83g-DwIQA7dU-XzIeelAHwg&s',
//                 currency: 'INR',
//                 key: `${Config.RARORPAY_KEY}`,
//                 amount: String(Math.round(amount * 100)),
//                 name: Strings.KFC,
//                 prefill: {
//                     email: DeliveryDetails?.email,
//                     contact: DeliveryDetails?.mobileNumber,
//                     name: DeliveryDetails?.personName
//                 },
//                 method: {
//                     card: false
//                 },
//                 theme: { color: Colors.KFC_red }
//             };

//             const data = await RazorpayCheckout.open(options);
//             return { success: true, payment_id: data.razorpay_payment_id };

//         } catch (error) {
//             return { success: false, error: error };
//         }
//     };

//     return { handlePayment };
// };