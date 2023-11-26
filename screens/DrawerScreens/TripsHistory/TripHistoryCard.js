import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Divider } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";

const TripHistoryCard = ({ data }) => {
    const navigation = useNavigation();

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "assigned":
                return "orange";
            case "ongoing":
                return "gold";
            case "completed":
                return "green";
            case "cancelled":
                return "red";
            default:
                return "gray";
        }
    };

    const textColor = getStatusColor(data?.status);
    return (
        <TouchableOpacity onPress={() => navigation.navigate("TripHistoryDetailScreen", { data: data })}>
            <View style={styles.tripContainer}>
                <Text style={styles.tripDate}>
                    {moment(data?.createdAt, "dddd, MMMM D, YYYY h:mm A").format("DD MMMM YYYY HH:mm A")}
                </Text>
                <View style={styles.infoContainer}>
                    <Ionicons name="location-outline" size={22} color="blue" />
                    <Text style={styles.tripInfoText}>{data?.origin.locationName}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="location-outline" size={22} color="green" />
                    <Text style={styles.tripInfoText}>{data?.destination.locationName}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="cash-outline" size={22} color="#333" />
                    <Text style={styles.tripInfoText}>PKR {data?.fare}</Text>
                </View>
                <View style={styles.tripStatus}>
                    <Text style={[styles.tripStatusText, { color: textColor }]}>{data?.status}</Text>
                </View>
                <Divider style={{ width: "100%" }} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tripContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        paddingTop: 5,
        paddingHorizontal: 15,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 3,
    },
    tripDate: {
        fontSize: 14,
        fontFamily: "Satoshi",
        fontWeight: "500",
        color: "#666",
        textAlign: "left",
        paddingVertical: 5,
    },
    tripInfoText: {
        color: "#000",
        marginLeft: 10,
        textAlign: "left",
        fontSize: 16,
        fontFamily: "SatoshiMedium",
    },
    tripStatus: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 5,
        marginBottom: 10,
    },
    tripStatusText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "right",
        textTransform: "uppercase",
    },
});

export default TripHistoryCard;
