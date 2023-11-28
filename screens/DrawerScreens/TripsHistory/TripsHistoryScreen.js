import { useEffect, useState } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { ref, onValue } from "firebase/database";

import { dbRealtime } from "../../../firebase/config";
import TripHistoryCard from "./TripHistoryCard";

const TripsHistoryScreen = () => {
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        fetchTripsData();
    }, []);

    const fetchTripsData = () => {
        const ridesRef = ref(dbRealtime, "Rides");
        onValue(ridesRef, (snapshot) => {
            if (snapshot.exists()) {
                const ridesData = snapshot.val();
                // Convert object to array for easier mapping
                const ridesArray = Object.values(ridesData);
                setTrips(ridesArray);
            }
        });
    };

    const renderTripDetails = ({ item }) => {
        return <TripHistoryCard data={item} />;
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={trips}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderTripDetails}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
    },
});

export default TripsHistoryScreen;
