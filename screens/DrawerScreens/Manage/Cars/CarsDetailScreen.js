import { useLayoutEffect } from "react";
import { Alert, ToastAndroid, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Button } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ref, remove } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../../../firebase/config";
import { selectRentACarUser } from "@store/slices/rentACarSlice";

const CarsDetailScreen = ({ route, navigation }) => {
    const { data } = route.params;

    const user = useSelector(selectRentACarUser);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Car Details",
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

    const deleteCar = (registrationNumber) => {
        const carRef = ref(dbRealtime, "Rent A Car/" + user.uid + "/Cars/" + registrationNumber);
        remove(carRef)
            .then(() => {
                console.log("Car deleted from DB");
                ToastAndroid.show("Car Deleted Successfully", ToastAndroid.SHORT);
                navigation.goBack();
            })
            .catch((error) => {
                console.log("Error deleting car from DB: ", error);
            });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.optionIcons}>
                    <TouchableOpacity onPress={() => navigation.navigate("EditCarScreen", { data: data })}>
                        <MaterialCommunityIcons
                            name="square-edit-outline"
                            size={25}
                            color="#555"
                            style={{ paddingHorizontal: 10 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            Alert.alert("Delete Car", "Are you sure you want to delete this car?", [
                                {
                                    text: "Cancel",
                                    onPress: () => null,
                                    style: "cancel",
                                },
                                { text: "Delete", onPress: () => deleteCar(data?.registrationNumber) },
                            ])
                        }
                    >
                        <Ionicons name="trash-outline" size={25} color="red" />
                    </TouchableOpacity>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="car-outline" size={30} color="#333" />
                    <Text style={styles.infoText}>Manufacturer: {data?.manufacturer}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="car-outline" size={30} color="#333" />
                    <Text style={styles.infoText}>Model: {data?.model}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="calendar-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>Year: {data?.year}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="speedometer-outline" size={26} color="#333" />
                    <Text style={styles.infoText}>Average (km/l): {data?.average}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <FontAwesome name="drivers-license-o" size={22} color="#333" />
                    <Text style={styles.infoText}>Registration Number: {data?.registrationNumber}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Ionicons name="color-palette-outline" size={28} color="#333" />
                    <Text style={styles.infoText}>Color: {data?.color}</Text>
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
        paddingVertical: 25,
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
    optionIcons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginBottom: 5,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 7,
    },
    infoText: {
        fontSize: 16,
        fontFamily: "SatoshiMedium",
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

export default CarsDetailScreen;
