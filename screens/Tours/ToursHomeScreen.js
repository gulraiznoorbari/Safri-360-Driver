import { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Text } from "react-native";
import { Button } from "react-native-elements";
import Ionicons from "react-native-vector-icons/Ionicons";
// import { ref, onValue } from "firebase/database";
import { useSelector } from "react-redux";

// import { dbRealtime } from "../../../../firebase/config";
import { selectUser } from "../../store/slices/userSlice";

const ToursHomeScreen = () => {
    const [tours, setTours] = useState([]);

    const user = useSelector(selectUser);

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
                    onPress={() => navigation.navigate("AddTourScreen")}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {tours.length === 0 ? (
                <View style={styles.notAvailableContainer}>
                    <View style={{ marginVertical: 12, marginHorizontal: 20 }}>
                        <Button
                            icon={<Ionicons name="add" size={22} color={"#000"} />}
                            iconPosition="left"
                            iconContainerStyle={{ marginRight: 10 }}
                            title="Add Tour"
                            containerStyle={styles.buttonContainer}
                            buttonStyle={styles.button}
                            titleStyle={styles.buttonText}
                            onPress={() => navigation.navigate("AddTourScreen")}
                        />
                    </View>
                    <Text style={styles.notAvailableText}>No Tours Added</Text>
                </View>
            ) : (
                <FlatList
                    data={tours}
                    keyExtractor={(item) => item?.id}
                    renderItem={renderToursDetail}
                    ListHeaderComponent={addTourButton}
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

export default ToursHomeScreen;
