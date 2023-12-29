import { DEFAULT_PROFILE_IMAGE } from "@env";
import { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    Linking,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Card } from "react-native-elements";
import { ref, onValue } from "firebase/database";
import { useSelector, useDispatch } from "react-redux";

import { dbRealtime } from "../../firebase/config";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import {
    selectRentACarUser,
    selectLoading,
    selectDriverAssigned,
    setDriverAssigned,
} from "@store/slices/rentACarSlice";

const { width } = Dimensions.get("window");

const RideRequestCards = ({ setModalVisible, setSelectedRide }) => {
    const [rides, setRides] = useState([]);
    const [usersInfo, setUsersInfo] = useState([]);

    const dispatch = useDispatch();
    const user = useSelector(selectRentACarUser);
    const loading = useSelector(selectLoading);
    const driverAssigned = useSelector(selectDriverAssigned);

    useEffect(() => {
        dispatch(setDriverAssigned(false));
        // if the rent a car owner has the requested car then show him the request:
        const ridesRef = ref(dbRealtime, "Rides");
        const rentACarRef = ref(dbRealtime, "Rent A Car");
        onValue(ridesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const ridesArray = Object.values(data);
                onValue(rentACarRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const rentACarData = snapshot.val();
                        const matchingRides = [];
                        const usersData = {}; // Separate state to store user info
                        // Create an array of customer IDs for all matching rides
                        const customerIDs = ridesArray.map((ride) => ride.customerID);
                        // Fetch user information for all customer IDs in a single call
                        const usersRef = ref(dbRealtime, "Users");
                        onValue(usersRef, (usersSnapshot) => {
                            if (usersSnapshot.exists()) {
                                const users = usersSnapshot.val();
                                // Filter user information for the matching customer IDs
                                customerIDs.forEach((customerID) => {
                                    if (users[customerID]) {
                                        usersData[customerID] = users[customerID];
                                    }
                                });
                                // Set the state with the updated user information
                                setUsersInfo(usersData);
                                for (const rentACarKey in rentACarData) {
                                    if (user.uid === rentACarKey) {
                                        const rentACar = rentACarData[rentACarKey].Cars;
                                        for (const carsKey in rentACar) {
                                            const car = rentACar[carsKey];
                                            ridesArray.forEach((ride) => {
                                                if (
                                                    car.status === "Idle" &&
                                                    ride.status === "fetching" &&
                                                    ride.selectedCar.registrationNumber === car.registrationNumber
                                                ) {
                                                    matchingRides.push(ride);
                                                }
                                            });
                                        }
                                    }
                                }
                                // Set the state with the matching rides
                                setRides(matchingRides);
                            }
                        });
                    }
                });
            } else {
                setRides([]);
            }
        });
    }, [driverAssigned]);

    const callUser = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const displayAvailableDrivers = (selectedRide) => {
        // Check if there are available (online) drivers
        // If there are, assign a driver to the ride
        // If there aren't, show a message to the user
        setSelectedRide(selectedRide);
        setModalVisible(true);
    };

    const cancelRide = (rideID) => {
        // Remove the specific ride from the rides array:
        let filteredRides = rides.filter((ride) => ride.rideID !== rideID);
        setRides(filteredRides);
    };

    const renderRideCard = ({ item, index }) => {
        const users = usersInfo[item.customerID] || {};

        return (
            <Card key={index} containerStyle={styles.cardContainer}>
                <View style={styles.userContainer}>
                    <Image source={{ uri: users.photoURL || DEFAULT_PROFILE_IMAGE }} style={styles.profileImage} />
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.userName}>{users.userName}</Text>
                        <Text style={styles.phoneNumber}>{humanPhoneNumber(users.phoneNumber)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => callUser(humanPhoneNumber(users.phoneNumber))}
                    >
                        <Ionicons name="call-outline" size={24} color="#000" style={styles.icon} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.locationName}>Pickup: {item.origin.locationName}</Text>
                <Text style={styles.locationName}>Destination: {item.destination.locationName}</Text>
                <Text style={styles.carInfo}>
                    {`Car Details: ${item.selectedCar.manufacturer} ${item.selectedCar.model} - ${item.selectedCar.year} - ${item.selectedCar.color}`}
                </Text>
                <TouchableOpacity style={styles.assignDriverButton} onPress={() => displayAvailableDrivers(item)}>
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
            {rides.length > 0 && !loading && !driverAssigned ? (
                <>
                    <FlatList
                        data={rides}
                        renderItem={renderRideCard}
                        key={rides.length}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={true}
                        horizontal
                        snapToInterval={width}
                        snapToAlignment="center"
                        decelerationRate="fast"
                    />
                </>
            ) : loading && !driverAssigned ? (
                <Card containerStyle={styles.cardContainer}>
                    <ActivityIndicator size="large" color="#000" style={styles.loader} />
                    <Text style={styles.loaderText}>Loading...</Text>
                </Card>
            ) : !loading && driverAssigned ? (
                <Card containerStyle={styles.cardContainer}>
                    <Text style={styles.loaderText}>Driver has been assigned.</Text>
                </Card>
            ) : (
                rides.length === 0 &&
                !loading &&
                !driverAssigned && (
                    <Card containerStyle={styles.cardContainer}>
                        <Text style={styles.noRideText}>No ride requests available at the moment.</Text>
                    </Card>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: width - 20,
        borderRadius: 10,
        backgroundColor: "#fff",
        borderColor: "#A7E92F",
        borderWidth: 1,
        marginBottom: 10,
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        elevation: 3,
    },
    loader: {
        marginVertical: 15,
    },
    loaderText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginVertical: 5,
    },
    noRideText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginVertical: 2,
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
