import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import WaveBackground from '../../components/WaveBackground';
import { localImages } from '@dwwp/utils/localimages';
import { vh } from '@dwwp/utils/dimensions';

interface Props {
    lastSeen?: number;
}

export const OnlineStatus: React.FC<Props> = ({ lastSeen }) => {
    const [status, setStatus] = useState('Loading...');
    const [isOnline, setIsOnline] = useState(true)

    const scale = useSharedValue(0.8);
    const rotation = useSharedValue(0);

    // Entry animation
    useEffect(() => {
        scale.value = withSpring(1);
    }, []);

    // Infinite rotation
    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 8000 }),
            -1,
            false
        );
    }, []);

    useEffect(() => {
        if (!lastSeen) return;

        const updateStatus = () => {
            const now = Date.now();
            const diffSeconds = Math.floor((now - lastSeen) / 1000);

            if (diffSeconds < 15) {
                setStatus('🟢 Online');
            } else if (diffSeconds < 60) {
                setStatus(`🟡 ${diffSeconds} sec ago`);
            } else if (diffSeconds < 3600) {
                setStatus(`🟡 ${Math.floor(diffSeconds / 60)} min ago`);
            } else if (diffSeconds < 86400) {
                setStatus(`🟡 ${Math.floor(diffSeconds / 3600)} hrs ago`);
            } else {
                setStatus(`🔴 ${Math.floor(diffSeconds / 86400)} days ago`);
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 5000);
        return () => clearInterval(interval);
    }, [lastSeen]);

    const animatedCard = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            // { rotate: `${rotation.value}deg` }
        ],
    }));

    const animatedWave = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Pressable
            onPressIn={() => (scale.value = withSpring(1.05))}
            onPressOut={() => (scale.value = withSpring(1))}
            style={styles.cardBg}
        >
            <Animated.View style={[
                styles.card,
                animatedCard
            ]}>
                <Animated.View style={[styles.waveContainer, animatedWave]}>
                    <LinearGradient
                        colors={['#af40ff', '#5b42f3', '#00ddeb']}
                        style={styles.wave}
                    />
                </Animated.View>
                <WaveBackground />
                {/* Content */}
                <View style={styles.content}>
                    {isOnline ?
                        <Image
                            source={localImages.wifi_new_white}
                            style={styles.image}
                        />
                        :
                        <Image
                            source={localImages.wifi_disconnected}
                            style={styles.image}
                        />
                    }

                    <Text style={styles.statusText}>
                        {isOnline ? '🟢 Online' : 'Offline'}
                    </Text>

                    <Text style={styles.subText}>
                        {isOnline ? 'Device Synced' : status}
                    </Text>
                </View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    cardBg:{
        // marginTop:vh(16)
    },
    // card: {
    //     width: 200,
    //     height: 270,
    //     borderRadius: 16,
    //     overflow: 'hidden',
    //     backgroundColor: '#111',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     elevation: 8,
    // },
    card: {
        width: 220,
        height: 280,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: '#000000',
        backgroundColor: '#00000092',

    },

    waveContainer: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
    },

    wave: {
        flex: 1,
        borderRadius: 250,
        opacity: 0.6,
    },

    content: {
        flex : 1 , 
        alignItems: 'center',
        justifyContent :'center'
    },

    image: {
        height: 100,
        width: 100,
        marginVertical: 10,
    },

    statusText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },

    subText: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 8,
    },
});