import { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { ref, onValue } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../../firebase/config";
import { selectRentACarUser } from "@store/slices/rentACarSlice";
import TripHistoryCard from "./TripHistoryCard";

const TripsHistoryScreen = () => {
    const user = useSelector(selectRentACarUser);
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        fetchTripsData();
    }, []);

    const fetchTripsData = () => {
        const ridesRef = ref(dbRealtime, "Rides");
        onValue(ridesRef, (snapshot) => {
            if (snapshot.exists()) {
                const ridesData = snapshot.val();
                const matchingRides = [];
                // Convert object to array for easier mapping
                const ridesArray = Object.values(ridesData);
                ridesArray.forEach((ride) => {
                    if (ride.rentACarUID === user.uid) {
                        matchingRides.push(ride);
                    }
                });
                setTrips(matchingRides);
            }
        });
    };

    const renderTripDetails = ({ item }) => {
        return <TripHistoryCard data={item} />;
    };

    return (
        <View style={styles.container}>
            {trips.length === 0 ? (
                <View style={styles.notAvailableContainer}>
                    <Text style={styles.notAvailableText}>No Trips Available</Text>
                </View>
            ) : (
                <FlatList
                    data={trips}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderTripDetails}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
    },
    notAvailableContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    notAvailableText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
    },
});

export default TripsHistoryScreen;
