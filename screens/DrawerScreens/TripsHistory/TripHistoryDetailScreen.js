import { useLayoutEffect, useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { Button, Divider } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import moment from "moment";
import { ref, onValue } from "firebase/database";

import { dbRealtime } from "../../../firebase/config";
import { LicensePlateIcon } from "@assets";
import { humanPhoneNumber } from "@utils/humanPhoneNumber";

const TripHistoryDetailScreen = ({ route, navigation }) => {
    const { data } = route.params;
    const [driverInfo, setDriverInfo] = useState([]);

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

    useEffect(() => {
        const driversRef = ref(dbRealtime, "Drivers");
        onValue(driversRef, (snapshot) => {
            const drivers = snapshot.val();
            const driverKeys = Object.keys(drivers);
            driverKeys.forEach((pinCode) => {
                if (pinCode === data?.assignedDriverPIN) {
                    setDriverInfo(drivers[pinCode]);
                }
            });
        });
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* ride details: */}
                <View style={styles.infoContainer}>
                    <Ionicons name="calendar-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>
                        {moment(data?.createdAt, "dddd, MMMM D, YYYY h:mm A").format("DD MMMM YYYY HH:mm A")}
                    </Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="location" size={26} color="#0078d7" />
                    <Text style={styles.infoText}>Origin: {data?.origin.locationName}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="location" size={26} color="green" />
                    <Text style={styles.infoText}>Destination: {data?.destination.locationName}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="cash-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>PKR {data?.fare}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="speedometer-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>Distance: {data?.distance} km</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="stopwatch-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>Duration: {Math.round(data?.duration)} mins</Text>
                </View>
                <Divider style={styles.divider} />

                {/* car details: */}
                <View style={styles.infoContainer}>
                    <Text style={styles.headerText}>Car</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="car-outline" size={27} color="#333" />
                    <Text style={styles.infoText}>
                        {data?.selectedCar.manufacturer} {data?.selectedCar.model}
                    </Text>
                </View>
                <View style={styles.infoContainer}>
                    <Image source={LicensePlateIcon} style={{ width: 27, height: 27 }} />
                    <Text style={styles.infoText}>{data?.selectedCar.registrationNumber}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="calendar-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>Year: {data?.selectedCar.year}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="color-palette-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>Color: {data?.selectedCar.color}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="speedometer-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>Average: {data?.selectedCar.average} km/L</Text>
                </View>
                <Divider style={styles.divider} />

                {/* driver details: */}
                <View style={styles.infoContainer}>
                    <Text style={styles.headerText}>Driver</Text>
                </View>
                <View style={styles.infoContainer}>
                    <AntDesign name="idcard" size={26} color="#333" />
                    <Text style={styles.infoText}>{driverInfo.CNIC}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="person-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>
                        {driverInfo.firstName} {driverInfo.lastName}
                    </Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="call-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>{humanPhoneNumber(driverInfo.phoneNumber)}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="key-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>PIN: {driverInfo.pinCode}</Text>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "space-between",
        marginBottom: 10,
    },
    divider: {
        backgroundColor: "#ccc",
        width: "100%",
        marginVertical: 5,
    },
    headerText: {
        fontSize: 19,
        fontWeight: "500",
        textAlign: "left",
        fontFamily: "SatoshiBlack",
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
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
    },
    infoText: {
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
