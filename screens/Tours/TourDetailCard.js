import { StyleSheet, Text, View, Pressable } from "react-native";
import { Divider } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";

import { formatCurrencyWithCommas } from "@utils/formatCurrencyValue";

const TourDetailCard = ({ data }) => {
    const navigation = useNavigation();

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "open":
                return "green";
            case "closed":
                return "red";
            default:
                return "black";
        }
    };
    const statusTextColor = getStatusColor(data?.tourBookingStatus);

    return (
        <Pressable onPress={() => navigation.navigate("TourDetailScreen", { data: data })}>
            <View style={styles.container}>
                <Text style={styles.tripDate}>
                    {moment(data.tourStartDate, "DD/MM/YYYY").format("ll")} -{" "}
                    {moment(data.tourEndDate, "DD/MM/YYYY").format("ll")}
                </Text>
                <View style={styles.infoContainer}>
                    <Text style={styles.tourNameText}>{data?.tourName}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="location-outline" size={22} color="blue" />
                    <Text style={styles.tourInfoText}>{data?.tourPickup.locationName}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="location-outline" size={22} color="green" />
                    <Text style={styles.tourInfoText}>{data?.tourDestination.locationName}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="cash-outline" size={22} color="#333" />
                    <Text style={styles.tourFareText}>PKR {formatCurrencyWithCommas(data?.tourFare)} /-</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="time-outline" size={22} color="#333" />
                    <Text style={styles.tourDepartureText}>Departure: {data?.tourDepartureTime}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="people-outline" size={22} color="#333" />
                    <Text style={styles.tourInfoText}>
                        Seats Left: {data?.tourSeatsLeft} / {data?.tourSeats}
                    </Text>
                </View>
                <View style={styles.tripStatus}>
                    <Text style={[styles.tripStatusText, { color: statusTextColor }]}>
                        Booking: {data?.tourBookingStatus}
                    </Text>
                </View>
                <Divider style={styles.divider} />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        paddingHorizontal: 15,
    },
    tripDate: {
        fontSize: 13,
        fontFamily: "Satoshi",
        fontWeight: "500",
        color: "#666",
        textAlign: "left",
        paddingVertical: 5,
    },
    tourNameText: {
        fontSize: 17,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "left",
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 3,
    },
    tourInfoText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        marginLeft: 10,
    },
    tourFareText: {
        fontSize: 14,
        fontFamily: "SatoshiBold",
        marginLeft: 10,
    },
    tourDepartureText: {
        fontSize: 14,
        fontFamily: "SatoshiBold",
        marginLeft: 10,
    },
    tripStatus: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 10,
    },
    tripStatusText: {
        fontSize: 14,
        fontFamily: "SatoshiBold",
        fontWeight: "400",
        textAlign: "right",
        textTransform: "uppercase",
        letterSpacing: 0.2,
    },
    divider: {
        width: "100%",
    },
});

export default TourDetailCard;
