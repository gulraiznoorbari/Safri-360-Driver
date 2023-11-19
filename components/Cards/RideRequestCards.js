import { DEFAULT_PROFILE_IMAGE } from "@env";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Dimensions, FlatList, TouchableOpacity, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Card } from "react-native-elements";
import { ref, onValue } from "firebase/database";

import { dbRealtime } from "../../firebase/config";
import { humanPhoneNumber } from "../../utils/humanPhoneNumber";

const { width } = Dimensions.get("window");

const RideRequestCards = () => {
    const [rides, setRides] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // if the rent a car owner has the requested car then show him the request:
        const ridesRef = ref(dbRealtime, "Rides");
        const rentACarRef = ref(dbRealtime, "Rent A Car");
        onValue(ridesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Convert object to array for easier mapping
                const ridesArray = Object.values(data);
                console.log("Rides: ", ridesArray);
                onValue(rentACarRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const rentACarData = snapshot.val();
                        for (const rentACarKey in rentACarData) {
                            const rentACar = rentACarData[rentACarKey].Cars;
                            console.log("Rent A Car: ", rentACar);
                            for (const carsKey in rentACar) {
                                const car = rentACar[carsKey];
                                ridesArray.forEach((ride) => {
                                    if (ride.selectedCar.registrationNumber === car.registrationNumber) {
                                        console.log("Ride: ", ride);
                                        fetchUserData(ride.customerID);
                                        setRides((prevRides) => [...prevRides, ride]);
                                    }
                                });
                            }
                        }
                    }
                });
            } else {
                setRides([]);
            }
        });
    }, []);

    const fetchUserData = (customerID) => {
        const userRef = ref(dbRealtime, "Users/" + customerID);
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log("User Data: ", userData);
                setUsers(userData);
            } else {
                setUsers([]);
            }
        });
    };

    const callUser = () => {
        const phoneNumber = users.phoneNumber;
        Linking.openURL(`tel:${humanPhoneNumber(phoneNumber)}`);
    };

    const checkAvailableDrivers = () => {
        // Check if there are available drivers
        // If there are, assign a driver to the ride
        // If there aren't, show a message to the user
    };

    const cancelRide = () => {
        // Cancel the ride
    };

    const renderRideCard = ({ item }) => {
        return (
            <Card key={item.rideID} containerStyle={styles.cardContainer}>
                <View style={styles.userContainer}>
                    <Image source={{ uri: users.photoURL || DEFAULT_PROFILE_IMAGE }} style={styles.profileImage} />
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.userName}>{users.userName}</Text>
                        <Text style={styles.phoneNumber}>{users.phoneNumber}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconContainer} onPress={() => callUser()}>
                        <Ionicons name="call-outline" size={24} color="#000" style={styles.icon} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.locationName}>Pickup: {item.origin.locationName}</Text>
                <Text style={styles.locationName}>Destination: {item.destination.locationName}</Text>
                <Text style={styles.carInfo}>
                    {`Car Details: ${item.selectedCar.manufacturer} ${item.selectedCar.model} - ${item.selectedCar.year} - ${item.selectedCar.color}`}
                </Text>
                <TouchableOpacity style={styles.assignDriverButton} onPress={() => checkAvailableDrivers()}>
                    <Text style={styles.assignDriverButtonText}>Assign A Driver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelRideButton} onPress={() => cancelRide()}>
                    <Text style={styles.cancelRideButtonText}>Ignore</Text>
                </TouchableOpacity>
            </Card>
        );
    };

    return (
        <View>
            <FlatList
                data={rides}
                renderItem={renderRideCard}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                horizontal
                snapToInterval={width}
                snapToAlignment="center"
                decelerationRate="fast"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: width - 30,
        borderRadius: 10,
        backgroundColor: "#fff",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        padding: 15,
    },
    userContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginRight: 15,
    },
    userInfoContainer: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        paddingBottom: 5,
    },
    phoneNumber: {
        fontSize: 14,
        fontFamily: "SatoshiMedium",
        color: "#666",
    },
    iconContainer: {
        marginRight: 7,
        borderRadius: 50,
        backgroundColor: "#A7E92F",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        padding: 10,
    },
    locationName: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        marginBottom: 5,
    },
    carInfo: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
    },
    assignDriverButton: {
        backgroundColor: "#A7E92F",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 12,
    },
    assignDriverButtonText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        textAlign: "center",
    },
    cancelRideButton: {
        backgroundColor: "#ccc",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 12,
    },
    cancelRideButtonText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        textAlign: "center",
    },
});

export default RideRequestCards;
