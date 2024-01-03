import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, FlatList, Linking, Dimensions, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Card } from "react-native-elements";
import { ref, onValue, update } from "firebase/database";
import { useSelector, useDispatch } from "react-redux";

import { dbRealtime } from "../../firebase/config";
import { selectFreightRider, setFreightRider } from "@store/slices/freightRiderSlice";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import { showError } from "@utils/ErrorHandlers";

const { width } = Dimensions.get("window");

const AvailableRequestsCards = () => {
    const dispatch = useDispatch();
    const freightRider = useSelector(selectFreightRider);
    const [usersData, setUsersData] = useState([]);
    const [availableRequests, setAvailableRequests] = useState([]);

    useEffect(() => {
        const requestsRef = ref(dbRealtime, "FreightRequests/");
        onValue(requestsRef, (snapshot) => {
            if (!snapshot.exists()) return;
            const requestsData = snapshot.val();
            const matchingRequests = [];
            const userInfo = {};
            for (const requestID in requestsData) {
                const request = requestsData[requestID];
                if (request.vehicle === freightRider.vehicleInfo.vehicleType) {
                    if (request.status === "fetching") {
                        const userRef = ref(dbRealtime, "Users/" + request.customerID);
                        onValue(userRef, (snapshot) => {
                            const userData = snapshot.val();
                            userInfo[request.customerID] = userData;
                            setUsersData(userInfo);
                            matchingRequests.push(request);
                        });
                    }
                }
            }
            setAvailableRequests(matchingRequests);
        });
    }, []);

    const callUser = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const acceptRequest = (requestID) => {
        const requestRef = ref(dbRealtime, "FreightRequests/" + requestID);
        update(requestRef, {
            status: "accepted",
            carRegistraionNumber: freightRider.vehicleInfo.carRegistraionNumber,
        })
            .then(() => {
                dispatch(setFreightRider({ rideAssigned: true }));
            })
            .catch((error) => {
                showError("Something went wrong!", "Please try again later.");
                // console.log(error);
                return;
            });
    };

    const rejectRequest = (requestID) => {
        let filteredRequests = availableRequests.filter((request) => request.id !== requestID);
        setAvailableRequests(filteredRequests);
    };

    const renderRequestCard = ({ item, index }) => {
        const user = usersData[item.customerID] || {};

        return (
            <Card key={index} containerStyle={styles.cardContainer}>
                <View style={styles.userContainer}>
                    <Image source={{ uri: user.photoURL }} style={styles.userImage} />
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userPhone}>{humanPhoneNumber(user.phoneNumber)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => callUser(humanPhoneNumber(user.phoneNumber))}
                        style={styles.iconContainer}
                    >
                        <Ionicons name="call-outline" size={24} color="#000" style={styles.icon} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.infoText}>Pickup: {item.origin.locationName}</Text>
                <Text style={styles.infoText}>Destination: {item.destination.locationName}</Text>
                <Text style={styles.infoText}>Weight: {item.weight} kg</Text>
                <Text style={styles.infoText}>PKR {item.fare}</Text>
                <TouchableOpacity onPress={() => acceptRequest(item.id)} style={styles.acceptButton}>
                    <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => rejectRequest(item.id)} style={styles.rejectButton}>
                    <Text style={styles.rejectButtonText}>Ignore</Text>
                </TouchableOpacity>
            </Card>
        );
    };

    return (
        <View>
            {availableRequests.length > 0 ? (
                <>
                    <FlatList
                        data={availableRequests}
                        renderItem={renderRequestCard}
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
            ) : (
                availableRequests.length === 0 && (
                    <Card containerStyle={styles.cardContainer}>
                        <Text style={styles.noRideText}>No Requests available at the moment.</Text>
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
    userContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginRight: 15,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        marginBottom: 3,
    },
    userPhone: {
        fontSize: 14,
        fontFamily: "SatoshiMedium",
        fontWeight: "400",
        color: "#666",
    },
    iconContainer: {
        marginRight: 7,
        borderRadius: 50,
        backgroundColor: "#A7E92F",
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        padding: 10,
    },
    infoText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        marginBottom: 5,
    },
    acceptButton: {
        backgroundColor: "#A7E92F",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 12,
    },
    acceptButtonText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
    },
    rejectButton: {
        backgroundColor: "#ccc",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 12,
    },
    rejectButtonText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
    },
    noRideText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginVertical: 2,
    },
});

export default AvailableRequestsCards;
