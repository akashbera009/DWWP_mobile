import React, { useEffect, useCallback, useRef, useState } from "react";
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Pressable,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolateColor,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@dwwp/store";
import { updateServoState } from "../servoActions";
import { showSuccessSnackbar, showWarningSnackbar } from "@dwwp/utils/showSnackBar";

// ─── Constants ────────────────────────────────────────────────────────────────
const SWITCH_WIDTH = 240;
const SWITCH_HEIGHT = SWITCH_WIDTH / 2.5;
const BUTTON_WIDTH = SWITCH_WIDTH * 0.55;
const BUTTON_HEIGHT = SWITCH_HEIGHT * 0.8;
const DURATION = 400;
const EASING = Easing.bezier(0, 0, 0, 1);
const PAN_THRESHOLD = SWITCH_WIDTH * 0.2;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToggleSwitchProps {
    disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ disabled = false }) => {
    const dispatch = useDispatch<AppDispatch>();

    // ── Redux state ────────────────────────────────────────────────────────────
    const { servoState, isLoading } = useSelector((state: RootState) => state.servo);
    const email = useSelector((state: RootState) => state.dashboard?.userDetails?.emailId);

    // ── Animation ──────────────────────────────────────────────────────────────
    const progress = useSharedValue(servoState ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming(servoState ? 1 : 0, {
            duration: DURATION,
            easing: EASING,
        });
    }, [servoState]);

    const buttonLeft_OFF = SWITCH_WIDTH * 0.05;
    const buttonLeft_ON = SWITCH_WIDTH * 0.40;

    const animatedButtonStyle = useAnimatedStyle(() => ({
        left: buttonLeft_OFF + progress.value * (buttonLeft_ON - buttonLeft_OFF),
    }));

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
    // ── Refs ───────────────────────────────────────────────────────────────────
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isEligibleRef = useRef<boolean>(true)
    const servoStateRef = useRef<boolean>(servoState)

    useEffect(() => {
        servoStateRef.current = servoState
    }, [servoState])

    // ── Shared toggle logic (refs only, no closure issues) ─────────────────────
    const executeToggle = () => {
        if (disabled || !email) return

        if (!isEligibleRef.current) {
            showWarningSnackbar('Too many requests in short time')
            progress.value = withTiming(servoStateRef.current ? 1 : 0, {
                duration: DURATION,
                easing: EASING,
            })
            return
        }

        isEligibleRef.current = false
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            isEligibleRef.current = true
        }, 1500)

        const newState = !servoStateRef.current
        dispatch(updateServoState({ email, newState }))
        showSuccessSnackbar(`Water Supply ${newState ? 'Activated' : 'De-Activated'}`)
    }

    // ── Gestures ───────────────────────────────────────────────────────────────
    const pan = Gesture.Pan()
        .runOnJS(true)
        .onUpdate((e) => {
            const base = servoStateRef.current ? buttonLeft_ON : buttonLeft_OFF
            const clamped = Math.min(
                Math.max(base + e.translationX, buttonLeft_OFF),
                buttonLeft_ON
            )
            progress.value = (clamped - buttonLeft_OFF) / (buttonLeft_ON - buttonLeft_OFF)
        })
        .onEnd((e) => {
            const draggedRight = e.translationX > PAN_THRESHOLD
            const draggedLeft = e.translationX < -PAN_THRESHOLD
            const wasTap = Math.abs(e.translationX) < 10 && Math.abs(e.translationY) < 10

            const shouldToggle =
                wasTap ||
                (draggedRight && !servoStateRef.current) ||
                (draggedLeft && servoStateRef.current)

            if (shouldToggle) {
                executeToggle()
            } else {
                progress.value = withTiming(servoStateRef.current ? 1 : 0, {
                    duration: DURATION,
                    easing: EASING,
                })
            }
        })

    if (!email) return null;
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#888" />
            </View>
        );
    }
    return (
        <View style={styles.wrapper}>
            <Pressable onPress={executeToggle}>
                <GestureDetector gesture={pan}>
                    <View
                        style={[
                            styles.switchTrack,
                            disabled && styles.switchDisabled,
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

                        {/* Sliding button — last child, always paints above indicators */}
                        <Animated.View style={[styles.button, animatedButtonStyle]}>
                            <View style={styles.buttonDotLeft} />
                            <View style={styles.buttonDotRight} />
                        </Animated.View>
                    </View>
                </GestureDetector>
            </Pressable>
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
        // zIndex removed — last-child paint order handles layering cleanly
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        borderRadius: 100,
        backgroundColor: "hsl(220, 20%, 88%)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: "6%",
        shadowColor: "hsl(220, 18%, 45%)",
        shadowOffset: { width: 4, height: 8 },
        shadowOpacity: 0.55,
        shadowRadius: 10,
        elevation: 8,        // raises button above indicators on Android
        overflow: "visible", // prevents dot clipping
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
        // Darker than left dot so it's visually distinct from the button bg
        backgroundColor: "hsl(220, 15%, 78%)",
        shadowColor: "hsl(220, 20%, 55%)",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },
});