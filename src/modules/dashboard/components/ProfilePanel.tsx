import { Image,  StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks'
import { logout } from '@dwwp/modules/auth/authAction'
import Avatar from './Avatar'
import { LoadingPopup } from '@dwwp/modules/auth/components/LoadingPopup'

type user = {
    fullName: string,
    emailId: string,
}
const ProfilePanel = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useAppDispatch()
    const userSelector = useAppSelector(state => state?.dashboard?.userDetails)

    type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;
    type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

    const navigation = useNavigation<MainStackNavigationProp>();
    const navigationAuth = useNavigation<RootStackNavigationProp>();

    const [userDetails, setUserDetails] = useState<user | null>(null)
    const [logouLoading, setLogOutLoading] = useState<boolean>(false)
    const useProfileMenuItem = [
        {
            title: strings.viewProfile,
            imageUrl: localImages.user,
            onClickEvent: () => {
                navigation.navigate(screenNames.ViewProfileScreen),
                    onClose?.()
            }
        },
        // { title: strings.settings, imageUrl: localImages.settings },
        { 
            title: strings.raiseComplaint,
             imageUrl: localImages.report,
              onClickEvent:()=>{
                 navigation.navigate(screenNames.RaiseComplaintScreen)
                 onClose?.()
              }
             },
        {
            title: strings.logout,
            imageUrl: localImages.logout,
            onClickEvent: async () => {
                try {
                    setLogOutLoading(true)
                    await dispatch(logout())
                    console.log('logged out succesfully');
                    navigationAuth.getParent()?.getParent()?.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: screenNames.AuthStack }],
                        })
                    )
                } catch (e) {
                    console.log('error is ', e);
                } finally {
                    setLogOutLoading(false)
                }
            }
        }
    ]

    useEffect(() => {
        if (userSelector === null) return
        setUserDetails(
            {
                fullName: userSelector?.fullName,
                emailId: userSelector?.emailId,
            }
        )
    }, []);
    return (
        <View style={[styles.dropdownPanel, { right: vw(12), width: vw(200) }]}>
            <View style={styles.profileSection}>
                <View style={styles.profileSectionImage}>
                    {userDetails?.fullName &&
                        <Avatar name={userDetails?.fullName} size={45} />
                    }
                </View>
                <View >
                    <Text style={styles.profileSectionName}>
                        {userDetails?.fullName}
                    </Text>
                    <Text style={styles.profileSectionEmail}>
                        {userDetails?.emailId}
                    </Text>
                </View> 
            </View>
            <LoadingPopup visible={logouLoading} message="Logging Out.." />
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
        marginVertical: vh(8),
        marginLeft: vw(8)
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
        justifyContent: 'center',
        alignItems: 'center'
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