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
    screenName: string
}
export const CustomHeader = ({ screenName }: CustomHeaderScreenProps) => {
    const { top } = useSafeAreaInsets()
    return (
        <View style={[styles.homeHeaderContainer, { paddingTop: top }]}>
            <TouchableOpacity
                onPress={() => goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Image
                    source={localImages.backArrow}
                    style={styles.backArrow}
                />
            </TouchableOpacity>
            <Text style={styles.homeHeaderText}>{screenName}</Text>
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
        alignItems: 'center'
    },
    backArrow: {
        height: vh(16),
        width: vw(16),
        tintColor: colors.white,
        marginHorizontal: vw(16)
    },
    homeHeaderText: {
        fontFamily: fonts.Bold,
        fontSize: normalize(20),
        color: colors.white,
        marginVertical: vh(6)
    },
});