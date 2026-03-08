// import React from 'react';
// import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// import colors from '@dwwp/utils/colors';

// type LoadingPopupScreenProps = {
//     visible: boolean
//     message: string
// }
// const LoadingPopup = ({ visible, message }: LoadingPopupScreenProps) => {
//   return (
//     <Modal transparent animationType="fade" visible={visible}>
//       <View style={styles.overlay}>

//         <View style={styles.container}>

//           <ActivityIndicator
//             size="large"
//             color={colors.primary}
//           />

//           <Text style={styles.text}>
//             {message || "Please wait..."}
//           </Text>

//         </View>

//       </View>
//     </Modal>
//   );
// };

// export default LoadingPopup;

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: colors.transparentBackground,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   container: {
//     width: 200,
//     backgroundColor: colors.white,
//     padding: 25,
//     borderRadius: 14,
//     alignItems: 'center',
//   },

//   text: {
//     marginTop: 15,
//     fontSize: 15,
//     color: colors.neutralBodyText,
//   },
// });