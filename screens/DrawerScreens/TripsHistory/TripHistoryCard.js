import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Divider } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";

const TripHistoryCard = ({ data }) => {
    const navigation = useNavigation();

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "green";
            case "cancelled":
                return "red";
            case "ongoing":
                return "gold";
            default:
                return "black";
        }
    };

    const textColor = getStatusColor(data?.status);
    return (
        <TouchableOpacity onPress={() => navigation.navigate("TripHistoryDetailScreen", { data: data })}>
            <View style={styles.tripContainer}>
                <Text style={styles.tripDate}>{moment(Date.now()).format("ll")}</Text>
                <View style={styles.infoContainer}>
                    <Ionicons name="location-outline" size={22} color="blue" />
                    <Text style={styles.tripInfoText}>{data?.origin}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="location-outline" size={22} color="green" />
                    <Text style={styles.tripInfoText}>{data?.destination}</Text>
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
        paddingVertical: 2,
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
        marginLeft: 10,
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        color: "#333",
        textAlign: "left",
    },
    tripStatus: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 5,
        marginBottom: 10,
    },
    tripStatusText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "right",
        textTransform: "uppercase",
    },
});

export default TripHistoryCard;
