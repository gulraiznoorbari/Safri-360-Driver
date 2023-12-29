import { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    ToastAndroid,
    ActivityIndicator,
    TouchableOpacity,
    PermissionsAndroid,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { ref, onValue, get, update } from "firebase/database";
import { Divider } from "react-native-elements";
import Modal from "react-native-modal";
import LottieView from "lottie-react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import SmsAndroid from "react-native-get-sms-android";

import { dbRealtime } from "../../firebase/config";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import { MapIcon } from "@assets";
import {
    selectRentACarUser,
    setLoading,
    selectLoading,
    setDriverAssigned,
    selectDriverAssigned,
} from "@store/slices/rentACarSlice";
import DisplayStarRatings from "../Driver/DisplayStarRatings";

const AvailableDriversList = ({ isModalVisible, setModalVisible, selectedRide }) => {
    const [drivers, setDrivers] = useState([]);

    const user = useSelector(selectRentACarUser);
    const loading = useSelector(selectLoading);
    const driverAssigned = useSelector(selectDriverAssigned);
    const dispatch = useDispatch();

    const requestSMSPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS);
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can send SMS");
                return true;
            } else {
                console.log("You cannot send SMS");
                return false;
            }
        } catch (error) {
            console.error("Error sending SMS: ", error);
            return false;
        }
    };

    useEffect(() => {
        dispatch(setDriverAssigned(false));
        fetchDriversData();
    }, []);

    const fetchDriversData = () => {
        const driversRef = ref(dbRealtime, "Drivers");
        onValue(driversRef, (snapshot) => {
            if (snapshot.exists()) {
                const driversData = snapshot.val();
                matchingDrivers = [];
                // Convert object to array for easier mapping
                const driversArray = Object.values(driversData);
                driversArray.forEach((driver) => {
                    if (driver.RentACarUID === user.uid && driver.status != "booked") {
                        matchingDrivers.push(driver);
                    }
                });
                setDrivers(matchingDrivers);
            } else {
                setDrivers([]);
            }
        });
    };

    const changeCarStatus = (selectedCarRegistrationNumber) => {
        const carRef = ref(dbRealtime, "Rent A Car/" + user.uid + "/Cars/" + selectedCarRegistrationNumber);
        update(carRef, {
            status: "booked",
        })
            .then(() => {
                console.log("Car status updated to booked.");
                ToastAndroid.show("Driver has been assigned and notified via SMS.", ToastAndroid.LONG);
                dispatch(setLoading(false));
                dispatch(setDriverAssigned(true));
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const changeDriverStatus = (pinCode) => {
        const driverRef = ref(dbRealtime, "Drivers/" + pinCode);
        const ridesRef = ref(dbRealtime, "Rides/" + selectedRide.rideID);
        update(driverRef, {
            status: "booked",
            assignedRideID: selectedRide.rideID,
        })
            .then(() => {
                console.log("Driver status updated to booked.");
                get(ridesRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const ridesData = snapshot.val();
                            if (ridesData.rideID === selectedRide.rideID) {
                                changeCarStatus(ridesData.selectedCar.registrationNumber);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // assign the ride to the driver:
    const assignDriver = (driverInfo) => {
        const ridesRef = ref(dbRealtime, "Rides/" + selectedRide.rideID);
        update(ridesRef, {
            rentACarUID: user.uid,
            status: "assigned",
            assignedDriverPIN: driverInfo.pinCode,
        })
            .then(() => {
                changeDriverStatus(driverInfo.pinCode);
                console.log("Driver has been assigned to the ride.");
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const notifyDriver = async (driverInfo) => {
        const hasSMSPermission = await requestSMSPermission();
        if (hasSMSPermission) {
            // Send the notification to the driver via SMS:
            SmsAndroid.autoSend(
                driverInfo.phoneNumber,
                `You have been assigned a ride. Please login to the Safri360 Driver app with the PIN: ${driverInfo.pinCode}`,
                (fail) => {
                    console.log("Failed with this error: " + fail);
                },
                (success) => {
                    assignDriver(driverInfo);
                    console.log("SMS status: ", success);
                },
            );
        }
    };

    const handlePress = (driverInfo) => {
        dispatch(setLoading(true));
        notifyDriver(driverInfo);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        dispatch(setDriverAssigned(false));
    };

    const renderAvailableDrivers = ({ item, index }) => {
        return (
            <View style={styles.driverContainer} key={index}>
                <Text style={styles.driverCNIC}>{item.CNIC}</Text>
                <Text style={styles.driverName}>
                    {item.firstName} {item.lastName}
                </Text>
                <DisplayStarRatings rating={item.ratings.rating} totalRatings={item.ratings.totalRatings} />
                <Text style={styles.driverPhoneNumber}>{humanPhoneNumber(item.phoneNumber)}</Text>
                <TouchableOpacity style={styles.assignDriverButton} onPress={() => handlePress(item)}>
                    <Text style={styles.assignDriverButtonText}>Assign</Text>
                </TouchableOpacity>
                <Divider style={styles.divider} />
            </View>
        );
    };

    return (
        <Modal
            isVisible={isModalVisible}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            backdropOpacity={0.75}
        >
            <View style={styles.modalContainer}>
                {!(loading && !driverAssigned) && (
                    <TouchableOpacity onPress={() => handleModalClose()}>
                        <Ionicons name="close-outline" size={25} color="black" style={styles.closeIcon} />
                    </TouchableOpacity>
                )}
                {drivers.length >= 0 && loading && !driverAssigned ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#000" style={styles.loader} />
                        <Text style={styles.loaderText}>Assigning driver...</Text>
                    </View>
                ) : !loading && driverAssigned ? (
                    <View style={styles.loadingContainer}>
                        <LottieView
                            source={require("@assets/animations/check-animation.json")}
                            autoPlay={true}
                            loop={false}
                            style={styles.lottieAnimation}
                        />
                        <Text style={styles.loaderText}>Driver has been assigned</Text>
                    </View>
                ) : drivers.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Image source={MapIcon} style={styles.icon} />
                        <Text style={styles.noRideText}>No drivers available at the moment.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={drivers}
                        renderItem={renderAvailableDrivers}
                        key={drivers.length}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    closeIcon: {
        alignSelf: "flex-end",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
        marginVertical: 20,
        borderRadius: 10,
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        width: 110,
        height: 110,
        alignSelf: "center",
        marginTop: -50,
        marginBottom: 25,
    },
    loader: {
        marginBottom: 20,
    },
    loaderText: {
        fontSize: 17,
        fontFamily: "SatoshiBold",
        textAlign: "center",
    },
    noRideText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        textAlign: "center",
    },
    driverCNIC: {
        fontSize: 13,
        fontFamily: "SatoshiMedium",
        color: "#666",
    },
    driverName: {
        fontSize: 20,
        fontFamily: "SatoshiBold",
        marginVertical: 3,
    },
    driverPhoneNumber: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
    },
    assignDriverButton: {
        backgroundColor: "#A7E92F",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 5,
    },
    assignDriverButtonText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        textAlign: "center",
    },
    divider: {
        marginVertical: 10,
    },
    lottieAnimation: {
        width: 200,
        height: 200,
        alignSelf: "center",
    },
});

export default AvailableDriversList;
