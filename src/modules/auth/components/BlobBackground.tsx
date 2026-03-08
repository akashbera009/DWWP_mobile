import { StyleSheet, Text, View, Animated, Easing } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { screenHeight, screenWidth } from '@dwwp/utils/dimensions';
import colors from '@dwwp/utils/colors';

const height = screenHeight
const width = screenWidth
const BlobBackground: React.FC = () => {
    const blob1 = useRef(new Animated.Value(0)).current;
    const blob2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blob1, {
                    toValue: 1,
                    duration: 4200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(blob1, {
                    toValue: 0,
                    duration: 4200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(blob2, {
                    toValue: 1,
                    duration: 5800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(blob2, {
                    toValue: 0,
                    duration: 5800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View
                style={[
                    styles.blob,
                    styles.blob1,
                    {
                        transform: [
                            {
                                translateY: blob1.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 18],
                                }),
                            },
                            {
                                scale: blob1.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.06],
                                }),
                            },
                        ],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.blob,
                    styles.blob2,
                    {
                        transform: [
                            {
                                translateY: blob2.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -14],
                                }),
                            },
                            {
                                scale: blob2.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.08],
                                }),
                            },
                        ],
                    },
                ]}
            />
        </View>
    );
};


export default BlobBackground

const styles = StyleSheet.create({
    // Blobs
    blob: {
        position: "absolute",
        borderRadius: 999,
        opacity: 0.13,
    },
    blob1: {
        width: width * 0.85,
        height: width * 0.85,
        backgroundColor: colors.primary,
        top: -width * 0.28,
        right: -width * 0.22,
    },
    blob2: {
        width: width * 0.65,
        height: width * 0.65,
        backgroundColor: colors.secondary,
        bottom: -width * 0.18,
        left: -width * 0.2,
    },

})