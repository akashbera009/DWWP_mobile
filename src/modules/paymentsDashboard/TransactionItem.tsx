import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Transaction } from './transactionData';

interface Props {
  item: Transaction;
}

const TransactionItem: React.FC<Props> = ({ item }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <View style={styles.container}>
        {/* Left Section */}
        <View style={styles.left}>
          <Text style={styles.txnId}>{item.id}</Text>
          <Text style={styles.date}>{item.date}</Text>
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
          onPress={() => setShowActions(true)}
        >
          <Text style={{ fontSize: 18 }}>⋮</Text>
        </TouchableOpacity>
      </View>

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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  left: { flex: 1 },
  middle: { flex: 1 },
  right: { alignItems: 'flex-end' },

  txnId: { fontWeight: '600' },
  date: { fontSize: 12, color: '#6B7280' },

  type: { fontSize: 13 },
  qty: { fontSize: 12, color: '#6B7280' },

  amount: { fontWeight: '700' },
  status: { fontSize: 12, marginTop: 2 },
  completed: { color: '#10B981' },
  pending: { color: '#F59E0B' },

  moreBtn: {
    paddingHorizontal: 10,
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