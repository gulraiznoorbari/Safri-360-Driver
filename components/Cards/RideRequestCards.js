import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Dimensions, FlatList, TouchableOpacity, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Card } from "react-native-elements";
import { ref, onValue } from "firebase/database";

import { humanPhoneNumber } from "../../utils/humanPhoneNumber";
import { dbRealtime } from "../../firebase/config";
import AvailableDriversList from "../AvailableDriversList";

const { width } = Dimensions.get("window");

const RideRequestCards = () => {
    const [rides, setRides] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        // if the rent a car owner has the requested car then show him the request:
        const ridesRef = ref(dbRealtime, "Rides");
        const rentACarRef = ref(dbRealtime, "Rent A Car");
        onValue(ridesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Convert object to array for easier mapping:
                const ridesArray = Object.values(data);
                onValue(rentACarRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const rentACarData = snapshot.val();
                        for (const rentACarKey in rentACarData) {
                            const rentACar = rentACarData[rentACarKey].Cars;
                            for (const carsKey in rentACar) {
                                const car = rentACar[carsKey];
                                ridesArray.forEach((ride) => {
                                    if (ride.selectedCar.registrationNumber === car.registrationNumber) {
                                        fetchUserData(ride.customerID);
                                        setRides(
                                            ridesArray.filter(
                                                (ride) =>
                                                    ride.selectedCar.registrationNumber === car.registrationNumber,
                                            ),
                                        );
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

    const displayAvailableDrivers = () => {
        // Check if there are available (online) drivers
        // If there are, assign a driver to the ride
        // If there aren't, show a message to the user
        setModalVisible(true);
    };

    const cancelRide = (rideID) => {
        // Remove the specific ride from the rides array:
        let filteredRides = rides.filter((ride) => ride.rideID !== rideID);
        setRides(filteredRides);
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
                <TouchableOpacity style={styles.assignDriverButton} onPress={() => displayAvailableDrivers()}>
                    <Text style={styles.assignDriverButtonText}>Assign A Driver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelRideButton} onPress={() => cancelRide(item.rideID)}>
                    <Text style={styles.cancelRideButtonText}>Ignore</Text>
                </TouchableOpacity>
            </Card>
        );
    };

    return (
        <View>
            {rides.length > 0 ? (
                <>
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
                    <AvailableDriversList isModalVisible={isModalVisible} setModalVisible={setModalVisible} />
                </>
            ) : (
                <Card containerStyle={styles.cardContainer}>
                    <Text style={styles.noRideText}>No ride requests available</Text>
                </Card>
            )}
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
