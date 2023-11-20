import { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, PermissionsAndroid } from "react-native";
import { useSelector } from "react-redux";
import Modal from "react-native-modal";
import { Divider } from "react-native-elements";
import { ref, onValue } from "firebase/database";

import { humanPhoneNumber } from "../utils/humanPhoneNumber";
import { dbRealtime } from "../firebase/config";
import { selectUser } from "../store/slices/userSlice";

const AvailableDriversList = ({ isModalVisible, setModalVisible }) => {
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

    const notifyDriver = async (phoneNumber, driverPIN) => {
        const hasSMSPermission = await requestSMSPermission();
        if (hasSMSPermission) {
            // Send the notification to the driver via SMS:
            SmsAndroid.autoSend(
                phoneNumber,
                `You have been assigned a ride. Please login to the Safri360 app with the PIN: ${driverPIN}`,
                (fail) => {
                    console.log("Failed with this error: " + fail);
                },
                (success) => {
                    ToastAndroid.show("Driver has been assigned and notified via SMS.", ToastAndroid.SHORT);
                    console.log("SMS status: ", success);
                    // change the driver's status to "assigned" / "booked" in the database...
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
                <TouchableOpacity
                    style={styles.assignDriverButton}
                    onPress={() => notifyDriver(item.phoneNumber, item.pinCode)}
                >
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
