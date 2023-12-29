import { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Text } from "react-native";
import { Button } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue } from "firebase/database";
import { useSelector } from "react-redux";

import { dbRealtime } from "../../firebase/config";
import { selectTourUser } from "@store/slices/tourSlice";
import TourDetailCard from "./TourDetailCard";

const ToursHomeScreen = ({ navigation }) => {
    const [tours, setTours] = useState([]);
    const user = useSelector(selectTourUser);

    useEffect(() => {
        const toursRef = ref(dbRealtime, "Tours/" + user.uid + "/Tours");
        onValue(toursRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return setTours([]);
            const toursList = [];
            for (let id in data) {
                toursList.push({ id, ...data[id] });
            }
            setTours(toursList);
        });
    }, [user.uid]);

    const renderToursDetail = ({ item }) => {
        return <TourDetailCard data={item} />;
    };

    const addTourButton = () => {
        return (
            <View style={{ marginVertical: 12, marginHorizontal: 20 }}>
                <Button
                    icon={<Ionicons name="add" size={22} color={"#000"} />}
                    iconPosition="left"
                    iconContainerStyle={{ marginRight: 10 }}
                    title="Add Tour"
                    containerStyle={styles.buttonContainer}
                    buttonStyle={styles.button}
                    titleStyle={styles.buttonText}
                    onPress={() => navigation.navigate("AddTourMainScreen")}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {tours.length === 0 ? (
                <>
                    <View style={{ marginVertical: 12, marginHorizontal: 20 }}>
                        <Button
                            icon={<Ionicons name="add" size={22} color={"#000"} />}
                            iconPosition="left"
                            iconContainerStyle={{ marginRight: 10 }}
                            title="Add Tour"
                            containerStyle={styles.buttonContainer}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonText}
                            onPress={() => navigation.navigate("AddTourMainScreen")}
                        />
                    </View>
                    <View style={styles.notAvailableContainer}>
                        <Text style={styles.notAvailableText}>No Tours Added Today</Text>
                    </View>
                </>
            ) : (
                <View>
                    <FlatList
                        data={tours}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderToursDetail}
                        ListHeaderComponent={addTourButton}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
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
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        width: "100%",
        alignSelf: "center",
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

export default ToursHomeScreen;
