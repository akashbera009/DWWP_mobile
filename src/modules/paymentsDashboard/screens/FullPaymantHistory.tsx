import React, { useRef, useState, useCallback, useMemo } from 'react'
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Animated, Dimensions,  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native' 
import LinearGradient from 'react-native-linear-gradient'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import fonts from '@dwwp/utils/fonts'
import { useAppSelector } from '@dwwp/store/hooks'
import { PaymentRecord, AddonRecord } from '@dwwp/modals'
import { localImages } from '@dwwp/utils/localimages'
import colors from '@dwwp/utils/colors'
import { CustomHeader } from '@dwwp/components/CustomHeader'

const { width: SCREEN_W } = Dimensions.get('window')

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primary: '#2B6568',
  primaryDark: '#1e4a4d',
  cyan: '#32C2CA',
  cyanBg: 'rgba(50,194,202,0.10)',
  cyanBorder: 'rgba(50,194,202,0.20)',
  white: '#FFFFFF',
  black: '#041617',
  body: '#6A7C92',
  border: '#E1E8ED',
  bg: '#F4F7F8',
  card: '#FFFFFF',
  success: '#27AE60',
  successBg: 'rgba(39,174,96,0.10)',
  successBorder: 'rgba(39,174,96,0.22)',
  warning: '#F39C12',
  warningBg: 'rgba(243,156,18,0.10)',
  warningBorder: 'rgba(243,156,18,0.22)',
  purple: '#7C5CBF',
  purpleBg: 'rgba(124,92,191,0.10)',
  purpleBorder: 'rgba(124,92,191,0.22)',
  shadow: 'rgba(43,101,104,0.08)',
  inputBg: '#EFF2F5',
}

// ─── Filter types ─────────────────────────────────────────────────────────────
type StatusFilter = 'All' | 'Completed' | 'Pending'
type AmountFilter = 'All' | 'lt200' | '200to500' | 'gt500'

interface ActiveFilters {
  month: string         // '' = all months,  'YYYY-MM' = specific
  status: StatusFilter
  amount: AmountFilter
}

const EMPTY_FILTERS: ActiveFilters = { month: '', status: 'All', amount: 'All' }

const AMOUNT_LABELS: Record<AmountFilter, string> = {
  All: 'Any',
  lt200: '< ₹200',
  '200to500': '₹200–500',
  gt500: '> ₹500',
}

function matchesAmount(amount: number, f: AmountFilter): boolean {
  if (f === 'All') return true
  if (f === 'lt200') return amount < 200
  if (f === '200to500') return amount >= 200 && amount <= 500
  if (f === 'gt500') return amount > 500
  return true
}

function matchesStatus(status: string | null | undefined, f: StatusFilter): boolean {
  if (f === 'All') return true
  const resolved = (status ?? 'Completed').toLowerCase()
  return resolved === f.toLowerCase()
}

function matchesMonth(dateStr: string | null | undefined, f: string): boolean {
  if (!f) return true
  if (!dateStr || typeof dateStr !== 'string') return false
  return dateStr.startsWith(f)
}

function extractMonths(dates: (string | null | undefined)[]): string[] {
  const seen = new Set<string>()
  dates.forEach(d => {
    if (d && typeof d === 'string' && d.length >= 7) seen.add(d.slice(0, 7))
  })
  return Array.from(seen).sort().reverse()
}

function countActive(f: ActiveFilters): number {
  return [f.month !== '', f.status !== 'All', f.amount !== 'All'].filter(Boolean).length
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return '—' }
}

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}

function fmtMonth(key: string | null | undefined): string {
  if (!key) return '—'
  try {
    const [y, m] = key.split('-')
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-IN', {
      month: 'short', year: '2-digit',
    })
  } catch { return key }
}

function shortId(id: string | null | undefined): string {
  if (!id || typeof id !== 'string') return '—'
  return id.slice(-10).toUpperCase()
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string | null | undefined }> = ({ status }) => {
  const resolved = status ?? 'Completed'
  const isOk = resolved.toLowerCase() === 'completed'
  return (
    <View style={[styles.badge, {
      backgroundColor: isOk ? C.successBg : C.warningBg,
      borderColor: isOk ? C.successBorder : C.warningBorder,
    }]}>
      <View style={[styles.badgeDot, { backgroundColor: isOk ? C.success : C.warning }]} />
      <Text style={[styles.badgeText, { color: isOk ? C.success : C.warning }]}>
        {resolved}
      </Text>
    </View>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
const Chip: React.FC<{
  label: string
  active: boolean
  color?: string
  onPress: () => void
}> = ({ label, active, color = C.primary, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current
  const onIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start()
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={onIn} onPressOut={onOut} onPress={onPress}
        style={[
          styles.chip,
          active
            ? { backgroundColor: color, borderColor: color }
            : { backgroundColor: C.card, borderColor: C.border },
        ]}
      >
        {active && <View style={styles.chipActiveDot} />}
        <Text style={[styles.chipText, { color: active ? C.white : C.body }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
const FilterBar: React.FC<{
  visible: boolean
  filters: ActiveFilters
  months: string[]
  onChange: (f: ActiveFilters) => void
  onClear: () => void
  tabColor: string
}> = ({ visible, filters, months, onChange, onClear, tabColor }) => {
  const animH = useRef(new Animated.Value(0)).current
  const animO = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(animH, { toValue: visible ? 1 : 0, friction: 14, tension: 160, useNativeDriver: false }),
      Animated.timing(animO, { toValue: visible ? 1 : 0, duration: 180, useNativeDriver: false }),
    ]).start()
  }, [visible])

  const maxH = animH.interpolate({ inputRange: [0, 1], outputRange: [0, normalize(170)] })

  const STATUS_OPTS: { value: StatusFilter; color: string }[] = [
    { value: 'All', color: C.primary },
    { value: 'Completed', color: C.success },
    { value: 'Pending', color: C.warning },
  ]
  const AMOUNT_OPTS: AmountFilter[] = ['All', 'lt200', '200to500', 'gt500']

  return (
    <Animated.View style={[styles.filterBar, { maxHeight: maxH, opacity: animO }]}>
      <View style={styles.filterInner}>

        {/* Month row */}
        {months.length > 0 && (
          <View style={styles.filterRow}>
            <Text style={styles.filterRowLabel}>Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterChips}>
                <Chip
                  label="All"
                  active={filters.month === ''}
                  color={tabColor}
                  onPress={() => onChange({ ...filters, month: '' })}
                />
                {months.map(m => (
                  <Chip
                    key={m}
                    label={fmtMonth(m)}
                    active={filters.month === m}
                    color={tabColor}
                    onPress={() => onChange({ ...filters, month: filters.month === m ? '' : m })}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Status row */}
        <View style={styles.filterRow}>
          <Text style={styles.filterRowLabel}>Status</Text>
          <View style={styles.filterChips}>
            {STATUS_OPTS.map(s => (
              <Chip
                key={s.value}
                label={s.value}
                active={filters.status === s.value}
                color={s.color}
                onPress={() => onChange({ ...filters, status: s.value })}
              />
            ))}
          </View>
        </View>

        {/* Amount row */}
        <View style={styles.filterRow}>
          <Text style={styles.filterRowLabel}>Amount</Text>
          <View style={styles.filterChips}>
            {AMOUNT_OPTS.map(a => (
              <Chip
                key={a}
                label={AMOUNT_LABELS[a]}
                active={filters.amount === a}
                color={tabColor}
                onPress={() => onChange({ ...filters, amount: a })}
              />
            ))}
          </View>
        </View>

        {/* Clear */}
        {countActive(filters) > 0 && (
          <Pressable onPress={onClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕  Clear all filters</Text>
          </Pressable>
        )}

      </View>
    </Animated.View>
  )
}

// ─── PaymentCard ──────────────────────────────────────────────────────────────
const PaymentCard: React.FC<{ item: PaymentRecord; index: number }> = ({ item, index }) => {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0)).current
  const slideY = useRef(new Animated.Value(normalize(24))).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay: index * 55, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, friction: 9, tension: 120, delay: index * 55, useNativeDriver: true }),
    ]).start()
  }, [])

  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start()
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: slideY }, { scale }] }}>
      <Pressable onPressIn={onIn} onPressOut={onOut} style={styles.card}>
        <LinearGradient colors={[C.cyan, C.primary]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.cardAccent} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={[styles.iconBox, { backgroundColor: C.cyanBg }]}>
              <Text style={styles.iconEmoji}>💳</Text>
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>Bill Payment</Text>
              <Text style={styles.cardMeta}>{fmtMonth(item.forMonth)}  ·  {fmtDate(item.timeStamp)}</Text>
            </View>
            <View style={styles.amountBlock}>
              <Text style={styles.amountText}>₹{item.amount}</Text>
              <Text style={styles.amountLabel}>paid</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardBottom}>
            <View style={styles.idBlock}>
              <Text style={styles.idLabel}>TXN ID</Text>
              <Text style={styles.idValue}>{shortId(item.razorPayId)}</Text>
            </View>
            <Text style={styles.timeText}>{fmtTime(item.timeStamp)}</Text>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

// ─── AddonCard ────────────────────────────────────────────────────────────────
const AddonCard: React.FC<{ item: AddonRecord; index: number }> = ({ item, index }) => {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0)).current
  const slideY = useRef(new Animated.Value(normalize(24))).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay: index * 55, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, friction: 9, tension: 120, delay: index * 55, useNativeDriver: true }),
    ]).start()
  }, [])

  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start()
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: slideY }, { scale }] }}>
      <Pressable onPressIn={onIn} onPressOut={onOut} style={styles.card}>
        <LinearGradient colors={[C.purple, '#5B3FA6']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.cardAccent} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={[styles.iconBox, { backgroundColor: C.purpleBg }]}>
              <Text style={styles.iconEmoji}>💧</Text>
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>Water Recharge</Text>
              <Text style={styles.cardMeta}>{fmtDate(item.addon_date)}</Text>
            </View>
            <View style={styles.amountBlock}>
              <Text style={styles.amountText}>₹{item.amount}</Text>
              <Text style={styles.amountLabel}>paid</Text>
            </View>
          </View>
          <View style={styles.addonPillRow}>
            <View style={[styles.addonPill, { backgroundColor: C.cyanBg, borderColor: C.cyanBorder }]}>
              <Text style={styles.addonPillIcon}>💧</Text>
              <Text style={[styles.addonPillText, { color: C.cyan }]}>{item.quantityDone}L added</Text>
            </View>
            <View style={[styles.addonPill, { backgroundColor: C.purpleBg, borderColor: C.purpleBorder }]}>
              <Text style={styles.addonPillIcon}>🔄</Text>
              <Text style={[styles.addonPillText, { color: C.purple }]}>{item.refill} refills</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardBottom}>
            <View style={styles.idBlock}>
              <Text style={styles.idLabel}>TXN ID</Text>
              <Text style={styles.idValue}>{shortId(item.razor_pay_id)}</Text>
            </View>
            <Text style={styles.timeText}>{fmtTime(item.addon_date)}</Text>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ filtered: boolean }> = ({ filtered }) => (
  <View style={styles.emptyWrap}>
    <Text style={styles.emptyIcon}>{filtered ? '🔍' : '🗂️'}</Text>
    <Text style={styles.emptyTitle}>{filtered ? 'No results' : 'Nothing here yet'}</Text>
    <Text style={styles.emptySub}>
      {filtered ? 'Try adjusting your filters' : 'Your transactions will appear here'}
    </Text>
  </View>
)

// ─── Summary strip ────────────────────────────────────────────────────────────
const SummaryStrip: React.FC<{
  activeTab: number
  payments: PaymentRecord[]
  addons: AddonRecord[]
  isFiltered: boolean
}> = ({ activeTab, payments, addons, isFiltered }) => {
  const totalPaid = payments.reduce((s, p) => s + (p.amount ?? 0), 0)
  const totalAddon = addons.reduce((s, a) => s + (a.amount ?? 0), 0)
  const totalLiters = addons.reduce((s, a) => s + (a.quantityDone ?? 0), 0)

  const items = activeTab === 0
    ? [
      { label: isFiltered ? 'Filtered Total' : 'Total Paid', value: `₹${totalPaid}`, color: C.cyan },
      { label: isFiltered ? 'Results' : 'Transactions', value: `${payments.length}`, color: C.primary },
    ]
    : [
      { label: isFiltered ? 'Filtered Total' : 'Total Spent', value: `₹${totalAddon}`, color: C.purple },
      { label: 'Liters Added', value: `${totalLiters}L`, color: C.cyan },
      { label: isFiltered ? 'Results' : 'Recharges', value: `${addons.length}`, color: C.primary },
    ]

  return (
    <View style={styles.summaryStrip}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <View style={styles.summaryDivider} />}
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
const FullPaymentHistory: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { paymentsHistory, addonsHistory } = useAppSelector(
    s => s.payment.transactionHistory
  ) as { paymentsHistory: PaymentRecord[]; addonsHistory: AddonRecord[] }

  const [activeTab, setActiveTab] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [payFilters, setPayFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [addFilters, setAddFilters] = useState<ActiveFilters>(EMPTY_FILTERS)

  const flatListRef = useRef<FlatList>(null)
  const tabIndicatorX = useRef(new Animated.Value(0)).current
  const scrollX = useRef(new Animated.Value(0)).current
  const TAB_W = (SCREEN_W - normalize(32) - normalize(8)) / 2

  // Derived months per tab
  const payMonths = useMemo(() => extractMonths((paymentsHistory ?? []).map(p => p.forMonth)), [paymentsHistory])
  const addMonths = useMemo(() => extractMonths((addonsHistory ?? []).map(a => a.addon_date)), [addonsHistory])

  // Filtered data
  const filteredPayments = useMemo(() => (paymentsHistory ?? []).filter(p =>
    matchesMonth(p.forMonth, payFilters.month) &&
    matchesStatus(p.status, payFilters.status) &&
    matchesAmount(p.amount ?? 0, payFilters.amount)
  ), [paymentsHistory, payFilters])

  const filteredAddons = useMemo(() => (addonsHistory ?? []).filter(a =>
    matchesMonth(a.addon_date, addFilters.month) &&
    matchesStatus(a.status, addFilters.status) &&
    matchesAmount(a.amount ?? 0, addFilters.amount)
  ), [addonsHistory, addFilters])

  const activeFilters = activeTab === 0 ? payFilters : addFilters
  const setActiveFilters = activeTab === 0 ? setPayFilters : setAddFilters
  const activeMonths = activeTab === 0 ? payMonths : addMonths
  const activeBadge = countActive(activeFilters)
  const tabColor = activeTab === 0 ? C.primary : C.purple
  const isFiltered = activeBadge > 0

  const switchTab = useCallback((index: number) => {
    setActiveTab(index)
    // Close filter bar when switching tabs so stale filters don't confuse
    setFilterOpen(false)
    Animated.spring(tabIndicatorX, {
      toValue: index * (TAB_W + normalize(4)),
      friction: 10, tension: 180, useNativeDriver: true,
    }).start()
    flatListRef.current?.scrollToIndex({ index, animated: true })
  }, [TAB_W])

  const onScrollEnd = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W)
    if (idx !== activeTab) switchTab(idx)
  }, [activeTab, switchTab])

  const TABS = [
    { label: localImages.salary, count: filteredPayments.length, total: paymentsHistory?.length ?? 0 },
    { label: localImages.thunder, count: filteredAddons.length, total: addonsHistory?.length ?? 0 },
  ]

  const renderPaymentsPage = () => (
    <View style={{ width: SCREEN_W }}>
      <FlatList<PaymentRecord>
        data={filteredPayments}
        keyExtractor={(_, i) => `pay-${i}`}
        renderItem={({ item, index }) => <PaymentCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState filtered={isFiltered} />}
      />
    </View>
  )

  const renderAddonsPage = () => (
    <View style={{ width: SCREEN_W }}>
      <FlatList<AddonRecord>
        data={filteredAddons}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <AddonCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState filtered={isFiltered} />}
      />
    </View>
  )

  const renderPage = ({ item: tabIndex }: { item: number }) =>
    tabIndex === 0 ? renderPaymentsPage() : renderAddonsPage()

  return (
    <View style={styles.screen} >
     <CustomHeader
     screenName='Payment History'/>

      {/* ── Tab bar ── */}
      <View style={styles.tabBarWrap}>
        <View style={styles.tabBar}>
          <Animated.View style={[
            styles.tabIndicator,
            {
              width: TAB_W,
              transform: [{ translateX: tabIndicatorX }],
              backgroundColor: activeTab === 0 ? C.cyanBg : C.purpleBg,
              borderColor: activeTab === 0 ? C.cyanBorder : C.purpleBorder,
            },
          ]} />
          {TABS.map((tab, i) => {
            const isActive = activeTab === i
            const showFiltered = isActive && isFiltered && tab.count !== tab.total
            return (
              <Pressable
                key={i}
                style={[styles.tabBtn, { width: TAB_W }]}
                onPress={() => switchTab(i)}
              >
                <Image
                  source={tab.label}
                  style={styles.label}
                />
                <View style={[
                  styles.tabCount,
                  { backgroundColor: isActive ? (i === 0 ? C.primary : C.purple) : C.inputBg },
                ]}>
                  <Text style={[styles.tabCountText, { color: isActive ? C.white : C.body }]}>
                    {showFiltered ? `${tab.count}/${tab.total}` : tab.count}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* ── Summary strip (shows filtered totals) ── */}
      <SummaryStrip
        activeTab={activeTab}
        payments={filteredPayments}
        addons={filteredAddons}
        isFiltered={isFiltered}
      />

      <View style={styles.filterbar} >
        <TouchableOpacity
          onPress={() => setFilterOpen(p => !p)}
        >
          <Image source={localImages.filter} style={styles.label} />
        </TouchableOpacity>
      </View>


      {/* ── Collapsible filter bar ── */}
      <FilterBar
        visible={filterOpen}
        filters={activeFilters}
        months={activeMonths}
        onChange={setActiveFilters}
        onClear={() => setActiveFilters(EMPTY_FILTERS)}
        tabColor={tabColor}
      />

      {/* ── Paged swipe list ── */}
      <FlatList
        ref={flatListRef}
        data={[0, 1]}
        keyExtractor={i => `tab-${i}`}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        getItemLayout={(_, index) => ({
          length: SCREEN_W, offset: SCREEN_W * index, index,
        })}
      />
    </View>
  )
}

export default FullPaymentHistory

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: normalize(20), paddingTop: normalize(14), paddingBottom: normalize(18), flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: normalize(34), height: normalize(34), borderRadius: normalize(17), backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginRight: normalize(12) },
  backBtnText: { color: C.white, fontSize: normalize(18), fontFamily: fonts.Bold },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fonts.Bold, fontSize: normalize(20), color: C.white },
  headerSub: { fontFamily: fonts.Regular, fontSize: normalize(12), color: 'rgba(255,255,255,0.65)', marginTop: vh(2) },

  // Filter toggle button in header
  filterToggleBtn: {
    width: normalize(38), height: normalize(38), borderRadius: normalize(19),
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: normalize(8),
  },
  filterToggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.28)' },
  filterToggleIcon: { fontSize: normalize(16) },
  filterBadge: {
    position: 'absolute', top: normalize(0), right: normalize(0),
    width: normalize(16), height: normalize(16), borderRadius: normalize(8),
    backgroundColor: C.warning, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: C.primaryDark,
  },
  filterBadgeText: { fontFamily: fonts.Bold, fontSize: normalize(9), color: C.white },

  // Filter bar
  filterBar: { overflow: 'hidden', backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border , marginHorizontal : vw(16)},
  filterInner: { padding: normalize(14), gap: normalize(10) },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
  filterRowLabel: { fontFamily: fonts.SemiBold, fontSize: normalize(11), color: C.body, width: normalize(46), flexShrink: 0 },
  filterScroll: { flex: 1 },
  filterChips: { flexDirection: 'row', gap: normalize(6), flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: normalize(4),
    paddingHorizontal: normalize(11), paddingVertical: normalize(5),
    borderRadius: normalize(20), borderWidth: 1,
  },
  chipActiveDot: { width: normalize(5), height: normalize(5), borderRadius: normalize(3), backgroundColor: 'rgba(255,255,255,0.7)' },
  chipText: { fontFamily: fonts.SemiBold, fontSize: normalize(11) },
  clearBtn: { alignSelf: 'flex-start', paddingHorizontal: normalize(12), paddingVertical: normalize(5), borderRadius: normalize(20), backgroundColor: C.inputBg },
  clearBtnText: { fontFamily: fonts.SemiBold, fontSize: normalize(11), color: C.body },

  // Summary strip
  summaryStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, paddingVertical: normalize(14), paddingHorizontal: normalize(24), borderBottomWidth: 1, borderBottomColor: C.border, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 10 },
  summaryItem: { flex: 1, alignItems: 'center', gap: vh(3) },
  summaryValue: { fontFamily: fonts.Bold, fontSize: normalize(17) },
  summaryLabel: { fontFamily: fonts.Regular, fontSize: normalize(10), color: C.body },
  summaryDivider: { width: 1, height: normalize(30), backgroundColor: C.border },

  // Tab bar
  tabBarWrap: { paddingHorizontal: normalize(16), paddingVertical: normalize(12), backgroundColor: C.bg },
  tabBar: { flexDirection: 'row', backgroundColor: C.card, borderRadius: normalize(16), padding: normalize(4), position: 'relative', borderWidth: 1, borderColor: C.border, shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  tabIndicator: { position: 'absolute', top: normalize(4), left: normalize(4), height: normalize(38), borderRadius: normalize(13), borderWidth: 1 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: normalize(38), borderRadius: normalize(13), gap: normalize(6), zIndex: 1 },
  tabLabelActive: { color: C.primary },
  label: { height: vh(22), width: vw(22), tintColor: colors.primary, marginHorizontal: vw(8) },
  tabCount: { paddingHorizontal: normalize(7), paddingVertical: normalize(2), borderRadius: normalize(10), minWidth: normalize(22), alignItems: 'center' },
  tabCountText: { fontFamily: fonts.Bold, fontSize: normalize(10) },

  // filter bar 
  filterbar:{
    marginHorizontal :vw(16),
    flexDirection :'row',
    marginVertical :vh(8),
    alignItems:'center',
    justifyContent :'flex-end',
  },  
  // Cards
  listContent: { paddingHorizontal: normalize(16), paddingTop: normalize(4), paddingBottom: normalize(30), gap: normalize(10) },
  card: { flexDirection: 'row', backgroundColor: C.card, borderRadius: normalize(18), overflow: 'hidden', shadowColor: C.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: C.border },
  cardAccent: { width: normalize(4) },
  cardBody: { flex: 1, padding: normalize(14), gap: normalize(10) },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
  iconBox: { width: normalize(40), height: normalize(40), borderRadius: normalize(13), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconEmoji: { fontSize: normalize(18) },
  cardTitleBlock: { flex: 1, gap: vh(2) },
  cardTitle: { fontFamily: fonts.Bold, fontSize: normalize(14), color: C.black },
  cardMeta: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body },
  amountBlock: { alignItems: 'flex-end', gap: vh(2) },
  amountText: { fontFamily: fonts.Bold, fontSize: normalize(17), color: C.black },
  amountLabel: { fontFamily: fonts.Regular, fontSize: normalize(10), color: C.body },
  addonPillRow: { flexDirection: 'row', gap: normalize(8) },
  addonPill: { flexDirection: 'row', alignItems: 'center', gap: normalize(4), paddingHorizontal: normalize(10), paddingVertical: normalize(4), borderRadius: normalize(20), borderWidth: 1 },
  addonPillIcon: { fontSize: normalize(12) },
  addonPillText: { fontFamily: fonts.SemiBold, fontSize: normalize(11) },
  cardDivider: { height: 1, backgroundColor: C.border },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
  idBlock: { flex: 1, gap: vh(1) },
  idLabel: { fontFamily: fonts.Regular, fontSize: normalize(9), color: C.body, letterSpacing: 0.8 },
  idValue: { fontFamily: fonts.Bold, fontSize: normalize(11), color: C.black, letterSpacing: 0.5 },
  timeText: { fontFamily: fonts.Regular, fontSize: normalize(11), color: C.body },
  badge: { flexDirection: 'row', alignItems: 'center', gap: normalize(4), paddingHorizontal: normalize(9), paddingVertical: normalize(3), borderRadius: normalize(20), borderWidth: 1 },
  badgeDot: { width: normalize(5), height: normalize(5), borderRadius: normalize(3) },
  badgeText: { fontFamily: fonts.SemiBold, fontSize: normalize(10) },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: vh(80), gap: normalize(8) },
  emptyIcon: { fontSize: normalize(40) },
  emptyTitle: { fontFamily: fonts.Bold, fontSize: normalize(16), color: C.black },
  emptySub: { fontFamily: fonts.Regular, fontSize: normalize(13), color: C.body },
})