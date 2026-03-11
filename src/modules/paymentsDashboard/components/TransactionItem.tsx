import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { vh, vw } from '@dwwp/utils/dimensions';
import colors from '@dwwp/utils/colors';

export interface Transaction {
  id: string;
  date: string;
  type: 'addon' | 'regular';
  amount: number;
  qty: number;
  status: 'completed' | 'pending';
}

interface Props {
  item: Transaction;
  key?: string;
  index: number
}

const TransactionItem: React.FC<Props> = ({ item, index }) => {
  const [showActions, setShowActions] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        delay: index * 60,
        useNativeDriver: true,
        damping: 18,
        stiffness: 120,
      }),
    ]).start();
  }, []);
  return (
    <>
      {/* <View style={styles.container}> */}
      <Animated.View
        style={[
          styles.row,
          {
            opacity: opacityAnim,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Left Section */}
        <View style={styles.left}>
          <Text style={styles.txnId} numberOfLines={1}>{item.id}</Text>
          <Text style={styles.date} numberOfLines={1}>{item.date}</Text>
        </View>

        {/* Middle */}
        <View style={styles.middle}>
          <Text style={styles.type}>
            {item.type === 'addon' ? 'Addon' : 'Regular'}
          </Text>
          <Text style={styles.qty}>Qty: {item.qty}</Text>
        </View>

        {/* Right */}
        <View style={styles.right}>
          <Text style={styles.amount}>₹{item.amount}</Text>
          <Text
            style={[
              styles.status,
              item.status === 'completed'
                ? styles.completed
                : styles.pending,
            ]}
          >
            {item.status}
          </Text>
        </View>

        {/* 3-dot button */}
        <TouchableOpacity
          style={styles.moreBtn}
          hitSlop={{ right: 10, top: 10, left: 10, bottom: 10 }}
          onPress={() => setShowActions(true)}
        >
          <Text style={{ fontSize: 18 }}>⋮</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Modal */}
      <Modal
        transparent
        visible={showActions}
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionBox}>
            <TouchableOpacity style={styles.actionItem}>
              <Text>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <Text>Download Invoice</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(16),
    paddingVertical: vh(12),
    gap: vw(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flex: 1 },
  middle: { flex: 1 },
  right: { alignItems: 'flex-end' , justifyContent : 'center' },

  txnId: { fontWeight: '600' },
  date: { fontSize: 12, color: '#6B7280' },

  type: { fontSize: 13 },
  qty: { fontSize: 12, color: '#6B7280' },

  amount: { fontWeight: '700' },
  status: { fontSize: 12, marginTop: 2 },
  completed: { color: colors.success },
  pending: { color: colors.warning },

  moreBtn: {
    paddingHorizontal: vw(10),
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBox: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
  },
  actionItem: {
    padding: 14,
  },
});