// import React, { useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Animated } from 'react-native';
// import colors from '@dwwp/utils/colors';
// import { normalize, vh, vw } from '@dwwp/utils/dimensions';
// import fonts from '@dwwp/utils/fonts';

// export interface Transaction {
//   id: string;
//   type: 'bill' | 'addon' | 'refund';
//   title: string;
//   subtitle: string;
//   amount: number;
//   date: string;
//   status: 'Completed' | 'pending' | 'failed';
// }

// interface Props {
//   item: Transaction;
//   index: number;
// }

// const TYPE_CONFIG = {
//   bill: { icon: '📋', color: colors.primary, bg: colors.primaryLight },
//   addon: { icon: '➕', color: colors.secondary, bg: 'rgba(123,104,238,0.1)' },
//   refund: { icon: '↩️', color: colors.success, bg: 'rgba(39,174,96,0.1)' },
// };

// const STATUS_CONFIG = {
//   Completed: { label: 'Completed', color: colors.success, bg: 'rgba(39,174,96,0.1)' },
//   pending: { label: 'Pending', color: colors.warning, bg: 'rgba(243,156,18,0.1)' },
//   failed: { label: 'Failed', color: colors.error, bg: 'rgba(231,76,60,0.1)' },
// };

// const TransactionItem: React.FC<Props> = ({ item, index }) => {
//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const opacityAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(opacityAnim, {
//         toValue: 1,
//         duration: 300,
//         delay: index * 60,
//         useNativeDriver: true,
//       }),
//       Animated.spring(slideAnim, {
//         toValue: 1,
//         delay: index * 60,
//         useNativeDriver: true,
//         damping: 18,
//         stiffness: 120,
//       }),
//     ]).start();
//   }, []);

//   const typeConf = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.bill;
//   const statusConf = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.Completed;
//   const isCredit = item.type === 'refund';

//   return (
//     <Animated.View
//       style={[
//         styles.row,
//         {
//           opacity: opacityAnim,
//           transform: [
//             {
//               translateX: slideAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [24, 0],
//               }),
//             },
//           ],
//         },
//       ]}
//     >
//       {/* Icon */}
//       <View style={[styles.iconBox, { backgroundColor: typeConf.bg }]}>
//         <Text style={styles.iconText}>{typeConf.icon}</Text>
//       </View>

//       {/* Info */}
//       <View style={styles.info}>
//         <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
//         <View style={styles.metaRow}>
//           <Text style={styles.date}>{item.date}</Text>
//           <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
//             <Text style={[styles.statusText, { color: statusConf.color }]}>{statusConf.label}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Amount */}
//       <Text style={[styles.amount, { color: isCredit ? colors.success : colors.neutralBlack }]}>
//         {isCredit ? '+' : '-'} ₹{Math.abs(item.amount)}
//       </Text>
//     </Animated.View>
//   );
// };

// export default TransactionItem;

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: vw(16),
//     paddingVertical: vh(12),
//     gap: vw(12),
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   iconBox: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexShrink: 0,
//   },
//   iconText: {
//     fontSize: 18,
//   },
//   info: {
//     flex: 1,
//     gap: 4,
//   },
//   title: {
//     fontFamily: fonts.Bold,
//     fontSize: normalize(13),
//     color: colors.neutralBlack,
//     letterSpacing: -0.1,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: vw(8),
//   },
//   date: {
//     fontFamily: fonts.Regular,
//     fontSize: normalize(11),
//     color: colors.neutralBodyText,
//   },
//   statusBadge: {
//     paddingHorizontal: vw(7),
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   statusText: {
//     fontFamily: fonts.Bold,
//     fontSize: normalize(10),
//   },
//   amount: {
//     fontFamily: fonts.Bold,
//     fontSize: normalize(14),
//     letterSpacing: -0.3,
//     flexShrink: 0,
//   },
// });