import { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ToastAndroid, PermissionsAndroid } from "react-native";
import { useSelector } from "react-redux";
import { ref, onValue, get, update } from "firebase/database";
import { Divider } from "react-native-elements";
import Modal from "react-native-modal";
import SmsAndroid from "react-native-get-sms-android";

import { humanPhoneNumber } from "../utils/humanPhoneNumber";
import { dbRealtime } from "../firebase/config";
import { selectUser } from "../store/slices/userSlice";

const AvailableDriversList = ({ isModalVisible, setModalVisible, selectedRide }) => {
    const [drivers, setDrivers] = useState([]);

    const user = useSelector(selectUser);

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
        fetchDriversData();
    }, [isModalVisible === true]);

    const fetchDriversData = () => {
        const driversRef = ref(dbRealtime, "Drivers");
        onValue(driversRef, (snapshot) => {
            if (snapshot.exists()) {
                const driversData = snapshot.val();
                // Convert object to array for easier mapping
                const driversArray = Object.values(driversData);
                driversArray.forEach((driver) => {
                    if (driver.RentACarUID === user.uid && driver.status === "online") {
                        setDrivers(driversArray);
                    }
                });
            } else {
                setDrivers([]);
            }
        });
    };

    const changeCarStatus = (selectedCarRegistrationNumber) => {
        const carsRef = ref(dbRealtime, "Rent A Car/" + user.uid + "/Cars");
        get(carsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const carsData = snapshot.val();
                    for (const carRegistrationNumber in carsData) {
                        if (carRegistrationNumber === selectedCarRegistrationNumber) {
                            const carRef = ref(dbRealtime, "Rent A Car/" + user.uid + "/Cars/" + carRegistrationNumber);
                            update(carRef, {
                                status: "booked",
                            }).then(() => {
                                console.log("Car status updated to booked.");
                            });
                        }
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const changeDriverStatus = (pinCode) => {
        get(driversRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const driversData = snapshot.val();
                    for (const driverPIN in driversData) {
                        if (driverPIN === pinCode) {
                            const driverRef = ref(dbRealtime, "Drivers/" + driverPIN);
                            update(driverRef, {
                                status: "booked",
                            }).then(() => {
                                console.log("Driver status updated to booked.");
                                ToastAndroid.show("Driver has been assigned and notified via SMS.", ToastAndroid.SHORT);
                            });
                        }
                    }
                }
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
        }).then(() => {
            get(ridesRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const ridesData = snapshot.val();
                    console.log("Rides data: ", ridesData);
                    if (ridesData.rideID === selectedRide.rideID) {
                        update(ridesRef, {
                            driverInfo: driverInfo,
                        }).then(() => {
                            changeDriverStatus(driverInfo.pinCode);
                            changeCarStatus(ridesData.selectedCar.registrationNumber);
                            console.log("Driver has been assigned to the ride.");
                        });
                    }
                }
            });
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

    const renderAvailableDrivers = ({ item, index }) => {
        return (
            <View style={styles.driverContainer} key={index}>
                <Text style={styles.driverCNIC}>{item.CNIC}</Text>
                <Text style={styles.driverName}>
                    {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.driverPhoneNumber}>{humanPhoneNumber(item.phoneNumber)}</Text>
                <TouchableOpacity style={styles.assignDriverButton} onPress={() => notifyDriver(item)}>
                    <Text style={styles.assignDriverButtonText}>Assign</Text>
                </TouchableOpacity>
                <Divider style={styles.divider} />
            </View>
        );
    };

    return (
        <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => setModalVisible(false)}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
        >
            <View style={styles.modalContainer}>
                {drivers.length > 0 ? (
                    <FlatList
                        data={drivers}
                        renderItem={renderAvailableDrivers}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <Text style={styles.noRideText}>No drivers available</Text>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
        marginVertical: 100,
        borderRadius: 10,
        padding: 15,
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
});

export default AvailableDriversList;
