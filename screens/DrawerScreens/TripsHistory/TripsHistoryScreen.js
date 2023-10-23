import { StyleSheet, View, FlatList } from "react-native";
import TripHistoryCard from "./TripHistoryCard";

const TripsHistoryScreen = () => {
    const trips = [
        {
            id: "1",
            origin: "Lahore",
            destination: "Islamabad",
            duration: "18 mins",
            distance: "12 km",
            car: "Toyota Corolla",
            fare: "150",
            status: "Completed",
        },
        {
            id: "2",
            origin: "Lahore",
            destination: "Islamabad",
            duration: "18 mins",
            distance: "12 km",
            car: "Toyota Corolla",
            fare: "150",
            status: "Cancelled",
        },
        {
            id: "3",
            origin: "Lahore",
            destination: "Islamabad",
            duration: "18 mins",
            distance: "12 km",
            car: "Toyota Corolla",
            fare: "150",
            status: "Ongoing",
        },
        {
            id: "4",
            origin: "Lahore",
            destination: "Islamabad",
            duration: "18 mins",
            distance: "12 km",
            car: "Toyota Corolla",
            fare: "150",
            status: "Completed",
        },
        {
            id: "5",
            origin: "Lahore",
            destination: "Islamabad",
            duration: "18 mins",
            distance: "12 km",
            car: "Toyota Corolla",
            fare: "150",
            status: "Completed",
        },
        {
            id: "6",
            origin: "Lahore",
            destination: "Islamabad",
            duration: "18 mins",
            distance: "12 km",
            car: "Toyota Corolla",
            fare: "150",
            status: "Completed",
        },
    ];

    const renderTripDetails = ({ item }) => {
        return <TripHistoryCard data={item} />;
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={trips}
                keyExtractor={(item) => item?.id}
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
    },
});

export default TripsHistoryScreen;
