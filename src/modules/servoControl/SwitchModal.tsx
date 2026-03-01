import colors from "@dwwp/utils/colors";
import BottomSheet, { BottomSheetView, TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SwitchModalPropType = {
    handleCloseModal: () => void;
}
export default function SwitchModal({ handleCloseModal }: SwitchModalPropType) {
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
                    style={[styles.content]}
                >
                    <View>
                        <Text>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis reiciendis, perspiciatis, laudantium aut totam ullam nam impedit mollitia deleniti nihil vel dignissimos magni rem ipsam quam, voluptatem fugiat dicta hic libero illum deserunt? Veniam magni, sed tenetur quas quae accusantium optio perspiciatis eius totam neque, voluptates, maiores vero ullam distinctio reprehenderit cupiditate tempora quam architecto quod quibusdam! Culpa cumque fuga dignissimos eaque quis, amet magnam tenetur magni adipisci consectetur totam odio officiis itaque corporis et odit neque, quam eligendi vero ex sed nihil quo iusto harum. Eius eveniet praesentium ab fugiat, obcaecati eligendi quisquam quod ex possimus unde deserunt vero?
                        </Text>
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
        flex: 1
    },
    bottomSheetBackground: {

    }
})