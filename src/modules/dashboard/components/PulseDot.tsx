import { normalize } from "@dwwp/utils/dimensions";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export const PulseDot: React.FC<{ color: string; active: boolean }> = ({ color, active }) => {
    const pulse = useRef(new Animated.Value(1)).current
    useEffect(() => {
        if (!active) return
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1.9, duration: 800, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]))
        loop.start()
        return () => loop.stop()
    }, [active])
    return (
        <View style={{ width: normalize(8), height: normalize(8), alignItems: 'center', justifyContent: 'center' }}>
            {active && (
                <Animated.View style={{
                    position: 'absolute',
                    width: normalize(8), height: normalize(8),
                    borderRadius: normalize(4),
                    backgroundColor: color,
                    opacity: 0.35,
                    transform: [{ scale: pulse }],
                }} />
            )}
            <View style={{ width: normalize(6), height: normalize(6), borderRadius: normalize(3), backgroundColor: color }} />
        </View>
    )
}
