import { useRef, useMemo, useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform, Linking } from "react-native";
import { Skeleton } from "@rneui/themed";
import { Divider } from "react-native-elements";
import { useSelector } from "react-redux";
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue } from "firebase/database";

import { dbRealtime } from "../firebase/config";
import { humanPhoneNumber } from "../utils/humanPhoneNumber";
import { selectDriver } from "../store/slices/driverSlice";

const DriverBottomSheet = () => {
    const [rideCustomerInfo, setRideCustomerInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const bottomSheetRef = useRef();
    const driver = useSelector(selectDriver);

    const snapPoints = useMemo(() => ["15%", "55%"], []);

    const animationConfigs = useBottomSheetSpringConfigs({
        damping: 80,
        overshootClamping: true,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        stiffness: 500,
    });

    useEffect(() => {
        if (driver.rideAssigned) {
            const userRef = ref(dbRealtime, "Users/" + driver.rideData.customerID);
            onValue(userRef, (snapshot) => {
                const data = snapshot.val();
                setRideCustomerInfo({ userName: data.userName, phoneNumber: data.phoneNumber });
                setLoading(false);
            });
        }
    }, [driver.rideAssigned]);

    const callUser = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

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
                {loading && driver.rideAssigned ? (
                    <View style={styles.loadingContainer}>
                        <Skeleton animation="pulse" width="90%" height="50" skeletonStyle={styles.skeletonStyle} />
                    </View>
                ) : !loading && driver.rideAssigned ? (
                    <>
                        <View style={styles.customerInfoContainer}>
                            <View style={{ flexDirection: "column" }}>
                                <Text style={styles.primaryText}>{rideCustomerInfo.userName}</Text>
                                <Text style={styles.secondaryText}>
                                    {humanPhoneNumber(rideCustomerInfo.phoneNumber)}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.iconContainer}
                                onPress={() => callUser(humanPhoneNumber(rideCustomerInfo.phoneNumber))}
                            >
                                <Ionicons name="call-outline" size={24} color="#000" style={styles.icon} />
                            </TouchableOpacity>
                        </View>

                        <Divider style={{ width: "100%", paddingVertical: 10 }} />

                        <View style={styles.infoContainer}>
                            <Ionicons name="location-outline" size={27} color="#007ACC" style={styles.icon} />
                            <Text style={styles.locationText}>{driver.rideData.origin.locationName}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Ionicons name="location-outline" size={27} color="red" style={styles.icon} />
                            <Text style={styles.locationText}>{driver.rideData.destination.locationName}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View style={styles.infoContainer}>
                                <Ionicons name="time-outline" size={27} color="#333" style={styles.icon} />
                                <Text style={styles.infoText}>{driver.rideData.duration} min(s)</Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Ionicons name="car-outline" size={27} color="#333" style={styles.icon} />
                                <Text style={[styles.infoText, { marginRight: 15 }]}>
                                    {Math.round(driver.rideData.distance).toFixed(1)} km
                                </Text>
                            </View>
                        </View>
                        <View style={styles.infoContainer}>
                            <Ionicons name="cash-outline" size={27} color="#333" style={styles.icon} />
                            <Text style={styles.fareText}>PKR {driver.rideData.fare}</Text>
                        </View>

                        <Divider style={{ width: "100%", paddingBottom: 10 }} />

                        <View style={styles.infoContainer}>
                            <Ionicons name="car-outline" size={27} color="#333" style={styles.icon} />
                            <Text style={styles.locationText}>
                                {driver.rideData.selectedCar.manufacturer +
                                    " " +
                                    driver.rideData.selectedCar.model +
                                    " - " +
                                    driver.rideData.selectedCar.year}
                            </Text>
                        </View>
                    </>
                ) : (
                    !loading &&
                    !driver.rideAssigned && (
                        <View style={styles.infoContainer}>
                            <Text style={styles.noRideText}>No ride assigned yet.</Text>
                        </View>
                    )
                )}
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
        paddingHorizontal: 20,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    customerInfoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    infoText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        color: "#333",
        textAlign: "left",
    },
    primaryText: {
        fontSize: 20,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        color: "#000",
        textAlign: "left",
    },
    secondaryText: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        color: "#666",
        textAlign: "left",
        marginTop: 3,
    },
    locationText: {
        width: "80%",
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        color: "#333",
        textAlign: "left",
    },
    fareText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        color: "#333",
        textAlign: "left",
    },
    noRideText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginVertical: 2,
    },
    iconContainer: {
        borderRadius: 50,
        backgroundColor: "#A7E92F",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        padding: 12,
    },
});

export default DriverBottomSheet;
