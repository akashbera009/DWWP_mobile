// import React, { useState, useEffect } from 'react'
// import { View, StyleSheet, LayoutChangeEvent } from 'react-native'
// import {
//     Canvas,
//     RoundedRect,
//     Circle,
//     Paint,
//     vec,
//     LinearGradient,
// } from '@shopify/react-native-skia'
// import {
//     useSharedValue,
//     withRepeat,
//     withSequence,
//     withTiming,
//     Easing,
// } from 'react-native-reanimated'

// // ─── Types ────────────────────────────────────────────────────────────────────

// export type RiskLevel = 'safe' | 'warning' | 'critical'

// interface LiquidGlassCardProps {
//     riskLevel: RiskLevel
//     children: React.ReactNode
//     borderRadius?: number
// }

// // ─── Risk Palette (light theme) ───────────────────────────────────────────────

// const RISK_PALETTE: Record<RiskLevel, {
//     bg: string
//     bgFallback: string   // solid fallback so wrapper is never black
//     blob1: string
//     blob2: string
//     border: string
//     glow: string
// }> = {
//     safe: {
//         bg:          'rgba(220, 245, 230, 0.95)',
//         bgFallback:  '#DCF5E6',
//         blob1:       'rgba(72, 199, 116, 0.28)',
//         blob2:       'rgba(72, 199, 116, 0.18)',
//         border:      'rgba(72, 199, 116, 0.55)',
//         glow:        'rgba(72, 199, 116, 0.75)',
//     },
//     warning: {
//         bg:          'rgba(255, 243, 220, 0.95)',
//         bgFallback:  '#FFF3DC',
//         blob1:       'rgba(255, 159, 28, 0.28)',
//         blob2:       'rgba(255, 159, 28, 0.18)',
//         border:      'rgba(255, 159, 28, 0.55)',
//         glow:        'rgba(255, 159, 28, 0.75)',
//     },
//     critical: {
//         bg:          'rgba(255, 228, 228, 0.95)',
//         bgFallback:  '#FFE4E4',
//         blob1:       'rgba(239, 68, 68, 0.24)',
//         blob2:       'rgba(239, 68, 68, 0.16)',
//         border:      'rgba(239, 68, 68, 0.55)',
//         glow:        'rgba(239, 68, 68, 0.75)',
//     },
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
//     riskLevel,
//     children,
//     borderRadius = 16,
// }) => {
//     const [size, setSize] = useState({ w: 0, h: 0 })
//     const palette = RISK_PALETTE[riskLevel]
//     const br = borderRadius

//     const b1cx = useSharedValue(0)
//     const b1cy = useSharedValue(0)
//     const b2cx = useSharedValue(0)
//     const b2cy = useSharedValue(0)

//     useEffect(() => {
//         const { w, h } = size
//         if (w === 0 || h === 0) return

//         b1cx.value = w * 0.75
//         b1cy.value = h * 0.15
//         b2cx.value = w * 0.20
//         b2cy.value = h * 0.78

//         b1cx.value = withRepeat(
//             withSequence(
//                 withTiming(w * 0.82, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
//                 withTiming(w * 0.58, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
//             ), -1, true
//         )
//         b1cy.value = withRepeat(
//             withSequence(
//                 withTiming(h * 0.20, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
//                 withTiming(h * 0.04, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
//             ), -1, true
//         )
//         b2cx.value = withRepeat(
//             withSequence(
//                 withTiming(w * 0.12, { duration: 4400, easing: Easing.inOut(Easing.sin) }),
//                 withTiming(w * 0.35, { duration: 4400, easing: Easing.inOut(Easing.sin) }),
//             ), -1, true
//         )
//         b2cy.value = withRepeat(
//             withSequence(
//                 withTiming(h * 0.85, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
//                 withTiming(h * 0.65, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
//             ), -1, true
//         )
//     }, [size.w, size.h])

//     const onLayout = (e: LayoutChangeEvent) => {
//         const { width, height } = e.nativeEvent.layout
//         if (width !== size.w || height !== size.h) {
//             setSize({ w: width, h: height })
//         }
//     }

//     const { w, h } = size

//     return (
//         // bgFallback ensures a light background even before Canvas mounts
//         <View
//             style={[
//                 styles.wrapper,
//                 { borderRadius: br, backgroundColor: palette.bgFallback },
//             ]}
//             onLayout={onLayout}
//         >
//             {w > 0 && h > 0 && (
//                 <Canvas style={StyleSheet.absoluteFill}>

//                     {/* Light risk-tinted base */}
//                     <RoundedRect x={0} y={0} width={w} height={h} r={br}
//                         color={palette.bg}
//                     />

//                     {/* Blob 1 — top right */}
//                     <Circle cx={b1cx} cy={b1cy} r={110} color={palette.blob1} />

//                     {/* Blob 2 — bottom left */}
//                     <Circle cx={b2cx} cy={b2cy} r={90} color={palette.blob2} />

//                     {/* White shimmer at top */}
//                     <RoundedRect x={2} y={2} width={w - 4} height={h * 0.35} r={br - 1}>
//                         <LinearGradient
//                             start={vec(w / 2, 0)}
//                             end={vec(w / 2, h * 0.35)}
//                             colors={['rgba(255,255,255,0.70)', 'rgba(255,255,255,0.0)']}
//                         />
//                     </RoundedRect>

//                     {/* Risk-colored border */}
//                     <RoundedRect x={0.5} y={0.5} width={w - 1} height={h - 1} r={br}>
//                         <Paint style="stroke" strokeWidth={1.2} color={palette.border} />
//                     </RoundedRect>

//                     {/* Top glow edge */}
//                     <RoundedRect x={4} y={1} width={w - 8} height={2} r={1}
//                         color={palette.glow}
//                     />

//                 </Canvas>
//             )}

//             <View style={styles.content}>{children}</View>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     wrapper: { overflow: 'hidden' },
//     content: { zIndex: 1 },
// })

// export default LiquidGlassCard