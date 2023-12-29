import { useState, useEffect, useLayoutEffect } from "react";
import { StyleSheet, FlatList, View, Text } from "react-native";
import { Button } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../../../firebase/config";
import { selectRentACarUser } from "@store/slices/rentACarSlice";
import DriverDetailCard from "./DriverDetailCard";

const DisplayDriversScreen = ({ navigation }) => {
    const [drivers, setDrivers] = useState([]);

    const user = useSelector(selectRentACarUser);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Manage Drivers",
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
            const data = snapshot.val();
            if (!data) return setDrivers([]);
            const driversList = [];
            for (let id in data) {
                if (data[id].RentACarUID === user.uid) {
                    driversList.push({ id, ...data[id] });
                }
            }
            setDrivers(driversList);
        });
    }, [user.uid]);

    const renderDriversDetail = ({ item }) => {
        return <DriverDetailCard data={item} />;
    };

    const addDriverButton = () => {
        return (
            <View style={{ marginVertical: 12, marginHorizontal: 20 }}>
                <Button
                    icon={<Ionicons name="add" size={22} color={"#000"} />}
                    iconPosition="left"
                    iconContainerStyle={{ marginRight: 10 }}
                    title="Add Driver"
                    containerStyle={styles.buttonContainer}
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonText}
                    onPress={() => navigation.navigate("AddDriverScreen")}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {drivers.length === 0 ? (
                <View style={styles.notAvailableContainer}>
                    <View style={{ marginVertical: 12, marginHorizontal: 20 }}>
                        <Button
                            icon={<Ionicons name="add" size={22} color={"#000"} />}
                            iconPosition="left"
                            iconContainerStyle={{ marginRight: 10 }}
                            title="Add Driver"
                            containerStyle={styles.buttonContainer}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonText}
                            onPress={() => navigation.navigate("AddDriverScreen")}
                        />
                    </View>
                    <Text style={styles.notAvailableText}>No Drivers Added</Text>
                </View>
            ) : (
                <FlatList
                    data={drivers}
                    keyExtractor={(item) => item?.id}
                    renderItem={renderDriversDetail}
                    ListHeaderComponent={addDriverButton}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
    },
    notAvailableContainer: {
        justifyContent: "center",
    },
    notAvailableText: {
        fontSize: 18,
        fontFamily: "SatoshiBold",
        fontWeight: "500",
        color: "#333",
        textAlign: "center",
        marginVertical: 20,
        marginHorizontal: 20,
    },
    buttonContainer: {
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderColor: "#A7E92F",
        borderRadius: 10,
        borderWidth: 2,
    },
    buttonText: {
        color: "#000",
        fontSize: 18,
        fontFamily: "SatoshiMedium",
        fontWeight: "500",
        textAlign: "center",
        marginLeft: 5,
    },
});

export default DisplayDriversScreen;
