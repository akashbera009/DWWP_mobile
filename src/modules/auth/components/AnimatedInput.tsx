import { Animated, Easing, StyleSheet, TextInput } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import colors from '@dwwp/utils/colors';


interface AnimatedInputProps {
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "number-pad" |"phone-pad";
    delay?: number;
    rightElement?: React.ReactNode;
    multiline?:boolean
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = "default",
    delay = 0,
    rightElement,
    multiline
}) => {
    const [focused, setFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 520,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: focused ? 1 : 0,
            duration: 220,
            useNativeDriver: false,
        }).start();
    }, [focused]);

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.primary],
    });

    const bgColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.inputBackground, colors.white],
    });

    return (
        <Animated.View
            style={[
                styles.inputWrapper,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <Animated.View
                style={[styles.inputContainer, { borderColor, backgroundColor: bgColor }]}
            >
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    placeholderTextColor={colors.placeholderText}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    multiline
                />
                {rightElement}
            </Animated.View>
        </Animated.View>
    );
};

export default AnimatedInput

const styles = StyleSheet.create({
      // Input
      inputWrapper: {
        marginBottom: 14,
      },
      inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
      },
      textInput: {
        flex: 1,
        fontSize: 15,
        color: colors.neutralBlack,
        paddingVertical: 0,
      },
})