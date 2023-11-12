import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Divider } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const DriverDetailCard = ({ data }) => {
    const navigation = useNavigation();

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "booked":
                return "red";
            case "offline":
                return "gray";
            case "online":
                return "green";
            default:
                return "black";
        }
    };
    const statusTextColor = getStatusColor(data?.status);

    return (
        <TouchableOpacity onPress={() => navigation.navigate("DriverDetailScreen", { data: data })}>
            <View style={styles.container}>
                {data.firstName == null && data.lastName == null && data.CNIC == null ? null : (
                    <View style={styles.infoContainer}>
                        <Ionicons name="person-outline" size={27} color="#333" style={styles.icon} />
                        <Text style={styles.driverInfoText}>{data?.firstName + " " + data?.lastName}</Text>
                    </View>
                )}
                <View style={styles.infoContainer}>
                    <FontAwesome name="drivers-license-o" size={20} color="#333" style={styles.icon} />
                    <Text style={styles.driverInfoText}>{data?.phoneNumber}</Text>
                </View>
                <View style={styles.driverStatus}>
                    <Text style={[styles.driverStatusText, { color: statusTextColor }]}>{data?.status}</Text>
                </View>
                <Divider style={{ width: "100%" }} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        paddingTop: 5,
        paddingHorizontal: 15,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    icon: {
        marginHorizontal: 5,
    },
    driverInfoText: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        color: "#333",
        textAlign: "left",
    },
    driverStatus: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 10,
    },
    driverStatusText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "right",
        textTransform: "uppercase",
    },
});

export default DriverDetailCard;
