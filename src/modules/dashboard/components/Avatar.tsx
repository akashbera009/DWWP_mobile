import { Image, StyleSheet, Text } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient';
import fonts from '@dwwp/utils/fonts';
import { useAppSelector } from '@dwwp/store/hooks';
import { normalize } from '@dwwp/utils/dimensions';
const colors = {
    primary: '#2B6568',
    primaryLight: 'rgba(43,101,104,0.12)',
    primaryDark: '#1e4a4d',
    activeDot: '#32C2CA',
    activeDotLight: 'rgba(50,194,202,0.18)',
    lightGreen: 'rgba(50,194,202,0.08)',
    white: '#FFFFFF',
    neutralBlack: '#041617',
    neutralBodyText: '#6A7C92',
    background: '#F4F7F8',
    border: '#E1E8ED',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    lightGray: '#F8F9FA',
    inputBackground: '#EFF2F5',
    shadow: 'rgba(43,101,104,0.10)',
    cardShadow: 'rgba(43,101,104,0.08)',
}
const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const profileImage = useAppSelector(s => s.dashboard.userDetails?.profileImage) ?? ''
    return (
        <LinearGradient
            colors={[colors.activeDot, colors.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        >
            {profileImage ? (
                <Image
                    src={profileImage}
                    style={styles.avatarImage}
                />
            ) : (
                <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
            )}
        </LinearGradient>
    )
}


export default Avatar

const styles = StyleSheet.create({

    // Avatar
    avatarImage: {
        height: '100%',
        width: '100%',
        borderRadius: 100
    },
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: fonts.Bold,
        color: colors.white,
        letterSpacing: 0.5,
    },
})