import {
    StyleSheet, Text,
    View,
    Animated,
    TouchableOpacity
} from 'react-native'
import React from 'react'
import { OnlineStatus } from './components/OnlineStatus'
import LinearGradient from 'react-native-linear-gradient'
import colors from '@dwwp/utils/colors'
import fonts from '@dwwp/utils/fonts'
import { normalize, vh } from '@dwwp/utils/dimensions'

type DeviceSectionProp = {
    lastSeen: number | undefined;
    servoState: boolean;
    setIsSwitchOpen: () => void
}
const DeviceSection = ({ lastSeen, servoState, setIsSwitchOpen }: DeviceSectionProp) => {
    return (
        <View style={[styles.deviceStatusSection]}>
            {/* Section label */}
            <Text style={styles.cardTitle}>Device Status</Text>

            {/* Row: WiFi status card  +  Quick-action card */}
            <View style={styles.statusRow}>

                {/* Left – animated WiFi / online status */}
                <OnlineStatus
                    lastSeen={lastSeen}
                    onPress={() => { /* optional: navigate to device detail */ }}
                />

                {/* Right – valve state + open sheet button */}
                <TouchableOpacity
                    style={styles.valveCard}
                    onPress={() => setIsSwitchOpen()}
                    activeOpacity={0.82}
                >
                    <LinearGradient
                        colors={servoState
                            ? ['#2B6568', '#1e4a4d']
                            : ['#F4F7F8', '#EFF2F5']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.valveTop}
                    >
                        {/* Decorative blob */}
                        <View style={styles.valveBlob} />

                        <Text style={styles.valveIcon}>
                            {servoState ? '💧' : '⏸️'}
                        </Text>
                        <Text style={[styles.valveStateText, {
                            color: servoState ? '#FFFFFF' : '#041617'
                        }]}>
                            {servoState ? 'Water ON' : 'Water OFF'}
                        </Text>
                        <Text style={[styles.valveStateDesc, {
                            color: servoState ? 'rgba(255,255,255,0.65)' : '#6A7C92'
                        }]}>
                            {servoState ? 'Valve open' : 'Valve closed'}
                        </Text>

                        {/* Live pill */}
                        <View style={[styles.valvePill, {
                            backgroundColor: servoState ? 'rgba(50,194,202,0.20)' : 'rgba(0,0,0,0.06)'
                        }]}>
                            <View style={[styles.valvePillDot, {
                                backgroundColor: servoState ? '#32C2CA' : '#B0BEC5'
                            }]} />
                            <Text style={[styles.valvePillText, {
                                color: servoState ? '#32C2CA' : '#B0BEC5'
                            }]}>
                                {servoState ? 'FLOWING' : 'STOPPED'}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Bottom half: change button */}
                    <View
                        style={styles.changeBtn}
                    >
                        <Text style={styles.changeBtnIcon}>⚙️</Text>
                        <Text style={styles.changeBtnText}>Change</Text>
                    </View>

                </TouchableOpacity>
            </View>
        </View >
    )
}

export default DeviceSection

const styles = StyleSheet.create({
    deviceStatusSection: {
        backgroundColor: colors.white,
        borderRadius: normalize(20),
        padding: normalize(20),
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 3,
    },
    cardTitle: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
        color: colors.neutralBlack,
    },


    // Status row (OnlineStatus card + Valve card)
    statusRow: {
        flexDirection: 'row',
        gap: normalize(12),
        alignItems: 'stretch',
    },

    // Valve card (right side, same height as OnlineStatus)
    valveCard: {
        flex: 1,
        backgroundColor : colors.primary,
        borderRadius: normalize(22),
        overflow: 'hidden',
        shadowRadius: 12,
        elevation: 10,
    },
    valveTop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: normalize(14),
        gap: vh(4),
        position: 'relative',
        overflow: 'hidden',
    },
    valveBlob: {
        position: 'absolute',
        width: normalize(100),
        height: normalize(100),
        borderRadius: normalize(50),
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: -normalize(30),
        right: -normalize(30),
    },
    valveIcon: {
        fontSize: normalize(26),
    },
    valveStateText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
        textAlign: 'center',
    },
    valveStateDesc: {
        fontFamily: fonts.Regular,
        fontSize: normalize(10),
        textAlign: 'center',
    },
    valvePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(4),
        paddingHorizontal: normalize(9),
        paddingVertical: normalize(3),
        borderRadius: normalize(20),
        marginTop: vh(2),
    },
    valvePillDot: {
        width: normalize(5),
        height: normalize(5),
        borderRadius: normalize(3),
    },
    valvePillText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(8),
        letterSpacing: 1.1,
    },

    // Change button (bottom of valve card)
    changeBtn: {
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: normalize(6),
        paddingVertical: normalize(12),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    changeBtnIcon: {
        fontSize: normalize(14),
    },
    changeBtnText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(13),
        color: colors.primary,
    },
})