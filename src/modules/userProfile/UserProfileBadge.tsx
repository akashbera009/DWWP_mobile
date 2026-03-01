import { Image, ImageSourcePropType, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import colors from '@dwwp/utils/colors';
import { localImages } from '@dwwp/utils/localimages';
import { strings } from '@dwwp/utils/strings';
import fonts from '@dwwp/utils/fonts';
type UserProfileBadgePropType = {
    isProfileBadgeOpen: boolean;
    onOpen: () => void
    onClose: () => void
}
type user = {
    imageUrl: ImageSourcePropType,
    name: string
    email: string
}
const UserProfileBadge = ({ isProfileBadgeOpen, onOpen, onClose }: UserProfileBadgePropType) => {
    const [userDetails, setUserDetails] = useState<user | null>(null)
    const useProfileMenuItem = [
        { title: strings.viewProfile, imageUrl: localImages.user },
        { title: strings.settings, imageUrl: localImages.settings },
        { title: strings.raiseComplaint, imageUrl: localImages.report },
        { title: strings.logout, imageUrl: localImages.logout }
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
        <>
            <Pressable
                style={styles.userPressButton}
                onPress={onOpen}
            >
                <Image source={userDetails?.imageUrl}
                    style={styles.profileImage}
                />
                <Image source={localImages.downarrow}
                    style={styles.downarrow}
                />
            </Pressable>
            {/* Modal */}
            <Modal
                transparent
                visible={isProfileBadgeOpen}
                animationType='none'
            >
                {/* Overlay */}
                <Pressable style={styles.overlay} onPress={onClose}>
                    <View
                        style={styles.expandedProfileView}
                    >
                        <View style={styles.profileSection}>
                            <Image
                                source={userDetails?.imageUrl}
                                style={styles.profileSectionImage}
                            />
                            <View style={styles.detailText}>
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
                                style={[styles.individualContainer, idx === useProfileMenuItem?.length -1  && styles.borderTop]}
                                // onPress={()=> item.pressEvent}
                                key={idx}
                            >
                                <Image source={item?.imageUrl} style={styles.clickIcon} />
                                <Text style={styles.clickText}>{item?.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}

export default UserProfileBadge

const styles = StyleSheet.create({
    userPressButton: {
        borderWidth: normalize(1),
        borderRadius: normalize(20),
        borderColor: colors.border,
        padding: normalize(2),
        flexDirection: 'row',
        alignItems: 'center'
    },
    profileImage: {
        height: vh(28),
        width: vh(28),
        borderRadius: normalize(20)
    },
    downarrow: {
        height: vh(16),
        width: vh(16),
        tintColor: colors.white,
        margin: normalize(10)
    },
    overlay: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-end",
        paddingTop: vh(50),
        paddingRight: vw(16),
    },

    expandedProfileView: {
        backgroundColor: colors.white,
        padding: vh(12),
        minWidth: vw(210),
        minHeight: vh(100),
        borderRadius: normalize(10),
        elevation: 10,
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
    detailText: {

    },
    profileSectionName: {
        fontFamily: fonts.Medium,
        fontSize: normalize(14)
    },
    profileSectionEmail: {
        fontFamily: fonts.light,
        fontSize: normalize(12)
    },
    individualContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: vh(6)
    },
    borderTop: {
        borderTopWidth: normalize(1),
        borderTopColor: colors.border,
        paddingTop : vh(10)
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
    }
})