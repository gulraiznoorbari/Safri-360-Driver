import { useEffect, useState, useRef, useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform, Linking } from "react-native";
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";
import { Skeleton } from "@rneui/themed";
import { Divider } from "react-native-elements";
import { useSelector, useDispatch } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue, update } from "firebase/database";

import { dbRealtime } from "../../firebase/config";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import { selectFreightRider, setFreightRider } from "@store/slices/freightRiderSlice";
import PrimaryButton from "../Buttons/PrimaryButton";

const FreightBottomSheet = () => {
    const [loading, setLoading] = useState(true);
    const [rideCustomerInfo, setRideCustomerInfo] = useState({});

    const dispatch = useDispatch();
    const bottomSheetRef = useRef(null);
    const freightRider = useSelector(selectFreightRider);

    const snapPoints = useMemo(() => ["15%", "60%"], []);

    const animationConfigs = useBottomSheetSpringConfigs({
        damping: 80,
        overshootClamping: true,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        stiffness: 500,
    });

    useEffect(() => {
        if (freightRider.rideAssigned && freightRider.rideData.customerID) {
            const userRef = ref(dbRealtime, "Users/" + freightRider.rideData.customerID);
            onValue(userRef, (snapshot) => {
                const userData = snapshot.val();
                setRideCustomerInfo({ userName: userData.userName, phoneNumber: userData.phoneNumber });
                setLoading(false);
            });
        }
    }, [freightRider.rideAssigned]);

    const arrivedButton = () => {
        const rideRef = ref(dbRealtime, "FreightRequests/" + freightRider.rideData.id);
        update(rideRef, {
            status: "arrived",
        })
            .then(() => {
                dispatch(setFreightRider({ riderArrived: true }));
                console.log("Arrived");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const startRideButton = () => {
        const rideRef = ref(dbRealtime, "FreightRequests/" + freightRider.rideData.id);
        update(rideRef, {
            status: "ongoing",
        })
            .then(() => {
                dispatch(setFreightRider({ riderArrived: false, rideStarted: true }));
                console.log("Started");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const endRideButton = () => {
        const rideRef = ref(dbRealtime, "FreightRequests/" + freightRider.rideData.id);
        update(rideRef, {
            status: "completed",
        })
            .then(() => {
                dispatch(
                    setFreightRider({
                        riderArrived: false,
                        rideStarted: false,
                        rideCompleted: true,
                        rideAssigned: false,
                        rideData: null,
                    }),
                );
                console.log("Ride Ended");
            })
            .catch((error) => {
                console.log(error);
            });
    };

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
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Skeleton animation="pulse" width="100%" height="50" skeletonStyle={styles.skeletonStyle} />
                    </View>
                ) : (
                    <>
                        <View style={styles.customerInfoContainer}>
                            <View style={{ flexDirection: "column" }}>
                                <Text style={styles.customerName}>{rideCustomerInfo.userName}</Text>
                                <Text style={styles.customerPhoneNumber}>
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

                        {!freightRider.rideStarted && freightRider.riderArrived ? (
                            <PrimaryButton text={"Start Ride"} action={startRideButton} buttonStyle={styles.button} />
                        ) : freightRider.rideStarted && !freightRider.riderArrived && !freightRider.rideCompleted ? (
                            <PrimaryButton text={"End Ride"} action={endRideButton} buttonStyle={styles.button} />
                        ) : freightRider.rideCompleted ? (
                            <View style={styles.infoContainer}>
                                <Text style={styles.rideCompletedText}>Ride Completed!</Text>
                            </View>
                        ) : (
                            freightRider.riderArrived && (
                                <PrimaryButton
                                    text={"I have Arrived"}
                                    action={arrivedButton}
                                    buttonStyle={styles.button}
                                />
                            )
                        )}

                        <Divider style={{ width: "100%", marginVertical: 12 }} />
                        <View style={styles.infoContainer}>
                            <Ionicons name="location" size={27} color="red" style={styles.icon} />
                            <Text style={styles.locationText}>{freightRider.rideData.origin.locationName}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Ionicons name="location" size={27} color="#007ACC" style={styles.icon} />
                            <Text style={styles.locationText}>{freightRider.rideData.destination.locationName}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Ionicons name="cube-outline" size={27} color="#333" style={styles.icon} />
                            <Text style={styles.fareText}>{freightRider.rideData.weight} Kg</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Ionicons name="cash-outline" size={27} color="#333" style={styles.icon} />
                            <Text style={styles.fareText}>PKR {freightRider.rideData.fare}</Text>
                        </View>
                    </>
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
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    skeletonStyle: {
        height: 70,
    },
    customerInfoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    customerName: {
        fontSize: 20,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        color: "#000",
        textAlign: "left",
    },
    customerPhoneNumber: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        color: "#666",
        textAlign: "left",
        marginTop: 3,
    },
    iconContainer: {
        borderRadius: 50,
        backgroundColor: "#A7E92F",
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        padding: 12,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    rideCompletedText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginTop: 20,
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
        width: "80%",
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        color: "#333",
        textAlign: "left",
    },
    button: {
        backgroundColor: "#A7E92F",
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 10,
    },
});

export default FreightBottomSheet;
