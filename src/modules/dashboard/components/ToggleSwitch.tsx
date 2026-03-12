import React, { useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@dwwp/store";
import { updateServoState } from "../servoActions";

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
    const email = useSelector((state: RootState) => state.dashboard?.userDetails?.emailId); // adjust selector to your auth slice

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

    // ── Toggle handler ─────────────────────────────────────────────────────────
    const handleToggle = useCallback(() => {
        console.log('clicking');
        
        if (!email) return;
        dispatch(updateServoState({ email, newState: !servoState }));
    }, [email, servoState, dispatch]);

    // ── Gestures ───────────────────────────────────────────────────────────────
    const tap = Gesture.Tap()
        .runOnJS(true)
        .onEnd(() => handleToggle());

    const pan = Gesture.Pan()
        // .runOnJS(true)
        .onTouchesMove(()=>{
            console.log('touching');
            
        })
        .onUpdate((e) => {
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

            if ((draggedRight && !servoState) || (draggedLeft && servoState)) {
                handleToggle();
            } else {
                // Snap back — no state change
                progress.value = withTiming(servoState ? 1 : 0, {
                    duration: DURATION,
                    easing: EASING,
                });
            }
        });

    const gesture = Gesture.Simultaneous(tap, pan);

    // ── Guards ─────────────────────────────────────────────────────────────────
    if (!email) return null;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#888" />
            </View>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <View style={styles.wrapper}>
            <GestureDetector gesture={gesture}>
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

                    {/* Sliding button */}
                    <Animated.View style={[styles.button, animatedButtonStyle]}>
                        <View style={styles.buttonDotLeft} />
                        <View style={styles.buttonDotRight} />
                    </Animated.View>
                </View>
            </GestureDetector>
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
});