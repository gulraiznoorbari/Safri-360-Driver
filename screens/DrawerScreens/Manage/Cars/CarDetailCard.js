import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Divider } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const CarDetailCard = ({ data }) => {
    const navigation = useNavigation();

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "booked":
                return "red";
            case "idle":
                return "green";
            default:
                return "black";
        }
    };
    const textColor = getStatusColor(data?.status);

    return (
        <TouchableOpacity onPress={() => navigation.navigate("CarsDetailScreen", { data: data })}>
            <View style={styles.container}>
                <View style={styles.infoContainer}>
                    <Ionicons name="car-outline" size={27} color="#333" style={styles.icon} />
                    <Text style={styles.carInfoText}>
                        {data?.manufacturer + " " + data?.model + " - " + data?.year}
                    </Text>
                </View>
                <View style={styles.infoContainer}>
                    <FontAwesome name="drivers-license-o" size={20} color="#333" style={styles.icon} />
                    <Text style={styles.carInfoText}>{data?.registrationNumber}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="color-palette-outline" size={23} color="#333" style={styles.icon} />
                    <Text style={styles.carInfoText}>{data?.color}</Text>
                </View>
                <View style={styles.carStatus}>
                    <Text style={[styles.carStatusText, { color: textColor }]}>{data?.status}</Text>
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
        paddingVertical: 2,
    },
    icon: {
        marginHorizontal: 5,
    },
    carInfoText: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        color: "#333",
        textAlign: "left",
    },
    carStatus: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 5,
        marginBottom: 10,
    },
    carStatusText: {
        fontSize: 15,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        textAlign: "right",
        textTransform: "uppercase",
    },
});

export default CarDetailCard;
