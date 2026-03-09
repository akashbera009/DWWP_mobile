import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { TRANSACTIONS } from '../mocks/transactionData';
import TransactionItem from './TransactionItem';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import colors from '@dwwp/utils/colors';
import fonts from '@dwwp/utils/fonts';
import { strings } from '@dwwp/utils/strings';
import { localImages } from '@dwwp/utils/localimages';
import { screenNames } from '@dwwp/utils/screenNames';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@dwwp/utils/types';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
type TransactionHistoryScreenProps = {
  scrollToBottom: () => void
}
type MainStackNavigation = NativeStackNavigationProp<MainStackParamList>;
const TransactionHistory = ({ scrollToBottom }: TransactionHistoryScreenProps) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
 
  const mainStackNavigation = useNavigation<MainStackNavigation>()
  const toggle = () => {
    if(!expanded){
      scrollToBottom()
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
    Animated.spring(rotateAnim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
      damping: 14,
      stiffness: 120,
    }).start();
  };

  const arrowRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleViewAllPress = () => {
    mainStackNavigation.navigate(screenNames.FullPaymantHistory)
  }

  const isTransactionLoading = false
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>{strings.TransactionHistory}</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconBox}>
              <Image source={localImages.bill}
                style={styles.Billlogo} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Transactions</Text>
              <Text style={styles.headerSub}>This month • {TRANSACTIONS.length} records</Text>
            </View>
          </View>
          <Animated.View style={[styles.chevron, { transform: [{ rotate: arrowRotate }] }]}>
            <Image source={localImages.angle}
              style={styles.angle} />
          </Animated.View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.listContainer}>
            <View style={styles.divider} />
            {!isTransactionLoading ?
              <>
                {TRANSACTIONS.slice(0, 3).map((txn, index) => (
                  <TransactionItem index={index} key={txn.id} item={txn as any} />
                ))}
              </>
              :
              <ActivityIndicator
                color={colors.primary}
                size={'large'}
              />
            }
          </View>
        )}
        {!isTransactionLoading &&
          <TouchableOpacity
            onPress={handleViewAllPress}
            style={styles.viewAllContainer}>
            <Text style={styles.viewAll}>{strings.viewFullHistory}</Text>
            <Image source={localImages.back} style={styles.backArrow} />
          </TouchableOpacity>
        }
      </View>
    </View>
  );
};

export default TransactionHistory;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: vw(16),
    marginTop: vh(16),
    marginBottom: vh(16)
  },
  sectionLabel: {
    fontFamily: fonts.Bold,
    fontSize: normalize(16),
    color: colors.primary,
    marginBottom: vh(10),
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: vw(16),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(12),
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  angle: {
    height: vh(16),
    width: vh(16),
    tintColor: colors.black,
    transform: [{ rotate: '90deg' }]
  },
  Billlogo: {
    height: vh(26),
    width: vh(26),
    tintColor: colors.primary
  },
  headerIconText: {
    fontSize: 20,
  },
  headerTitle: {
    fontFamily: fonts.Bold,
    fontSize: normalize(15),
    color: colors.neutralBlack,
    letterSpacing: -0.2,
  },
  headerSub: {
    fontFamily: fonts.Regular,
    fontSize: normalize(11),
    color: colors.neutralBodyText,
    marginTop: 2,
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 18,
    color: colors.neutralBodyText,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: vw(16),
  },
  listContainer: {
    paddingBottom: vh(8),
  },
  viewAllContainer: {
    marginHorizontal: vw(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: normalize(2),
    borderTopColor: colors.border,
    paddingVertical: vh(8)
  },
  viewAll: {
    color: colors.primary,
    fontSize: normalize(14),
    fontFamily: fonts.Medium
  },
  backArrow: {
    height: vh(10),
    width: vh(16),
    marginHorizontal: vw(8),
    tintColor: colors.primary,
    transform: [{ rotate: '180deg' }]
  }
});