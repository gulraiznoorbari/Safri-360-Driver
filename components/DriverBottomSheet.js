import { useRef, useMemo } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";

const DriverBottomSheet = () => {
    const bottomSheetRef = useRef();

    const snapPoints = useMemo(() => ["15%", "80%"], []);

    const animationConfigs = useBottomSheetSpringConfigs({
        damping: 80,
        overshootClamping: true,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        stiffness: 500,
    });

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            animationConfigs={animationConfigs}
            keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            style={styles.bottomSheetContainer}
        >
            <BottomSheetView style={styles.container}>
                <Text>Awesome 🎉</Text>
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    bottomSheetContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    container: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        backgroundColor: "#fff",
    },
});

export default DriverBottomSheet;
