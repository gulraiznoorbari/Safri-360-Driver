import { useState, useEffect, useLayoutEffect } from "react";
import { StyleSheet, View, FlatList, Text } from "react-native";
import { Button } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../../../firebase/config";
import { selectRentACarUser } from "@store/slices/rentACarSlice";
import CarDetailCard from "./CarDetailCard";

const DisplayCarsScreen = ({ navigation }) => {
    const [cars, setCars] = useState([]);

    const user = useSelector(selectRentACarUser);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Manage Cars",
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
        const carsRef = ref(dbRealtime, "Rent A Car/" + user.uid + "/Cars");
        onValue(carsRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return setCars([]);
            const carsList = [];
            for (let id in data) {
                carsList.push({ id, ...data[id] });
            }
            setCars(carsList);
        });
    }, [user.uid]);

    const renderCarsDetail = ({ item }) => {
        return <CarDetailCard data={item} />;
    };

    const addCarButton = () => {
        return (
            <View style={{ marginVertical: 12, marginHorizontal: 20 }}>
                <Button
                    icon={<Ionicons name="add" size={22} color={"#000"} />}
                    iconPosition="left"
                    iconContainerStyle={{ marginRight: 10 }}
                    title="Add Car"
                    containerStyle={styles.buttonContainer}
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonText}
                    onPress={() => navigation.navigate("AddCarScreen")}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {cars.length === 0 ? (
                <View style={styles.notAvailableContainer}>
                    <View style={{ marginVertical: 12, marginHorizontal: 20 }}>
                        <Button
                            icon={<Ionicons name="add" size={22} color={"#000"} />}
                            iconPosition="left"
                            iconContainerStyle={{ marginRight: 10 }}
                            title="Add Car"
                            containerStyle={styles.buttonContainer}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonText}
                            onPress={() => navigation.navigate("AddCarScreen")}
                        />
                    </View>
                    <Text style={styles.notAvailableText}>No Cars Added</Text>
                </View>
            ) : (
                <FlatList
                    data={cars}
                    keyExtractor={(item) => item?.id}
                    renderItem={renderCarsDetail}
                    ListHeaderComponent={addCarButton}
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

export default DisplayCarsScreen;
