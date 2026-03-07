import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    StatusBar,
    Platform,
} from "react-native";
import {
    Canvas,
    Path,
    LinearGradient,
    vec,
    Group,
    Circle,
} from "@shopify/react-native-skia";
import Animated, {
    Easing,
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withDelay,
    runOnJS,
    SharedValue,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const STEP = 2; // finer path resolution for smoother waves

// ─────────────────────────────────────────────
// Bubble data (static positions, animated rise)
// ─────────────────────────────────────────────
const BUBBLES = [
    { x: width * 0.15, r: 4, delay: 200, dur: 3200 },
    { x: width * 0.30, r: 3, delay: 800, dur: 2800 },
    { x: width * 0.50, r: 6, delay: 0, dur: 3600 },
    { x: width * 0.65, r: 3, delay: 1400, dur: 2600 },
    { x: width * 0.80, r: 5, delay: 600, dur: 3000 },
    { x: width * 0.22, r: 2, delay: 1800, dur: 2400 },
    { x: width * 0.72, r: 4, delay: 1000, dur: 3400 },
];

// ─────────────────────────────────────────────
// Helper: build a sine-wave path
// ─────────────────────────────────────────────
function buildWavePath(
    baseY: number,
    amplitude: number,
    phase: number,
    frequency: number
): string {
    "worklet";
    let d = `M 0 ${baseY}`;
    for (let x = 0; x <= width; x += STEP) {
        const angle = (x / width) * Math.PI * frequency + phase;
        const y = amplitude * Math.sin(angle) + baseY;
        d += ` L ${x} ${y}`;
    }
    d += ` L ${width} ${height} L 0 ${height} Z`;
    return d;
}

// ─────────────────────────────────────────────
// WaveBackground  – three layered waves
// ─────────────────────────────────────────────
interface WaveBackgroundProps {
    fill: SharedValue<number>;
    duration: number;
}

export const WaveBackground: React.FC<WaveBackgroundProps> = ({ fill, duration }) => {
    // Independent phase for each wave layer
    const phase1 = useSharedValue(0);
    const phase2 = useSharedValue(0);
    const phase3 = useSharedValue(0);

    useEffect(() => {
        // Wave 1 – primary, medium speed
        phase1.value = withRepeat(
            withTiming(Math.PI * 2, { duration: duration * .9, easing: Easing.linear }),
            -1, false
        );
        // Wave 2 – slightly faster, offset start
        phase2.value = withRepeat(
            withTiming(Math.PI * 2, { duration: duration * .5, easing: Easing.linear }),
            -1, false
        );
        // Wave 3 – slow, large
        phase3.value = withRepeat(
            withTiming(Math.PI * 2, { duration: duration * 1.3, easing: Easing.linear }),
            -1, false
        );
    }, []);

    // Shared vertical offset from fill level
    const baseY = useDerivedValue(
        () => height - height * 0.04 - fill.value * (height * 0.90)
    );

    // Amplitude shrinks as the tank fills (flattens at top)
    const amp1 = useDerivedValue(() => 26 - fill.value * 18);
    const amp2 = useDerivedValue(() => 18 - fill.value * 12);
    const amp3 = useDerivedValue(() => 34 - fill.value * 22);

    // Layer 1 – primary wave
    const path1 = useDerivedValue(() =>
        buildWavePath(baseY.value + 0, amp1.value, phase1.value, 2.2)
    );
    // Layer 2 – secondary wave, slightly higher
    const path2 = useDerivedValue(() =>
        buildWavePath(baseY.value - 18, amp2.value, phase2.value + Math.PI * 0.6, 1.8)
    );
    // Layer 3 – deep undertone wave, lower
    const path3 = useDerivedValue(() =>
        buildWavePath(baseY.value + 20, amp3.value, phase3.value + Math.PI * 1.3, 1.4)
    );

    // Gradient anchors
    const gStart = useDerivedValue(() => vec(0, baseY.value - 40));
    const gEnd = useDerivedValue(() => vec(0, height));

    // Bubble Y values: rise from baseY toward top
    const bubbleYs = BUBBLES.map((b) => {
        const progress = useSharedValue(0);
        useEffect(() => {
            progress.value = withDelay(
                b.delay,
                withRepeat(
                    withTiming(1, { duration: b.dur, easing: Easing.linear }),
                    -1, false
                )
            );
        }, []);
        return useDerivedValue(() => {
            const surfaceY = baseY.value;
            return surfaceY + (1 - progress.value) * (height - surfaceY) * 0.85;
        });
    });

    const bubbleOpacities = BUBBLES.map((b) => {
        const progress = useSharedValue(0);
        useEffect(() => {
            progress.value = withDelay(
                b.delay,
                withRepeat(
                    withTiming(1, { duration: b.dur, easing: Easing.linear }),
                    -1, false
                )
            );
        }, []);
        return useDerivedValue(() =>
            // Fade in quickly, fade out near surface
            progress.value < 0.1
                ? progress.value * 10 * 0.5
                : progress.value > 0.85
                    ? (1 - progress.value) / 0.15 * 0.5
                    : 0.5
        );
    });

    return (
        <View style={StyleSheet.absoluteFill}>
            <Canvas style={StyleSheet.absoluteFill}>
                {/* Layer 3 – darkest / deepest */}
                <Path path={path3} style="fill" opacity={0.45}>
                    <LinearGradient
                        start={gStart}
                        end={gEnd}
                        colors={["#0077cc", "#003e8a"]}
                    />
                </Path>

                {/* Layer 2 – mid */}
                <Path path={path2} style="fill" opacity={0.60}>
                    <LinearGradient
                        start={gStart}
                        end={gEnd}
                        colors={["#1e9fff", "#0055bb"]}
                    />
                </Path>

                {/* Layer 1 – front / brightest */}
                <Path path={path1} style="fill">
                    <LinearGradient
                        start={gStart}
                        end={gEnd}
                        colors={["#4facfe", "#006fd6"]}
                    />
                </Path>

                {/* Rising bubbles */}
                <Group>
                    {BUBBLES.map((b, i) => (
                        <Circle
                            key={i}
                            cx={b.x}
                            cy={bubbleYs[i]}
                            r={b.r}
                            color="rgba(255,255,255,0.35)"
                            opacity={bubbleOpacities[i]}
                        />
                    ))}
                </Group>
            </Canvas>
        </View>
    );
};

// ─────────────────────────────────────────────
// AnimatedLetter – drops in from above, staggered
// ─────────────────────────────────────────────
interface AnimatedLetterProps {
    char: string;
    delay: number;
    fill: SharedValue<number>;   // used to drive the water-reveal clip
    index: number;
    total: number;
}

const AnimatedLetter: React.FC<AnimatedLetterProps> = ({
    char, delay, fill, index, total,
}) => {
    const dropY = useSharedValue(-60);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.6);
    const bob = useSharedValue(0);

    useEffect(() => {
        // Drop in
        dropY.value = withDelay(delay, withTiming(0, { duration: 520, easing: Easing.out(Easing.back(2.5)) }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 320 }));
        scale.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.back(2)) }));

        // Bob starts after all letters land (stagger + settle)
        const bobStart = delay + 700;
        bob.value = withDelay(
            bobStart,
            withRepeat(
                withTiming(1, { duration: 1800 + index * 120, easing: Easing.inOut(Easing.sin) }),
                -1, true
            )
        );
    }, []);

    const ghostStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: dropY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value * 0.18,   // ghost / shadow layer
    }));

    const brightStyle = useAnimatedStyle(() => {
        // Water rise reveals the bright white version bottom-up
        // Each letter reveals at a slightly different fill threshold
        const letterThreshold = 0.35 + (index / total) * 0.25;
        const revealProgress = Math.max(
            0, Math.min(1, (fill.value - letterThreshold) / 0.25)
        );
        const bobOffset = Math.sin(bob.value * Math.PI * 2) * 6;

        return {
            transform: [
                { translateY: dropY.value + bobOffset },
                { scale: scale.value },
            ],
            opacity: opacity.value,
            // clip revealed portion via height (approximated with overflow+height)
            // We layer ghost (#8ab) under bright (#fff) that's clipped from bottom
        };
    });

    // Water-reveal clip height
    const revealClipStyle = useAnimatedStyle(() => {
        const letterThreshold = 0.35 + (index / total) * 0.25;
        const revealProgress = Math.max(
            0, Math.min(1, (fill.value - letterThreshold) / 0.28)
        );
        return {
            height: revealProgress * 90,   // 90 ≈ fontSize
            overflow: "hidden" as const,
            position: "absolute" as const,
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: "flex-end" as const,
            alignItems: "center" as const,
        };
    });

    return (
        <View style={{ position: "relative", alignItems: "center" }}>
            {/* Dim base letter */}
            <Animated.Text style={[styles.logoChar, { color: "#5a9fd4" }, ghostStyle]}>
                {char}
            </Animated.Text>

            {/* Bright letter (always full) – provides the drop-in */}
            <Animated.Text
                style={[
                    styles.logoChar,
                    { color: "#c8e8ff", position: "absolute" },
                    brightStyle,
                ]}
            >
                {char}
            </Animated.Text>

            {/* Pure white water-revealed portion */}
            <Animated.View style={[revealClipStyle]}>
                <Animated.Text
                    style={[
                        styles.logoChar,
                        { color: "#ffffff" },
                        brightStyle,
                        // override position so it sits inside clip view normally
                        { position: "relative" },
                    ]}
                >
                    {char}
                </Animated.Text>
            </Animated.View>
        </View>
    );
};

// ─────────────────────────────────────────────
// Tagline – fades + slides up after fill done
// ─────────────────────────────────────────────
interface TaglineProps {
    fill: SharedValue<number>;
    text: string;
    duration: number;
}
const Tagline: React.FC<TaglineProps> = ({ fill, text, duration }) => {
    const ty = useSharedValue(24);
    const opacity = useSharedValue(0);

    useEffect(() => {
        ty.value = withDelay(duration * .9, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
        opacity.value = withDelay(duration * .9, withTiming(1, { duration: 600 }));
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: ty.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={style}>
            <Text style={styles.tagline}>{text}</Text>
        </Animated.View>
    );
};

// ─────────────────────────────────────────────
// Splash Screen
// ─────────────────────────────────────────────
interface SplashScreenProps {
    duration?: number;
    onDone?: () => void;
    logoText?: string;
    taglineText?: string;
}

const DWWPSplash: React.FC<SplashScreenProps> = ({
    duration = 3600,
    onDone = () => { },
    logoText = "DWWP",
    taglineText = "Welcome to DWWP",
}) => {
    const fill = useSharedValue(0);

    useEffect(() => {
        fill.value = withTiming(
            1,
            { duration, easing: Easing.inOut(Easing.quad) },
            (finished) => {
                if (finished) {
                    setTimeout(() => runOnJS(onDone)(), 900);
                }
            }
        );
    }, []);

    const letters = logoText.split("");

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <WaveBackground fill={fill} duration={duration} />

            {/* Subtle radial glow behind logo */}
            <View style={styles.glowCircle} />

            <View style={styles.center}>
                {/* Logo letters */}
                <View style={styles.lettersRow}>
                    {letters.map((char, i) => (
                        <AnimatedLetter
                            key={i}
                            char={char}
                            delay={180 + i * 130}
                            fill={fill}
                            index={i}
                            total={letters.length}
                        />
                    ))}
                </View>

                <View style={{ height: 14 }} />

                <Tagline fill={fill} text={taglineText} duration={duration} />
            </View>
        </View>
    );
};

export default DWWPSplash;

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#050f2e",
    },
    center: {
        position: "absolute",
        top: Platform.OS === "android" ? height * 0.4 : height * 0.4,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    lettersRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 6,
    },
    logoChar: {
        fontSize: 80,
        fontWeight: "900",
        letterSpacing: 2,
        textAlign: "center",
        includeFontPadding: false,
    },
    tagline: {
        color: "#a8d8f8",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 3,
        textTransform: "uppercase",
    },
    glowCircle: {
        position: "absolute",
        top: Platform.OS === "android" ? height * 0.3 : height * 0.3,
        alignSelf: "center",
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: "rgba(79,172,254,0.08)",
        // React Native doesn't natively blur, but this gives a soft halo
    },
});