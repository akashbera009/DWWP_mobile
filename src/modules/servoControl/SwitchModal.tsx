import colors from "@dwwp/utils/colors";
import BottomSheet, { BottomSheetView, TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import ToggleSwitch from "./ToggleSwitch";
import { strings } from "@dwwp/utils/strings";
import fonts from "@dwwp/utils/fonts";
import { normalize, vh, vw } from "@dwwp/utils/dimensions";
import { localImages } from "@dwwp/utils/localimages";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SwitchModalPropType = {
    handleCloseModal: () => void;
}
export default function SwitchModal({ handleCloseModal }: SwitchModalPropType) {
    const { bottom } = useSafeAreaInsets()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            // bottomSheetRef?.current?.close()
            handleCloseModal?.()
        }
    }, [],
    )
    const handleSheetClose = useCallback(async () => {
        await bottomSheetRef?.current?.close()
        setTimeout(() => {
            handleCloseModal?.()
        }, 300);
    }, [handleCloseModal])
    return (
        <>
            <View style={StyleSheet.absoluteFill}>
                <Pressable style={styles.overlay} onPress={handleSheetClose} />
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                onChange={handleSheetChanges}
                enablePanDownToClose
                backgroundStyle={styles.bottomSheetBackground}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                android_keyboardInputMode="adjustResize"
            >
                <BottomSheetView
                    style={[styles.content, { paddingBottom: bottom }]}
                >
                    <View>
                        <Text style={styles.waterControlheader}>{strings.waterControlheader}</Text>
                        <ToggleSwitch userId="ab@gmail.com" />
                        <Text style={styles.waterControlDescription}>{strings.waterControlDescription}</Text>
                        <View style={styles.infoContainer}>
                            <Image source={localImages.info}
                                style={styles.infoIcon} />
                            <Text style={styles.waterControlDescriptionInfo}>{strings.waterControlDescriptionInfo}</Text>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheet>

        </>
    )
}
const styles = StyleSheet.create({
    overlay: {
        backgroundColor: colors.transparentBackground07,
        flexGrow: 1
    },
    content: {
        flex: 1,
    },
    bottomSheetBackground: {

    },
    waterControlheader: {
        fontFamily: fonts.Bold,
        fontSize: normalize(18),
        textAlign: 'center',
        color: colors.primary
    },
    waterControlDescription: {
        fontFamily: fonts.Regular,
        fontSize: normalize(14),
        textAlign: 'center',
        color: colors.secondary,
        marginHorizontal: vw(16)
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: vw(30)
    },
    infoIcon: {
        height: vh(20),
        width: vh(20),
        tintColor: colors.warning
    },
    waterControlDescriptionInfo: {
        fontFamily: fonts.Medium,
        fontSize: normalize(10),
        color: colors.warning,
        textAlign: 'left',
        marginHorizontal: vw(8)
    },
})