import { useRef, useMemo, useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform, Linking } from "react-native";
import { Skeleton } from "@rneui/themed";
import { Divider } from "react-native-elements";
import { useSelector, useDispatch } from "react-redux";
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue, update } from "firebase/database";

import { dbRealtime } from "../../firebase/config";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import { selectDriver, setDriver } from "@store/slices/driverSlice";
import { selectRentACarUser } from "@store/slices/rentACarSlice";
import PrimaryButton from "../Buttons/PrimaryButton";

const DriverBottomSheet = () => {
    const [rideCustomerInfo, setRideCustomerInfo] = useState({});
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const bottomSheetRef = useRef();
    const driver = useSelector(selectDriver);
    const rentACarUser = useSelector(selectRentACarUser);

    const snapPoints = useMemo(() => ["15%", "64%"], []);

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

    /**
     * The `arrivedButton` function updates the status of a driver to "arrived" in a real-time database
     * and dispatches an action to set the driver's `driverArrived` property to `true`.
     */
    const arrivedButton = () => {
        const driverRef = ref(dbRealtime, "Drivers/" + driver.pinCode);
        update(driverRef, {
            status: "arrived",
        })
            .then(() => {
                dispatch(setDriver({ driverArrived: true }));
                console.log("Arrived");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    /**
     * The `startRideButton` function updates the status of a ride to "ongoing" in a real-time database
     * and dispatches an action to set the driver's `driverArrived` to false and `rideStarted` to true.
     */
    const startRideButton = () => {
        const rideRef = ref(dbRealtime, "Rides/" + driver.rideData.rideID);
        update(rideRef, {
            status: "ongoing",
        })
            .then(() => {
                dispatch(setDriver({ driverArrived: false, rideStarted: true }));
                console.log("Started");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    /**
     * The `endRideButton` function updates the status of a ride to "completed", updates the driver's
     * status to "Online", updates the car's status to "Idle", and logs "Ended" to the console.
     */
    const getRideRef = (rideID) => ref(dbRealtime, "Rides/" + rideID);
    const getDriverRef = (pinCode) => ref(dbRealtime, "Drivers/" + pinCode);
    const getCarRef = (uid, registrationNumber) => ref(dbRealtime, "Rent A Car/" + uid + "/Cars/" + registrationNumber);

    const updateRideStatus = async (rideRef, status) => update(rideRef, { status: status });
    const updateDriverStatus = async (driverRef, status) => update(driverRef, { status: status });
    const updateCarStatus = async (carRef, status) => update(carRef, { status: status });

    const endRideButton = async () => {
        try {
            const rideRef = getRideRef(driver.rideData.rideID);
            const driverRef = getDriverRef(driver.pinCode);
            const carRef = getCarRef(rentACarUser.uid, driver.rideData.selectedCar.registrationNumber);

            await updateRideStatus(rideRef, "completed");
            dispatch(
                setDriver({
                    rideCompleted: true,
                    rideData: null,
                    rideAssigned: false,
                    driverArrived: false,
                    rideStarted: false,
                }),
            );
            await updateDriverStatus(driverRef, "Online");
            await updateCarStatus(carRef, "Idle");
            console.log("Ride Ended");
        } catch (error) {
            console.log(error);
        }
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
                        <Skeleton animation="pulse" width="100%" height="50" skeletonStyle={styles.skeletonStyle} />
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

                        {!driver.rideStarted && driver.driverArrived ? (
                            <PrimaryButton text={"Start Ride"} action={startRideButton} buttonStyle={styles.button} />
                        ) : driver.rideStarted && !driver.driverArrived && !driver.rideCompleted ? (
                            <PrimaryButton text={"End Ride"} action={endRideButton} buttonStyle={styles.button} />
                        ) : driver.rideCompleted ? (
                            <View style={styles.infoContainer}>
                                <Text style={styles.rideCompletedText}>Ride Completed.</Text>
                            </View>
                        ) : (
                            <PrimaryButton text={"I Have Arrived"} action={arrivedButton} buttonStyle={styles.button} />
                        )}

                        <Divider style={{ width: "100%", marginVertical: 12 }} />
                        <View style={styles.infoContainer}>
                            <Ionicons name="location" size={27} color="red" style={styles.icon} />
                            <Text style={styles.locationText}>{driver.rideData.origin.locationName}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Ionicons name="location" size={27} color="#007ACC" style={styles.icon} />
                            <Text style={styles.locationText}>{driver.rideData.destination.locationName}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View style={styles.infoContainer}>
                                <Ionicons name="time-outline" size={27} color="#333" style={styles.icon} />
                                <Text style={styles.infoText}>
                                    {Math.round(driver.rideData.duration).toFixed(0)} min(s)
                                </Text>
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

                        <Divider style={{ width: "100%" }} />

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
                    !driver.rideAssigned && (
                        <View style={styles.noRideContainer}>
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
    rideCompletedText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginTop: 20,
    },
    noRideContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    noRideText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginTop: 20,
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
    button: {
        backgroundColor: "#A7E92F",
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 10,
    },
});

export default DriverBottomSheet;
