import { useLayoutEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";

const TripHistoryDetailScreen = ({ route, navigation }) => {
    const { data } = route.params;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Ride Details",
            headerTitleStyle: {
                fontSize: 20,
                fontFamily: "SatoshiBlack",
                fontWeight: "400",
            },
            headerTitleAlign: "center",
            headerStyle: {
                height: 60,
            },
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={26} color="#333" />
                    <Text style={styles.dateText}>{moment(Date.now()).format("LL")}</Text>
                </View>
                <View style={styles.originContainer}>
                    <Ionicons name="location" size={26} color="#0078d7" />
                    <Text style={styles.originText}>Origin: {data?.origin}</Text>
                </View>
                <View style={styles.destinationContainer}>
                    <Ionicons name="location" size={26} color="green" />
                    <Text style={styles.destinationText}>Destination: {data?.destination}</Text>
                </View>
                <View style={styles.car}>
                    <Ionicons name="car-outline" size={26} color="#333" />
                    <Text style={styles.carText}>{data?.car}</Text>
                </View>
                <View style={styles.rideDistance}>
                    <Ionicons name="speedometer-outline" size={26} color="#333" />
                    <Text style={styles.rideDistanceText}>Distance: {data?.distance}</Text>
                </View>
                <View style={styles.rideDuration}>
                    <Ionicons name="stopwatch-outline" size={26} color="#333" />
                    <Text style={styles.rideDurationText}>Duration: {data?.duration}</Text>
                </View>
                <View style={styles.rideFare}>
                    <Ionicons name="cash-outline" size={26} color="#333" />
                    <Text style={styles.rideFareText}>PKR {data?.fare}</Text>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    icon={<Ionicons name="chatbubbles-outline" size={22} color={"#000"} />}
                    title="Support"
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonText}
                    onPress={() => {}}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "space-between",
        marginBottom: 10,
    },
    content: {
        flexDirection: "column",
        backgroundColor: "#fff",
        paddingVertical: 20,
        paddingHorizontal: 30,
        margin: 10,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    dateText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        marginLeft: 13,
    },
    originContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    originText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        marginLeft: 13,
    },
    destinationContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    destinationText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        marginLeft: 13,
    },
    car: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    carText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        marginLeft: 13,
    },
    rideDistance: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    rideDistanceText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        marginLeft: 13,
    },
    rideDuration: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    rideDurationText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        marginLeft: 13,
    },
    rideFare: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    rideFareText: {
        fontSize: 16,
        fontFamily: "SatoshiBold",
        fontWeight: "600",
        marginLeft: 13,
    },
    buttonContainer: {
        marginBottom: 5,
    },
    button: {
        backgroundColor: "#A7E92F",
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 10,
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

export default TripHistoryDetailScreen;
