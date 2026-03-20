import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { vw, vh, normalize } from '../utils/dimensions'
import colors from '@dwwp/utils/colors'

// Reusable shimmer bone
const Bone = ({
  width,
  height,
  borderRadius = normalize(8),
  style,
  shimmerValue,
  dark = false,
}: {
  width: number | string
  height: number
  borderRadius?: number
  style?: object
  shimmerValue: Animated.Value
  dark?: boolean
}) => {
  const backgroundColor = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: dark
      ? [
        'rgba(255,255,255,0.08)',
        'rgba(255,255,255,0.18)',
        'rgba(255,255,255,0.08)',
      ]
      : [colors.inputBackground, '#E2E7EC', colors.inputBackground],
  })

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor,
          overflow: 'hidden',
        },
        style,
      ]}
    />
  )
}

const DashboardSkeleton = () => {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [shimmer])

  return (
    <View style={styles.container}>

      {/* ── GREETING ── */}
      <View style={styles.greeting}>
        <Bone width={vw(118)} height={vh(15)} borderRadius={normalize(6)} shimmerValue={shimmer} />
        <Bone width={vw(180)} height={vh(22)} borderRadius={normalize(7)} shimmerValue={shimmer} style={{ marginTop: vh(8) }} />
      </View>

      {/* ── BILL CARD ── */}
      <View style={styles.billCard}>
        {/* Decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <View style={styles.billLeft}>
          {/* "CURRENT BILL" label */}
          <Bone width={vw(90)} height={vh(12)} borderRadius={normalize(4)} shimmerValue={shimmer} dark />
          {/* Amount */}
          <Bone width={vw(145)} height={vh(36)} borderRadius={normalize(8)} shimmerValue={shimmer} dark style={{ marginTop: vh(10) }} />
          {/* Badge */}
          <Bone width={vw(105)} height={vh(28)} borderRadius={normalize(16)} shimmerValue={shimmer} dark style={{ marginTop: vh(10) }} />
          {/* Stats row */}
          <View style={styles.billStatsRow}>
            <View style={styles.statItem}>
              <Bone width={vw(38)} height={vh(18)} borderRadius={normalize(5)} shimmerValue={shimmer} dark />
              <Bone width={vw(32)} height={vh(12)} borderRadius={normalize(4)} shimmerValue={shimmer} dark style={{ marginTop: vh(4) }} />
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Bone width={vw(48)} height={vh(18)} borderRadius={normalize(5)} shimmerValue={shimmer} dark />
              <Bone width={vw(42)} height={vh(12)} borderRadius={normalize(4)} shimmerValue={shimmer} dark style={{ marginTop: vh(4) }} />
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Bone width={vw(28)} height={vh(18)} borderRadius={normalize(5)} shimmerValue={shimmer} dark />
              <Bone width={vw(36)} height={vh(12)} borderRadius={normalize(4)} shimmerValue={shimmer} dark style={{ marginTop: vh(4) }} />
            </View>
          </View>
        </View>

        {/* Circle gauge */}
        <View style={styles.gaugeWrapper}>
          <View style={styles.gaugeOuter}>
            <View style={styles.gaugeInner}>
              <Bone width={vw(28)} height={vh(16)} borderRadius={normalize(4)} shimmerValue={shimmer} dark />
              <Bone width={vw(22)} height={vh(11)} borderRadius={normalize(4)} shimmerValue={shimmer} dark style={{ marginTop: vh(4) }} />
            </View>
          </View>
        </View>
      </View>

      {/* ── STATS GRID ── */}
      <View style={styles.grid}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.gridCard}>
            {/* Icon circle */}
            <View style={styles.upperGrid}>
              <Bone width={vw(38)} height={vw(38)} borderRadius={vw(12)} shimmerValue={shimmer} style={{ marginBottom: vh(0) }} />
              {/* Label */}
              <View style={styles.gripRight}>
                <Bone width={vw(70)} height={vh(12)} borderRadius={normalize(4)} shimmerValue={shimmer} style={{ marginBottom: vh(6) }} />
                {/* Value */}
                <Bone width={vw(42)} height={vh(22)} borderRadius={normalize(6)} shimmerValue={shimmer} style={{ marginBottom: vh(8) }} />
              </View>
            </View>
            {/* Trend badge */}
            <Bone width={vw(100)} height={vh(12)} borderRadius={normalize(8)} shimmerValue={shimmer} style={{marginLeft: vw(18) , marginTop:(-8)}}/>
          </View>
        ))}
      </View>

      {/* ── DEVICE STATUS ── */}
      <View style={styles.deviceSection}>
        <Bone width={vw(130)} height={vh(20)} borderRadius={normalize(6)} shimmerValue={shimmer} />
        <View style={styles.deviceCard}>
          <View style={styles.deviceRow}>
            {[0, 1].map((i) => (
              <View key={i} style={styles.deviceItem}>
                <Bone width={vw(150)} height={vh(90)} borderRadius={normalize(14)} shimmerValue={shimmer} />
                <Bone width={vw(60)} height={vh(12)} borderRadius={normalize(4)} shimmerValue={shimmer} style={{ marginTop: vh(8) }} />
                <Bone width={vw(40)} height={vh(10)} borderRadius={normalize(4)} shimmerValue={shimmer} style={{ marginTop: vh(4) }} />
              </View>
            ))}
          </View>
        </View>
      </View>

    </View>
  )
}

export default DashboardSkeleton

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
    paddingHorizontal: vw(16),
  },
  // Greeting
  greeting: {
    marginTop: vh(12),
  },

  // Bill card
  billCard: {
    marginTop: vh(18),
    backgroundColor: colors.primary,
    borderRadius: normalize(22),
    padding: vw(18),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: vh(175),
  },
  blob1: {
    position: 'absolute',
    width: vw(130),
    height: vw(130),
    borderRadius: vw(65),
    backgroundColor: 'rgba(50,194,202,0.12)',
    bottom: -vw(40),
    right: vw(60),
  },
  blob2: {
    position: 'absolute',
    width: vw(90),
    height: vw(90),
    borderRadius: vw(45),
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -vw(20),
    right: vw(10),
  },
  billLeft: {
    flex: 1,
  },
  billStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh(16),
    gap: vw(10),
  },
  statItem: {
    alignItems: 'flex-start',
  },
  divider: {
    width: 1,
    height: vh(30),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Gauge
  gaugeWrapper: {
    marginLeft: vw(12),
  },
  gaugeOuter: {
    width: vw(90),
    height: vw(90),
    borderRadius: vw(45),
    borderWidth: 6,
    borderColor: 'rgba(50,194,202,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  gaugeInner: {
    alignItems: 'center',
  },

  // Grid
  grid: {
    marginTop: vh(8),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent :'space-around',
    marginHorizontal :vw(8),
    gap: vh(8),
  },
  gridCard: {
    width: vw(150),
    height: vh(105),
    borderRadius: normalize(18),
    backgroundColor: colors.background,
    padding: vw(12),
    shadowColor: colors.cardShadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: colors.inputBackground,
  },
  upperGrid: {
    flexDirection: 'row',
    paddingVertical: vh(12)
  },
  gripRight :{
    marginHorizontal : vw(12)
  },
  // Device section
  deviceSection: {
    marginTop: vh(24),
    gap: vh(14),
  },
  deviceCard: {
    borderRadius: normalize(18),
    backgroundColor: colors.background,
    padding: vw(14),
    shadowColor: colors.cardShadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  deviceRow: {
    flexDirection: 'row',
    gap: vw(14),
  },
  deviceItem: {
    alignItems: 'center',
  },
})