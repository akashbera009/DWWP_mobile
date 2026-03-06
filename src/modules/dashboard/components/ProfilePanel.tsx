import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import colors from '@dwwp/utils/colors'
import fonts from '@dwwp/utils/fonts'

import { MainStackParamList, RootStackParamList } from '@dwwp/utils/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions, useNavigation } from '@react-navigation/native'
import { strings } from '@dwwp/utils/strings'
import { localImages } from '@dwwp/utils/localimages'
import { screenNames } from '@dwwp/utils/screenNames'
import mmkvStorage from '@dwwp/utils/mmkvStorage'

type user = {
    imageUrl: ImageSourcePropType,
    name: string
    email: string
}
const ProfilePanel = ({ onClose }: { onClose: () => void }) => {
    type MainStackNavigationProp =
        NativeStackNavigationProp<MainStackParamList>;

    type RootStackNavigationProp =
        NativeStackNavigationProp<RootStackParamList>;
    const navigation = useNavigation<MainStackNavigationProp>();
    const navigationAuth = useNavigation<RootStackNavigationProp>();

    const [userDetails, setUserDetails] = useState<user | null>(null)
    const useProfileMenuItem = [
        {
            title: strings.viewProfile,
            imageUrl: localImages.user,
            onClickEvent: () => {
                navigation.navigate(screenNames.ViewProfileScreen),
                    onClose?.()
            }
        },
        { title: strings.settings, imageUrl: localImages.settings },
        { title: strings.raiseComplaint, imageUrl: localImages.report },
        {
            title: strings.logout,
            imageUrl: localImages.logout,
            onClickEvent: async () => {
                await mmkvStorage.setItem("USER_EMAIL", '');
                console.log('userEmail cleared to space');

                navigationAuth.getParent()?.getParent()?.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: screenNames.AuthStack }],
                    })
                )
                // navigationAuth.navigate(screenNames.AuthStack, {
                //     screen: screenNames.LoginScreen
                // })
            }
        }
    ]

    useEffect(() => {
        setUserDetails(
            {
                name: 'Akash Bera',
                email: 'ab@gmail.com',
                imageUrl: {
                    uri: 'https://imgs.search.brave.com/jVFBSCsWLVIm0V_8EDl9hAXC4cnGgQ34Djm_UIm_EZU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA2LzI0LzY5LzM3/LzM2MF9GXzYyNDY5/Mzc3Ml9OYUczUEU3/U1JBcUhBU3VJVGg3/QWVFNWU1MnE0Z0VQ/eS5qcGc'
                }
            });
    }, []);
    return (
        <View style={[styles.dropdownPanel, { right: vw(12), width: vw(200) }]}>
            {/* <View style={[styles.dropdownHeader, { gap: normalize(10) }]}>
                <Avatar name="Akash Bera" size={40} />
                <View>
                    <Text style={styles.dropdownTitle}>Akash Bera</Text>
                    <Text style={styles.cardSubtitle}>Admin</Text>
                </View>
            </View> */}
            <View style={styles.profileSection}>
                <Image
                    source={userDetails?.imageUrl}
                    style={styles.profileSectionImage}
                />
                <View >
                    <Text style={styles.profileSectionName}>
                        {userDetails?.name}
                    </Text>
                    <Text style={styles.profileSectionEmail}>
                        {userDetails?.email}
                    </Text>
                </View>
            </View>
            {useProfileMenuItem.map((item, idx) => (
                <TouchableOpacity
                    style={[styles.individualContainer, idx === useProfileMenuItem?.length - 1 && styles.borderTop]}
                    onPress={() => item?.onClickEvent?.()}
                    key={idx}
                >
                    <Image source={item?.imageUrl} style={styles.clickIcon} />
                    <Text style={styles.clickText}>{item?.title}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}
export default ProfilePanel

const styles = StyleSheet.create({
    dropdownPanel: {
        position: 'absolute',
        top: normalize(90),
        right: vw(30), 
        backgroundColor: colors.white,
        padding: vh(12),
        minWidth: vw(210),
        minHeight: vh(100),
        borderRadius: normalize(10),
        elevation: 10,

    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: normalize(14),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dropdownTitle: {
        fontFamily: fonts.Bold,
        fontSize: normalize(14),
        color: colors.neutralBlack,
    },
    cardSubtitle: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.neutralBodyText,
        marginTop: vh(2),
    },
    profileMenuItem: {
        padding: normalize(12),
    },
    profileMenuText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(13),
        color: colors.neutralBlack,
    },
    individualContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: vh(6)
    },
    borderTop: {
        borderTopWidth: normalize(1),
        borderTopColor: colors.border,
        paddingTop: vh(10)
    },
    clickText: {
        fontSize: normalize(14),
        color: colors.primary,
        fontFamily: fonts.Regular
    },
    clickIcon: {
        height: vh(16),
        width: vh(16),
        tintColor: colors.primary,
        marginRight: vw(10)
    },
    profileSection: {
        flexDirection: 'row',
        paddingVertical: vh(8),
        borderBottomWidth: normalize(1),
        borderBottomColor: colors.border
    },
    profileSectionImage: {
        height: vh(45),
        width: vh(45),
        borderWidth: normalize(1),
        borderRadius: normalize(30),
        borderColor: colors.primary,
        marginRight: normalize(10),
    },
    profileSectionName: {
        fontFamily: fonts.Medium,
        fontSize: normalize(14)
    },
    profileSectionEmail: {
        fontFamily: fonts.light,
        fontSize: normalize(12)
    },

})