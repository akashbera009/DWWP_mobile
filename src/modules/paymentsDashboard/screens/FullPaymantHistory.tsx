import React, { useRef, useState, useMemo, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Animated, Dimensions, TextInput, Image,
  TouchableOpacity, Modal, ScrollView,
} from 'react-native'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { useAppSelector } from '@dwwp/store/hooks'
import { PaymentRecord, AddonRecord } from '@dwwp/modals'
import { localImages } from '@dwwp/utils/localimages'
import colors from '@dwwp/utils/colors'
import { CustomHeader } from '@dwwp/components/CustomHeader'
import { AddonCard, PaymentCard } from '../components/AddonAndRechargeCardComponent'
import { Portal } from '@gorhom/portal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  primary: '#2B6568',
  primaryDark: '#1e4a4d',
  cyan: '#32C2CA',
  white: '#FFFFFF',
  black: '#041617',
  text: '#1A1A1A',
  textLight: '#6A7C92',
  border: '#E1E8ED',
  bg: '#F8FAFB',
  card: '#FFFFFF',
  divider: '#E8ECEF',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  overlay: 'rgba(0,0,0,0.5)',
  shadow: 'rgba(43,101,104,0.08)',
}

// ─── Type definitions ─────────────────────────────────────────────────────────
type TransactionWithType =
  | ({ type: 'payment' } & PaymentRecord)
  | ({ type: 'addon' } & AddonRecord)

interface FilterState {
  status: 'all' | 'completed' | 'pending'
  amount: 'all' | 'lt200' | '200to500' | 'gt500'
  search: string
}

const DEFAULT_FILTERS: FilterState = { status: 'all', amount: 'all', search: '' }

// ─── Helper functions ─────────────────────────────────────────────────────────

function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  try {
    return new Date(dateString)
  } catch {
    return null
  }
}

function getMonthKeyFromTransaction(tx: TransactionWithType): string | null {
  // Use forMonth for payments, parse addon_date for addons
  if (tx.type === 'payment') {
    return tx.forMonth || null
  } else {
    // For addons, extract month from addon_date timestamp
    const date = parseDate(tx.addon_date)
    if (!date) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }
}

function getAllTransactions(payments: PaymentRecord[], addons: AddonRecord[]): TransactionWithType[] {
  const combined: TransactionWithType[] = [
    ...(payments || []).map(p => ({ ...p, type: 'payment' as const })),
    ...(addons || []).map(a => ({ ...a, type: 'addon' as const })),
  ]
  // Sort by timestamp, most recent first
  return combined.sort((a, b) => {
    const dateA = parseDate(a.type === 'payment' ? a.timeStamp : a.addon_date)?.getTime() ?? 0
    const dateB = parseDate(b.type === 'payment' ? b.timeStamp : b.addon_date)?.getTime() ?? 0
    return dateB - dateA
  })
}

function getTransactionDate(tx: TransactionWithType): string | null {
  return tx.type === 'payment' ? tx.timeStamp : tx.addon_date
}

function getTransactionAmount(tx: TransactionWithType): number {
  return tx.amount ?? 0
}

function getTransactionStatus(tx: TransactionWithType): string {
  return tx.status ?? 'Completed'
}

function groupByMonth(txs: TransactionWithType[]): Record<string, TransactionWithType[]> {
  const grouped: Record<string, TransactionWithType[]> = {}
  txs.forEach(tx => {
    const monthKey = getMonthKeyFromTransaction(tx)
    if (monthKey) {
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(tx)
    }
  })
  // Already sorted by timestamp in getAllTransactions, so keep that order
  return grouped
}

function formatMonthDisplay(monthKey: string | null | undefined): string {
  if (!monthKey) return '—'
  try {
    const [y, m] = monthKey.split('-')
    if (!y || !m) return monthKey
    const date = new Date(parseInt(y), parseInt(m) - 1)
    return date.toLocaleDateString('en-IN', {
      month: 'long', year: 'numeric',
    })
  } catch {
    return monthKey
  }
}

function matchesFilter(tx: TransactionWithType, filters: FilterState): boolean {
  const amount = getTransactionAmount(tx)
  const status = getTransactionStatus(tx).toLowerCase()
  const date = getTransactionDate(tx)

  // Amount filter
  if (filters.amount !== 'all') {
    if (filters.amount === 'lt200' && amount >= 200) return false
    if (filters.amount === '200to500' && (amount < 200 || amount > 500)) return false
    if (filters.amount === 'gt500' && amount <= 500) return false
  }

  // Status filter
  if (filters.status !== 'all' && status !== filters.status) return false

  // Search filter (by date or amount)
  if (filters.search) {
    const query = filters.search.toLowerCase()
    const amountStr = amount.toString()
    const dateStr = date?.toLowerCase() || ''
    if (!amountStr.includes(query) && !dateStr.includes(query)) return false
  }

  return true
}

// ─── Transaction Item (renders PaymentCard or AddonCard) ──────────────────────
const TransactionItem: React.FC<{ item: TransactionWithType; index: number }> = ({ item, index }) => {
  return item.type === 'payment'
    ? <PaymentCard item={item} index={index} />
    : <AddonCard item={item} index={index} />
}

// ─── Month Separator ──────────────────────────────────────────────────────────
const MonthSeparator: React.FC<{ month: string }> = ({ month }) => (
  <View style={styles.monthSeparator}>
    <Text style={styles.monthLabel}>{formatMonthDisplay(month)}</Text>
  </View>
)

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ hasSearch: boolean }> = ({ hasSearch }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{hasSearch ? '🔍' : '📋'}</Text>
    <Text style={styles.emptyTitle}>{hasSearch ? 'No results' : 'No transactions yet'}</Text>
    <Text style={styles.emptySub}>
      {hasSearch ? 'Try adjusting your search or filters' : 'Your history will appear here'}
    </Text>
  </View>
)

// ─── Filter Panel (PhonePe style) ─────────────────────────────────────────────
const FilterPanel: React.FC<{
  visible: boolean
  filters: FilterState
  onFilterChange: (f: FilterState) => void
  onClose: () => void
}> = ({ visible, filters, onFilterChange, onClose }) => {
  const { bottom } = useSafeAreaInsets()
  return (
    <Modal visible={visible} animationType="slide" transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.filterOverlay}>
        <View style={styles.filterPanel}>
          {/* Header */}
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.filterClose}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            {/* Status section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'all' as const, label: 'All' },
                  { key: 'completed' as const, label: 'Completed' },
                  { key: 'pending' as const, label: 'Pending' },
                ].map(option => (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.filterOption,
                      filters.status === option.key && styles.filterOptionActive,
                    ]}
                    onPress={() =>
                      onFilterChange({ ...filters, status: option.key })
                    }
                  >
                    <View style={[
                      styles.filterCheckbox,
                      filters.status === option.key && styles.filterCheckboxActive,
                    ]}>
                      {filters.status === option.key && (
                        <Text style={styles.filterCheckmark}>✓</Text>
                      )}
                    </View>
                    <Text style={[
                      styles.filterOptionLabel,
                      filters.status === option.key && styles.filterOptionLabelActive,
                    ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Amount section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Amount</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'all' as const, label: 'Any Amount' },
                  { key: 'lt200' as const, label: 'Less than ₹200' },
                  { key: '200to500' as const, label: '₹200 - ₹500' },
                  { key: 'gt500' as const, label: 'More than ₹500' },
                ].map(option => (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.filterOption,
                      filters.amount === option.key && styles.filterOptionActive,
                    ]}
                    onPress={() =>
                      onFilterChange({ ...filters, amount: option.key })
                    }
                  >
                    <View style={[
                      styles.filterCheckbox,
                      filters.amount === option.key && styles.filterCheckboxActive,
                    ]}>
                      {filters.amount === option.key && (
                        <Text style={styles.filterCheckmark}>✓</Text>
                      )}
                    </View>
                    <Text style={[
                      styles.filterOptionLabel,
                      filters.amount === option.key && styles.filterOptionLabelActive,
                    ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.filterFooter, { marginBottom: bottom }]}>
            <Pressable
              style={styles.filterResetBtn}
              onPress={() => onFilterChange(DEFAULT_FILTERS)}
            >
              <Text style={styles.filterResetBtnText}>Reset</Text>
            </Pressable>
            <Pressable
              style={styles.filterApplyBtn}
              onPress={onClose}
            >
              <Text style={styles.filterApplyBtnText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SimplifiedPaymentHistory: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { paymentsHistory, addonsHistory } = useAppSelector(
    s => s.payment.transactionHistory
  ) as { paymentsHistory: PaymentRecord[]; addonsHistory: AddonRecord[] }

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  // All transactions sorted by date
  const allTransactions = useMemo(
    () => getAllTransactions(paymentsHistory || [], addonsHistory || []),
    [paymentsHistory, addonsHistory]
  )

  // Filtered transactions
  const filteredTransactions = useMemo(
    () => allTransactions.filter(tx => matchesFilter(tx, filters)),
    [allTransactions, filters]
  )

  // Group by month
  const groupedByMonth = useMemo(
    () => groupByMonth(filteredTransactions),
    [filteredTransactions]
  )

  const months = useMemo(
    () => Object.keys(groupedByMonth).sort().reverse(),
    [groupedByMonth]
  )

  // Flat list for rendering
  const flatData = useMemo(() => {
    const data: Array<{ id: string; type: 'month' | 'transaction'; data: string | TransactionWithType }> = []
    months.forEach(month => {
      data.push({ id: `month-${month}`, type: 'month', data: month })
      groupedByMonth[month].forEach((tx, idx) => {
        data.push({ id: `tx-${month}-${idx}`, type: 'transaction', data: tx })
      })
    })
    return data
  }, [months, groupedByMonth])

  const handleSearchChange = useCallback((text: string) => {
    setFilters(prev => ({ ...prev, search: text }))
  }, [])

  const hasActiveFilters = filters.status !== 'all' || filters.amount !== 'all'

  return (
    <View style={styles.screen}>
      <CustomHeader
        screenName="Transaction History"
        subTitle="All payments and recharges"
      />

      {/* Search bar with filter button */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Image source={localImages.search} style={styles.filter} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={C.textLight}
            value={filters.search}
            onChangeText={handleSearchChange}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Image source={localImages.filter} style={styles.filter} />
          {hasActiveFilters && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Filter Panel Modal */}
      <Portal hostName='safe'>
        <FilterPanel
          visible={filterModalVisible}
          filters={filters}
          onFilterChange={setFilters}
          onClose={() => setFilterModalVisible(false)}
        />
      </Portal>

      {/* Transactions List */}
      <FlatList
        ref={flatListRef}
        data={flatData}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) =>
          item.type === 'month' ? (
            <MonthSeparator month={item.data} />
          ) : (
            <TransactionItem item={item.data} index={index} />
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState hasSearch={filters.search.length > 0} />}
      />
    </View>
  )
}

export default SimplifiedPaymentHistory

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(0),
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    marginTop: vh(6),
    borderColor: colors.border,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
  },
  filter: {
    height: vh(18),
    width: vh(18),
    marginHorizontal: vw(6),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(14),
    color: C.text,
    fontFamily: fonts.Regular,
  },
  filterBtn: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(12),
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: '#f0f0f0',
  },
  filterBtnIcon: {
    fontSize: normalize(18),
  },
  filterDot: {
    position: 'absolute',
    top: normalize(6),
    right: normalize(6),
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: C.primary,
  },

  // Filter Panel
  filterOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'flex-end',
  },
  filterPanel: {
    backgroundColor: C.card,
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    maxHeight: '85%',
    paddingTop: normalize(16),
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  filterTitle: {
    fontSize: normalize(18),
    fontFamily: fonts.Bold,
    color: C.text,
  },
  filterClose: {
    fontSize: normalize(24),
    color: C.textLight,
  },
  filterContent: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
  },
  filterSection: {
    marginBottom: normalize(28),
  },
  filterSectionTitle: {
    fontSize: normalize(14),
    fontFamily: fonts.SemiBold,
    color: C.text,
    marginBottom: normalize(12),
  },
  filterOptions: {
    gap: normalize(10),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(10),
    backgroundColor: C.bg,
  },
  filterOptionActive: {
    backgroundColor: 'rgba(43,101,104,0.08)',
  },
  filterCheckbox: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(6),
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
  },
  filterCheckboxActive: {
    borderColor: C.primary,
    backgroundColor: C.primary,
  },
  filterCheckmark: {
    color: C.white,
    fontSize: normalize(12),
    fontFamily: fonts.Bold,
  },
  filterOptionLabel: {
    fontSize: normalize(14),
    fontFamily: fonts.Regular,
    color: C.textLight,
  },
  filterOptionLabelActive: {
    color: C.primary,
    fontFamily: fonts.SemiBold,
  },
  filterFooter: {
    flexDirection: 'row',
    gap: normalize(12),
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(14),
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  filterResetBtn: {
    flex: 1,
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
  },
  filterResetBtnText: {
    fontSize: normalize(14),
    fontFamily: fonts.SemiBold,
    color: C.text,
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    backgroundColor: C.primary,
    alignItems: 'center',
  },
  filterApplyBtnText: {
    fontSize: normalize(14),
    fontFamily: fonts.SemiBold,
    color: C.white,
  },

  // Month separator
  monthSeparator: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    backgroundColor: C.bg,
  },
  monthLabel: {
    fontSize: normalize(16),
    fontFamily: fonts.Bold,
    color: C.text,
  },

  // Transaction item (handled by PaymentCard/AddonCard)
  // Styles removed - using existing card components

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vh(100),
    gap: normalize(12),
  },
  emptyIcon: {
    fontSize: normalize(48),
    marginBottom: normalize(8),
  },
  emptyTitle: {
    fontSize: normalize(18),
    fontFamily: fonts.Bold,
    color: C.text,
  },
  emptySub: {
    fontSize: normalize(14),
    fontFamily: fonts.Regular,
    color: C.textLight,
    textAlign: 'center',
  },

  // List
  listContent: {
    paddingBottom: normalize(24),
    backgroundColor: C.bg,
  },
})