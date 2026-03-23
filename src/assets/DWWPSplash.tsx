/**
 * DWWPSplash.tsx
 *
 * Fix: hooks (useSharedValue / useEffect / useDerivedValue) were called
 * inside BUBBLES.map() — that violates React's Rules of Hooks and causes
 * random bubbles and animations to silently drop.
 *
 * Solution: each bubble lives in its own <Bubble /> component so every
 * hook call is unconditional and at the top level of a component.
 */

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
const STEP = 2;

// ─── Brand palette ────────────────────────────────────────────────────────────
const BRAND = {
    bg: "#041617",
    wave1Front: "#32C2CA",
    wave1Back: "#1a9ea6",
    wave2Front: "#2B6568",
    wave2Back: "#1e4a4d",
    wave3Front: "#1a4a4d",
    wave3Back: "#0d2b2d",
    letterDim: "#2B8A8E",
    letterMid: "#7FD4D8",
    letterFull: "#FFFFFF",
    tagline: "#7FD4D8",
    bubble: "rgba(50,194,202,0.38)",
    glow: "rgba(50,194,202,0.07)",
};

// ─── Bubble config ────────────────────────────────────────────────────────────
interface BubbleConfig {
    x: number;
    r: number;
    delay: number;
    dur: number;
}

const BUBBLE_CONFIGS: BubbleConfig[] = [
    { x: width * 0.10, r: 3.5, delay: 200, dur: 3200 },
    { x: width * 0.25, r: 2.5, delay: 800, dur: 2800 },
    { x: width * 0.42, r: 5.0, delay: 0, dur: 3600 },
    { x: width * 0.58, r: 2.5, delay: 1400, dur: 2600 },
    { x: width * 0.72, r: 4.0, delay: 600, dur: 3000 },
    { x: width * 0.18, r: 2.0, delay: 1800, dur: 2400 },
    { x: width * 0.68, r: 3.5, delay: 1000, dur: 3400 },
    { x: width * 0.88, r: 2.0, delay: 500, dur: 2900 },
    { x: width * 0.35, r: 3.0, delay: 1200, dur: 3100 },
    { x: width * 0.82, r: 4.5, delay: 300, dur: 2700 },
];

// ─── Wave path builder (worklet) ──────────────────────────────────────────────
function buildWavePath(
    baseY: number,
    amplitude: number,
    phase: number,
    frequency: number
): string {
    "worklet";
    let d = `M 0 ${baseY}`;
    for (let x = 0; x <= width; x += STEP) {
        const y = amplitude * Math.sin((x / width) * Math.PI * frequency + phase) + baseY;
        d += ` L ${x} ${y}`;
    }
    d += ` L ${width} ${height} L 0 ${height} Z`;
    return d;
}

// ─── Single Bubble component (fixes hooks-in-map violation) ───────────────────
interface BubbleProps {
    config: BubbleConfig;
    baseY: SharedValue<number>;
}

const Bubble: React.FC<BubbleProps> = ({ config, baseY }) => {
    // Each bubble owns exactly one progress shared value — no map, no violation
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(
            config.delay,
            withRepeat(
                withTiming(1, { duration: config.dur, easing: Easing.linear }),
                -1,
                false
            )
        );
    }, []);

    const cy = useDerivedValue(() => {
        const surfaceY = baseY.value;
        return surfaceY + (1 - progress.value) * (height - surfaceY) * 0.85;
    });

    const opacity = useDerivedValue(() =>
        progress.value < 0.10
            ? progress.value * 10 * 0.55
            : progress.value > 0.85
                ? ((1 - progress.value) / 0.15) * 0.55
                : 0.55
    );

    return (
        <Circle
            cx={config.x}
            cy={cy}
            r={config.r}
            color={BRAND.bubble}
            opacity={opacity}
        />
    );
};

// ─── WaveBackground ───────────────────────────────────────────────────────────
interface WaveBackgroundProps {
    fill: SharedValue<number>;
    duration: number;
}

const WaveBackground: React.FC<WaveBackgroundProps> = ({ fill, duration }) => {
    const phase1 = useSharedValue(0);
    const phase2 = useSharedValue(0);
    const phase3 = useSharedValue(0);

    useEffect(() => {
        phase1.value = withRepeat(
            withTiming(Math.PI * 2, { duration: duration * 0.90, easing: Easing.linear }),
            -1, false
        );
        phase2.value = withRepeat(
            withTiming(Math.PI * 2, { duration: duration * 0.55, easing: Easing.linear }),
            -1, false
        );
        phase3.value = withRepeat(
            withTiming(Math.PI * 2, { duration: duration * 1.35, easing: Easing.linear }),
            -1, false
        );
    }, []);

    const baseY = useDerivedValue(
        () => height - height * 0.04 - fill.value * (height * 0.90)
    );

    const amp1 = useDerivedValue(() => 26 - fill.value * 18);
    const amp2 = useDerivedValue(() => 18 - fill.value * 12);
    const amp3 = useDerivedValue(() => 34 - fill.value * 22);

    const path1 = useDerivedValue(() =>
        buildWavePath(baseY.value, amp1.value, phase1.value, 2.2)
    );
    const path2 = useDerivedValue(() =>
        buildWavePath(baseY.value - 18, amp2.value, phase2.value + Math.PI * 0.6, 1.8)
    );
    const path3 = useDerivedValue(() =>
        buildWavePath(baseY.value + 20, amp3.value, phase3.value + Math.PI * 1.3, 1.4)
    );

    const gStart = useDerivedValue(() => vec(0, baseY.value - 40));
    const gEnd = useDerivedValue(() => vec(0, height));

    return (
        <View style={StyleSheet.absoluteFill}>
            <Canvas style={StyleSheet.absoluteFill}>
                {/* Layer 3 – deepest */}
                <Path path={path3} style="fill" opacity={0.45}>
                    <LinearGradient start={gStart} end={gEnd}
                        colors={[BRAND.wave3Front, BRAND.wave3Back]} />
                </Path>

                {/* Layer 2 – mid */}
                <Path path={path2} style="fill" opacity={0.62}>
                    <LinearGradient start={gStart} end={gEnd}
                        colors={[BRAND.wave2Front, BRAND.wave2Back]} />
                </Path>

                {/* Layer 1 – front / brightest */}
                <Path path={path1} style="fill">
                    <LinearGradient start={gStart} end={gEnd}
                        colors={[BRAND.wave1Front, BRAND.wave1Back]} />
                </Path>

                {/* ✅ Each bubble is its own component — no hooks-in-map */}
                <Group>
                    {BUBBLE_CONFIGS.map((cfg, i) => (
                        <Bubble key={i} config={cfg} baseY={baseY} />
                    ))}
                </Group>
            </Canvas>
        </View>
    );
};

// ─── AnimatedLetter ───────────────────────────────────────────────────────────
interface AnimatedLetterProps {
    char: string;
    delay: number;
    fill: SharedValue<number>;
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
        dropY.value = withDelay(delay, withTiming(0, { duration: 520, easing: Easing.out(Easing.back(2.5)) }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 320 }));
        scale.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.back(2)) }));
        bob.value = withDelay(delay + 700,
            withRepeat(
                withTiming(1, { duration: 1800 + index * 120, easing: Easing.inOut(Easing.sin) }),
                -1, true
            )
        );
    }, []);

    const ghostStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: dropY.value }, { scale: scale.value }],
        opacity: opacity.value * 0.20,
    }));

    const brightStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: dropY.value + Math.sin(bob.value * Math.PI * 2) * 6 },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    const revealClipStyle = useAnimatedStyle(() => {
        const threshold = 0.35 + (index / total) * 0.25;
        const progress = Math.max(0, Math.min(1, (fill.value - threshold) / 0.28));
        return {
            height: progress * 90,
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
            {/* Ghost */}
            <Animated.Text style={[styles.logoChar, { color: BRAND.letterDim }, ghostStyle]}>
                {char}
            </Animated.Text>
            {/* Mid cyan */}
            <Animated.Text style={[styles.logoChar, { color: BRAND.letterMid, position: "absolute" }, brightStyle]}>
                {char}
            </Animated.Text>
            {/* White water-revealed clip */}
            <Animated.View style={revealClipStyle}>
                <Animated.Text style={[styles.logoChar, { color: BRAND.letterFull, position: "relative" }, brightStyle]}>
                    {char}
                </Animated.Text>
            </Animated.View>
        </View>
    );
};

// ─── Tagline ──────────────────────────────────────────────────────────────────
interface TaglineProps {
    text: string;
    duration: number;
    extraDelay?: number;
    textStyle?: object;
}

// ✅ Standalone component — no hooks inside render loops
const FadeSlideText: React.FC<TaglineProps> = ({ text, duration, extraDelay = 0, textStyle }) => {
    const ty = useSharedValue(20);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const start = duration * 0.88 + extraDelay;
        ty.value = withDelay(start, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
        opacity.value = withDelay(start, withTiming(1, { duration: 600 }));
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: ty.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={style}>
            <Text style={[styles.tagline, textStyle]}>{text}</Text>
        </Animated.View>
    );
};

// ─── Subtitle with dot separators ────────────────────────────────────────────
const SubtitleLine: React.FC<{ duration: number }> = ({ duration }) => {
    const ty = useSharedValue(16);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const start = duration * 0.93;
        ty.value = withDelay(start, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
        opacity.value = withDelay(start, withTiming(1, { duration: 500 }));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: ty.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.subtitleRow, animStyle]}>
            <View style={styles.subtitleDot} />
            <Text style={styles.subtitleText}>Domestic Water Wastage Prevention</Text>
            <View style={styles.subtitleDot} />
        </Animated.View>
    );
};

// ─── Main Splash ──────────────────────────────────────────────────────────────
interface SplashProps {
    duration?: number;
    onDone?: () => void;
    logoText?: string;
    taglineText?: string;
}

const DWWPSplash: React.FC<SplashProps> = ({
    duration = 3600,
    onDone = () => { },
    logoText = "DWWP",
    taglineText = "Smart Water. Saved.",
}) => {
    const fill = useSharedValue(0);

    useEffect(() => {
        fill.value = withTiming(
            1,
            { duration, easing: Easing.inOut(Easing.quad) },
            (finished) => {
                if (finished) setTimeout(() => runOnJS(onDone)(), 900);
            }
        );
    }, []);

    const letters = logoText.split("");

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Waves + bubbles */}
            <WaveBackground fill={fill} duration={duration} />

            {/* Glow halos */}
            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />

            {/* ── Center content ── */}
            <View style={styles.center}>

                {/* Animated letters */}
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

                <View style={{ height: 16 }} />

                {/* Tagline */}
                <FadeSlideText
                    text={taglineText}
                    duration={duration}
                    extraDelay={0}
                />

                <View style={{ height: 8 }} />

                {/* Subtitle */}
                <SubtitleLine duration={duration} />

            </View>
        </View>
    );
};

export default DWWPSplash;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: BRAND.bg,
    },
    center: {
        position: "absolute",
        top: Platform.OS === "android" ? height * 0.37 : height * 0.37,
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
        letterSpacing: 4,
        textAlign: "center",
        includeFontPadding: false,
    },

    // Tagline
    tagline: {
        color: BRAND.tagline,
        fontSize: 15,
        fontWeight: "600",
        letterSpacing: 4,
        textTransform: "uppercase",
        textAlign: "center",
    },

    // Subtitle row
    subtitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    subtitleDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(50,194,202,0.45)",
    },
    subtitleText: {
        color: "rgba(50,194,202,0.55)",
        fontSize: 10,
        fontWeight: "500",
        letterSpacing: 1.6,
        textTransform: "uppercase",
        textAlign: "center",
    },

    // Glow halos
    glowTop: {
        position: "absolute",
        top: Platform.OS === "android" ? height * 0.27 : height * 0.27,
        alignSelf: "center",
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: BRAND.glow,
    },
    glowBottom: {
        position: "absolute",
        bottom: -80,
        alignSelf: "center",
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: "rgba(43,101,104,0.12)",
    },
});