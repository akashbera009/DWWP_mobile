import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import React from 'react';
// custom imports
import { localImages } from '@dwwp/utils/localImages';
import colors from '@dwwp/utils/colors';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import fonts from '@dwwp/utils/fonts';
// import { useAppSelector } from '@dwwp/utils/hooks';
import { strings } from '@dwwp/utils/strings';
import { useNavigation } from '@react-navigation/native';
import { screenNames } from '@dwwp/utils/screenNames';

export const HomeHeader = () => {
    //   const auth = useAppSelector(s => s.auth);
    //   const userData = auth?.profile;
    const userData = {
addresses : [{address1:'address'}]
    }
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                <View style={styles.leftIconContainer}>
                    {/* <Image source={localImages.locationMarker} style={styles.marker} /> */}
                </View>
            </View>
            <View style={styles.textContainer}>
                <Pressable
                    style={styles.headingContainer}
                    // onPress={() => navigation.navigate(screenNames.SelectAddress)}
                >
                    <Text style={styles.heading} numberOfLines={1}>
                        {userData?.addresses?.[0]?.address1 ?? strings.address}
                    </Text>
                    {/* <Image source={localImages.downArrow} style={styles.arrow} /> */}
                </Pressable>
                <Text style={styles.subHeading} numberOfLines={1}>
                    {userData?.addresses?.length === 0
                        && strings.noLocationProvided
                        // : userData?.addresses?.[0]?.address_mode === 'PINNED'
                        //     ? userData?.addresses?.[0]?.address2
                        //     : userData?.addresses?.[0]?.address2 !== ''
                        //         ? userData?.addresses?.[0]?.address2
                        //         : userData?.addresses?.[0]?.state || ''
                        }
                </Text>
            </View>
            <View style={styles.rightContainer}>
                <Pressable style={styles.iconContainer}>
                    {/* <Image source={localImages.groupOrderIcon} style={styles.rightIcon} /> */}
                </Pressable>
                <Pressable style={[styles.iconContainer, styles.iconStyle]}>
                    <Image
                        // source={localImages.notificationIcon}
                        // style={styles.rightIcon}
                    />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: vh(16),
        paddingHorizontal: vw(16),
        backgroundColor: colors.primary
    },
    leftContainer: {
        flex: 0.08,
    },
    rightContainer: {
        flexDirection: 'row',
        flex: 0.3,
        justifyContent: 'flex-end',
        marginLeft: vw(15),
    },
    leftIconContainer: {
        backgroundColor: colors.helpIconBackground,
        borderRadius: normalize(50),
        alignItems: 'center',
        width: vw(24),
        height: vh(24),
        marginTop: vh(2),
    },
    textContainer: {
        marginLeft: vw(8),
        flex: 0.62,
    },
    iconContainer: {
        backgroundColor: colors.helpIconBackground,
        borderRadius: normalize(50),
        alignItems: 'center',
    },
    marker: {
        width: vw(14),
        height: vh(14),
        margin: normalize(5),
    },
    rightIcon: {
        width: vw(24),
        height: vh(24),
        margin: normalize(8),
    },
    iconStyle: {
        marginLeft: vw(8),
    },
    headingContainer: { flexDirection: 'row', alignItems: 'center' },
    heading: {
        fontSize: normalize(16),
        fontFamily: fonts.Medium,
        color: colors.neutralBlack,
    },
    subHeading: {
        fontSize: normalize(12),
        fontFamily: fonts.Regular,
        color: colors.neutralBodyText,
        marginTop: vh(2),
    },
    arrow: {
        width: vw(16),
        height: vh(16),
        marginLeft: vw(2),
    },
});