import { ImageBackground, ScrollView, StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React, { useState } from 'react'
import { HomeHeader } from '@dwwp/components/HomeHeader'
import colors from '@dwwp/utils/colors'
import { strings } from '@dwwp/utils/strings'
import fonts from '@dwwp/utils/fonts'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { OnlineStatus } from './OnlineStatus'
import UsagesComponent from './UsagesComponent'
import FixedPricesComponent from './FixedPricesComponent'
import UserProfileBadge from '../userProfile/UserProfileBadge'
import { CustomButton } from '@dwwp/components/CustomButton'
import { Portal } from '@gorhom/portal'
import SwitchModal from '../servoControl/SwitchModal'
import { showSnackbar } from '@dwwp/utils/showSnackBar'
import { localImages } from '@dwwp/utils/localimages'
import NotificationComponent from './NotificationComponent'

const DashBoardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isProfileBadgeOpen, setIsProfileBadgeOpen] = useState<boolean>(false)
    const [isNotificationTabOpen, setIsNotificationTabOpen] = useState<boolean>(false)
    return (
        <View style={styles.container}>
            <View style={styles.homeHeaderContainer}>
                <View style={styles.logoContainer}>
                    <Image source={localImages.dwwp_logo} style={styles.logo} />
                    <Text style={styles.homeHeaderText}>{strings.dwwp}</Text>
                </View>
                <View style={styles.profileContainer}>
                    < NotificationComponent
                        isNotificationTabOpen={isNotificationTabOpen}
                        onClose={() => setIsNotificationTabOpen(false)}
                        onOpen={() => setIsNotificationTabOpen(true)}
                    />
                    <UserProfileBadge
                        onClose={() => setIsProfileBadgeOpen(false)}
                        onOpen={() => setIsProfileBadgeOpen(true)}
                        isProfileBadgeOpen={isProfileBadgeOpen}
                    />
                </View>
            </View>
            <View style={styles.scrollContainer}>
                <ScrollView>
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>Welcome Back Akash Bera </Text>
                        <Text style={[styles.welcomeText, { color: colors.black }]}>x </Text>
                    </View>

                    <UsagesComponent />
                    <FixedPricesComponent />

                    <View style={styles.sectionHeader}>
                        <Text style={styles.userDashBoardHeader}>{strings.deviceControl}</Text>
                        <Image source={localImages.backArrow} style={styles.sectionHeaderBackArrow} />
                    </View>
                    <View style={styles.deviceControlSection}>
                        <OnlineStatus />
                        <View style={styles.deviceControlRightSection}>
                            <CustomButton
                                title='open sheet'
                                onPress={() => setIsModalOpen(prev => !prev)}
                                variant='secondary'
                            />
                            <CustomButton
                                title='call toaster '
                                onPress={() => {
                                    showSnackbar({ message: 'hi', type: 'success' })
                                }}
                                style={{ marginTop: vh(10) }}
                                variant='outline'
                            />
                        </View>
                    </View>

                </ScrollView>

                {/* portals  */}
                <Portal hostName='safe'>
                    {isModalOpen &&
                        <SwitchModal handleCloseModal={() => setIsModalOpen(false)} />
                    }
                </Portal>
            </View>
        </View>
    )
}

export default DashBoardPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // flexGrow : 1 , 
    },
    homeHeaderContainer: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profileContainer: {
        marginRight: vw(16),
        flexDirection: 'row',
        alignItems: 'center'
    },
    logoContainer:{
        flexDirection : 'row', 
        alignItems : 'center'
    },
    logo: {
        height: vh(30),
        width: vw(30),
        resizeMode: 'contain',
        borderRadius : normalize(10),
        marginLeft: vw(16)
    },
    homeHeaderText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(24),
        color: colors.white,
        marginHorizontal: vw(8),
        marginVertical: vh(6)
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: vh(50)// unnecessary 
    },
    welcomeContainer: {
        backgroundColor: colors.lightGreen,
        marginHorizontal: vw(16),
        marginVertical: vh(10),
        padding: normalize(10),
        borderRadius: normalize(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    welcomeText: {
        fontFamily: fonts.Medium,
        fontSize: normalize(16),
        color: colors.primary
    },
    sectionHeader: {
        marginVertical: vh(8),
        flexDirection: 'row',
        alignItems: 'center'
    },
    userDashBoardHeader: {
        fontFamily: fonts.Bold,
        fontSize: normalize(16),
        color: colors.primary,
        marginHorizontal: vw(16)
    },
    sectionHeaderBackArrow: {
        transform: [{ rotate: '180deg' }]
    },
    deviceControlSection: {
        flexDirection: 'row',
        marginHorizontal: vw(16),
        marginVertical: vh(8)
    },
    deviceControlRightSection: {
        margin: normalize(8)
    }
})