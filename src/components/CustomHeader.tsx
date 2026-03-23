import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
// custom imports
import colors from '@dwwp/utils/colors';
import { normalize, vh, vw } from '@dwwp/utils/dimensions';
import fonts from '@dwwp/utils/fonts';
import { goBack } from '@dwwp/utils/navigationService';
import { localImages } from '@dwwp/utils/localimages';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CustomHeaderScreenProps = {
    screenName: string,
    subTitle?: string
}
export const CustomHeader = ({ screenName, subTitle }: CustomHeaderScreenProps) => {
    const { top } = useSafeAreaInsets()
    return (
        <View style={[styles.homeHeaderContainer, { paddingTop: top }]}>
            <TouchableOpacity
                onPress={() => goBack()}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                style={{marginLeft: vw(2)}}
            >
                <Image
                    source={localImages.backArrow}
                    style={styles.backArrow}
                />
            </TouchableOpacity>
            <View
                style={styles.titleBox}>
                <Text style={styles.homeHeaderText}>{screenName}</Text>
                {subTitle && (
                    <Text style={styles.subTitleText}>{subTitle}</Text>
                )}
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
    homeHeaderContainer: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backArrow: {
        height: vh(16),
        width: vw(16),
        tintColor: colors.white,
        marginHorizontal: vw(16)
    },
    titleBox:{
        marginVertical: vh(8),
    },
    homeHeaderText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(20),
        color: colors.white,
    },
    subTitleText: {
        fontFamily: fonts.Regular,
        fontSize: normalize(12),
        color: colors.white,
        position : 'relative',
        top : vh(-2)
    }
});