import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolateColor,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

// Firebase imports — adjust paths as needed
// import { db } from "../../firebaseConfig";
import {
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";

// ─── Constants ────────────────────────────────────────────────────────────────
const SWITCH_WIDTH = 240;
const SWITCH_HEIGHT = SWITCH_WIDTH / 2.5;
const BUTTON_WIDTH = SWITCH_WIDTH * 0.55;
const BUTTON_HEIGHT = SWITCH_HEIGHT * 0.8;
const DURATION = 400;
const EASING = Easing.bezier(0, 0, 0, 1);

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToggleSwitchProps {
    userId: string | undefined;
    disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ userId, disabled }) => {
    // ── State ──────────────────────────────────────────────────────────────────
    const [servoState, setServoState] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    const [totalUsage, setTotalUsage] = useState(0);
    const [limitBYUser, setLimitByUser] = useState(0);
    const [penaltyLimit, setPenaltyLimit] = useState(0);
    const [addedLimit, setAddedLimit] = useState(0);

    // ── Animation ──────────────────────────────────────────────────────────────
    // progress: 0 = OFF (left), 1 = ON (right)
    const progress = useSharedValue(0);

    useEffect(() => {
        if (servoState !== null) {
            progress.value = withTiming(servoState ? 1 : 0, {
                duration: DURATION,
                easing: EASING,
            });
        }
    }, [servoState]);

    // Button slides from left: 5% to 40% of switch width
    const buttonLeft_OFF = SWITCH_WIDTH * 0.05;
    const buttonLeft_ON = SWITCH_WIDTH * 0.40;

    const animatedButtonStyle = useAnimatedStyle(() => ({
        left: buttonLeft_OFF + progress.value * (buttonLeft_ON - buttonLeft_OFF),
    }));

    const animatedLeftIndicatorStyle = useAnimatedStyle(() => ({
        opacity: 1,
        // Active (pressed-in) = servoState ON → left indicator NOT active
        shadowOpacity: withTiming(progress.value === 0 ? 0 : 0, { duration: DURATION }),
    }));

    const animatedRightIndicatorStyle = useAnimatedStyle(() => ({
        opacity: 1,
    }));

    // Left indicator color: when ON → orange glow; when OFF → pressed in shadow
    const animatedLeftBgStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ["hsl(22, 20%, 75%)", "hsl(22, 90%, 55%)"]
        ),
    }));

    const animatedRightBgStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ["hsl(220, 20%, 70%)", "hsl(220, 20%, 85%)"]
        ),
    }));

    // ── Derived ─────────────────────────────────────────────────────────────────
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}-${month}`;

    const cutoffLimit = limitBYUser + penaltyLimit + addedLimit;
    const limitReached = totalUsage >= cutoffLimit && cutoffLimit > 0;

    // ── Firestore refs ──────────────────────────────────────────────────────────
    const servoDocRef = userId
    //   ? doc(db, "users", userId) : 
    null;
    const addonDocRef = userId
    // ? doc(db, `users/${userId}/monthlyUsages/${yearMonth}/addon/addon_details`)
    // :
    null;
    const usageDocRef = userId
    // ? doc(db, "users", userId, "monthlyUsages", yearMonth)
    // : 
    null;

    // ── Fetch servo state + realtime listener ───────────────────────────────────
    useEffect(() => {
        if (!userId || !servoDocRef) return;

        const fetchInitial = async () => {
            try {
                // const snap = await getDoc(servoDocRef);
                // if (snap.exists()) setServoState(snap.data().servoState ?? false);
            } catch (e) {
                console.error("Error fetching servo state:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchInitial();

        // const unsub = onSnapshot(servoDocRef, (snap) => {
        //   if (snap.exists()) setServoState(snap.data().servoState ?? false);
        // });

        // return unsub;
    }, [userId]);

    // ── Fetch addon/added limit ──────────────────────────────────────────────────
    useEffect(() => {
        if (!userId || !addonDocRef) return;

        const fetchAddon = async () => {
            try {
                // const snap = await getDoc(addonDocRef);
                // if (snap.exists()) setAddedLimit(snap.data().added_limit ?? 0);
            } catch (e) {
                console.error("Error fetching addedLimit:", e);
            }
        };

        fetchAddon();
    }, [userId, limitBYUser]);

    // ── Real-time usage + limit listeners ───────────────────────────────────────
    useEffect(() => {
        if (!userId || !usageDocRef) return;

        const day = String(now.getDate()).padStart(2, "0");
        const today = `${year}-${month}-${day}`;

        // const unsubUsage = onSnapshot(usageDocRef, (snap) => {
        //   if (snap.exists()) {
        //     const data = snap.data();
        //     const total = Object.entries(data)
        //       .filter(([key]) => key.startsWith(yearMonth))
        //       .reduce((sum, [, val]) => sum + (Number(val) || 0), 0);

        //     setLimitByUser(data.limit ?? 0);
        //     setTotalUsage(total);
        //   }
        // });

        // const unsubLimit = onSnapshot(doc(db, "admin", "limit"), (snap) => {
        //   if (snap.exists()) {
        //     const data = snap.data();
        //     setPenaltyLimit(data.penalty ?? 0);
        //   }
        // });

        return () => {
            //   unsubUsage();
            //   unsubLimit();
        };
    }, [userId]);

    // ── Auto-disable when limit exceeded ────────────────────────────────────────
    useEffect(() => {
        if (!servoDocRef) return;
        if (limitReached && servoState !== false) {
            //   updateDoc(servoDocRef, { servoState: false })
            //     .then(() => setServoState(false))
            //     .catch((e) => console.error("Auto-disable failed:", e));
        }
    }, [totalUsage, limitBYUser, penaltyLimit, addedLimit]);

    // ── Toggle handler ──────────────────────────────────────────────────────────
    const handleToggle = useCallback(async () => {
        if (disabled || limitReached || !servoDocRef) return;
        const newState = !servoState;
        try {
            //   await updateDoc(servoDocRef, { servoState: newState });
            setServoState(newState);
        } catch (e) {
            console.error("Error toggling servo:", e);
        }
    }, [disabled, limitReached, servoState, servoDocRef]);

    // ── Tap gesture ─────────────────────────────────────────────────────────────
    const PAN_THRESHOLD = SWITCH_WIDTH * 0.2

    const tap = Gesture.Tap()
        .runOnJS(true)
        .onEnd(() => {
            handleToggle();
        });
    const pan = Gesture.Pan()
        .runOnJS(true)
        .onUpdate((e) => {
            // Animate the button following the finger, clamped to valid range
            const base = servoState ? buttonLeft_ON : buttonLeft_OFF;
            const clamped = Math.min(
                Math.max(base + e.translationX, buttonLeft_OFF),
                buttonLeft_ON
            );
            progress.value = (clamped - buttonLeft_OFF) / (buttonLeft_ON - buttonLeft_OFF);
        })
        .onEnd((e) => {
            const draggedRight = e.translationX > PAN_THRESHOLD;
            const draggedLeft = e.translationX < -PAN_THRESHOLD;

            if (draggedRight && !servoState) {
                handleToggle(); // turn ON
            } else if (draggedLeft && servoState) {
                handleToggle(); // turn OFF
            } else {
                // Snap back to current state — no change
                progress.value = withTiming(servoState ? 1 : 0, {
                    duration: DURATION,
                    easing: EASING,
                });
            }
        });
    const gesture = Gesture.Simultaneous(tap, pan);

    // ── Guard ───────────────────────────────────────────────────────────────────
    if (!userId) return null;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#888" />
            </View>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <View style={styles.wrapper}>
            <GestureDetector gesture={gesture}>
                <View
                    style={[
                        styles.switchTrack,
                        (disabled || limitReached) && styles.switchDisabled,
                    ]}
                >
                    {/* Left indicator (ON / orange) */}
                    <Animated.View
                        style={[styles.indicator, styles.indicatorLeft, animatedLeftBgStyle]}
                    />

                    {/* Right indicator (OFF / grey) */}
                    <Animated.View
                        style={[styles.indicator, styles.indicatorRight, animatedRightBgStyle]}
                    />

                    {/* Sliding button */}
                    <Animated.View style={[styles.button, animatedButtonStyle]}>
                        <View style={styles.buttonDotLeft} />
                        <View style={styles.buttonDotRight} />
                    </Animated.View>
                </View>
            </GestureDetector>

            {!limitReached && ( // need change 
                <View style={styles.limitBanner}>
                    <Text style={styles.limitText}>
                        Water usage limit reached. Control disabled.
                    </Text>
                </View>
            )}
        </View>
    );
};

export default ToggleSwitch;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        marginVertical: 16,
        marginHorizontal: 8,
    },
    loadingContainer: {
        height: SWITCH_HEIGHT + 32,
        justifyContent: "center",
        alignItems: "center",
    },

    // ── Track ──────────────────────────────────────────────────────────────────
    switchTrack: {
        position: "relative",
        width: SWITCH_WIDTH,
        height: SWITCH_HEIGHT,
        borderRadius: SWITCH_WIDTH,
        backgroundColor: "hsl(220, 20%, 87%)",
        alignItems: "center",
        justifyContent: "center",
        // Neumorphic inset shadow (approximated with border)
        shadowColor: "hsl(220, 20%, 60%)",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 0,
        borderWidth: 1,
        borderColor: "hsl(220, 20%, 80%)",
    },
    switchDisabled: {
        opacity: 0.55,
    },

    // ── Indicators ─────────────────────────────────────────────────────────────
    indicator: {
        position: "absolute",
        width: "40%",
        height: "60%",
        borderRadius: 100,
    },
    indicatorLeft: {
        left: "10%",
        borderTopLeftRadius: 100,
        borderBottomLeftRadius: 100,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    indicatorRight: {
        right: "10%",
        borderTopRightRadius: 100,
        borderBottomRightRadius: 100,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        backgroundColor: "hsl(220, 20%, 70%)",
    },

    // ── Button ─────────────────────────────────────────────────────────────────
    button: {
        position: "absolute",
        zIndex: 1,
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        borderRadius: 100,
        backgroundColor: "hsl(220, 20%, 88%)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: "6%",
        // Shadow
        shadowColor: "hsl(220, 18%, 45%)",
        shadowOffset: { width: 4, height: 8 },
        shadowOpacity: 0.55,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonDotLeft: {
        width: "38%",
        aspectRatio: 1,
        borderRadius: 100,
        backgroundColor: "hsl(220, 20%, 92%)",
        shadowColor: "hsl(220, 20%, 75%)",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
    },
    buttonDotRight: {
        width: "38%",
        aspectRatio: 1,
        borderRadius: 100,
        backgroundColor: "hsl(220, 20%, 88%)",
        shadowColor: "hsl(220, 20%, 65%)",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
    },

    // ── Limit banner ───────────────────────────────────────────────────────────
    limitBanner: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "#ffe5e5",
        borderColor: "#ff4d4d",
        borderWidth: 1,
        borderRadius: 6,
        maxWidth: 300,
    },
    limitText: {
        color: "#b30000",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
});