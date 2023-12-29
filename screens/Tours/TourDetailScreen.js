import { useLayoutEffect, useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, ToastAndroid } from "react-native";
import { Button, Card } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";
import { ref, onValue, remove, update } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../firebase/config";
import { selectTourUser } from "@store/slices/tourSlice";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";
import { formatCurrencyWithCommas } from "@utils/formatCurrencyValue";

const TourDetailScreen = ({ route, navigation }) => {
    const { data } = route.params;
    const user = useSelector(selectTourUser);

    const [tours, setTours] = useState([]);
    const [tourSeatsBooked, setTourSeatsBooked] = useState("");
    const [tourTotalFare, setTourTotalFare] = useState("");

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Tour Details",
            headerTitleStyle: {
                fontSize: 20,
                fontFamily: "SatoshiBlack",
                fontWeight: "400",
            },
            headerTitleAlign: "center",
            headerStyle: {
                height: 60,
            },
            headerRight: () => (
                <TouchableOpacity onPress={() => deleteTour(data.tourID)}>
                    <Ionicons name="trash-outline" size={26} color="#000" style={{ marginRight: 12 }} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        const tourRef = ref(dbRealtime, "Tours/" + user.uid + "/Tours");
        onValue(tourRef, (snapshot) => {
            const tourdata = snapshot.val();
            const toursArray = Object.values(tourdata);
            toursArray.forEach((tour) => {
                if (tour.tourID === data.tourID) {
                    setTours(tour);
                }
            });
        });
    }, []);

    useEffect(() => {
        setTourSeatsBooked(tours.tourSeats - tours.tourSeatsLeft);
    }, [tours.tourSeats, tours.tourSeatsLeft]);

    useEffect(() => {
        setTourTotalFare(tours.tourFare * tourSeatsBooked);
    }, [tours.tourFare, tourSeatsBooked]);

    const toggleBookingStatus = () => {
        const newStatus = tours.tourBookingStatus === "Open" ? "Closed" : "Open";
        const tourRef = ref(dbRealtime, "Tours/" + user.uid + "/Tours/" + tours.tourID);
        update(tourRef, {
            tourBookingStatus: newStatus,
        })
            .then(() => {
                ToastAndroid.show("Booking status updated successfully!", ToastAndroid.SHORT);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const deleteTour = (tourID) => {
        const tourRef = ref(dbRealtime, "Tours/" + user.uid + "/Tours/" + tourID);
        remove(tourRef)
            .then(() => {
                ToastAndroid.show("Tour deleted successfully!", ToastAndroid.SHORT);
                navigation.navigate("Home");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getSeatStatusColor = (seats, seatsLeft) => {
        const seatsInt = parseInt(seats);
        const seatsLeftInt = parseInt(seatsLeft);
        if (seatsLeftInt / seatsInt <= 0.25) {
            return "red";
        } else if (seatsLeftInt / seatsInt <= 0.5) {
            return "orange";
        } else if (seatsLeftInt / seatsInt <= 0.75) {
            return "gold";
        } else {
            return "green";
        }
    };
    const textColor = getSeatStatusColor(tours.seats, tours.seatsLeft);

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            <View style={styles.toggleContainer}>
                <Text style={styles.isOnlineSwitchText}>
                    Bookings: {tours.tourBookingStatus === "Open" ? "Open " : "Closed "}
                </Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#A7E92F" }}
                    thumbColor={tours.tourBookingStatus === "Open" ? "#A7E92F" : "#767577"}
                    value={tours.tourBookingStatus === "Open" ? true : false}
                    onValueChange={toggleBookingStatus}
                    style={styles.isOnlineSwitch}
                />
            </View>
            <View style={styles.twoContainers}>
                <Card containerStyle={styles.seatContainerStyle}>
                    <Card.Title style={styles.title}>Seats Left</Card.Title>
                    <Card.Divider />
                    <Text style={[styles.tourSeatsText, { color: textColor }]}>
                        {tours.tourSeatsLeft} / {tours.tourSeats}
                    </Text>
                </Card>
                <Card containerStyle={styles.fareContainerStyle}>
                    <Card.Title style={styles.title}>Total Fare</Card.Title>
                    <Card.Divider />
                    <Text style={styles.tourTotalFareText}>PKR {formatCurrencyWithCommas(tourTotalFare)}</Text>
                </Card>
            </View>
            <View style={styles.tourInfoContainer}>
                <Card containerStyle={styles.mainCardContainerStyle}>
                    <Card.Title style={styles.tourNameText}>{tours.tourName}</Card.Title>
                    <Card.Divider />
                    <View style={styles.infoContainer}>
                        <Ionicons name="calendar-outline" size={30} color="#333" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Tour Dates:</Text>
                            <Text style={styles.tourInfoText}>
                                {moment(tours.tourStartDate, "DD/MM/YYYY").format("ll")} -{" "}
                                {moment(tours.tourEndDate, "DD/MM/YYYY").format("ll")}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Ionicons name="time-outline" size={30} color="#333" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Departure Time:</Text>
                            <Text style={styles.tourInfoText}>{tours.tourDepartureTime}</Text>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Ionicons name="location-outline" size={30} color="#333" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Pickup:</Text>
                            <Text style={styles.tourInfoText}>
                                {tours.tourPickup ? tours.tourPickup.locationName : data.tourPickup.locationName}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Ionicons name="location-outline" size={30} color="#333" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Destination:</Text>
                            <Text style={styles.tourInfoText}>
                                {tours.tourDestination
                                    ? tours.tourDestination.locationName
                                    : data.tourPickup.locationName}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Ionicons name="cash-outline" size={30} color="#333" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Fare:</Text>
                            <Text style={styles.tourInfoText}>
                                PKR {formatCurrencyWithCommas(tours.tourFare ? tours.tourFare : data.tourFare)} /-
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Ionicons name="time-outline" size={30} color="#333" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Stay Period:</Text>
                            <Text style={styles.tourInfoText}>
                                {tours?.tourDays} Days, {tours.tourNights} Nights
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Ionicons name="map-outline" size={30} color="#333" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Itenaries:</Text>
                            <Text style={styles.tourItenaryText}>{tours.tourItenary}</Text>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Ionicons name="business-outline" size={29} color="#333" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Tour Company Name:</Text>
                            <Text style={styles.tourCompanyName}>{tours.companyName}</Text>
                        </View>
                    </View>
                    <View style={styles.infoContainer}>
                        <Ionicons name="call-outline" size={29} color="#000" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoHeading}>Contact #:</Text>
                            <Text style={styles.tourCompanyNumber}>{humanPhoneNumber(tours.companyPhoneNumber)}</Text>
                        </View>
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 15,
        backgroundColor: "#f5f5f5",
    },
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        marginLeft: 3,
    },
    isOnlineSwitchText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
    },
    isOnlineSwitch: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
    twoContainers: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
    },
    seatContainerStyle: {
        width: 140,
        padding: 15,
        paddingVertical: 18,
        borderColor: "#A7E92F",
        borderWidth: 1,
        borderRadius: 10,
        elevation: 2,
    },
    fareContainerStyle: {
        width: 170,
        paddingHorizontal: 15,
        paddingVertical: 18,
        borderColor: "#A7E92F",
        borderWidth: 1,
        borderRadius: 10,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontFamily: "SatoshiBlack",
        fontWeight: "400",
    },
    tourSeatsText: {
        fontSize: 16,
        fontWeight: "400",
        fontFamily: "SatoshiBold",
        textAlign: "center",
    },
    tourTotalFareText: {
        fontSize: 16,
        fontWeight: "400",
        fontFamily: "SatoshiBold",
        textAlign: "center",
    },
    tourInfoContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    mainCardContainerStyle: {
        width: "100%",
        borderRadius: 10,
        borderColor: "#A7E92F",
        borderWidth: 1,
        elevation: 1,
    },
    tourNameText: {
        fontSize: 18,
        fontFamily: "SatoshiBlack",
        fontWeight: "400",
        textAlign: "center",
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    infoTextContainer: {
        flexDirection: "column",
        marginLeft: 10,
    },
    infoHeading: {
        fontSize: 17,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        marginLeft: 5,
    },
    tourInfoText: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        marginLeft: 10,
        paddingRight: 20,
    },
    tourItenaryText: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        marginLeft: 10,
        paddingRight: 20,
    },
    tourCompanyName: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        marginLeft: 10,
        paddingRight: 20,
    },
    tourCompanyNumber: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        marginLeft: 10,
        paddingRight: 20,
    },
    iconContainer: {
        borderRadius: 50,
        backgroundColor: "#A7E92F",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        padding: 8,
    },
    buttonContainer: {
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#A7E92F",
        padding: 10,
        borderRadius: 10,
    },
    buttonText: {
        color: "#000",
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "center",
        marginLeft: 10,
    },
});

export default TourDetailScreen;
